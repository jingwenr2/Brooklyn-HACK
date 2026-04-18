from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

class GameState(Base):
    __tablename__ = "game_state"

    id = Column(String, primary_key=True, index=True)
    turn = Column(Integer, default=1)
    max_turns = Column(Integer, default=20)
    current_ap = Column(Integer, default=0)
    
    # Relationships
    players = relationship("Player", back_populates="game")
    properties = relationship("Property", back_populates="game")

class Player(Base):
    __tablename__ = "players"

    id = Column(String, primary_key=True, index=True)
    game_id = Column(String, ForeignKey("game_state.id"))
    role = Column(String)  # "USER" or "FLIPPER"
    cash = Column(Integer, default=22000)
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
    
    name = Column(String)                 # e.g., "Startup Lofts"
    district = Column(String)             # e.g., "pixel_park"
    tier = Column(String)                 # "budget", "mid", "premium"
    
    base_value = Column(Integer)
    market_value = Column(Integer)
    rent_value = Column(Integer)
    dev_level = Column(Integer, default=0) # 0 to 3
    
    # Mechanics tracking
    is_listed = Column(Boolean, default=False)
    expiry_turn = Column(Integer, nullable=True) # Turn number when unbought property expires

    # Flipper AI targeting (visible to player as the 👀 icon)
    is_flipper_target = Column(Boolean, default=False)
    flipper_acquire_turn = Column(Integer, nullable=True) # Turn Flipper plans to buy

    game = relationship("GameState", back_populates="properties")
    owner = relationship("Player", back_populates="properties")
