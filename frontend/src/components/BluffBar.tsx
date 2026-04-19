import { useEffect, useState } from "react";
import { useGameStore } from "../store/gameStore";

const BLUFF_PRESETS = [
  "I'm going all-in on premium properties.",
  "I'm dumping my portfolio soon.",
  "Pixel Park is overvalued.",
  "I'm coming for your properties",
];

export default function BluffBar() {
  const turn = useGameStore((s) => s.turn);
  const ap = useGameStore((s) => s.ap);
  const addToast = useGameStore((s) => s.addToast);
  const [input, setInput] = useState("");
  const [announced, setAnnounced] = useState(false);

  // Reset announced state when a new turn starts
  useEffect(() => {
    setAnnounced(false);
  }, [turn]);

  // Bluff is free (no AP cost) but only one per turn, and only before spending AP
  const canAnnounce = ap != null && !announced;

  const handleAnnounce = () => {
    const message = input.trim();
    if (!message || !canAnnounce) return;

    // TODO: POST to /api/game/{session}/announce once backend supports it
    addToast(`You announced: "${message}"`, "warning");
    setAnnounced(true);
    setInput("");
  };

  // Reset announced state when a new turn starts (ap resets to non-null)
  // This is handled naturally since BluffBar re-renders when ap changes

  return (
    <div className="card">
      <h2 className="card__label">== CHAT ==</h2>

      {announced ? (
        <div className="card__row" style={{ color: "var(--color-orange)", fontSize: 16, marginTop: 8 }}>
          Announcement made this turn.
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnnounce()}
              placeholder="Broadcast your bluff..."
              disabled={!canAnnounce}
              style={{
                flex: 1,
                background: "transparent",
                border: "1px solid var(--color-panel-border)",
                color: "var(--color-text-main)",
                fontFamily: "var(--font-body)",
                fontSize: 16,
                padding: "4px 8px",
                outline: "none",
              }}
            />
            <button
              className="btn"
              disabled={!canAnnounce || !input.trim()}
              onClick={handleAnnounce}
              style={{ fontSize: 10, padding: "4px 12px", border: "1px solid var(--color-panel-border)" }}
            >
              SEND
            </button>
          </div>

          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
            {BLUFF_PRESETS.map((preset) => (
              <div
                key={preset}
                className="card__row"
                style={{ 
                  cursor: canAnnounce ? "pointer" : "default", 
                  fontSize: 18,
                  opacity: canAnnounce ? 0.7 : 0.35,
                  lineHeight: "1.2",
                  border: "1px solid var(--color-panel-border)",
                  padding: "6px 10px",
                }}
                onClick={() => canAnnounce && setInput(preset)}
              >
                &gt; {preset}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
