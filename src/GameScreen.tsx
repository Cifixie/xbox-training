import { useEffect, useRef, useState } from "react";
import type { GameMode, Prompt, PromptType, RoundResult } from "./types";
import { PROMPT_LABELS, PROMPT_COLORS, CHILL_MAX_MISSES } from "./types";

interface Props {
  mode: GameMode;
  currentPrompt: Prompt | null;
  rounds: RoundResult[];
  misses: number;
  promptTimeoutMs: number;
  promptStartTime: number | null;
}

function PromptBadge({ type }: { type: PromptType }) {
  const label = PROMPT_LABELS[type];
  const color = PROMPT_COLORS[type];
  const isStick = type.startsWith("RS_");

  return (
    <div
      className={`prompt-badge ${isStick ? "stick-badge" : "button-badge"}`}
      style={{ "--btn-color": color } as React.CSSProperties}
    >
      <span className="prompt-badge-label">{label}</span>
      {isStick && <span className="prompt-badge-hint">Right Stick</span>}
    </div>
  );
}

function TimerBar({
  startTime,
  timeoutMs,
}: {
  startTime: number;
  timeoutMs: number;
}) {
  const [progress, setProgress] = useState(1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.max(0, 1 - elapsed / timeoutMs);
      setProgress(p);
      if (p > 0) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [startTime, timeoutMs]);

  const barColor =
    progress > 0.5 ? "#4CAF50" : progress > 0.25 ? "#FF9800" : "#f44336";

  return (
    <div className="timer-bar-track">
      <div
        className="timer-bar-fill"
        style={{ width: `${progress * 100}%`, backgroundColor: barColor }}
      />
    </div>
  );
}

export function GameScreen({
  mode,
  currentPrompt,
  rounds,
  misses,
  promptTimeoutMs,
  promptStartTime,
}: Props) {
  const successes = rounds.filter((r) => r.correct).length;
  const lastResults = rounds.slice(-5).reverse();

  return (
    <div className="screen game-screen">
      {/* HUD */}
      <div className="hud">
        <div className="hud-item">
          <span className="hud-label">Mode</span>
          <span className="hud-value mode-badge" data-mode={mode}>
            {mode === "survive"
              ? "Survive"
              : mode === "time"
                ? "Time Attack"
                : "Chill"}
          </span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Hits</span>
          <span className="hud-value success">{successes}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">
            {mode === "chill"
              ? `Misses (${misses}/${CHILL_MAX_MISSES})`
              : "Misses"}
          </span>
          <span className="hud-value miss">{misses}</span>
        </div>
      </div>

      {/* Prompt area */}
      <div className="play-area">
        {currentPrompt ? (
          <>
            <div
              className="prompt-container"
              style={{
                left: `${currentPrompt.x}%`,
                top: `${currentPrompt.y}%`,
              }}
            >
              <PromptBadge type={currentPrompt.type} />
            </div>
            {promptStartTime && (
              <div className="timer-bar-wrapper">
                <TimerBar
                  startTime={promptStartTime}
                  timeoutMs={promptTimeoutMs}
                />
              </div>
            )}
          </>
        ) : (
          <div className="waiting-text">Get ready…</div>
        )}
      </div>

      {/* Recent results */}
      {lastResults.length > 0 && (
        <div className="recent-results">
          {lastResults.map((r, i) => (
            <div
              key={i}
              className={`result-pill ${r.correct ? "correct" : "wrong"}`}
            >
              <span>{PROMPT_LABELS[r.prompt]}</span>
              <span>
                {r.correct
                  ? r.reactionMs !== null
                    ? `${r.reactionMs}ms`
                    : "✓"
                  : r.reactionMs === null
                    ? "MISS"
                    : "✗"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
