import { useState, useEffect } from "react";
import {
  CHILL_MAX_MISSES,
  TIME_MODE_START_MS,
  TIMER_DECREMENT_MS,
  TIMER_INCREMENT_MS,
  type GameMode,
} from "./types";

interface Props {
  onStart: (mode: GameMode) => void;
}

const MODE_INFO: Record<
  GameMode,
  { label: string; description: string; color: string; hidden?: boolean }
> = {
  survive: {
    label: "Survive",
    color: "#f44336",
    description: "One mistake ends the game. How long can you last?",
  },
  time: {
    label: "Time Attack",
    color: "#FF9800",
    description: `Start with ${TIME_MODE_START_MS / 1000}s. Each hit +${TIMER_INCREMENT_MS / 1000}s, each miss −${TIMER_DECREMENT_MS / 1000}s. Survive as long as you can.`,
  },
  chill: {
    label: "Chill",
    color: "#4CAF50",
    description: `You get ${CHILL_MAX_MISSES} misses before it's over. No pressure.`,
  },
};

export function StartScreen({ onStart }: Props) {
  const [selected, setSelected] = useState<GameMode>("survive");
  const [controllerConnected, setControllerConnected] = useState(false);

  useEffect(() => {
    const checkController = () => {
      const gps = navigator.getGamepads();
      setControllerConnected(Array.from(gps).some((gp) => gp !== null));
    };

    const onConnect = () => setControllerConnected(true);
    const onDisconnect = () => {
      const gps = navigator.getGamepads();
      setControllerConnected(Array.from(gps).some((gp) => gp !== null));
    };

    window.addEventListener("gamepadconnected", onConnect);
    window.addEventListener("gamepaddisconnected", onDisconnect);
    checkController();

    return () => {
      window.removeEventListener("gamepadconnected", onConnect);
      window.removeEventListener("gamepaddisconnected", onDisconnect);
    };
  }, []);

  return (
    <div className="screen start-screen">
      <h1 className="game-title">Reaction Game</h1>
      <p className="game-subtitle">Xbox Controller Edition</p>

      <div className="controller-status">
        <span
          className={`status-dot ${controllerConnected ? "connected" : "disconnected"}`}
        />
        {controllerConnected
          ? "Controller connected"
          : "Connect an Xbox controller to play"}
      </div>

      <div className="mode-selector">
        {(Object.keys(MODE_INFO) as GameMode[])
          .filter((mode) => !MODE_INFO[mode].hidden)
          .map((mode) => {
            const info = MODE_INFO[mode];
            return (
              <button
                key={mode}
                className={`mode-card ${selected === mode ? "selected" : ""}`}
                style={{ "--mode-color": info.color } as React.CSSProperties}
                onClick={() => setSelected(mode)}
              >
                <span className="mode-label">{info.label}</span>
                <span className="mode-desc">{info.description}</span>
              </button>
            );
          })}
      </div>

      <button
        className="start-btn"
        disabled={!controllerConnected}
        onClick={() => onStart(selected)}
      >
        Start Game
      </button>

      {!controllerConnected && (
        <p className="connect-hint">
          Plug in your controller and press a button to activate it.
        </p>
      )}
    </div>
  );
}
