import { useGameStore } from "../store/gameStore";
import { PROPERTIES } from "../data/properties";
import { money } from "../utils/format";

export default function Portfolio() {
  const ownedIds = useGameStore((s) => s.ownedPropertyIds);
  const propertyMeta = useGameStore((s) => s.propertyMeta);
  const cash = useGameStore((s) => s.cash);
  const debt = useGameStore((s) => s.debt);
  const netWorth = useGameStore((s) => s.netWorth);
  const selectProperty = useGameStore((s) => s.selectProperty);

  const ownedProperties = PROPERTIES.filter((p) => ownedIds.includes(p.id));
  const totalRent = ownedProperties.reduce((sum, p) => {
    const meta = propertyMeta[p.id];
    return sum + (meta?.rentValue ?? 0);
  }, 0);
  const portfolioValue = ownedProperties.reduce((sum, p) => {
    const meta = propertyMeta[p.id];
    return sum + (meta?.marketValue ?? p.baseValue);
  }, 0);

  return (
    <div className="card">
      <h2 className="card__label">== PORTFOLIO ==</h2>

      <div className="card__row" style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Cash</span>
        <span style={{ color: "var(--color-gold)" }}>{money(cash)}</span>
      </div>
      <div className="card__row" style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Holdings</span>
        <span style={{ color: "var(--color-neon-blue)" }}>{money(portfolioValue)}</span>
      </div>
      {debt > 0 && (
        <div className="card__row" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Debt</span>
          <span style={{ color: "var(--color-danger)" }}>-{money(debt)}</span>
        </div>
      )}
      <div
        className="card__row"
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid var(--color-panel-border)",
          paddingTop: 6,
          marginTop: 2,
        }}
      >
        <span>Net Worth</span>
        <span style={{ color: "var(--color-gold)", fontFamily: "var(--font-display)", fontSize: 14 }}>
          {money(netWorth)}
        </span>
      </div>
      <div className="card__row" style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Rent/turn</span>
        <span style={{ color: "var(--color-neon-green)" }}>+{money(totalRent)}</span>
      </div>
    </div>
  );
}
