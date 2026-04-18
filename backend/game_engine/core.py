import uuid
import random
from sqlalchemy.orm import Session
from backend.models.core import GameState, Player, Property
import backend.config as config
from backend.game_engine.ai.base import Action, RivalStrategy
from backend.game_engine.ai.flipper import FlipperStrategy

# Stateless strategy instances keyed by Player.role
_STRATEGIES: dict[str, RivalStrategy] = {
    "FLIPPER": FlipperStrategy(),
}

def create_new_game(db: Session, session_id: str) -> GameState:
    """Initializes a new game state, creating players and 10 property plots."""
    
    # Delete existing game for this session to reset
    db.query(Property).filter(Property.game_id == session_id).delete()
    db.query(Player).filter(Player.game_id == session_id).delete()
    db.query(GameState).filter(GameState.id == session_id).delete()
    
    # Core state
    game = GameState(id=session_id, turn=1, max_turns=config.MAX_TURNS, current_ap=0)
    db.add(game)
    
    # Create Players
    user = Player(
        id=f"{session_id}_user", 
        game_id=session_id, 
        role="USER", 
        cash=config.STARTING_CASH
    )
    flipper = Player(
        id=f"{session_id}_flipper", 
        game_id=session_id, 
        role="FLIPPER", 
        cash=int(config.STARTING_CASH * 2.0) # Flipper gets rich start
    )
    db.add_all([user, flipper])
    
    # Property Blueprints (Matching sprite_registry.json)
    blueprints = [
        {"name": "Startup Lofts", "tier": "budget", "val": 6000},
        {"name": "Trade Center", "tier": "budget", "val": 7000},
        {"name": "Signal Tower", "tier": "budget", "val": 8000},
        {"name": "Market Block", "tier": "budget", "val": 9000},
        {"name": "Venture Place", "tier": "mid", "val": 12000},
        {"name": "Capital Square", "tier": "mid", "val": 14000},
        {"name": "Exchange Tower", "tier": "mid", "val": 16000},
        {"name": "Metro Spire", "tier": "mid", "val": 18000},
        {"name": "Mogul Tower", "tier": "premium", "val": 28000},
        {"name": "Apex Plaza", "tier": "premium", "val": 38000},
    ]
    
    # Populate properties
    for bp in blueprints:
        prop = Property(
            id=f"{session_id}_{bp['name'].replace(' ', '_').lower()}",
            game_id=session_id,
            name=bp['name'],
            district="pixel_park",
            tier=bp['tier'],
            base_value=bp['val'],
            market_value=bp['val'],
            rent_value=int(bp['val'] * config.BASE_RENT_MULTIPLIER_BUDGET if bp['tier'] == "budget" else bp['val'] * 0.15)
        )
        db.add(prop)
        
    db.commit()
    return game

def start_turn(db: Session, game: GameState) -> int:
    """
    Rolls 1d4+1 AP (Action Points).
    Applies property expiries before the round begins.
    Returns the rolled AP amount.
    """
    # Expiry Check
    expired_props = db.query(Property).filter(
        Property.game_id == game.id,
        Property.is_listed == True,
        Property.expiry_turn <= game.turn
    ).all()
    
    for prop in expired_props:
        prop.is_listed = False
        prop.expiry_turn = None
        # Drop value by 10% on expiry
        prop.market_value = int(prop.market_value * 0.9)
        
    # Roll AP
    rolled_ap = random.randint(1, 4) + 1  # 2 to 5 AP
    game.current_ap = rolled_ap
    
    db.commit()
    return rolled_ap

def end_turn(db: Session, game: GameState):
    """
    Ends the current turn, processing all cash flow (Rent & Debt).
    Moves the game state forward to the next round.
    """
    # 0. AI Phase: rivals execute any pending buys/sells before rent is settled.
    ai_phase(db, game)

    # 1. Cash Flow: Collect Rent for all owned properties
    owned_properties = db.query(Property).filter(
        Property.game_id == game.id,
        Property.owner_id != None
    ).all()
    
    for prop in owned_properties:
        owner = db.query(Player).filter(Player.id == prop.owner_id).first()
        if owner and not owner.is_bankrupt:
            # Add rent income to owner's cash
            # Rate is stored in prop.rent_value (dynamically shifts via catalysts later)
            owner.cash += prop.rent_value
            
    # 2. Debt Math: Apply 5% interest per turn on any outstanding debt
    players = db.query(Player).filter(Player.game_id == game.id).all()
    for p in players:
        if p.debt > 0 and not p.is_bankrupt:
            # 5% interest per turn (simulating high tension leverage)
            interest = int(p.debt * 0.05)
            p.debt += interest
            
            # Check bankruptcy condition if cash < 0 and debt ratio is terrible (Tier 2 rules)
            if p.cash < 0:
                p.is_bankrupt = True
    
    # 3. Advance Turn State
    if game.turn >= game.max_turns:
        # Game over state triggered
        pass
    else:
        game.turn += 1
        game.current_ap = 0 # AP resets

    # 4. AI Scan: flag next-turn targets so the 👀 icon is visible immediately.
    ai_scan_phase(db, game)

    db.commit()


def _active_rivals(db: Session, game: GameState) -> list[Player]:
    return (
        db.query(Player)
        .filter(
            Player.game_id == game.id,
            Player.role != "USER",
            Player.is_bankrupt == False,  # noqa: E712
        )
        .all()
    )


def ai_phase(db: Session, game: GameState) -> list[dict]:
    """Run each rival's act() and apply resulting actions.

    Returns event records for the intel feed.
    """
    events: list[dict] = []
    for rival in _active_rivals(db, game):
        strategy = _STRATEGIES.get(rival.role)
        if strategy is None:
            continue
        for action in strategy.act(db, game, rival):
            record = _apply_rival_action(db, game, rival, action)
            if record is not None:
                events.append(record)
    db.flush()
    return events


def ai_scan_phase(db: Session, game: GameState) -> None:
    """Run each rival's scan() to set targets for the next turn."""
    for rival in _active_rivals(db, game):
        strategy = _STRATEGIES.get(rival.role)
        if strategy is None:
            continue
        strategy.scan(db, game, rival)


def _apply_rival_action(
    db: Session, game: GameState, rival: Player, action: Action
) -> dict | None:
    """Execute a single rival action. Silently drops actions that became invalid
    between scan() and act() (e.g. player bought the target first).

    TODO: replace with the shared ActionProcessor once the player Buy endpoint
    lands in Step 3 — same validation logic, applied from both sides.
    """
    prop = (
        db.query(Property)
        .filter(Property.id == action["property_id"], Property.game_id == game.id)
        .first()
    )
    if prop is None:
        return None

    atype = action.get("type")
    if atype == "buy":
        if prop.owner_id is not None or not prop.is_listed:
            return None
        if rival.cash < prop.market_value:
            return None
        rival.cash -= prop.market_value
        prop.owner_id = rival.id
        prop.is_listed = False
        prop.expiry_turn = None
        prop.is_flipper_target = False
        prop.flipper_acquire_turn = None
        return {
            "actor": rival.role,
            "action": "buy",
            "property": prop.name,
            "price": prop.market_value,
            "turn": game.turn,
        }

    if atype == "sell":
        if prop.owner_id != rival.id:
            return None
        rival.cash += prop.market_value
        prop.owner_id = None
        prop.is_listed = True
        prop.expiry_turn = game.turn + config.PROPERTY_EXPIRY_TURNS if hasattr(config, "PROPERTY_EXPIRY_TURNS") else game.turn + 5
        return {
            "actor": rival.role,
            "action": "sell",
            "property": prop.name,
            "price": prop.market_value,
            "turn": game.turn,
        }

    return None
