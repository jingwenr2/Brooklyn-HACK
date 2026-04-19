"""
Core game engine — state initialization, turn lifecycle, and player actions.
All math aligned to architecture.md config constants.
"""
import json
import random
import time
from sqlalchemy.orm import Session
from backend.models.core import Catalyst, GameState, Player, PregenTrivia, Property, TriviaSession
from backend.config import BALANCE
import backend.config as config
from backend.game_engine.ai.base import Action, RivalStrategy
from backend.game_engine.ai.flipper import FlipperStrategy
from backend.game_engine.catalysts import (
    fire_catalysts_for_turn,
    generate_catalysts_for_game,
    pick_catalyst_for_research,
    reveal_catalyst,
)
from backend.game_engine.trivia import generate_trivia

# ──────────────────────────────────────────────
#  PROPERTY BLUEPRINTS (10 total, matching sprites)
# ──────────────────────────────────────────────
# ──────────────────────────────────────────────
#  DICE OUTCOMES (1d6 storyline — see config.Balance expected value: +3.5 AP, -$83/turn)
# ──────────────────────────────────────────────
#  Face 1: bad break (1 AP, -10% Net Worth)
#  Face 2: slow start (1 AP, 0)
#  Face 3–4: normal (2 AP, 0)
#  Face 5: hot (3 AP, 0)
#  Face 6: lucky break (3 AP, +5% Net Worth)
DICE_OUTCOMES = [
    {
        "ap": 1, "penalty_pct": 0.10, "tone": "bad",
        "flavors": [
            "Market downturn! Your liquid reserves took a 10% hit.",
            "Unexpected lawsuit settlements. Lose 10% of net worth.",
            "Aggressive tax audit penalty. -10% cash equivalent.",
            "Cyber-heist on your offshore account. 10% drained.",
        ],
    },
    {
        "ap": 1, "cash": 0, "tone": "slow",
        "flavors": [
            "Slow week. Phones quiet, deals frozen. Only 1 AP.",
            "Coffee machine broke. Morale tanked. 1 AP.",
            "Market's holding its breath. You manage 1 AP today.",
        ],
    },
    {
        "ap": 2, "cash": 0, "tone": "neutral",
        "flavors": [
            "Solid grind. 2 AP on the board.",
            "Two meetings, two moves. 2 AP.",
            "Average day at the office. 2 AP.",
        ],
    },
    {
        "ap": 2, "cash": 0, "tone": "neutral",
        "flavors": [
            "Steady hands. 2 AP to spend.",
            "The market is moving, but you're keeping pace. 2 AP.",
        ],
    },
    {
        "ap": 3, "cash": 0, "tone": "hot",
        "flavors": [
            "Firing on all cylinders. 3 AP.",
            "Good coffee, better instincts. 3 AP to spend.",
            "Everyone's returning your calls. 3 AP.",
        ],
    },
    {
        "ap": 3, "bonus_pct": 0.05, "tone": "lucky",
        "flavors": [
            "Unicorn exit! Your small side-bet pays off with a 5% net worth boost.",
            "Found uncashed dividends in a drawer. Bonus 5% net worth.",
            "Your tweet about the neighborhood went viral. +5% bonus cash.",
            "Tax rebate arrives early. +5% boost.",
        ],
    },
]


BLUEPRINTS = [
    {"name": "Startup Lofts",  "key": "startup_lofts",  "tier": "budget",  "val": 6_000,  "unlock": 1,  "category": "tech"},
    {"name": "Trade Center",   "key": "trade_center",   "tier": "budget",  "val": 7_000,  "unlock": 5,  "category": "finance"},
    {"name": "Signal Tower",   "key": "signal_tower",   "tier": "budget",  "val": 8_000,  "unlock": 1,  "category": "tech"},
    {"name": "Market Block",   "key": "market_block",   "tier": "budget",  "val": 9_000,  "unlock": 18, "category": "finance"},
    {"name": "Venture Place",  "key": "venture_place",  "tier": "mid",     "val": 12_000, "unlock": 1,  "category": "finance"},
    {"name": "Capital Square", "key": "capital_square", "tier": "mid",     "val": 14_000, "unlock": 3,  "category": "finance"},
    {"name": "Exchange Tower", "key": "exchange_tower", "tier": "mid",     "val": 16_000, "unlock": 7,  "category": "finance"},
    {"name": "Metro Spire",    "key": "metro_spire",    "tier": "mid",     "val": 18_000, "unlock": 12, "category": "urban"},
    {"name": "Mogul Tower",    "key": "mogul_tower",    "tier": "premium", "val": 28_000, "unlock": 9,  "category": "culture"},
    {"name": "Apex Plaza",     "key": "apex_plaza",     "tier": "premium", "val": 38_000, "unlock": 15, "category": "urban"},
]


def _calc_rent(base_value: int, dev_level: int = 0) -> int:
    """Rent = base_value × BASE_RENT_YIELD × dev_multiplier."""
    return int(base_value * BALANCE.BASE_RENT_YIELD * BALANCE.rent_multiplier(dev_level))


def _calc_dev_cost(market_value: int) -> int:
    """Dev cost = FLAT_FEE + PERCENT_FEE × market_value."""
    return int(BALANCE.DEV_FLAT_FEE + BALANCE.DEV_PERCENT_FEE * market_value)


def _calc_net_worth(db: Session, player: Player) -> int:
    """Net worth = cash + sum(market_value × dev_value_mult) - debt."""
    props = db.query(Property).filter(Property.owner_id == player.id).all()
    portfolio = sum(
        int(p.market_value * BALANCE.dev_value_multiplier(p.dev_level))
        for p in props
    )
    return player.cash + portfolio - player.debt


def _normalize_finances(player: Player) -> None:
    """If cash is negative, convert the deficit into debt (overdraft)."""
    if player.cash < 0:
        deficit = abs(player.cash)
        player.debt += deficit
        player.cash = 0


# ──────────────────────────────────────────────
#  GAME INIT
# ──────────────────────────────────────────────

# Stateless strategy instances keyed by Player.role
_STRATEGIES: dict[str, RivalStrategy] = {
    "FLIPPER": FlipperStrategy(),
}

def create_new_game(db: Session, session_id: str) -> GameState:
    """Initializes a new game: players + 10 property plots."""

    # Wipe any existing session
    db.query(PregenTrivia).filter(PregenTrivia.game_id == session_id).delete()
    db.query(TriviaSession).filter(TriviaSession.game_id == session_id).delete()
    db.query(Catalyst).filter(Catalyst.game_id == session_id).delete()
    db.query(Property).filter(Property.game_id == session_id).delete()
    db.query(Player).filter(Player.game_id == session_id).delete()
    db.query(GameState).filter(GameState.id == session_id).delete()

    game = GameState(
        id=session_id,
        turn=1,
        max_turns=BALANCE.MAX_TURNS,
        current_ap=0,
    )
    db.add(game)

    # Players
    user = Player(
        id=f"{session_id}_user",
        game_id=session_id,
        role="USER",
        cash=BALANCE.STARTING_CASH,
    )
    flipper = Player(
        id=f"{session_id}_flipper",
        game_id=session_id,
        role="FLIPPER",
        cash=int(BALANCE.STARTING_CASH * 1.5),
    )
    db.add_all([user, flipper])

    # Group and shuffle unlock schedules by tier
    unlocks_by_tier = {}
    for bp in BLUEPRINTS:
        unlocks_by_tier.setdefault(bp["tier"], []).append(bp["unlock"])
        
    for tier in unlocks_by_tier:
        random.shuffle(unlocks_by_tier[tier])

    # Properties
    for bp in BLUEPRINTS:
        prop = Property(
            id=f"{session_id}_{bp['key']}",
            game_id=session_id,
            name=bp["name"],
            district="pixel_park",
            tier=bp["tier"],
            theme_category=bp["category"],
            sprite_key=bp["key"],
            base_value=bp["val"],
            market_value=bp["val"],
            rent_value=_calc_rent(bp["val"], 0),
            dev_level=0,
            tenant_bonus=1.0,
            is_listed=False,
            unlock_turn=unlocks_by_tier[bp["tier"]].pop(),
        )
        db.add(prop)

    db.commit()

    # Schedule catalyst events for the whole game
    generate_catalysts_for_game(db, game)

    return game


# ──────────────────────────────────────────────
#  TURN LIFECYCLE
# ──────────────────────────────────────────────

def _check_time(game: GameState) -> dict | None:
    """Helper to reject actions if the speed timer has run out."""
    if game.is_paused:
        return None
    if game.turn_expires_at and time.time() > game.turn_expires_at:
        return {"success": False, "error": "Turn time expired (Speed Tycoon mode)"}
    return None


def pause_game(db: Session, game: GameState) -> dict:
    """Freeze the speed timer."""
    if game.turn_expires_at:
        game.timer_remaining_at_pause = max(0, game.turn_expires_at - time.time())
        game.turn_expires_at = None
    
    game.is_paused = True
    db.commit()
    return {"success": True, "remaining": game.timer_remaining_at_pause}


def resume_game(db: Session, game: GameState) -> dict:
    """Unfreeze the speed timer."""
    if game.timer_remaining_at_pause is not None:
        game.turn_expires_at = time.time() + game.timer_remaining_at_pause
        game.timer_remaining_at_pause = None
    
    game.is_paused = False
    db.commit()
    return {"success": True, "expires_at": game.turn_expires_at}


def activate_timer(db: Session, game: GameState) -> dict:
    """Explicitly start the 40-second speed timer."""
    game.turn_expires_at = time.time() + BALANCE.TURN_TIME_LIMIT
    db.commit()
    return {"success": True, "expires_at": game.turn_expires_at}


def start_turn(db: Session, game: GameState) -> dict:
    """
    Start-of-turn sequence (architecture.md §2):
      1. Pay mortgage/debt interest
      2. Drip-feed property listings
      3. Roll 1d6 storyline dice — AP + optional cash delta + flavor text
    Returns dict with ap, dice_roll, cash_delta, flavor, low_roll, and new listings.
    """
    newly_listed = []
    user_interest_paid = 0

    # 1. Debt interest (deducted from cash at START of turn)
    for p in db.query(Player).filter(Player.game_id == game.id).all():
        if p.debt > 0 and not p.is_bankrupt:
            interest = int(p.debt * BALANCE.MORTGAGE_INTEREST_RATE)
            p.cash -= interest
            _normalize_finances(p)
            if p.role == "USER":
                user_interest_paid = interest

    # 2. Drip-feed property listings (unlock properties scheduled for this turn)
    props = db.query(Property).filter(
        Property.game_id == game.id,
        Property.unlock_turn <= game.turn,
        Property.is_listed == False,
        Property.owner_id == None,
        Property.expiry_turn == None,
    ).all()

    for prop in props:
        prop.is_listed = True
        prop.expiry_turn = game.turn + random.randint(BALANCE.PROPERTY_EXPIRY_MIN_TURNS, BALANCE.PROPERTY_EXPIRY_MAX_TURNS)
        newly_listed.append(prop.id)

    # 3. Storyline dice: 1d6 → AP, cash swing, flavor text
    face = random.randint(1, 6)
    
    # Force a neutral start for turn 1
    if game.turn == 1:
        face = 3 # Neutral (2 AP, $0 delta)

    outcome = DICE_OUTCOMES[face - 1]
    rolled_ap = outcome["ap"]

    # Calculate dynamic cash delta based on Net Worth percentages
    user = db.query(Player).filter(
        Player.game_id == game.id, Player.role == "USER"
    ).first()

    cash_delta = 0
    if user and not user.is_bankrupt:
        nw = _calc_net_worth(db, user)
        if "penalty_pct" in outcome:
            cash_delta = -int(nw * outcome["penalty_pct"])
        elif "bonus_pct" in outcome:
            cash_delta = int(nw * outcome["bonus_pct"])
        else:
            cash_delta = outcome.get("cash", 0)

    flavor = random.choice(outcome["flavors"])
    tone = outcome["tone"]

    game.current_ap = rolled_ap
    is_low_roll = rolled_ap <= BALANCE.LOW_ROLL_THRESHOLD

    # Apply storyline cash delta to the human player only (AI is unaffected).
    if cash_delta:
        if user and not user.is_bankrupt:
            user.cash += cash_delta
            _normalize_finances(user)

    db.commit()
    return {
        "ap": rolled_ap,
        "dice_roll": face,
        "cash_delta": cash_delta,
        "interest_paid": user_interest_paid,
        "flavor": flavor,
        "tone": tone,
        "low_roll": is_low_roll,
        "newly_listed": newly_listed,
        "turn": game.turn,
    }


def end_turn(db: Session, game: GameState) -> dict:
    """
    End-of-turn sequence (architecture.md §2):
      1. AI Phase: rivals act before rent is collected
      2. Collect rent for all owned properties
      3. Expire old listings
      4. Check bankruptcy / victory
      5. Advance turn counter
      6. AI Scan: prepare targets for next turn
    Returns dict with summary info.
    """
    # 1. AI Phase: rivals execute any pending buys/sells before rent is settled.
    ai_events = ai_phase(db, game)

    # 1b. Catalyst phase: fire scheduled events and expire old ones.
    catalyst_events = fire_catalysts_for_turn(db, game)

    user = db.query(Player).filter(
        Player.game_id == game.id, Player.role == "USER"
    ).first()

    # 2. Rent collection
    total_rent = 0
    owned = db.query(Property).filter(
        Property.game_id == game.id,
        Property.owner_id != None,
    ).all()
    for prop in owned:
        owner = db.query(Player).filter(Player.id == prop.owner_id).first()
        if owner and not owner.is_bankrupt:
            owner.cash += prop.rent_value
            if owner.id == user.id:
                total_rent += prop.rent_value

    # 3. Expire old listings (unowned past their expiry turn)
    expired_ids = []
    expired = db.query(Property).filter(
        Property.game_id == game.id,
        Property.is_listed == True,
        Property.owner_id == None,
        Property.expiry_turn != None,
        Property.expiry_turn <= game.turn,
    ).all()
    for prop in expired:
        prop.is_listed = False
        prop.market_value = int(prop.market_value * 0.9)
        expired_ids.append(prop.id)

    # 4. Victory / bankruptcy checks
    game_over = False
    victory = False
    net_worth = _calc_net_worth(db, user) if user else 0
    user_props_count = db.query(Property).filter(Property.owner_id == user.id).count() if user else 0

    # Early "Mogul Victory" — must be ahead of the rival on net worth AND meet
    # the absolute thresholds. Previously the rival was ignored, so the player
    # auto-won at turn 10 even while Flipper out-earned them.
    flipper_player = db.query(Player).filter(
        Player.game_id == game.id, Player.role == "FLIPPER"
    ).first()
    flipper_nw = _calc_net_worth(db, flipper_player) if flipper_player else 0

    if (
        game.turn >= BALANCE.EARLY_WIN_TURN
        and net_worth >= BALANCE.EARLY_WIN_NET_WORTH
        and user_props_count >= BALANCE.EARLY_WIN_MIN_PROPERTIES
        and net_worth > flipper_nw
    ):
        game_over = True
        victory = True

    # Bankruptcy check (LTV based)
    if user and user.debt > 0:
        portfolio_val = max(net_worth + user.debt - user.cash, 1)
        ltv = user.debt / portfolio_val
        if ltv >= BALANCE.BANKRUPTCY_LTV:
            user.is_bankrupt = True
            game_over = True

    # 5. Advance turn
    if game.turn >= game.max_turns:
        game_over = True
    else:
        game.turn += 1
        game.current_ap = 0 # AP resets
    
    game.turn_expires_at = None # Reset timer

    # 6. AI Scan: flag next-turn targets so the 👀 icon is visible immediately.
    ai_scan_phase(db, game)

    db.commit()
    return {
        "turn": game.turn,
        "rent_collected": total_rent,
        "expired": expired_ids,
        "net_worth": net_worth,
        "game_over": game_over,
        "victory": victory,
        "ai_events": ai_events,
        "catalyst_events": catalyst_events,
    }


# ──────────────────────────────────────────────
#  PLAYER ACTIONS (each costs 1 AP)
# ──────────────────────────────────────────────

def buy_property(db: Session, game: GameState, player: Player, property_id: str) -> dict:
    """
    Buy action (1 AP):
      - Property must be listed and unowned
      - Player must have enough cash
      - Deducts cash, assigns ownership, delists
    """
    if time_err := _check_time(game): return time_err

    if game.current_ap < 1:
        return {"success": False, "error": "Not enough AP (need 1)"}

    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        return {"success": False, "error": "Property not found"}
    
    # Safety: check if listing has technically already expired but not yet delisted
    if prop.expiry_turn is not None and prop.expiry_turn < game.turn:
        prop.is_listed = False
        db.commit()
        return {"success": False, "error": "Property listing has expired"}

    if not prop.is_listed:
        return {"success": False, "error": "Property is not currently listed"}
    if prop.owner_id is not None:
        return {"success": False, "error": "Property is already owned"}
    if player.cash < prop.market_value:
        return {"success": False, "error": f"Not enough cash (need ${prop.market_value:,}, have ${player.cash:,})"}

    # Execute purchase
    player.cash -= prop.market_value
    prop.owner_id = player.id
    prop.is_listed = False
    prop.expiry_turn = None
    game.current_ap -= 1

    db.commit()
    return {
        "success": True,
        "property": prop.name,
        "cost": prop.market_value,
        "cash_remaining": player.cash,
        "ap_remaining": game.current_ap,
    }


def develop_property(db: Session, game: GameState, player: Player, property_id: str) -> dict:
    """
    Develop action (1 AP):
      - Must own the property
      - Dev level must be < MAX_DEV_LEVEL (3)
      - Cost = $500 + 15% × market_value
      - Increases dev_level, recalculates rent and market value
    """
    if time_err := _check_time(game): return time_err

    if game.current_ap < 1:
        return {"success": False, "error": "Not enough AP (need 1)"}

    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        return {"success": False, "error": "Property not found"}
    if prop.owner_id != player.id:
        return {"success": False, "error": "You don't own this property"}
    
    tier_cap = BALANCE.TIER_DEV_CAPS.get(prop.tier, 0)
    if prop.dev_level >= tier_cap:
        return {"success": False, "error": f"{prop.tier.capitalize()} properties are capped at level {tier_cap}"}

    cost = _calc_dev_cost(prop.market_value)
    if player.cash < cost:
        return {"success": False, "error": f"Not enough cash (need ${cost:,}, have ${player.cash:,})"}

    # Execute development
    player.cash -= cost
    prop.dev_level += 1
    prop.rent_value = _calc_rent(prop.base_value, prop.dev_level)
    prop.market_value = int(prop.base_value * BALANCE.dev_value_multiplier(prop.dev_level))
    game.current_ap -= 1

    db.commit()
    return {
        "success": True,
        "property": prop.name,
        "new_level": prop.dev_level,
        "cost": cost,
        "new_rent": prop.rent_value,
        "new_market_value": prop.market_value,
        "cash_remaining": player.cash,
        "ap_remaining": game.current_ap,
    }


def sell_property(db: Session, game: GameState, player: Player, property_id: str) -> dict:
    """
    Sell action (1 AP):
      - Must own the property
      - Returns 90% of current market value
      - Property is listed back on the market with a fresh expiry turn
    """
    if time_err := _check_time(game): return time_err

    if game.current_ap < 1:
        return {"success": False, "error": "Not enough AP (need 1)"}

    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        return {"success": False, "error": "Property not found"}
    if prop.owner_id != player.id:
        return {"success": False, "error": "You don't own this property"}

    payout = int(prop.market_value * 0.9)

    # Execute sale
    player.cash += payout
    prop.owner_id = None
    prop.is_listed = True
    prop.expiry_turn = game.turn + random.randint(BALANCE.PROPERTY_EXPIRY_MIN_TURNS, BALANCE.PROPERTY_EXPIRY_MAX_TURNS)
    game.current_ap -= 1

    db.commit()
    return {
        "success": True,
        "property": prop.name,
        "payout": payout,
        "cash_remaining": player.cash,
        "ap_remaining": game.current_ap,
    }


def research_action(
    db: Session,
    game: GameState,
    player: Player,
    property_id: str,
    difficulty: str = "medium",
) -> dict:
    """
    Research action (1 AP) — step 1 of 2:
      - Picks a future catalyst to quiz the player about
      - Uses a pre-generated trivia question if available (instant), otherwise
        falls back to a synchronous OpenAI call
      - Freezes the speed timer so the modal doesn't time out
      - AP is NOT deducted yet — that happens on answer submission
    """
    from backend.game_engine.research import generate_question

    if time_err := _check_time(game): return time_err

    if game.current_ap < 1:
        return {"success": False, "error": "Not enough AP (need 1)"}

    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        return {"success": False, "error": "Property not found"}

    # If there's already an open session, return it (idempotent retry).
    existing = db.query(TriviaSession).filter(TriviaSession.id == player.id).first()
    if existing:
        return _trivia_session_response(existing, game)

    catalyst = pick_catalyst_for_research(db, game)
    if catalyst is None:
        return {"success": False, "error": "No catalysts left to research — game is too late"}

    # Trivia category follows the PROPERTY's theme, not the catalyst's —
    # players learn about the building type they clicked on.
    prop_category = prop.theme_category or catalyst.category

    # Fast path: use a pre-generated question for this category if one exists.
    pregen_id = f"{game.id}_{prop_category}"
    pregen = db.query(PregenTrivia).filter(PregenTrivia.id == pregen_id).first()
    if pregen:
        q_question = pregen.question
        q_options_json = pregen.options_json
        q_correct_index = pregen.correct_index
        q_category = pregen.category
        q_source = pregen.source
        db.delete(pregen)
    else:
        q = generate_trivia(theme=prop.name, category=prop_category, difficulty=difficulty)
        q_question = q.question
        q_options_json = json.dumps(q.options)
        q_correct_index = q.correct_index
        q_category = q.category
        q_source = q.source

    # Freeze the speed timer — capture how much time was left so we can restore it.
    remaining = None
    if game.turn_expires_at:
        remaining = max(0.0, game.turn_expires_at - time.time())
        game.turn_expires_at = None

    # Spend AP up-front so the modal can always be completed, even if the
    # player sits idle past the turn timer in another browser tab.
    game.current_ap -= 1

    session = TriviaSession(
        id=player.id,
        game_id=game.id,
        player_id=player.id,
        catalyst_id=catalyst.id,
        property_id=property_id,
        question=q_question,
        options_json=q_options_json,
        correct_index=q_correct_index,
        category=q_category,
        source=q_source,
        created_turn=game.turn,
        paused_remaining_secs=remaining,
    )
    db.add(session)
    db.commit()

    return _trivia_session_response(session, game)


def answer_trivia(db: Session, game: GameState, player: Player, answer_index: int) -> dict:
    """
    Research action — step 2 of 2:
      - Validates the submitted answer against the active TriviaSession
      - Correct: reveals the catalyst (theme + direction + effects + turn)
      - Wrong: returns misleading intel (flipped direction); AP is still spent
      - Deducts 1 AP, restores the speed timer with the remaining time, clears session
    """
    session = db.query(TriviaSession).filter(TriviaSession.id == player.id).first()
    if not session:
        return {"success": False, "error": "No active research question"}

    # AP was already spent in research_action; no check needed here.

    catalyst = db.query(Catalyst).filter(Catalyst.id == session.catalyst_id).first()
    prop = db.query(Property).filter(Property.id == session.property_id).first()

    correct = answer_index == session.correct_index

    intel: dict = {}
    if catalyst:
        if correct:
            reveal_catalyst(db, catalyst)
            intel = {
                "theme": catalyst.theme,
                "direction": catalyst.direction,
                "fires_on_turn": catalyst.scheduled_turn,
                "rent_multiplier": catalyst.rent_multiplier,
                "value_multiplier": catalyst.value_multiplier,
                "duration": catalyst.duration,
                "copy": catalyst.copy,
            }
            # Reward: City Grant for correct research
            player.cash += BALANCE.RESEARCH_REWARD_CASH
        else:
            # Partial Intel: Reveal theme/category but hide direction/effects
            intel = {
                "theme": catalyst.theme,
                "direction": "unknown",
                "fires_on_turn": None,
                "partial": True,
                "copy": f"Something is brewing related to {catalyst.theme}...",
            }
            # Consolation Prize: Selling failed research notes
            player.cash += 200

    # Restore the speed timer with whatever time remained when research started.
    if session.paused_remaining_secs is not None and session.paused_remaining_secs > 0:
        game.turn_expires_at = time.time() + session.paused_remaining_secs

    # Clear the session regardless
    correct_index_snapshot = session.correct_index
    db.delete(session)
    db.commit()

    return {
        "success": True,
        "correct": correct,
        "correct_index": correct_index_snapshot,
        "property": prop.name if prop else None,
        "intel": intel,
        "ap_remaining": game.current_ap,
    }


def pregen_next_trivia(session_id: str) -> None:
    """
    Background task: ensure a trivia question is cached for every unique
    property category in this game, so a click on any property pulls an
    on-theme question instantly. Safe to call from FastAPI's BackgroundTasks —
    opens its own DB session so it doesn't tangle with the request's session.
    """
    from backend.database import SessionLocal  # local import to avoid cycles at module load

    db = SessionLocal()
    try:
        game = db.query(GameState).filter(GameState.id == session_id).first()
        if not game:
            return

        props = db.query(Property).filter(Property.game_id == session_id).all()
        categories = {p.theme_category for p in props if p.theme_category}
        if not categories:
            return

        for category in categories:
            pregen_id = f"{session_id}_{category}"
            if db.query(PregenTrivia).filter(PregenTrivia.id == pregen_id).first():
                continue  # already cached for this category

            q = generate_trivia(theme=category, category=category, difficulty="medium")
            db.add(PregenTrivia(
                id=pregen_id,
                game_id=session_id,
                category=category,
                question=q.question,
                options_json=json.dumps(q.options),
                correct_index=q.correct_index,
                source=q.source,
                created_turn=game.turn,
            ))
            db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


def _trivia_session_response(session: TriviaSession, game: GameState | None = None) -> dict:
    return {
        "success": True,
        "trivia": {
            "question_id": session.id,
            "question": session.question,
            "options": json.loads(session.options_json),
            "category": session.category,
            "source": session.source,
            "property_id": session.property_id,
        },
        "ap_remaining": game.current_ap if game is not None else None,
        "turn_expires_at": game.turn_expires_at if game is not None else None,
    }


# ──────────────────────────────────────────────
#  AI HELPERS
# ──────────────────────────────────────────────

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
        prop.expiry_turn = game.turn + random.randint(
            BALANCE.PROPERTY_EXPIRY_MIN_TURNS, BALANCE.PROPERTY_EXPIRY_MAX_TURNS
        )
        return {
            "actor": rival.role,
            "action": "sell",
            "property": prop.name,
            "price": prop.market_value,
            "turn": game.turn,
        }

    if atype == "develop":
        if prop.owner_id != rival.id:
            return None
        if prop.dev_level >= BALANCE.MAX_DEV_LEVEL:
            return None
        cost = _calc_dev_cost(prop.market_value)
        if rival.cash < cost:
            return None
        rival.cash -= cost
        prop.dev_level += 1
        prop.rent_value = _calc_rent(prop.base_value, prop.dev_level)
        prop.market_value = int(prop.base_value * BALANCE.dev_value_multiplier(prop.dev_level))
        return {
            "actor": rival.role,
            "action": "develop",
            "property": prop.name,
            "new_level": prop.dev_level,
            "cost": cost,
            "turn": game.turn,
        }

    return None
