import APDiceRoll from "../components/APDiceRoll";
import DistrictBoard from "../components/DistrictBoard";
import PlayerCard from "../components/PlayerCard";
import RivalCard from "../components/RivalCard";
import TopBar from "../components/TopBar";
import { useGameStore } from "../store/gameStore";

export default function GameScreen() {
  const ap = useGameStore((s) => s.ap);
  const endTurn = useGameStore((s) => s.endTurn);

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
            <button className="btn" disabled>
              BUY
            </button>
            <button className="btn" disabled>
              RESEARCH
            </button>
            <button
              className="btn btn--primary"
              onClick={endTurn}
              disabled={ap == null}
            >
              END TURN
            </button>
          </div>
        </section>
      </div>

      <footer className="intel">
        <span className="intel__label">INTEL FEED</span>
        <span className="intel__body">
          No intel yet. Spend AP on Research to reveal market catalysts.
        </span>
      </footer>

      <APDiceRoll />
    </div>
  );
}
