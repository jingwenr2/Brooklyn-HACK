import { useGameStore } from "../store/gameStore";

export default function Announcements() {
  const turn = useGameStore((s) => s.turn);
  const propertyMeta = useGameStore((s) => s.propertyMeta);
  const listedPropertyIds = useGameStore((s) => s.listedPropertyIds);

  const announcements: string[] = [];

  listedPropertyIds.forEach((id) => {
    const meta = propertyMeta[id];
    if (meta && meta.expiryTurn != null) {
      const turnsLeft = meta.expiryTurn - turn;
      // Triggers EXACTLY when a property has 1 turn left
      if (turnsLeft === 1) {
        announcements.push(`Warning: A property leaves the market NEXT TURN! (Look for the ⏳)`);
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
