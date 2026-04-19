from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base


class GameState(Base):
    __tablename__ = "game_state"

    id = Column(String, primary_key=True, index=True)
    turn = Column(Integer, default=1)
    max_turns = Column(Integer, default=20)
    current_ap = Column(Integer, default=0)
    finance_tier = Column(Integer, default=1)
    is_paused = Column(Boolean, default=False)
    turn_expires_at = Column(Float, nullable=True) # Timestamp for speed timer
    timer_remaining_at_pause = Column(Float, nullable=True) # Seconds remaining when paused

    # Relationships
    players = relationship("Player", back_populates="game")
    properties = relationship("Property", back_populates="game")


class Player(Base):
    __tablename__ = "players"

    id = Column(String, primary_key=True, index=True)
    game_id = Column(String, ForeignKey("game_state.id"))
    role = Column(String)                        # "USER" or "FLIPPER"
    cash = Column(Integer, default=22_000)
    debt = Column(Integer, default=0)
    reputation = Column(Integer, default=0)

    # State tracking
    is_bankrupt = Column(Boolean, default=False)

    game = relationship("GameState", back_populates="players")
    properties = relationship("Property", back_populates="owner")


class Property(Base):
    __tablename__ = "properties"

    id = Column(String, primary_key=True, index=True)
    game_id = Column(String, ForeignKey("game_state.id"))
    owner_id = Column(String, ForeignKey("players.id"), nullable=True)

    name = Column(String)                        # e.g., "Startup Lofts"
    district = Column(String)                    # e.g., "pixel_park"
    tier = Column(String)                        # "budget", "mid", "premium"
    sprite_key = Column(String, nullable=True)   # Key into sprite_registry.json

    base_value = Column(Integer)                 # Price at game start
    market_value = Column(Integer)               # Current value (shifts w/ catalysts)
    rent_value = Column(Integer)                 # base_value × BASE_RENT_YIELD
    dev_level = Column(Integer, default=0)       # 0–3
    tenant_bonus = Column(Float, default=1.0)    # Premium tenant multiplier

    # Mechanics tracking
    is_listed = Column(Boolean, default=False)
    unlock_turn = Column(Integer, default=1)     # Turn this property becomes available
    expiry_turn = Column(Integer, nullable=True) # Turn it expires if unbought

    # Flipper AI targeting (visible to player as the 👀 icon)
    is_flipper_target = Column(Boolean, default=False)
    flipper_acquire_turn = Column(Integer, nullable=True) # Turn Flipper plans to buy

    game = relationship("GameState", back_populates="properties")
    owner = relationship("Player", back_populates="properties")
