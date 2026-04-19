import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import APDiceRoll from "../components/APDiceRoll";
import DistrictBoard from "../components/DistrictBoard";
import PlayerCard from "../components/PlayerCard";
import RivalCard from "../components/RivalCard";
import TopBar from "../components/TopBar";
import Announcements from "../components/Announcements";
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
  const initGame = useGameStore((s) => s.initGame);
  const resumeGame = useGameStore((s) => s.resumeGame);
  const buyProperty = useGameStore((s) => s.buyProperty);
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
  const canResearch = canAct;
  
  const selectedMeta = selectedId ? propertyMeta[selectedId] : null;
  const selectedPriceStr = selectedMeta ? `$${Math.floor(selectedMeta.marketValue / 1000)}k` : "";

  return (
    <div className="game">
      <TopBar />
      <div className="game__body">
        <section className="game__left">
          <PlayerCard />
          <div className="card card--trash-talk">
            <h2 className="card__label">== TRASH TALK ==</h2>
            <div className="card__row card__row--muted">
              &gt; Flipper is silent for now.
            </div>
          </div>
        </section>

        <section className="game__center">
          <DistrictBoard />
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

      <footer className="intel">
        <span className="intel__label">INTEL FEED</span>
        <span className="intel__body">
          {selectedId
            ? `Property selected: ${selectedId.replace(/_/g, " ")}. Choose an action.`
            : "No intel yet. Spend AP on Research to reveal market catalysts."}
        </span>
      </footer>

      <APDiceRoll />
    </div>
  );
}
