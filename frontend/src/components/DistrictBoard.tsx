import { PROPERTIES } from "../data/properties";
import { useGameStore } from "../store/gameStore";
import PropertyTile from "./PropertyTile";

export default function DistrictBoard() {
  const boardPositions = useGameStore((s) => s.boardPositions);

  return (
    <div className="board">
      <div className="board__plane">
        {PROPERTIES.map((property, i) => {
          const position = boardPositions[i];
          if (!position) return null; // Safe guard during initial load
          
          return (
            <PropertyTile
              key={property.id}
              property={property}
              position={position}
            />
          );
        })}
      </div>
      <div className="board__label">PIXEL PARK</div>
    </div>
  );
}
