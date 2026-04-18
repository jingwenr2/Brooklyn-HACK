import { useGameStore } from "../store/gameStore";

export default function TopBar() {
  const turn = useGameStore((s) => s.turn);
  const ap = useGameStore((s) => s.ap);

  return (
    <header className="topbar">
      <span className="topbar__slot topbar__slot--left">
        TURN <span className="topbar__value">{turn}</span> / 20
      </span>
      <span className="topbar__slot topbar__slot--center">
        AP: <span className="topbar__value">{ap ?? "—"}</span>
      </span>
      <button className="topbar__pause" aria-label="Pause">
        ||
      </button>
    </header>
  );
}
