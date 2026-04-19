import React from "react";

type VictoryVariant = "WIN" | "LOSS" | "BANKRUPT";

interface VictoryScreenProps {
  variant: VictoryVariant;
  cash: number;
  netWorth: number;
  propsOwned: number;
  turn: number;
  onPlayAgain: () => void;
}

const variantConfig: Record<VictoryVariant, { title: string; subtitle: string; titleColor: string; accentColor: string }> = {
  WIN: {
    title: "YOU WON",
    subtitle: "Mogul status achieved.",
    titleColor: "var(--color-gold)",
    accentColor: "var(--color-neon-green)",
  },
  LOSS: {
    title: "FLIPPER WINS",
    subtitle: "The block is lost.",
    titleColor: "var(--color-danger)",
    accentColor: "var(--color-orange)",
  },
  BANKRUPT: {
    title: "LIQUIDATED",
    subtitle: "Flipper bought out your debts.",
    titleColor: "var(--color-danger)",
    accentColor: "var(--color-orange)",
  },
};

export default function VictoryScreen({ variant, cash, netWorth, propsOwned, turn, onPlayAgain }: VictoryScreenProps) {
  const { title, subtitle, titleColor, accentColor } = variantConfig[variant];

  return (
    <div style={overlayStyle}>
      <style>{`
        @keyframes victoryFadeScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        .victory-panel {
          animation: victoryFadeScale 0.3s ease forwards;
        }

        .victory-button:hover {
          transform: translateY(-1px);
          box-shadow: 2px 2px 0 rgba(45, 156, 219, 0.45);
        }
      `}</style>

      <div style={{ ...panelStyle, borderColor: "var(--color-gold)" }} className="victory-panel">
        <div style={headerRowStyle}>
          <h1 style={{ ...titleStyle, color: titleColor, fontFamily: "'Press Start 2P', monospace" }}>{title}</h1>
          <p style={{ ...subtitleStyle, fontFamily: "'VT323', monospace", color: "var(--color-text-main)" }}>{subtitle}</p>
        </div>

        <div style={statCardStyle}>
          <div style={statRowStyle}>
            <span style={statLabelStyle}>NET WORTH</span>
            <span style={{ ...statValueStyle, color: accentColor }}>${netWorth.toLocaleString()}</span>
          </div>
          <div style={statRowStyle}>
            <span style={statLabelStyle}>CASH</span>
            <span style={{ ...statValueStyle, color: "var(--color-text-main)" }}>${cash.toLocaleString()}</span>
          </div>
          <div style={statRowStyle}>
            <span style={statLabelStyle}>PROPERTIES</span>
            <span style={{ ...statValueStyle, color: accentColor }}>{propsOwned}</span>
          </div>
          <div style={statRowStyle}>
            <span style={statLabelStyle}>TURN</span>
            <span style={{ ...statValueStyle, color: "var(--color-text-main)" }}>{turn}</span>
          </div>
        </div>

        <button type="button" style={{ ...buttonStyle, borderColor: "var(--color-neon-blue)" }} className="victory-button" onClick={onPlayAgain}>
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(17, 17, 21, 0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const panelStyle: React.CSSProperties = {
  width: "min(600px, calc(100vw - 40px))",
  padding: "28px",
  backgroundColor: "var(--color-panel-bg)",
  border: "2px solid var(--color-panel-bg)",
  boxShadow: "0 0 0 2px rgba(255,255,255,0.02), 0 12px 40px rgba(0,0,0,0.45)",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  textAlign: "center",
  outline: "none",
};

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  alignItems: "center",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "32px",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  textAlign: "center",
  maxWidth: "100%",
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "1rem",
  color: "var(--color-text-muted)",
};

const statCardStyle: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "2px solid rgba(255,255,255,0.08)",
  padding: "18px",
  display: "grid",
  gap: "12px",
  fontFamily: "'VT323', monospace",
};

const statRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
};

const statLabelStyle: React.CSSProperties = {
  color: "var(--color-text-main)",
  letterSpacing: "0.15em",
  fontSize: "0.95rem",
};

const statValueStyle: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
};

const buttonStyle: React.CSSProperties = {
  marginTop: "8px",
  padding: "14px 22px",
  backgroundColor: "var(--color-neon-blue)",
  color: "#111",
  border: "2px solid var(--color-neon-blue)",
  fontFamily: "'Press Start 2P', monospace",
  fontSize: "0.85rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  cursor: "pointer",
  alignSelf: "center",
  minWidth: "220px",
  transition: "transform 0.12s ease, box-shadow 0.12s ease",
};

// Example import/demo usage:
// import VictoryScreen from "./components/VictoryScreen";
//
// <VictoryScreen
//   variant="WIN"
//   cash={128420}
//   netWorth={142000}
//   propsOwned={4}
//   turn={20}
//   onPlayAgain={() => console.log("Restart game")}
// />
