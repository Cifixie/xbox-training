import { useState, useEffect } from "react";
import {
  TIMER_DECREMENT_MS,
  TIMER_INCREMENT_MS,
  type GameMode,
  type GameSettings,
} from "./types";
import { SettingsModal } from "./SettingsModal";

interface Props {
  onStart: (mode: GameMode) => void;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
}

function modeInfo(
  settings: GameSettings,
): Record<
  GameMode,
  { label: string; description: string; color: string; hidden?: boolean }
> {
  return {
    survive: {
      label: "Survive",
      color: "#f44336",
      description: "One mistake ends the game. How long can you last?",
    },
    time: {
      label: "Time Attack",
      color: "#FF9800",
      description: `Start with ${settings.timeModeStartMs / 1000}s. Each hit +${TIMER_INCREMENT_MS / 1000}s, each miss −${TIMER_DECREMENT_MS / 1000}s. Survive as long as you can.`,
    },
    chill: {
      label: "Chill",
      color: "#4CAF50",
      description: `You get ${settings.chillMaxMisses} misses before it's over. No pressure.`,
    },
  };
}

export function StartScreen({ onStart, settings, onSettingsChange }: Props) {
  const [selected, setSelected] = useState<GameMode>("survive");
  const [controllerConnected, setControllerConnected] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const MODE_INFO = modeInfo(settings);

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
      <button
        className="settings-trigger"
        aria-label="Open settings"
        onClick={() => setSettingsOpen(true)}
      >
        ⚙ Settings
      </button>

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

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onChange={onSettingsChange}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
