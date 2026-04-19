import type { GridPos, Property } from "../types/game";
import { useGameStore } from "../store/gameStore";
import starFilled from "../../../sprites/star_filled.svg";
import starEmpty from "../../../sprites/star_empty.svg";

const TILE_W = 128;
const ROW_STAGGER_X = 64;
const ROW_Y = 56;

interface Props {
  property: Property;
  position: GridPos;
}

export default function PropertyTile({ property, position }: Props) {
  const selectedId = useGameStore((s) => s.selectedPropertyId);
  const selectProperty = useGameStore((s) => s.selectProperty);
  const meta = useGameStore((s) => s.propertyMeta[property.id]);
  const turn = useGameStore((s) => s.turn);

  const isSelected = selectedId === property.id;
  const ownerRole = meta?.ownerRole ?? null;
  const isOwned = ownerRole === "YOU";
  const isRivalOwned = ownerRole === "FLIPPER";
  const isListed = meta?.listed ?? false;
  const devLevel = meta?.devLevel ?? 0;

  const turnsUntilExpiry = isListed && meta?.expiryTurn != null ? meta.expiryTurn - turn : null;
  const isExpiringSoon = turnsUntilExpiry === 0;

  const isAvailable = isListed && !isOwned && !isRivalOwned;
  const isInteractive = isAvailable || isOwned || isRivalOwned;

  const isLocked = !isInteractive && turn < (meta?.unlockTurn ?? 0);
  const isExpired = !isInteractive && !isLocked;

  const baseX = position.row === 1 ? 0 : ROW_STAGGER_X;
  const x = baseX + position.col * TILE_W;
  const y = position.row * ROW_Y;
  const z = position.row * 10 + position.col;

  const handleClick = () => {
    if (!isInteractive) return;
    selectProperty(isSelected ? null : property.id);
  };

  let tileClass = "tile";
  if (isLocked) tileClass += " tile--locked";
  if (isExpired) tileClass += " tile--expired";
  if (isSelected) tileClass += " tile--selected";
  if (isOwned) tileClass += " tile--owned-you";
  if (isRivalOwned) tileClass += " tile--owned-rival";
  if ((isOwned || isRivalOwned) && devLevel > 0) tileClass += " tile--has-level";

  return (
    <button
      type="button"
      className={tileClass}
      style={{ left: x, top: y, zIndex: z }}
      title={`${property.name} — $${property.baseValue.toLocaleString()}${isOwned ? " (YOU)" : isRivalOwned ? " (FLIPPER)" : isAvailable ? " (AVAILABLE)" : isLocked ? " (LOCKED)" : " (OFF-MARKET)"
        }`}
      onClick={handleClick}
    >
      <div className="tile__visuals">
        <div className="tile__shadow" />
        <div className="tile__base" />
        <img src={property.sprite} alt={property.name} className="tile__sprite" />

        {/* Development Level - Digital Readout */}
        {(isOwned || isRivalOwned) && devLevel > 0 && (
          <div className="tile__level-readout">
            LVL {devLevel}
          </div>
        )}

        {/* Status Badges for non-interactive tiles */}
        {isLocked && (
          <span className="tile__badge tile__badge--status">LOCKED</span>
        )}
        {isExpired && (
          <span className="tile__badge tile__badge--status tile__badge--expired">OFF-MARKET</span>
        )}

        {isSelected && (
          <div className="tile__selection-indicator" aria-hidden="true">
            <div className="tile__selection-pyramid" />
          </div>
        )}

        {isExpiringSoon && (
          <span
            className="tile__badge tile__badge--danger tile__badge--pulse"
            aria-label="Expiring soon"
          >
            ⏳
          </span>
        )}

        <span className="tile__tier">
          {isOwned ? "YOU" : isRivalOwned ? "FLIPPER" : property.tier}
        </span>
      </div>

      {/* Precise Hitboxes (Static - won't move on hover) */}
      <div className="tile__hitbox tile__hitbox--base" />
      <div className="tile__hitbox tile__hitbox--left" />
      <div className="tile__hitbox tile__hitbox--mid-left" />
      <div className="tile__hitbox tile__hitbox--outer-upper-left" />
      <div className="tile__hitbox tile__hitbox--upper-left" />
      <div className="tile__hitbox tile__hitbox--inner-upper-left" />
      <div className="tile__hitbox tile__hitbox--lower-left" />
      <div className="tile__hitbox tile__hitbox--right" />
      <div className="tile__hitbox tile__hitbox--mid-right" />
      <div className="tile__hitbox tile__hitbox--outer-upper-right" />
      <div className="tile__hitbox tile__hitbox--upper-right" />
      <div className="tile__hitbox tile__hitbox--inner-upper-right" />
      <div className="tile__hitbox tile__hitbox--lower-right" />
      <div className="tile__hitbox tile__hitbox--bottom" />
      <div className="tile__hitbox tile__hitbox--lower" />
      <div className="tile__hitbox tile__hitbox--mid" />
      <div className="tile__hitbox tile__hitbox--top" />
    </button>
  );
}
