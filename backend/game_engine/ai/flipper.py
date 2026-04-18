"""The Flipper — buys the cheapest listed property it can afford, flips it
on any profit, never develops. Teaches the player that flipping leaves
long-term rent money on the table.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from backend.config import BALANCE
from backend.models.core import GameState, Player, Property

from .base import Action, RivalStrategy


class FlipperStrategy(RivalStrategy):
    archetype = "flipper"

    # Multiplier over purchase price at which Flipper will voluntarily sell.
    FLIP_MARGIN = 1.15

    def scan(self, db: Session, game: GameState, rival: Player) -> None:
        # Drop stale targets (bought by someone, expired, or un-listed)
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

        # Keep an existing valid target
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

        # Pick the cheapest affordable listed property
        target = (
            db.query(Property)
            .filter(
                Property.game_id == game.id,
                Property.is_listed.is_(True),
                Property.owner_id.is_(None),
                Property.market_value <= rival.cash,
            )
            .order_by(Property.market_value.asc())
            .first()
        )
        if target is not None:
            target.is_flipper_target = True
            target.flipper_acquire_turn = (
                game.turn + BALANCE.FLIPPER_EYES_WARN_TURNS_EASY
            )

    def act(self, db: Session, game: GameState, rival: Player) -> list[Action]:
        actions: list[Action] = []

        # 1. Execute a pending acquisition if the buy window has arrived.
        target = (
            db.query(Property)
            .filter(
                Property.game_id == game.id,
                Property.is_flipper_target.is_(True),
            )
            .first()
        )
        if (
            target is not None
            and target.is_listed
            and target.owner_id is None
            and target.market_value <= rival.cash
            and target.flipper_acquire_turn is not None
            and game.turn >= target.flipper_acquire_turn
        ):
            actions.append({"type": "buy", "property_id": target.id})

        # 2. Flip any property owned ≥1 turn at a profit.
        owned = (
            db.query(Property)
            .filter(
                Property.game_id == game.id,
                Property.owner_id == rival.id,
            )
            .all()
        )
        for prop in owned:
            if prop.market_value >= int(prop.base_value * self.FLIP_MARGIN):
                actions.append({"type": "sell", "property_id": prop.id})

        return actions
