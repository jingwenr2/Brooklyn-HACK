import { useGameStore } from "../store/gameStore";
import { PROPERTIES } from "../data/properties";

export default function Announcements() {
  const turn = useGameStore((s) => s.turn);
  const propertyMeta = useGameStore((s) => s.propertyMeta);
  const listedPropertyIds = useGameStore((s) => s.listedPropertyIds);

  const announcements: string[] = [];

  listedPropertyIds.forEach((id) => {
    const meta = propertyMeta[id];
    if (meta && meta.expiryTurn != null) {
      const turnsLeft = meta.expiryTurn - turn;
      
      // Triggers EXACTLY when a property is on its FINAL turn
      if (turnsLeft === 0) {
        announcements.push(`CRITICAL: A property leaves the market at the end of THIS TURN! (⏳)`);
      }
    }
  });

  return (
    <div className="card card--announcements">
      <h2 className="card__label">== ANNOUNCEMENTS ==</h2>
      {announcements.length > 0 ? (
        announcements.map((msg, i) => (
          <div key={i} className="card__row" style={{ color: "var(--color-danger)" }}>
            &gt; {msg}
          </div>
        ))
      ) : (
        <div className="card__row card__row--muted">
          &gt; No active deadlines.
        </div>
      )}
    </div>
  );
}
