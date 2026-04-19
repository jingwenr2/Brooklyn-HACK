import { useGameStore } from "../store/gameStore";
import { money } from "../utils/format";

export default function PauseMenu() {
  const pauseOpen = useGameStore((s) => s.pauseOpen);
  const setPauseOpen = useGameStore((s) => s.setPauseOpen);
  const turn = useGameStore((s) => s.turn);
  const netWorth = useGameStore((s) => s.netWorth);
  const ownedIds = useGameStore((s) => s.ownedPropertyIds);

  if (!pauseOpen) return null;

  const handleSaveQuit = () => {
    localStorage.setItem("mogul_blocks_save", "1");
    window.location.href = "/";
  };

  return (
    <div className="dice-overlay" onClick={() => setPauseOpen(false)}>
      <div className="dice-modal" style={{ minWidth: 340 }} onClick={(e) => e.stopPropagation()}>
        <h2 className="dice-modal__title">PAUSED</h2>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="card__row" style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--color-text-muted)" }}>Turn</span>
            <span>{turn} / 20</span>
          </div>
          <div className="card__row" style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--color-text-muted)" }}>Net Worth</span>
            <span style={{ color: "var(--color-gold)" }}>{money(netWorth)}</span>
          </div>
          <div className="card__row" style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--color-text-muted)" }}>Properties</span>
            <span>{ownedIds.length}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", marginTop: 8 }}>
          <button className="btn btn--primary" onClick={() => setPauseOpen(false)}>
            RESUME
          </button>
          <button className="btn" onClick={handleSaveQuit}>
            SAVE &amp; QUIT
          </button>
        </div>
      </div>
    </div>
  );
}
