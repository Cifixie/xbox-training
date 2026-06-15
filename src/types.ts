export type GameMode = "survive" | "time" | "chill";

export type GamePhase = "start" | "playing" | "end";

export type PromptType =
  | "A"
  | "B"
  | "X"
  | "Y"
  | "RB"
  | "LB"
  | "RT"
  | "LT"
  | "RS_UP"
  | "RS_DOWN"
  | "RS_LEFT"
  | "RS_RIGHT";

export interface Prompt {
  type: PromptType;
  x: number; // percent
  y: number; // percent
}

export interface RoundResult {
  prompt: PromptType;
  reactionMs: number | null; // null = missed / timeout
  correct: boolean;
}

export interface GameState {
  mode: GameMode;
  phase: GamePhase;
  currentPrompt: Prompt | null;
  promptStartTime: number | null;
  rounds: RoundResult[];
  misses: number;
  totalPenaltyMs: number; // for 'time' mode
  gameStartTime: number | null;
  gameEndTime: number | null;
}

// Gamepad button indices (standard mapping)
export const BUTTON_MAP: Record<number, PromptType> = {
  0: "A",
  1: "B",
  2: "X",
  3: "Y",
  4: "LB",
  5: "RB",
  6: "LT",
  7: "RT",
};

// Right stick axes: axis 2 = horizontal, axis 3 = vertical
export const STICK_THRESHOLD = 0.5;

export const ALL_PROMPTS: PromptType[] = [
  "A",
  "B",
  "X",
  "Y",
  "RB",
  "LB",
  "RT",
  "LT",
  "RS_UP",
  "RS_DOWN",
  "RS_LEFT",
  "RS_RIGHT",
];

export const PROMPT_TIMEOUT_MS = 3000;
export const NEXT_PROMPT_DELAY_MS = 500;
export const CHILL_MAX_MISSES = 10;
export const TIME_PENALTY_MS = 500;

export const PROMPT_LABELS: Record<PromptType, string> = {
  A: "A",
  B: "B",
  X: "X",
  Y: "Y",
  RB: "RB",
  LB: "LB",
  RT: "RT",
  LT: "LT",
  RS_UP: "↑",
  RS_DOWN: "↓",
  RS_LEFT: "←",
  RS_RIGHT: "→",
};

export const PROMPT_COLORS: Record<PromptType, string> = {
  A: "#4CAF50", // green
  B: "#f44336", // red
  X: "#2196F3", // blue
  Y: "#FFEB3B", // yellow
  RB: "#9C27B0", // purple
  LB: "#FF9800", // orange
  RT: "#00BCD4", // cyan
  LT: "#E91E63", // pink
  RS_UP: "#ffffff",
  RS_DOWN: "#ffffff",
  RS_LEFT: "#ffffff",
  RS_RIGHT: "#ffffff",
};
