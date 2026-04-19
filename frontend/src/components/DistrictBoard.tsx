import { PROPERTIES } from "../data/properties";
import { useGameStore } from "../store/gameStore";
import PropertyTile from "./PropertyTile";

export default function DistrictBoard() {
  const turn = useGameStore((s) => s.turn);
  const boardPositions = useGameStore((s) => s.boardPositions);
  const unlockTurns = useGameStore((s) => s.unlockTurns);

  return (
    <div className="board">
      <div className="board__plane">
        {PROPERTIES.map((property, i) => {
          const position = boardPositions[i];
          const dynamicUnlock = unlockTurns[property.id] ?? Infinity;
          if (!position) return null; // Safe guard during initial load
          
          return (
            <PropertyTile
              key={property.id}
              property={property}
              position={position}
              unlocked={turn >= dynamicUnlock}
            />
          );
        })}
      </div>
      <div className="board__label">PIXEL PARK</div>
    </div>
  );
}
