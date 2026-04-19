import { useEffect, useState } from "react";
import { useGameStore } from "../store/gameStore";

export default function APDiceRoll() {
  const open = useGameStore((s) => s.diceModalOpen);
  const turn = useGameStore((s) => s.turn);
  const rollAP = useGameStore((s) => s.rollAP);
  const activateTimer = useGameStore((s) => s.activateTimer);

  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
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
    setResult(null);

    try {
      // Call backend immediately so it's ready, but wait at least 1.4s for the visual spin
      const rollPromise = rollAP();
      const timerPromise = new Promise((resolve) => setTimeout(resolve, 1400));
      
      await Promise.all([rollPromise, timerPromise]);

      const ap = useGameStore.getState().ap;
      setRolling(false);
      setResult(ap);
      setAutoProceedTime(3); // Start 3s countdown
    } catch (err) {
      console.error("Dice roll failed:", err);
      setRolling(false);
      // addToast is available in store
      useGameStore.getState().addToast("Connection error. Try rolling again.", "danger");
    }
  };

  const proceed = async () => {
    if (result == null) return;
    setResult(null);
    setAutoProceedTime(null);
    
    // Start the backend turn timer
    await activateTimer();
    
    useGameStore.setState({ diceModalOpen: false });
  };

  return (
    <div className="dice-overlay">
      <div className="dice-modal">
        <div style={{ position: "absolute", top: 12, right: 16, fontSize: 8, color: "var(--color-copper)", letterSpacing: 1 }}>
          [ TIMER PAUSED ]
        </div>
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
              PROCEED {autoProceedTime !== null && `(${autoProceedTime})`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
