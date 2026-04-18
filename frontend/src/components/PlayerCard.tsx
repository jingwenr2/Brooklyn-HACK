import { useGameStore } from "../store/gameStore";
import { money } from "../utils/format";

export default function PlayerCard() {
  const cash = useGameStore((s) => s.cash);
  const netWorth = useGameStore((s) => s.netWorth);
  const owned = useGameStore((s) => s.ownedPropertyIds);

  return (
    <aside className="card card--player">
      <h2 className="card__label">== YOU ==</h2>
      <div className="card__cash">{money(cash)}</div>
      <div className="card__row">Props: {owned.length}</div>
      <div className="card__row">Net Worth: {money(netWorth)}</div>
      <div className="card__row card__row--muted">Debt: $0</div>
    </aside>
  );
}
