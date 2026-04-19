import { useGameStore } from "../store/gameStore";

export default function TopBar() {
  const turn = useGameStore((s) => s.turn);
  const ap = useGameStore((s) => s.ap);
  const diceModalOpen = useGameStore((s) => s.diceModalOpen);
  const setPauseOpen = useGameStore((s) => s.setPauseOpen);

  return (
    <header className="topbar">
      <span className="topbar__slot topbar__slot--left">
        TURN <span className="topbar__value">{turn}</span> / 20
      </span>

      <span className="topbar__slot topbar__slot--center">
        AP: <span className="topbar__value">{diceModalOpen ? "—" : (ap ?? "—")}</span>
      </span>

      <span className="topbar__slot topbar__slot--right">
        <button className="topbar__pause" aria-label="Pause" onClick={() => setPauseOpen(true)}>
          ||
        </button>
      </span>
    </header>
  );
}
