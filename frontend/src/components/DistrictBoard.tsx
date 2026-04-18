import { BOARD_POSITIONS, PROPERTIES } from "../data/properties";
import { useGameStore } from "../store/gameStore";
import PropertyTile from "./PropertyTile";

export default function DistrictBoard() {
  const turn = useGameStore((s) => s.turn);

  return (
    <div className="board">
      <div className="board__plane">
        {PROPERTIES.map((property, i) => (
          <PropertyTile
            key={property.id}
            property={property}
            position={BOARD_POSITIONS[i]}
            unlocked={turn >= property.unlockTurn}
          />
        ))}
      </div>
      <div className="board__label">PIXEL PARK</div>
    </div>
  );
}
