import { useState } from "react";
import { useGameStore } from "../store/gameStore";

export default function TriviaModal() {
  const open = useGameStore((s) => s.triviaOpen);
  const q = useGameStore((s) => s.triviaQuestion);
  const answerTrivia = useGameStore((s) => s.answerTrivia);
  const loading = useGameStore((s) => s.loading);
  const [picked, setPicked] = useState<number | null>(null);

  if (!open || !q) return null;

  const submit = async () => {
    if (picked == null) return;
    await answerTrivia(picked);
    setPicked(null);
  };

  return (
    <div className="trivia-overlay">
      <div className="trivia-modal">
        <div className="trivia-modal__header">
          <span className="trivia-modal__tag">RESEARCH INTEL</span>
          <span className="trivia-modal__source">
            {q.source === "openai" ? "LIVE FEED" : "ARCHIVE"}
          </span>
        </div>
        <p className="trivia-modal__question">{q.question}</p>
        <div className="trivia-modal__options">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`trivia-option ${picked === i ? "trivia-option--selected" : ""}`}
              onClick={() => setPicked(i)}
              disabled={loading}
            >
              <span className="trivia-option__letter">{String.fromCharCode(65 + i)}</span>
              <span className="trivia-option__text">{opt}</span>
            </button>
          ))}
        </div>
        <button
          className="btn btn--primary"
          onClick={submit}
          disabled={picked == null || loading}
        >
          SUBMIT ANSWER (1 AP)
        </button>
      </div>
    </div>
  );
}
