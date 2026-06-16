import type { GameMode, RoundResult } from "./types";
import { TIMER_DECREMENT_MS, TIMER_INCREMENT_MS } from "./types";

interface Props {
  mode: GameMode;
  rounds: RoundResult[];
  misses: number;
  chillMaxMisses: number;
  gameStartTime: number | null;
  gameEndTime: number | null;
  onRestart: () => void;
}

function fmt(ms: number): string {
  const s = (ms / 1000).toFixed(2);
  return `${s}s`;
}

function avgReaction(rounds: RoundResult[]): string {
  const hits = rounds.filter((r) => r.correct && r.reactionMs !== null);
  if (hits.length === 0) return "—";
  const avg = hits.reduce((sum, r) => sum + r.reactionMs!, 0) / hits.length;
  return `${Math.round(avg)}ms`;
}

export function EndScreen({
  mode,
  rounds,
  misses,
  chillMaxMisses,
  gameStartTime,
  gameEndTime,
  onRestart,
}: Props) {
  const successes = rounds.filter((r) => r.correct).length;
  const totalElapsed =
    gameStartTime && gameEndTime ? gameEndTime - gameStartTime : 0;

  return (
    <div className="screen end-screen">
      <h2 className="end-title">Game Over</h2>

      <div className="end-stats">
        {mode === "survive" && (
          <>
            <StatRow
              label="Successful presses"
              value={String(successes)}
              highlight
            />
            <StatRow label="Avg reaction time" value={avgReaction(rounds)} />
            <StatRow label="Misses" value={String(misses)} />
            <StatRow label="Total time" value={fmt(totalElapsed)} />
          </>
        )}

        {mode === "time" && (
          <>
            <StatRow
              label="Successful presses"
              value={String(successes)}
              highlight
            />
            <StatRow label="Misses" value={String(misses)} />
            <StatRow label="Time survived" value={fmt(totalElapsed)} />
            <StatRow label="Avg reaction time" value={avgReaction(rounds)} />
            <p className="penalty-note">
              Each hit +{TIMER_INCREMENT_MS / 1000}s · each miss −
              {TIMER_DECREMENT_MS / 1000}s
            </p>
          </>
        )}

        {mode === "chill" && (
          <>
            <StatRow
              label="Successful presses"
              value={String(successes)}
              highlight
            />
            <StatRow label="Misses" value={`${misses} / ${chillMaxMisses}`} />
            <StatRow label="Avg reaction time" value={avgReaction(rounds)} />
            <StatRow label="Total time" value={fmt(totalElapsed)} />
          </>
        )}
      </div>

      <div className="end-actions">
        <button className="start-btn" onClick={onRestart}>
          Back to Menu
        </button>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  highlight,
  warn,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={`stat-row ${highlight ? "highlight" : ""} ${warn ? "warn" : ""}`}
    >
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}
