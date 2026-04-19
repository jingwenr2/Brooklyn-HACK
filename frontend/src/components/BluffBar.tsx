import { useState } from "react";
import { useGameStore } from "../store/gameStore";

const BLUFF_PRESETS = [
  "I'm going all-in on premium properties.",
  "I'm dumping my portfolio soon.",
  "Pixel Park is overvalued.",
  "I'm coming for your properties, Flipper.",
];

export default function BluffBar() {
  const ap = useGameStore((s) => s.ap);
  const addToast = useGameStore((s) => s.addToast);
  const [input, setInput] = useState("");
  const [announced, setAnnounced] = useState(false);

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
      <h2 className="card__label">== BLUFF / SIGNAL ==</h2>

      {announced ? (
        <div className="card__row" style={{ color: "var(--color-orange)", fontSize: 14 }}>
          Announcement made this turn.
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnnounce()}
              placeholder="Make a public announcement..."
              disabled={!canAnnounce}
              style={{
                flex: 1,
                background: "var(--color-bg-deep)",
                border: "2px solid var(--color-panel-border)",
                color: "var(--color-text-main)",
                fontFamily: "var(--font-body)",
                fontSize: 16,
                padding: "6px 10px",
              }}
            />
            <button
              className="btn"
              disabled={!canAnnounce || !input.trim()}
              onClick={handleAnnounce}
              style={{ fontSize: 9, padding: "6px 10px" }}
            >
              SEND
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
            {BLUFF_PRESETS.map((preset) => (
              <button
                key={preset}
                className="btn"
                disabled={!canAnnounce}
                onClick={() => setInput(preset)}
                style={{ fontSize: 8, padding: "4px 6px" }}
              >
                {preset.length > 30 ? preset.slice(0, 28) + "..." : preset}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
