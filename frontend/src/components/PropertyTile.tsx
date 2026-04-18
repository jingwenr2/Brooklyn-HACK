import type { GridPos, Property } from "../types/game";
import { useGameStore } from "../store/gameStore";

const TILE_W = 128;
const ROW_STAGGER_X = 64;
const ROW_Y = 56;

interface Props {
  property: Property;
  position: GridPos;
  unlocked: boolean;
}

export default function PropertyTile({ property, position, unlocked }: Props) {
  const selectedId = useGameStore((s) => s.selectedPropertyId);
  const selectProperty = useGameStore((s) => s.selectProperty);
  const meta = useGameStore((s) => s.propertyMeta[property.id]);
  const turn = useGameStore((s) => s.turn);

  const isSelected = selectedId === property.id;
  const ownerRole = meta?.ownerRole ?? null;
  const isOwned = ownerRole === "YOU";
  const isRivalOwned = ownerRole === "FLIPPER";
  const isListed = meta?.listed ?? false;

  // Expiry countdown: show when listed and ≤5 turns from expiring.
  const turnsUntilExpiry =
    isListed && meta?.expiryTurn != null ? meta.expiryTurn - turn : null;
  const showExpiry =
    turnsUntilExpiry != null && turnsUntilExpiry > 0 && turnsUntilExpiry <= 5;

  const showFlipperEyes =
    Boolean(meta?.flipperTarget) && !isOwned && !isRivalOwned;

  const baseX = position.row === 1 ? 0 : ROW_STAGGER_X;
  const x = baseX + position.col * TILE_W;
  const y = position.row * ROW_Y;
  const z = isSelected ? 200 : position.row * 10 + position.col;

  const handleClick = () => {
    if (!unlocked) return;
    selectProperty(isSelected ? null : property.id);
  };

  let tileClass = "tile";
  if (!unlocked) tileClass += " tile--locked";
  if (isSelected) tileClass += " tile--selected";
  if (isOwned) tileClass += " tile--owned-you";
  if (isRivalOwned) tileClass += " tile--owned-rival";

  return (
    <button
      type="button"
      className={tileClass}
      style={{ left: x, top: y, zIndex: z }}
      title={`${property.name} — $${property.baseValue.toLocaleString()}${
        isOwned ? " (YOU)" : isRivalOwned ? " (FLIPPER)" : isListed ? " (AVAILABLE)" : ""
      }`}
      disabled={!unlocked}
      onClick={handleClick}
    >
      <div className="tile__shadow" />
      <div className="tile__base" />
      <img src={property.sprite} alt={property.name} className="tile__sprite" />

      {showExpiry && (
        <span
          className={`tile__badge tile__badge--expiry ${
            turnsUntilExpiry! <= 2 ? "tile__badge--danger" : ""
          }`}
          aria-label={`Expires in ${turnsUntilExpiry} turns`}
        >
          {turnsUntilExpiry}
        </span>
      )}

      {showFlipperEyes && (
        <span
          className="tile__badge tile__badge--eyes"
          aria-label="Flipper is targeting this property"
        >
          👀
        </span>
      )}

      <span className="tile__tier">
        {isOwned ? "YOU" : isRivalOwned ? "FLIPPER" : property.tier}
      </span>
    </button>
  );
}
