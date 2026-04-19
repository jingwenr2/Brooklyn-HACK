import { useGameStore } from "../store/gameStore";
import { PROPERTIES } from "../data/properties";

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

  const getBuildingsInSector = (category: string) => {
    return Object.entries(propertyMeta)
      .filter(([_, meta]) => meta.themeCategory === category)
      .map(([id, _]) => PROPERTIES.find((p) => p.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  // Revealed-but-not-yet-fired catalysts (from Research)
  catalysts
    .filter((c) => c.revealed && c.status === "pending")
    .forEach((c) => {
      const turnsAway = c.scheduledTurn - turn;
      if (turnsAway <= 0) return;
      const buildings = getBuildingsInSector(c.category);
      lines.push({
        message: `INTEL: ${c.category.toUpperCase()} (${buildings}) — ${c.direction.toUpperCase()} in ${turnsAway}t`,
        color: "var(--color-gold)",
      });
    });

  // Active (currently shifting the market) catalysts
  catalysts
    .filter((c) => c.status === "active")
    .forEach((c) => {
      const buildings = getBuildingsInSector(c.category);
      const isBoom = c.direction === "boom";
      lines.push({
        message: `${c.category.toUpperCase()} SECTOR (${buildings}): ${isBoom ? "RENT SURGE! ↑" : "RENT CRASH! ↓"}`,
        color: isBoom ? "var(--color-neon-green)" : "var(--color-danger)",
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
