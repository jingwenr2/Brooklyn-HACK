import flipperPortrait from "../../../sprites/flipper.svg";
import { money } from "../utils/format";

export default function RivalCard() {
  return (
    <aside className="card card--rival">
      <h2 className="card__label">== FLIPPER ==</h2>
      <img
        src={flipperPortrait}
        alt="The Flipper"
        className="card__portrait"
      />
      <div className="card__row">Est. Cash: {money(22_000)}</div>
      <div className="card__row">Props: 0</div>
    </aside>
  );
}
