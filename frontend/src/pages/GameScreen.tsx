import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import APDiceRoll from "../components/APDiceRoll";
import DistrictBoard from "../components/DistrictBoard";
import PlayerCard from "../components/PlayerCard";
import RivalCard from "../components/RivalCard";
import TopBar from "../components/TopBar";
import Announcements from "../components/Announcements";
import TurnTimer from "../components/TurnTimer";
import Portfolio from "../components/Portfolio";
import GameOverScreen from "../components/GameOverScreen";
import PauseMenu from "../components/PauseMenu";
import EventToast from "../components/EventToast";
import BluffBar from "../components/BluffBar";
import IntelFeed from "../components/IntelFeed";
import { useGameStore } from "../store/gameStore";

export default function GameScreen() {
  const [searchParams] = useSearchParams();
  const didInit = useRef(false);
  const ap = useGameStore((s) => s.ap);
  const turn = useGameStore((s) => s.turn);
  const maxTurns = useGameStore((s) => s.maxTurns);
  const isBankrupt = useGameStore((s) => s.isBankrupt);
  const selectedId = useGameStore((s) => s.selectedPropertyId);
  const listedIds = useGameStore((s) => s.listedPropertyIds);
  const ownedIds = useGameStore((s) => s.ownedPropertyIds);
  const propertyMeta = useGameStore((s) => s.propertyMeta);
  const loading = useGameStore((s) => s.loading);
  const gameOverData = useGameStore((s) => s.gameOverData);
  const initGame = useGameStore((s) => s.initGame);
  const resumeGame = useGameStore((s) => s.resumeGame);
  const buyProperty = useGameStore((s) => s.buyProperty);
  const developProperty = useGameStore((s) => s.developProperty);
  const researchProperty = useGameStore((s) => s.researchProperty);
  const endTurn = useGameStore((s) => s.endTurn);

  // Initialize the game on first mount
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    if (searchParams.get("resume") === "1") {
      resumeGame();
    } else {
      initGame();
    }
  }, []);

  const isGameOver = isBankrupt || turn >= maxTurns;
  const canAct = ap != null && ap >= 1 && selectedId != null && !loading && !isGameOver;
  const canBuy = canAct && listedIds.includes(selectedId!) && !ownedIds.includes(selectedId!);
  const canDevelop = canAct && ownedIds.includes(selectedId!) && (propertyMeta[selectedId!]?.devLevel ?? 0) < 3;
  const canResearch = canAct;
  
  const selectedMeta = selectedId ? propertyMeta[selectedId] : null;
  const selectedPriceStr = selectedMeta ? `$${Math.floor(selectedMeta.marketValue / 1000)}k` : "";

  // Dev cost: $1,500 flat + 15% of market value (from config.py)
  const devCost = selectedMeta ? 1500 + Math.floor(0.15 * selectedMeta.marketValue) : 0;
  const devCostStr = devCost ? `$${(devCost / 1000).toFixed(1)}k` : "";

  return (
    <div className="game">
      <TopBar />
      <div className="game__body">
        <section className="game__left">
          <PlayerCard />
          <Portfolio />
          <BluffBar />
        </section>

        <section className="game__center">
          <DistrictBoard />
          <TurnTimer />
        </section>

        <section className="game__right">
          <RivalCard />
          <div className="action-panel">
            <h2 className="card__label">== ACTIONS ==</h2>

            {selectedId ? (
              <div className="card__row" style={{ color: "var(--color-text-main)" }}>
                Selected: {selectedId.replace(/_/g, " ").toUpperCase()}
              </div>
            ) : (
              <div className="card__row card__row--muted">
                Click a property to select it
              </div>
            )}

            <button
              className="btn"
              disabled={!canBuy}
              onClick={buyProperty}
            >
              {canBuy && selectedPriceStr ? `BUY — ${selectedPriceStr}` : "BUY"}
            </button>
            <button
              className="btn"
              disabled={!canDevelop}
              onClick={developProperty}
            >
              {canDevelop && devCostStr ? `DEVELOP — ${devCostStr}` : "DEVELOP"}
            </button>
            <button
              className="btn"
              disabled={!canResearch}
              onClick={researchProperty}
            >
              RESEARCH
            </button>
            <button
              className="btn btn--primary"
              onClick={endTurn}
              disabled={ap == null || loading || isGameOver}
            >
              END TURN
            </button>
          </div>
          <Announcements />
        </section>
      </div>

      <IntelFeed />

      <APDiceRoll />
      <PauseMenu />
      <EventToast />
      {gameOverData && <GameOverScreen />}
    </div>
  );
}
