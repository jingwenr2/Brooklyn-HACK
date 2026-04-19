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

  const turnsUntilExpiry = isListed && meta?.expiryTurn != null ? meta.expiryTurn - turn : null;
  const isExpiringSoon = turnsUntilExpiry === 0;

  const isAvailable = isListed && !isOwned && !isRivalOwned;
  const isInteractive = isAvailable || isOwned || isRivalOwned;

  const isLocked = !isInteractive && turn < (meta?.unlockTurn ?? 0);
  const isExpired = !isInteractive && !isLocked;

  const showFlipperEyes =
    Boolean(meta?.flipperTarget) && !isOwned && !isRivalOwned;

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

  return (
    <button
      type="button"
      className={tileClass}
      style={{ left: x, top: y, zIndex: z }}
      title={`${property.name} — $${property.baseValue.toLocaleString()}${isOwned ? " (YOU)" : isRivalOwned ? " (FLIPPER)" : isAvailable ? " (AVAILABLE)" : isLocked ? " (LOCKED)" : " (OFF-MARKET)"
        }`}
      onClick={handleClick}
    >
      <div className="tile__shadow" />
      <div className="tile__base" />
      <img src={property.sprite} alt={property.name} className="tile__sprite" />

      {/* Status Badges for non-interactive tiles */}
      {isLocked && (
        <span className="tile__badge tile__badge--status">LOCKED</span>
      )}
      {isExpired && (
        <span className="tile__badge tile__badge--status tile__badge--expired">OFF-MARKET</span>
      )}

      {/* Precise Hitboxes */}
      <div className="tile__hitbox tile__hitbox--base" />
      <div className="tile__hitbox tile__hitbox--left" />
      <div className="tile__hitbox tile__hitbox--mid-left" />
      <div className="tile__hitbox tile__hitbox--lower-left" />
      <div className="tile__hitbox tile__hitbox--right" />
      <div className="tile__hitbox tile__hitbox--mid-right" />
      <div className="tile__hitbox tile__hitbox--lower-right" />
      <div className="tile__hitbox tile__hitbox--bottom" />
      <div className="tile__hitbox tile__hitbox--lower" />
      <div className="tile__hitbox tile__hitbox--mid" />
      <div className="tile__hitbox tile__hitbox--top" />

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
