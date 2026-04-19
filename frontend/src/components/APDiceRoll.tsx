import { useEffect, useState } from "react";
import { useGameStore } from "../store/gameStore";

export default function APDiceRoll() {
  const open = useGameStore((s) => s.diceModalOpen);
  const turn = useGameStore((s) => s.turn);
  const diceResult = useGameStore((s) => s.diceResult);
  const rollAP = useGameStore((s) => s.rollAP);
  const activateTimer = useGameStore((s) => s.activateTimer);

  const [rolling, setRolling] = useState(false);
  const [displayFace, setDisplayFace] = useState<number | null>(null);
  const [autoProceedTime, setAutoProceedTime] = useState<number | null>(null);

  useEffect(() => {
    if (autoProceedTime === null) return;

    if (autoProceedTime <= 0) {
      proceed();
      return;
    }

    const timer = setTimeout(() => {
      setAutoProceedTime(autoProceedTime - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoProceedTime]);

  if (!open) return null;

  const roll = async () => {
    setRolling(true);
    setDisplayFace(null);

    try {
      const rollPromise = rollAP();
      const timerPromise = new Promise((resolve) => setTimeout(resolve, 1400));

      await Promise.all([rollPromise, timerPromise]);

      const result = useGameStore.getState().diceResult;
      setRolling(false);
      setDisplayFace(result?.face ?? null);
      // Lucky/bad rolls hold longer so the player can read the flavor line.
      const hold = result && (result.tone === "bad" || result.tone === "lucky") ? 5 : 3;
      setAutoProceedTime(hold);
    } catch (err) {
      console.error("Dice roll failed:", err);
      setRolling(false);
      useGameStore.getState().addToast("Connection error. Try rolling again.", "danger");
    }
  };

  const proceed = async () => {
    if (diceResult == null) return;
    setDisplayFace(null);
    setAutoProceedTime(null);

    await activateTimer();

    useGameStore.setState({ diceModalOpen: false });
  };

  const toneClass = diceResult ? `dice-modal--${diceResult.tone}` : "";
  const showResult = !rolling && diceResult && displayFace != null;

  return (
    <div className="dice-overlay">
      <div className={`dice-modal ${toneClass}`}>
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            fontSize: 8,
            color: "var(--color-copper)",
            letterSpacing: 1,
          }}
        >
          [ TIMER PAUSED ]
        </div>
        <h2 className="dice-modal__title">TURN {turn}</h2>
        <p className="dice-modal__sub">Roll for Action Points</p>
        <div className={`dice ${rolling ? "dice--spinning" : ""}`}>
          <span className="dice__face">{rolling ? "?" : (displayFace ?? "?")}</span>
        </div>
        {!showResult ? (
          <button className="btn btn--primary" onClick={roll} disabled={rolling}>
            {rolling ? "ROLLING..." : "ROLL"}
          </button>
        ) : (
          <>
            <div className="dice-modal__result">+{diceResult!.ap} ACTION POINTS</div>
            {diceResult!.cashDelta !== 0 && (
              <div
                className={`dice-modal__cash ${
                  diceResult!.cashDelta < 0 ? "dice-modal__cash--neg" : "dice-modal__cash--pos"
                }`}
              >
                {diceResult!.cashDelta < 0 ? "-" : "+"}${Math.abs(diceResult!.cashDelta).toLocaleString()}
              </div>
            )}
            {diceResult!.flavor && (
              <div className="dice-modal__flavor">"{diceResult!.flavor}"</div>
            )}
            <button className="btn btn--primary" onClick={proceed}>
              PROCEED {autoProceedTime !== null && `(${autoProceedTime})`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
