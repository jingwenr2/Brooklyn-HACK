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
      // Display the actual AP on the dice face to avoid confusion
      setDisplayFace(result?.ap ?? null);
      
      // If a cash event happened (Bad/Lucky), give 10s to read. Otherwise 8s.
      const holdTime = result && result.cashDelta !== 0 ? 10 : 8;
      setAutoProceedTime(holdTime);
    } catch (err) {
      console.error("Dice roll failed:", err);
      setRolling(false);
      useGameStore.getState().addToast("Connection error. Try rolling again.", "danger");
    }
  };

  const proceed = async () => {
    if (diceResult == null) return;

    // Financial Alert: Surfacing the "hidden" interest cost
    if (diceResult.interestPaid > 0) {
      useGameStore.getState().addToast(
        `Financial Alert: -$${diceResult.interestPaid.toLocaleString()} paid in debt interest.`, 
        "danger"
      );
    }

    setDisplayFace(null);
    setAutoProceedTime(null);

    await activateTimer();

    useGameStore.setState({ diceModalOpen: false });
  };

  const showResult = !rolling && diceResult && displayFace != null;
  const toneClass = showResult ? `dice-modal--${diceResult!.tone}` : "";

  return (
    <div className="dice-overlay">
      <div className={`dice-modal ${toneClass}`}>
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
            <div className="dice-modal__result">
              +{diceResult!.ap} ACTION POINT{diceResult!.ap === 1 ? "" : "S"}
            </div>
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
