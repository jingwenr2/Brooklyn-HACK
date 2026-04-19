import { useGameStore } from "../store/gameStore";

interface Line {
  message: string;
  color: string;
}

export default function Announcements() {
  const turn = useGameStore((s) => s.turn);
  const propertyMeta = useGameStore((s) => s.propertyMeta);
  const listedPropertyIds = useGameStore((s) => s.listedPropertyIds);
  const catalysts = useGameStore((s) => s.catalysts);

  const lines: Line[] = [];

  // Revealed-but-not-yet-fired catalysts (from Research)
  catalysts
    .filter((c) => c.revealed && c.status === "pending")
    .forEach((c) => {
      const turnsAway = c.scheduledTurn - turn;
      if (turnsAway <= 0) return;
      const arrow = c.direction === "boom" ? "↑" : "↓";
      lines.push({
        message: `INTEL: ${c.theme} ${arrow} fires in ${turnsAway} turn${turnsAway === 1 ? "" : "s"}`,
        color: c.direction === "boom" ? "var(--color-neon-green)" : "var(--color-danger)",
      });
    });

  // Active (currently shifting the market) catalysts
  catalysts
    .filter((c) => c.status === "active")
    .forEach((c) => {
      const arrow = c.direction === "boom" ? "↑" : "↓";
      lines.push({
        message: `MARKET ${arrow}: ${c.theme} (rent ×${c.rentMultiplier.toFixed(2)}, val ×${c.valueMultiplier.toFixed(2)})`,
        color: c.direction === "boom" ? "var(--color-neon-green)" : "var(--color-danger)",
      });
    });

  // Listings expiring THIS turn
  listedPropertyIds.forEach((id) => {
    const meta = propertyMeta[id];
    if (meta && meta.expiryTurn != null) {
      const turnsLeft = meta.expiryTurn - turn;
      if (turnsLeft === 0) {
        lines.push({
          message: `CRITICAL: A property leaves the market at the end of THIS TURN! (⏳)`,
          color: "var(--color-danger)",
        });
      }
    }
  });

  return (
    <div className="card card--announcements">
      <h2 className="card__label">== ANNOUNCEMENTS ==</h2>
      {lines.length > 0 ? (
        lines.map((line, i) => (
          <div key={i} className="card__row" style={{ color: line.color }}>
            &gt; {line.message}
          </div>
        ))
      ) : (
        <div className="card__row card__row--muted">&gt; No active deadlines.</div>
      )}
    </div>
  );
}
