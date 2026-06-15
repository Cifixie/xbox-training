import { useState, useEffect, useRef, useCallback } from "react";
import type {
  GameMode,
  GamePhase,
  GameState,
  Prompt,
  PromptType,
  RoundResult,
} from "./types.ts";
import {
  ALL_PROMPTS,
  BUTTON_MAP,
  CHILL_MAX_MISSES,
  NEXT_PROMPT_DELAY_MS,
  PROMPT_TIMEOUT_MS,
  STICK_THRESHOLD,
  TIME_MODE_START_MS,
  TIMER_DECREMENT_MS,
  TIMER_INCREMENT_MS,
} from "./types.ts";
import { StartScreen } from "./StartScreen.tsx";
import { GameScreen } from "./GameScreen.tsx";
import { EndScreen } from "./EndScreen.tsx";
import "./App.css";

function randomPrompt(): Prompt {
  const type = ALL_PROMPTS[Math.floor(Math.random() * ALL_PROMPTS.length)];
  const x = 10 + Math.random() * 80;
  const y = 10 + Math.random() * 80;
  return { type, x, y };
}

function initialState(): GameState {
  return {
    mode: "survive",
    phase: "start",
    currentPrompt: null,
    promptStartTime: null,
    rounds: [],
    misses: 0,
    timeDeadline: null,
    gameStartTime: null,
    gameEndTime: null,
  };
}

export default function App() {
  const [state, setState] = useState<GameState>(initialState());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const prevButtonsRef = useRef<boolean[]>([]);
  const prevAxesRef = useRef<number[]>([]);

  const clearPromptTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showNextPromptRef = useRef<(() => void) | null>(null);

  const showNextPrompt = useCallback(() => {
    clearPromptTimeout();
    const prompt = randomPrompt();
    const now = Date.now();
    setState((s) => ({ ...s, currentPrompt: prompt, promptStartTime: now }));

    timeoutRef.current = setTimeout(() => {
      setState((s) => {
        if (!s.currentPrompt) return s;
        const result: RoundResult = {
          prompt: s.currentPrompt.type,
          reactionMs: null,
          correct: false,
        };
        const newMisses = s.misses + 1;
        const newRounds = [...s.rounds, result];

        if (s.mode === "survive") {
          return {
            ...s,
            rounds: newRounds,
            misses: newMisses,
            phase: "end",
            currentPrompt: null,
            gameEndTime: Date.now(),
          };
        }
        if (s.mode === "chill" && newMisses >= CHILL_MAX_MISSES) {
          return {
            ...s,
            rounds: newRounds,
            misses: newMisses,
            phase: "end",
            currentPrompt: null,
            gameEndTime: Date.now(),
          };
        }
        if (s.mode === "time") {
          return {
            ...s,
            rounds: newRounds,
            misses: newMisses,
            timeDeadline:
              s.timeDeadline !== null
                ? s.timeDeadline - TIMER_DECREMENT_MS
                : s.timeDeadline,
            currentPrompt: null,
          };
        }
        return {
          ...s,
          rounds: newRounds,
          misses: newMisses,
          currentPrompt: null,
        };
      });
    }, PROMPT_TIMEOUT_MS);
  }, [clearPromptTimeout]);

  useEffect(() => {
    showNextPromptRef.current = showNextPrompt;
  }, [showNextPrompt]);

  // When a miss happens in time/chill mode, currentPrompt becomes null → show next
  const prevCurrentPromptRef = useRef<Prompt | null>(null);
  const prevPhaseRef = useRef<GamePhase>("start");

  useEffect(() => {
    const prevPrompt = prevCurrentPromptRef.current;
    const prevPhase = prevPhaseRef.current;
    const shouldQueueNext =
      state.phase === "playing" &&
      state.currentPrompt === null &&
      prevPhase === "playing" &&
      prevPrompt !== null;

    prevCurrentPromptRef.current = state.currentPrompt;
    prevPhaseRef.current = state.phase;

    if (!shouldQueueNext) return;
    const t = setTimeout(() => showNextPromptRef.current?.(), NEXT_PROMPT_DELAY_MS);
    return () => clearTimeout(t);
  }, [state.phase, state.currentPrompt]);

  const handleButtonPress = useCallback(
    (pressed: PromptType) => {
      const s = stateRef.current;
      if (s.phase !== "playing" || !s.currentPrompt) return;

      const correct = pressed === s.currentPrompt.type;
      const reactionMs = s.promptStartTime
        ? Date.now() - s.promptStartTime
        : null;
      const result: RoundResult = {
        prompt: s.currentPrompt.type,
        reactionMs,
        correct,
      };

      if (correct) {
        clearPromptTimeout();
        setState((prev) => ({
          ...prev,
          rounds: [...prev.rounds, result],
          currentPrompt: null,
          timeDeadline:
            prev.mode === "time" && prev.timeDeadline !== null
              ? prev.timeDeadline + TIMER_INCREMENT_MS
              : prev.timeDeadline,
        }));
        setTimeout(() => showNextPromptRef.current?.(), NEXT_PROMPT_DELAY_MS);
      } else {
        setState((prev) => {
          const newMisses = prev.misses + 1;
          const newRounds = [...prev.rounds, result];

          if (prev.mode === "survive") {
            clearPromptTimeout();
            return {
              ...prev,
              rounds: newRounds,
              misses: newMisses,
              phase: "end",
              currentPrompt: null,
              gameEndTime: Date.now(),
            };
          }
          if (prev.mode === "chill" && newMisses >= CHILL_MAX_MISSES) {
            clearPromptTimeout();
            return {
              ...prev,
              rounds: newRounds,
              misses: newMisses,
              phase: "end",
              currentPrompt: null,
              gameEndTime: Date.now(),
            };
          }
          if (prev.mode === "time") {
            return {
              ...prev,
              rounds: newRounds,
              misses: newMisses,
              timeDeadline:
                prev.timeDeadline !== null
                  ? prev.timeDeadline - TIMER_DECREMENT_MS
                  : prev.timeDeadline,
            };
          }
          return {
            ...prev,
            rounds: newRounds,
            misses: newMisses,
          };
        });
      }
    },
    [clearPromptTimeout],
  );

  useEffect(() => {
    let frame = 0;

    const pollGamepad = () => {
      const gamepads = window.navigator.getGamepads();
      // Controllers don't always occupy slot 0 (connection order, Bluetooth,
      // phantom pads), so use the first connected one — matching how the
      // start screen detects "any connected gamepad".
      const gp = Array.from(gamepads).find((g) => g !== null) ?? null;

      if (gp) {
        const s = stateRef.current;

        gp.buttons.forEach((btn, idx) => {
          const wasPressed = prevButtonsRef.current[idx] ?? false;
          const isPressed = btn.pressed;
          if (isPressed && !wasPressed && s.phase === "playing") {
            const promptType = BUTTON_MAP[idx];
            if (promptType) handleButtonPress(promptType);
          }
          prevButtonsRef.current[idx] = isPressed;
        });

        const rx = gp.axes[2] ?? 0;
        const ry = gp.axes[3] ?? 0;
        const prevRx = prevAxesRef.current[2] ?? 0;
        const prevRy = prevAxesRef.current[3] ?? 0;

        if (s.phase === "playing") {
          if (
            Math.abs(rx) > STICK_THRESHOLD &&
            Math.abs(prevRx) <= STICK_THRESHOLD
          ) {
            handleButtonPress(rx > 0 ? "RS_RIGHT" : "RS_LEFT");
          }
          if (
            Math.abs(ry) > STICK_THRESHOLD &&
            Math.abs(prevRy) <= STICK_THRESHOLD
          ) {
            handleButtonPress(ry > 0 ? "RS_DOWN" : "RS_UP");
          }
        }

        prevAxesRef.current[2] = rx;
        prevAxesRef.current[3] = ry;
      }

      frame = requestAnimationFrame(pollGamepad);
    };

    frame = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(frame);
  }, [handleButtonPress]);

  const handleStart = useCallback(
    (mode: GameMode) => {
      clearPromptTimeout();
      const now = Date.now();
      setState({
        ...initialState(),
        mode,
        phase: "playing",
        gameStartTime: now,
        timeDeadline: mode === "time" ? now + TIME_MODE_START_MS : null,
      });
      setTimeout(() => showNextPromptRef.current?.(), NEXT_PROMPT_DELAY_MS);
    },
    [clearPromptTimeout],
  );

  const handleRestart = useCallback(() => {
    clearPromptTimeout();
    setState(initialState());
  }, [clearPromptTimeout]);

  useEffect(() => {
    if (state.phase === "end") clearPromptTimeout();
  }, [state.phase, clearPromptTimeout]);

  // 'time' mode: end the game the moment the countdown reaches zero.
  useEffect(() => {
    if (state.phase !== "playing" || state.mode !== "time") return;
    const id = setInterval(() => {
      const s = stateRef.current;
      if (
        s.phase === "playing" &&
        s.timeDeadline !== null &&
        Date.now() >= s.timeDeadline
      ) {
        clearPromptTimeout();
        setState((prev) =>
          prev.phase === "playing"
            ? {
                ...prev,
                phase: "end",
                currentPrompt: null,
                gameEndTime: Date.now(),
              }
            : prev,
        );
      }
    }, 100);
    return () => clearInterval(id);
  }, [state.phase, state.mode, clearPromptTimeout]);

  return (
    <div className="app">
      {state.phase === "start" && <StartScreen onStart={handleStart} />}
      {state.phase === "playing" && (
        <GameScreen
          mode={state.mode}
          currentPrompt={state.currentPrompt}
          rounds={state.rounds}
          misses={state.misses}
          promptTimeoutMs={PROMPT_TIMEOUT_MS}
          promptStartTime={state.promptStartTime}
          timeDeadline={state.timeDeadline}
        />
      )}
      {state.phase === "end" && (
        <EndScreen
          mode={state.mode}
          rounds={state.rounds}
          misses={state.misses}
          gameStartTime={state.gameStartTime}
          gameEndTime={state.gameEndTime}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
