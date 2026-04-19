"""
Headless simulation harness for balancing Mogul Blocks.

Runs N full games of Flipper-vs-scripted-user on a fresh in-memory SQLite
instance per game, collects outcomes, and prints aggregate stats so we can
iterate on Flipper AI tuning without hitting the real backend.

Usage:
    python -m backend.scripts.simulate -n 100
    python -m backend.scripts.simulate -n 50 --strategy builder --verbose
    python -m backend.scripts.simulate --compare          # all strategies x2
"""
from __future__ import annotations

import argparse
import random
from collections import Counter
from dataclasses import dataclass, field
from typing import Optional

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

import backend.game_engine.core as engine_mod
from backend.database import Base
from backend.models.core import GameState, Player, Property  # noqa: F401 — registers tables


# ──────────────────────────────────────────────
#  Ephemeral DB per game (isolates sim state)
# ──────────────────────────────────────────────

def _make_ephemeral_session() -> Session:
    eng = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(eng)
    return sessionmaker(bind=eng, autocommit=False, autoflush=False)()


# ──────────────────────────────────────────────
#  Scripted user strategies
# ──────────────────────────────────────────────

class ScriptedUser:
    """Plays the human side with a deterministic rule-based policy.

    - "buyer":    always buy the cheapest affordable listing, never develop
    - "builder":  develop anything owned before buying new listings
    - "balanced": buy until 3 owned, then prioritize developing cheap props
    """

    def __init__(self, strategy: str = "balanced"):
        self.strategy = strategy

    def play_turn(self, db: Session, game: GameState, user: Player) -> list[dict]:
        events: list[dict] = []
        safety = 0  # guard against infinite loops if an action returns success=False silently
        while game.current_ap > 0 and safety < 20:
            safety += 1
            # Re-fetch user so cash/debt reflect prior actions this turn
            user = db.query(Player).filter(Player.id == user.id).first()
            action = self._pick(db, game, user)
            if action is None:
                break
            if action["type"] == "buy":
                r = engine_mod.buy_property(db, game, user, action["property_id"])
            elif action["type"] == "develop":
                r = engine_mod.develop_property(db, game, user, action["property_id"])
            else:
                break
            if not r.get("success"):
                break
            events.append({
                "turn": game.turn,
                "type": action["type"],
                "property": r.get("property"),
                "ap_remaining": r.get("ap_remaining"),
            })
        return events

    def _pick(self, db: Session, game: GameState, user: Player) -> Optional[dict]:
        listed = (
            db.query(Property)
            .filter(
                Property.game_id == game.id,
                Property.is_listed.is_(True),
                Property.owner_id.is_(None),
                Property.market_value <= user.cash,
            )
            .order_by(Property.market_value.asc())
            .all()
        )
        cheapest = listed[0] if listed else None

        owned = (
            db.query(Property)
            .filter(Property.owner_id == user.id)
            .order_by(Property.base_value.asc())
            .all()
        )
        developable: list[Property] = []
        for p in owned:
            if p.dev_level >= engine_mod.BALANCE.MAX_DEV_LEVEL:
                continue
            cost = engine_mod._calc_dev_cost(p.market_value)
            if user.cash >= cost:
                developable.append(p)

        def dev_action() -> Optional[dict]:
            if developable:
                return {"type": "develop", "property_id": developable[0].id}
            return None

        def buy_action() -> Optional[dict]:
            if cheapest is not None:
                return {"type": "buy", "property_id": cheapest.id}
            return None

        if self.strategy == "buyer":
            return buy_action() or dev_action()

        if self.strategy == "builder":
            return dev_action() or buy_action()

        # balanced: accumulate portfolio early, then develop
        if len(owned) < 3:
            return buy_action() or dev_action()
        return dev_action() or buy_action()


# ──────────────────────────────────────────────
#  Game loop
# ──────────────────────────────────────────────

@dataclass
class GameResult:
    seed: int
    strategy: str
    turns_played: int
    winner: str  # "USER" | "FLIPPER" | "TIE"
    user_net_worth: int
    flipper_net_worth: int
    user_props: int
    flipper_props: int
    user_bankrupt: bool
    victory_flag: bool
    user_dev_levels: list[int] = field(default_factory=list)
    flipper_dev_levels: list[int] = field(default_factory=list)


def run_single_game(seed: int, strategy: str = "balanced") -> GameResult:
    random.seed(seed)
    session_id = f"sim_{seed}"
    db = _make_ephemeral_session()

    game = engine_mod.create_new_game(db, session_id)
    user = db.query(Player).filter(
        Player.game_id == session_id, Player.role == "USER"
    ).first()
    flipper = db.query(Player).filter(
        Player.game_id == session_id, Player.role == "FLIPPER"
    ).first()

    scripted = ScriptedUser(strategy)
    victory_flag = False

    while True:
        engine_mod.start_turn(db, game)
        scripted.play_turn(db, game, user)
        result = engine_mod.end_turn(db, game)
        if result.get("victory"):
            victory_flag = True
        if result.get("game_over"):
            break
        # re-fetch for next iteration
        user = db.query(Player).filter(Player.id == user.id).first()
        flipper = db.query(Player).filter(Player.id == flipper.id).first()

    # Final re-fetch for reporting
    user = db.query(Player).filter(Player.id == user.id).first()
    flipper = db.query(Player).filter(Player.id == flipper.id).first() if flipper else None

    user_nw = engine_mod._calc_net_worth(db, user)
    flipper_nw = engine_mod._calc_net_worth(db, flipper) if flipper else 0

    user_props_q = db.query(Property).filter(Property.owner_id == user.id).all()
    flipper_props_q = (
        db.query(Property).filter(Property.owner_id == flipper.id).all() if flipper else []
    )

    if user.is_bankrupt:
        winner = "FLIPPER"
    elif victory_flag:
        winner = "USER"  # triggered EARLY_WIN condition
    elif user_nw > flipper_nw:
        winner = "USER"
    elif flipper_nw > user_nw:
        winner = "FLIPPER"
    else:
        winner = "TIE"

    result_obj = GameResult(
        seed=seed,
        strategy=strategy,
        turns_played=game.turn,
        winner=winner,
        user_net_worth=user_nw,
        flipper_net_worth=flipper_nw,
        user_props=len(user_props_q),
        flipper_props=len(flipper_props_q),
        user_bankrupt=bool(user.is_bankrupt),
        victory_flag=victory_flag,
        user_dev_levels=[p.dev_level for p in user_props_q],
        flipper_dev_levels=[p.dev_level for p in flipper_props_q],
    )
    db.close()
    return result_obj


# ──────────────────────────────────────────────
#  Batch runner
# ──────────────────────────────────────────────

def run_simulation(n: int = 50, strategy: str = "balanced", verbose: bool = False,
                   seed_start: int = 1000) -> dict:
    results: list[GameResult] = []
    for i in range(n):
        r = run_single_game(seed=seed_start + i, strategy=strategy)
        results.append(r)
        if verbose:
            print(
                f"  game {i+1:3d}: seed={r.seed} winner={r.winner:7s} "
                f"user=${r.user_net_worth:>8,} flipper=${r.flipper_net_worth:>8,} "
                f"user_props={r.user_props} flipper_props={r.flipper_props} turns={r.turns_played}"
            )

    outcomes = Counter(r.winner for r in results)
    user_rate = outcomes["USER"] / n * 100
    flipper_rate = outcomes["FLIPPER"] / n * 100
    tie_rate = outcomes["TIE"] / n * 100
    avg_user_nw = sum(r.user_net_worth for r in results) / n
    avg_flipper_nw = sum(r.flipper_net_worth for r in results) / n
    avg_user_props = sum(r.user_props for r in results) / n
    avg_flipper_props = sum(r.flipper_props for r in results) / n
    bankrupt_rate = sum(1 for r in results if r.user_bankrupt) / n * 100
    victory_rate = sum(1 for r in results if r.victory_flag) / n * 100

    # Alternate view: who would win on pure net worth (ignoring early-win trigger).
    nw_winner = Counter()
    for r in results:
        if r.user_net_worth > r.flipper_net_worth:
            nw_winner["USER"] += 1
        elif r.flipper_net_worth > r.user_net_worth:
            nw_winner["FLIPPER"] += 1
        else:
            nw_winner["TIE"] += 1

    summary = {
        "n": n,
        "strategy": strategy,
        "user_win_rate": user_rate,
        "flipper_win_rate": flipper_rate,
        "tie_rate": tie_rate,
        "avg_user_net_worth": avg_user_nw,
        "avg_flipper_net_worth": avg_flipper_nw,
        "avg_user_props": avg_user_props,
        "avg_flipper_props": avg_flipper_props,
        "bankrupt_rate": bankrupt_rate,
        "early_victory_rate": victory_rate,
        "nw_user_rate": nw_winner["USER"] / n * 100,
        "nw_flipper_rate": nw_winner["FLIPPER"] / n * 100,
    }
    return summary


def _print_summary(summary: dict) -> None:
    print(f"\n=== {summary['n']} games  |  user strategy: {summary['strategy']} ===")
    print(f"  User win rate:      {summary['user_win_rate']:5.1f}%")
    print(f"  Flipper win rate:   {summary['flipper_win_rate']:5.1f}%")
    print(f"  Tie rate:           {summary['tie_rate']:5.1f}%")
    print(f"  Bankrupt rate:      {summary['bankrupt_rate']:5.1f}%")
    print(f"  Early victory rate: {summary['early_victory_rate']:5.1f}%")
    print(f"  (pure net worth)  User: {summary['nw_user_rate']:5.1f}%  Flipper: {summary['nw_flipper_rate']:5.1f}%")
    print(f"  Avg user   net worth: ${summary['avg_user_net_worth']:>10,.0f}  props avg: {summary['avg_user_props']:.2f}")
    print(f"  Avg flipper net worth: ${summary['avg_flipper_net_worth']:>10,.0f}  props avg: {summary['avg_flipper_props']:.2f}")


def _run_compare(n: int, seed_start: int = 1000) -> None:
    """Run all three user strategies head-to-head against the same Flipper."""
    for strat in ("buyer", "balanced", "builder"):
        s = run_simulation(n=n, strategy=strat, verbose=False, seed_start=seed_start)
        _print_summary(s)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Mogul Blocks headless simulator")
    parser.add_argument("-n", type=int, default=50, help="number of games")
    parser.add_argument(
        "--strategy", default="balanced", choices=["balanced", "builder", "buyer"],
        help="scripted user's strategy",
    )
    parser.add_argument("--seed", type=int, default=1000, help="starting seed")
    parser.add_argument("--verbose", action="store_true", help="per-game line")
    parser.add_argument("--compare", action="store_true", help="run all strategies")
    args = parser.parse_args()

    if args.compare:
        _run_compare(args.n, args.seed)
    else:
        s = run_simulation(args.n, args.strategy, args.verbose, args.seed)
        _print_summary(s)
