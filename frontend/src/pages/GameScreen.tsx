import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import APDiceRoll from "../components/APDiceRoll";
import DistrictBoard from "../components/DistrictBoard";
import PlayerCard from "../components/PlayerCard";
import RivalCard from "../components/RivalCard";
import TopBar from "../components/TopBar";
import VictoryScreen from "../components/VictoryScreen";
import Announcements from "../components/Announcements";
import TurnTimer from "../components/TurnTimer";
import Portfolio from "../components/Portfolio";
import PauseMenu from "../components/PauseMenu";
import EventToast from "../components/EventToast";
import BluffBar from "../components/BluffBar";
import IntelFeed from "../components/IntelFeed";
import TriviaModal from "../components/TriviaModal";
import { useGameStore } from "../store/gameStore";

export default function GameScreen() {
  const [searchParams] = useSearchParams();
  const didInit = useRef(false);
  const ap = useGameStore((s) => s.ap);
  const turn = useGameStore((s) => s.turn);
  const maxTurns = useGameStore((s) => s.maxTurns);
  const isBankrupt = useGameStore((s) => s.isBankrupt);
  const selectedId = useGameStore((s) => s.selectedPropertyId);
  const listedIds = useGameStore((s) => s.listedPropertyIds);
  const ownedIds = useGameStore((s) => s.ownedPropertyIds);
  const propertyMeta = useGameStore((s) => s.propertyMeta);
  const loading = useGameStore((s) => s.loading);
  const cash = useGameStore((s) => s.cash);
  const netWorth = useGameStore((s) => s.netWorth);
  const gameOver = useGameStore((s) => s.gameOver);
  const victoryState = useGameStore((s) => s.victoryState);
  const playAgain = useGameStore((s) => s.playAgain);
  const initGame = useGameStore((s) => s.initGame);
  const resumeGame = useGameStore((s) => s.resumeGame);
  const buyProperty = useGameStore((s) => s.buyProperty);
  const developProperty = useGameStore((s) => s.developProperty);
  const sellProperty = useGameStore((s) => s.sellProperty);
  const researchProperty = useGameStore((s) => s.researchProperty);
  const endTurn = useGameStore((s) => s.endTurn);
  const isRivalThinking = useGameStore((s) => s.isRivalThinking);

  // Initialize the game on first mount
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    if (searchParams.get("resume") === "1") {
      resumeGame();
    } else {
      initGame();
    }
  }, []);

  const isGameOver = isBankrupt || turn >= maxTurns || gameOver;
  const selectedMeta = selectedId ? propertyMeta[selectedId] : null;

  // Tiered Caps: budget=1, mid=2, premium=3
  const getTierCap = (tier?: string) => {
    if (tier === "budget") return 1;
    if (tier === "mid") return 2;
    if (tier === "premium") return 3;
    return 0;
  };

  const currentDevLevel = selectedMeta?.devLevel ?? 0;
  const tierCap = selectedMeta ? getTierCap(selectedMeta.tier) : 0;
  const isMaxDeveloped = currentDevLevel >= tierCap;

  const canAct = ap != null && ap >= 1 && selectedId != null && !loading && !isGameOver;
  const canBuy = canAct && listedIds.includes(selectedId!) && !ownedIds.includes(selectedId!);
  const canDevelop = canAct && ownedIds.includes(selectedId!) && !isMaxDeveloped;
  const canSell = canAct && ownedIds.includes(selectedId!);
  const canResearch = canAct;
  
  const selectedPriceStr = selectedMeta ? `$${Math.floor((selectedMeta.marketValue || 0) / 1000)}k` : "";

  // Dev cost: $500 flat + 25% of market value (updated for hardcore balance)
  const devCost = selectedMeta ? 500 + Math.floor(0.25 * (selectedMeta.marketValue || 0)) : 0;
  const devCostStr = devCost ? `$${(devCost / 1000).toFixed(1)}k` : "";

  // Sell payout: 90% of market value
  const sellPayout = selectedMeta ? Math.floor(0.9 * (selectedMeta.marketValue || 0)) : 0;
  const sellPayoutStr = sellPayout ? `$${(sellPayout / 1000).toFixed(1)}k` : "";

  return (
    <div className="game">
      <TopBar />
      <div className="game__body">
        <section className="game__left">
          <PlayerCard />
          <Portfolio />
          <BluffBar />
        </section>

        <section className="game__center">
          <DistrictBoard />
          <TurnTimer />
        </section>

        <section className="game__right">
          <RivalCard />
          <div className="action-panel">
            <h2 className="card__label">== ACTIONS ==</h2>

            {selectedId ? (
              <div className="card__row" style={{ color: "var(--color-text-main)" }}>
                Selected: {selectedId.replace(/_/g, " ").toUpperCase()}
              </div>
            ) : (
              <div className="card__row card__row--muted">
                Click a property to select it
              </div>
            )}

            <button
              className="btn"
              disabled={!canBuy}
              onClick={buyProperty}
            >
              {canBuy && selectedPriceStr ? `BUY — ${selectedPriceStr}` : "BUY"}
            </button>
            <button
              className="btn"
              disabled={!canDevelop}
              onClick={developProperty}
            >
              {isMaxDeveloped ? `MAX REACHED (${selectedMeta?.tier.toUpperCase()})` : canDevelop && devCostStr ? `DEVELOP — ${devCostStr}` : "DEVELOP"}
            </button>
            <button
              className="btn"
              disabled={!canSell}
              onClick={sellProperty}
            >
              {canSell && sellPayoutStr ? `SELL — ${sellPayoutStr}` : "SELL"}
            </button>
            <button
              className="btn"
              disabled={!canResearch}
              onClick={researchProperty}
            >
              RESEARCH
            </button>
            <button
              className={`btn btn--primary ${ap === 0 && !loading ? "btn--pulse-attention" : ""}`}
              onClick={endTurn}
              disabled={ap == null || loading || isGameOver}
            >
              END TURN
            </button>
          </div>
          <Announcements />
        </section>
      </div>

      <IntelFeed />

      <APDiceRoll />

      {isRivalThinking && (
        <div className="rival-turn-overlay">
          <div className="rival-turn-banner">
            <h2 className="rival-turn-banner__title">RIVAL IS ACTING...</h2>
          </div>
        </div>
      )}

      {gameOver && victoryState ? (
        <VictoryScreen
          variant={victoryState}
          cash={cash}
          netWorth={netWorth}
          propsOwned={ownedIds.length}
          turn={turn}
          onPlayAgain={playAgain}
        />
      ) : null}
      <TriviaModal />
      <PauseMenu />
      <EventToast />
    </div>
  );
}
