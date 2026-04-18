import { Route, Routes } from "react-router-dom";
import GameScreen from "./pages/GameScreen";
import LaunchPage from "./pages/LaunchPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LaunchPage />} />
      <Route path="/tutorial" element={<Placeholder title="Tutorial" />} />
      <Route path="/game" element={<GameScreen />} />
    </Routes>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <main className="launch">
      <h1 className="launch__title">{title}</h1>
      <p className="launch__sub">Not built yet — coming soon.</p>
    </main>
  );
}
