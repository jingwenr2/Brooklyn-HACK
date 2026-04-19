import flipperPortrait from "../../../sprites/flipper.svg";
import { money } from "../utils/format";
import { useGameStore } from "../store/gameStore";

export default function RivalCard() {
  const flipperCash = useGameStore((s) => s.flipperCash);
  const flipperProps = useGameStore((s) => s.flipperProps);

  return (
    <aside className="card card--rival">
      <h2 className="card__label">== FLIPPER ==</h2>
      <img
        src={flipperPortrait}
        alt="The Flipper"
        className="card__portrait"
      />
      <div className="card__row">Est. Cash: {money(flipperCash)}</div>
      <div className="card__row">Props: {flipperProps}</div>
    </aside>
  );
}
