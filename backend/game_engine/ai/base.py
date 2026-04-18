"""Abstract base for AI rival decision logic.

Each archetype (Flipper, Builder, Analyst, Shark) subclasses RivalStrategy.
Decisions are rule-based by design — no LLM calls in this path. Keeping it
deterministic makes tests trivial and lets balance tuning happen via config
instead of prompt engineering.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TypedDict

from sqlalchemy.orm import Session

from backend.models.core import GameState, Player


class Action(TypedDict, total=False):
    """A single action the action processor will apply on behalf of a rival."""
    type: str              # "buy" | "develop" | "sell" | "research" | ...
    property_id: str
    amount: int


class RivalStrategy(ABC):
    """Base strategy for an AI rival. One instance per archetype, stateless.

    State lives on the Player/Property rows; the strategy is pure logic.
    """

    archetype: str = "base"

    @abstractmethod
    def scan(self, db: Session, game: GameState, rival: Player) -> None:
        """Inspect the board and flag a target for a future buy.

        Runs at end of turn so the 👀 icon is visible to the player on the
        next turn. Setting a target is a commitment; cleared only when the
        target is acquired, expires, or the rival is out-bid.
        """

    @abstractmethod
    def act(self, db: Session, game: GameState, rival: Player) -> list[Action]:
        """Return actions to execute this turn, respecting rival.cash.

        Called during the AI phase (after the player phase, before rent
        collection). The action processor applies each action in order;
        failed actions are logged but do not halt the turn.
        """
