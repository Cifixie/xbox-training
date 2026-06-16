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
  timeDeadline: number | null; // for 'time' mode: timestamp the countdown hits 0
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

// 'time' mode countdown: starts at 1 minute, each hit adds time, each miss removes it
export const TIME_MODE_START_MS = 40000;
export const TIMER_INCREMENT_MS = 500;
export const TIMER_DECREMENT_MS = 1000;

// ---------------------------------------------------------------------------
// Configurable settings
// ---------------------------------------------------------------------------

// User-tunable values. Each maps to a preset constant used as its default.
export interface GameSettings {
  promptTimeoutMs: number; // how long a prompt stays before it's a miss
  chillMaxMisses: number; // misses allowed in Chill mode
  timeModeStartMs: number; // starting clock in Time Attack mode
}

export const DEFAULT_SETTINGS: GameSettings = {
  promptTimeoutMs: PROMPT_TIMEOUT_MS,
  chillMaxMisses: CHILL_MAX_MISSES,
  timeModeStartMs: TIME_MODE_START_MS,
};

// Generic, metadata-driven description of every setting. The settings modal
// renders itself purely from this schema, so adding a new setting only
// requires extending GameSettings, DEFAULT_SETTINGS, and this array.
export type SettingControl = "slider" | "number";

export interface SettingDef {
  key: keyof GameSettings;
  title: string; // short heading shown in the modal
  label: string; // control label
  description: string; // longer explanation
  control: SettingControl;
  min: number; // bounds in display units
  max: number;
  step: number;
  unit: string; // shown next to the value, e.g. "s"
  // Conversions between the stored value (ms / count) and the display value.
  toDisplay: (stored: number) => number;
  fromDisplay: (display: number) => number;
}

export const SETTINGS_SCHEMA: SettingDef[] = [
  {
    key: "promptTimeoutMs",
    title: "Reaction Window",
    label: "Time to react",
    description:
      "How long each prompt stays on screen before it counts as a miss.",
    control: "slider",
    min: 1,
    max: 7,
    step: 1,
    unit: "s",
    toDisplay: (ms) => Math.round(ms / 1000),
    fromDisplay: (s) => s * 1000,
  },
  {
    key: "chillMaxMisses",
    title: "Chill Lives",
    label: "Misses allowed",
    description: "How many misses you get before Chill mode ends.",
    control: "number",
    min: 1,
    max: 10,
    step: 1,
    unit: "",
    toDisplay: (n) => n,
    fromDisplay: (n) => n,
  },
  {
    key: "timeModeStartMs",
    title: "Starting Clock",
    label: "Starting time",
    description: "How much time you begin with in Time Attack mode.",
    control: "number",
    min: 10,
    max: 60,
    step: 5,
    unit: "s",
    toDisplay: (ms) => Math.round(ms / 1000),
    fromDisplay: (s) => s * 1000,
  },
];

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
