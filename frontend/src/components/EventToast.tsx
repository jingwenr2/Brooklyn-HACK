import { useGameStore } from "../store/gameStore";

const VARIANT_COLORS: Record<string, string> = {
  info: "var(--color-neon-blue)",
  success: "var(--color-neon-green)",
  danger: "var(--color-danger)",
  warning: "var(--color-orange)",
};

export default function EventToast() {
  const toasts = useGameStore((s) => s.toasts);
  const dismissToast = useGameStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 56,
        right: 16,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 200,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: "var(--color-panel-bg)",
            border: `2px solid ${VARIANT_COLORS[t.variant] ?? VARIANT_COLORS.info}`,
            padding: "10px 16px",
            fontFamily: "var(--font-body)",
            fontSize: 18,
            color: "var(--color-text-main)",
            maxWidth: 360,
            pointerEvents: "auto",
            cursor: "pointer",
            animation: "fade-in 0.2s ease-out",
            letterSpacing: 0.5,
            lineHeight: "1.2",
            boxShadow: "4px 4px 0 rgba(0,0,0,0.3)"
          }}
          onClick={() => dismissToast(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
