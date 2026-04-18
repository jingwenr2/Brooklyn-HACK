import type { GridPos, Property } from "../types/game";

const TILE_W = 128;
const ROW_STAGGER_X = 64; // Row 0 and 2 offset right by half a tile
const ROW_Y = 56; // Vertical spacing between rows (iso compression)

interface Props {
  property: Property;
  position: GridPos;
  unlocked: boolean;
}

export default function PropertyTile({ property, position, unlocked }: Props) {
  const baseX = position.row === 1 ? 0 : ROW_STAGGER_X;
  const x = baseX + position.col * TILE_W;
  const y = position.row * ROW_Y;
  const z = position.row * 10 + position.col;

  return (
    <button
      type="button"
      className={`tile ${unlocked ? "tile--unlocked" : "tile--locked"}`}
      style={{ left: x, top: y, zIndex: z }}
      title={property.name}
      disabled={!unlocked}
    >
      <div className="tile__shadow" />
      <div className="tile__base" />
      <img src={property.sprite} alt={property.name} className="tile__sprite" />
      <span className="tile__tier">{property.tier}</span>
    </button>
  );
}
