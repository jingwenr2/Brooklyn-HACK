import { useGameStore } from "../store/gameStore";

export default function IntelFeed() {
  const intelLog = useGameStore((s) => s.intelLog);
  const selectedId = useGameStore((s) => s.selectedPropertyId);

  return (
    <footer className="intel">
      <span className="intel__label">INTEL</span>
      <span className="intel__body">
        {intelLog.length > 0 ? (
          <span style={{ color: intelLog[0].message.includes("Partial Intel") ? "var(--color-orange)" : "inherit" }}>
            [T{intelLog[0].turn}] {intelLog[0].message}
          </span>
        ) : selectedId ? (
          `Selected: ${selectedId.replace(/_/g, " ")}. Spend AP on Research for intel.`
        ) : (
          "No intel yet. Research properties to reveal market data."
        )}
      </span>
      {intelLog.length > 1 && (
        <span
          className="intel__label"
          style={{ marginLeft: "auto", cursor: "default" }}
          title={intelLog.map((e) => `[T${e.turn}] ${e.message}`).join("\n")}
        >
          {intelLog.length} ENTRIES
        </span>
      )}
    </footer>
  );
}
