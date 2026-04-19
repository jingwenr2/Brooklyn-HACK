"""Balance constants and runtime settings for Mogul Blocks."""
from __future__ import annotations

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Balance:
    # --- STARTING ---
    STARTING_CASH: int = 22_000
    MAX_TURNS: int = 20
    TURN_TIME_LIMIT: int = 40
    EARLY_WIN_TURN: int = 10
    EARLY_WIN_NET_WORTH: int = 100_000
    EARLY_WIN_MIN_PROPERTIES: int = 3

    # --- ACTION POINTS (dice roll each turn) ---
    AP_DICE_SIDES: int = 4
    AP_DICE_MODIFIER: int = 1
    AP_MIN: int = 2
    AP_MAX: int = 5
    LOW_ROLL_THRESHOLD: int = 2
    LOW_ROLL_PENALTY_CASH: int = 4_000

    # --- TENSION MECHANICS ---
    PROPERTY_EXPIRY_MIN_TURNS: int = 3
    PROPERTY_EXPIRY_MAX_TURNS: int = 6
    FLIPPER_EYES_WARN_TURNS_EASY: int = 2
    FLIPPER_EYES_WARN_TURNS_HARD: int = 1
    CASH_DANGER_THRESHOLD: float = 1.0

    # --- RENT ---
    BASE_RENT_YIELD: float = 0.12  # 12% of property value per turn

    # Rent multipliers by development level
    RENT_MULTIPLIER_0: float = 1.0   # Undeveloped
    RENT_MULTIPLIER_1: float = 1.5   # Basic upgrade
    RENT_MULTIPLIER_2: float = 2.2   # Major upgrade
    RENT_MULTIPLIER_3: float = 3.0   # Flagship

    # --- DEVELOPMENT ---
    MAX_DEV_LEVEL: int = 3
    DEV_FLAT_FEE: int = 500          # Fixed fee per upgrade
    DEV_PERCENT_FEE: float = 0.15    # + 15% of current property value

    # Market value multiplier per dev level (for net worth calc)
    DEV_VALUE_MULT_0: float = 1.0
    DEV_VALUE_MULT_1: float = 1.3    # +30%
    DEV_VALUE_MULT_2: float = 1.7    # +70%
    DEV_VALUE_MULT_3: float = 2.2    # +120%

    # --- MORTGAGE (Tier 2, unlocks at turn 10) ---
    MORTGAGE_UNLOCK_TURN: int = 10
    MAX_LTV: float = 0.70
    MORTGAGE_INTEREST_RATE: float = 0.05  # 5% per turn

    # --- BANKRUPTCY ---
    DEBT_WARNING_LTV: float = 0.80
    BANKRUPTCY_LTV: float = 1.00

    # --- DISTRICT ---
    MONOPOLY_THRESHOLD: int = 3
    MONOPOLY_BONUS: float = 1.25

    # --- AI (Flipper — MVP) ---
    FLIPPER_PROFIT_THRESHOLD: float = 0.10
    FLIPPER_MAX_BID_MULTIPLIER: float = 1.1
    AI_BID_NOISE: float = 0.10

    # --- HEAT ---
    HEAT_INDICATOR_TURNS_BEFORE: int = 2

    def rent_multiplier(self, dev_level: int) -> float:
        return {
            0: self.RENT_MULTIPLIER_0,
            1: self.RENT_MULTIPLIER_1,
            2: self.RENT_MULTIPLIER_2,
            3: self.RENT_MULTIPLIER_3,
        }.get(dev_level, 1.0)

    def dev_value_multiplier(self, dev_level: int) -> float:
        return {
            0: self.DEV_VALUE_MULT_0,
            1: self.DEV_VALUE_MULT_1,
            2: self.DEV_VALUE_MULT_2,
            3: self.DEV_VALUE_MULT_3,
        }.get(dev_level, 1.0)


BALANCE = Balance()


CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_TRIVIA_MODEL = os.getenv("OPENAI_TRIVIA_MODEL", "gpt-4o-mini")
DB_PATH = os.getenv("MOGUL_BLOCKS_DB_PATH", "backend/data/mogul_blocks.db")
