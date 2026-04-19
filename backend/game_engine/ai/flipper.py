"""The Flipper — aggressive rival that snipes high-value listings, develops
its portfolio when cash allows, and opportunistically grabs extra listings
if cash is piling up. Tuned via the headless sim in backend/scripts/simulate.

Design principles (post-tuning, v2):
  - Target by ABSOLUTE value, not cheapness. Cheap props are what the player
    can also afford — Flipper reaching for bigger props forces the player to
    race up the tier ladder, not just coast on budget lofts.
  - Short warn window (1 turn). The 👀 icon still appears so the player
    sees the intent, but Flipper doesn't wait three turns to pull the trigger.
  - Opportunistic multi-buy: after the primary target, grab any other
    affordable listing in the same turn when cash is high enough to stay liquid.
  - Develop owned properties rather than auto-flipping them. Holding + dev
    compounds rent faster than a 1.15× flip.
  - Never voluntarily sell. The sell action remains plumbed for future archetypes.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from backend.config import BALANCE
from backend.models.core import GameState, Player, Property

from .base import Action, RivalStrategy


class FlipperStrategy(RivalStrategy):
    archetype = "flipper"

    # Turns between flagging a target and executing the buy.
    # 0 = same end_turn phase Flipper scanned in; 1 gives the player one
    # visible turn to outbid — we keep 1 because the 👀 preview is the
    # signature tension mechanic. Sim shows ~2pp win-rate hit for this.
    WARN_TURNS = 1

    # Keep a small cash buffer after primary buy — not so much that cash
    # idles while the player locks in listings.
    CASH_RESERVE_FRAC = 0.05

    # Develop a property if we have at least this many × dev_cost in cash.
    DEV_CASH_HEADROOM = 1.5

    def scan(self, db: Session, game: GameState, rival: Player) -> None:
        # Drop stale targets (acquired, expired, or un-listed)
        stale = (
            db.query(Property)
            .filter(
                Property.game_id == game.id,
                Property.is_flipper_target.is_(True),
            )
            .all()
        )
        for prop in stale:
            if prop.owner_id is not None or not prop.is_listed:
                prop.is_flipper_target = False
                prop.flipper_acquire_turn = None

        # Keep existing valid target
        active = (
            db.query(Property)
            .filter(
                Property.game_id == game.id,
                Property.is_flipper_target.is_(True),
            )
            .first()
        )
        if active:
            return

        # Target the HIGHEST-value listing Flipper can afford (subject to a
        # soft cap from FLIPPER_MAX_BID_MULTIPLIER so it doesn't torch its cash).
        bid_ceiling = int(rival.cash * BALANCE.FLIPPER_MAX_BID_MULTIPLIER)
        target = (
            db.query(Property)
            .filter(
                Property.game_id == game.id,
                Property.is_listed.is_(True),
                Property.owner_id.is_(None),
                Property.market_value <= bid_ceiling,
            )
            .order_by(Property.market_value.desc())
            .first()
        )
        if target is not None:
            target.is_flipper_target = True
            target.flipper_acquire_turn = game.turn + self.WARN_TURNS

    def act(self, db: Session, game: GameState, rival: Player) -> list[Action]:
        actions: list[Action] = []

        # 1. Primary target buy, if the warn window has elapsed.
        target = (
            db.query(Property)
            .filter(
                Property.game_id == game.id,
                Property.is_flipper_target.is_(True),
            )
            .first()
        )
        primary_bought = False
        if (
            target is not None
            and target.is_listed
            and target.owner_id is None
            and target.market_value <= rival.cash
            and target.flipper_acquire_turn is not None
            and game.turn >= target.flipper_acquire_turn
        ):
            actions.append({"type": "buy", "property_id": target.id})
            # Mentally deduct this cost so the opportunistic step budgets correctly.
            rival_cash_after = rival.cash - target.market_value
            primary_bought = True
        else:
            rival_cash_after = rival.cash

        # 2. Opportunistic extra buy — grab another listing if we have
        # cash to spare after the primary, keeping a reserve for develop/rent swings.
        reserve = int(rival_cash_after * self.CASH_RESERVE_FRAC)
        budget = rival_cash_after - reserve
        if budget > 0:
            extras = (
                db.query(Property)
                .filter(
                    Property.game_id == game.id,
                    Property.is_listed.is_(True),
                    Property.owner_id.is_(None),
                    Property.market_value <= budget,
                )
                .order_by(Property.market_value.desc())
                .all()
            )
            for extra in extras:
                if target is not None and extra.id == target.id and primary_bought:
                    continue  # already in actions
                if extra.market_value > budget:
                    continue
                actions.append({"type": "buy", "property_id": extra.id})
                budget -= extra.market_value
                if budget <= reserve:
                    break

        # 3. Develop owned properties when cash allows. Prefer low-dev-level
        # props (biggest ROI from the next level up).
        owned = (
            db.query(Property)
            .filter(
                Property.game_id == game.id,
                Property.owner_id == rival.id,
            )
            .order_by(Property.dev_level.asc(), Property.market_value.desc())
            .all()
        )
        remaining_cash = budget  # already keeps reserve out
        for prop in owned:
            if prop.dev_level >= BALANCE.MAX_DEV_LEVEL:
                continue
            dev_cost = int(BALANCE.DEV_FLAT_FEE + BALANCE.DEV_PERCENT_FEE * prop.market_value)
            if remaining_cash >= dev_cost * self.DEV_CASH_HEADROOM:
                actions.append({"type": "develop", "property_id": prop.id})
                remaining_cash -= dev_cost

        return actions
