import { useState } from "react";
import { useGameStore } from "../store/gameStore";

export default function APDiceRoll() {
  const open = useGameStore((s) => s.diceModalOpen);
  const turn = useGameStore((s) => s.turn);
  const setAP = useGameStore((s) => s.setAP);

  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  if (!open) return null;

  const roll = () => {
    setRolling(true);
    setResult(null);
    const ap = Math.floor(Math.random() * 4) + 2; // 1d4+1 → 2..5
    window.setTimeout(() => {
      setRolling(false);
      setResult(ap);
    }, 1400);
  };

  const proceed = () => {
    if (result == null) return;
    setAP(result);
    setResult(null);
  };

  return (
    <div className="dice-overlay">
      <div className="dice-modal">
        <h2 className="dice-modal__title">TURN {turn}</h2>
        <p className="dice-modal__sub">Roll for Action Points</p>
        <div className={`dice ${rolling ? "dice--spinning" : ""}`}>
          <span className="dice__face">{rolling ? "?" : (result ?? "?")}</span>
        </div>
        {result == null ? (
          <button
            className="btn btn--primary"
            onClick={roll}
            disabled={rolling}
          >
            {rolling ? "ROLLING..." : "ROLL"}
          </button>
        ) : (
          <>
            <div className="dice-modal__result">+{result} ACTION POINTS</div>
            <button className="btn btn--primary" onClick={proceed}>
              PROCEED
            </button>
          </>
        )}
      </div>
    </div>
  );
}
