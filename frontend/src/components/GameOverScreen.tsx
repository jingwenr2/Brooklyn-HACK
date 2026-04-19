import { useGameStore } from "../store/gameStore";
import { money } from "../utils/format";

export default function GameOverScreen() {
  const data = useGameStore((s) => s.gameOverData);

  if (!data) return null;

  const handleReplay = () => {
    window.location.href = "/game";
  };

  const handleMenu = () => {
    window.location.href = "/";
  };

  return (
    <div className="dice-overlay">
      <div className="dice-modal" style={{ minWidth: 400, gap: 16 }}>
        <h1
          className="dice-modal__title"
          style={{
            fontSize: 20,
            color: data.victory ? "var(--color-gold)" : "var(--color-danger)",
          }}
        >
          {data.victory ? "MOGUL VICTORY" : "GAME OVER"}
        </h1>

        <p className="dice-modal__sub">{data.reason}</p>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="card__row" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Net Worth</span>
            <span style={{ color: "var(--color-gold)" }}>{money(data.netWorth)}</span>
          </div>
          <div className="card__row" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Properties</span>
            <span>{data.propertiesOwned}</span>
          </div>
          <div className="card__row" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Turns Played</span>
            <span>{data.turnsPlayed}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button className="btn btn--primary" onClick={handleReplay}>
            PLAY AGAIN
          </button>
          <button className="btn" onClick={handleMenu}>
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
