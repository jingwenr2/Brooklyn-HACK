"""Trace one simulated game turn-by-turn for debugging Flipper behavior."""
import random
import sys

from backend.scripts.simulate import _make_ephemeral_session, ScriptedUser
import backend.game_engine.core as engine
from backend.models.core import Player, Property


def trace(seed: int = 1000, strategy: str = "balanced"):
    random.seed(seed)
    session_id = f"trace_{seed}"
    db = _make_ephemeral_session()

    game = engine.create_new_game(db, session_id)
    user = db.query(Player).filter(Player.game_id == session_id, Player.role == "USER").first()
    flipper = db.query(Player).filter(Player.game_id == session_id, Player.role == "FLIPPER").first()
    scripted = ScriptedUser(strategy)

    print(f"=== seed {seed}, strategy {strategy} ===")
    while True:
        engine.start_turn(db, game)
        user = db.query(Player).filter(Player.id == user.id).first()
        flipper = db.query(Player).filter(Player.id == flipper.id).first()
        listed = db.query(Property).filter(
            Property.game_id == session_id,
            Property.is_listed.is_(True),
            Property.owner_id.is_(None),
        ).all()
        targets = db.query(Property).filter(
            Property.game_id == session_id,
            Property.is_flipper_target.is_(True),
        ).all()
        print(
            f"T{game.turn:>2}  AP={game.current_ap}  "
            f"U=${user.cash:>6,}/{user.debt}/{engine._calc_net_worth(db, user):>7,}  "
            f"F=${flipper.cash:>6,}/-/{engine._calc_net_worth(db, flipper):>7,}  "
            f"listed={len(listed)}  target={[t.name+'@'+str(t.flipper_acquire_turn) for t in targets]}"
        )

        actions = scripted.play_turn(db, game, user)
        for a in actions:
            print(f"      user: {a['type']} {a['property']}  ap_left={a['ap_remaining']}")

        result = engine.end_turn(db, game)
        for ev in result.get("ai_events", []):
            print(f"      FLIPPER: {ev['action']} {ev['property']} " + (f"L{ev.get('new_level')}" if ev['action'] == 'develop' else f"${ev.get('price',0):,}"))
        for ev in result.get("catalyst_events", []):
            print(f"      ~ CATALYST {ev['direction'].upper()}: {ev['theme']} rent×{ev['rent_multiplier']:.2f} val×{ev['value_multiplier']:.2f}")
        if result.get("rent_collected"):
            print(f"      rent to user: ${result['rent_collected']:,}")

        if result.get("game_over"):
            user = db.query(Player).filter(Player.id == user.id).first()
            flipper = db.query(Player).filter(Player.id == flipper.id).first()
            user_nw = engine._calc_net_worth(db, user)
            flipper_nw = engine._calc_net_worth(db, flipper)
            up = db.query(Property).filter(Property.owner_id == user.id).count()
            fp = db.query(Property).filter(Property.owner_id == flipper.id).count()
            print(f"\nGAME OVER turn {game.turn}  victory={result.get('victory')}")
            print(f"  User:    props={up}  NW=${user_nw:,}")
            print(f"  Flipper: props={fp}  NW=${flipper_nw:,}")
            break

    db.close()


if __name__ == "__main__":
    seed = int(sys.argv[1]) if len(sys.argv) > 1 else 1000
    strat = sys.argv[2] if len(sys.argv) > 2 else "balanced"
    trace(seed, strat)
