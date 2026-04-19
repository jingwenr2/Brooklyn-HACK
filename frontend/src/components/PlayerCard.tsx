import { useGameStore } from "../store/gameStore";
import { money } from "../utils/format";

export default function PlayerCard() {
  const cash = useGameStore((s) => s.cash);
  const lastDelta = useGameStore((s) => s.lastCashDelta);
  const deltaKey = useGameStore((s) => s.cashDeltaKey);
  const netWorth = useGameStore((s) => s.netWorth);
  const debt = useGameStore((s) => s.debt);
  const owned = useGameStore((s) => s.ownedPropertyIds);

  return (
    <aside className="card card--player">
      <h2 className="card__label">== YOU ==</h2>
      <div className="card__cash-container">
        <div className="card__cash">{money(cash)}</div>
        {lastDelta !== null && (
          <div 
            key={deltaKey}
            className={`card__delta ${lastDelta < 0 ? "card__delta--neg" : "card__delta--pos"}`}
          >
            {lastDelta < 0 ? "-" : "+"}{money(Math.abs(lastDelta))}
          </div>
        )}
      </div>
      <div className="card__row">Props: {owned.length}</div>
      <div className="card__row">Net Worth: {money(netWorth)}</div>
      <div className={`card__row ${debt > 0 ? "card__row--danger" : "card__row--muted"}`}>
        Debt: {money(debt)}
      </div>
    </aside>
  );
}
