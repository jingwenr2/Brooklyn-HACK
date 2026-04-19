import { useEffect, useState } from "react";
import { useGameStore } from "../store/gameStore";

export default function TurnTimer() {
  const turnExpiresAt = useGameStore((s) => s.turnExpiresAt);
  const endTurn = useGameStore((s) => s.endTurn);
  const pauseOpen = useGameStore((s) => s.pauseOpen);
  const triviaOpen = useGameStore((s) => s.triviaOpen);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!turnExpiresAt || pauseOpen || triviaOpen) {
      return;
    }

    const updateTimer = () => {
      const now = Date.now() / 1000;
      const remaining = Math.max(0, turnExpiresAt - now);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        endTurn();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [turnExpiresAt, endTurn, pauseOpen, triviaOpen]);

  if (timeLeft === null && !turnExpiresAt) return null;
  
  // If paused, we still want to show the last time remaining
  const displayTime = timeLeft ?? (turnExpiresAt ? Math.max(0, turnExpiresAt - Date.now() / 1000) : 40);
  
  const isDanger = displayTime < 10;
  const progress = (displayTime / 40) * 100;

  return (
    <div className={`turn-timer ${isDanger ? "turn-timer--danger" : ""}`}>
      <div className="turn-timer__label">SESSION TIME</div>
      <div className="turn-timer__clock">
        [ 00:{Math.ceil(displayTime).toString().padStart(2, "0")} ]
      </div>
      <div className="turn-timer__bar-track">
        <div 
          className="turn-timer__bar-fill" 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  );
}
