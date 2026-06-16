import { useEffect } from "react";
import type { GameSettings, SettingDef } from "./types";
import { DEFAULT_SETTINGS, SETTINGS_SCHEMA } from "./types";

interface Props {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onClose: () => void;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function SettingRow({
  def,
  settings,
  onChange,
}: {
  def: SettingDef;
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
}) {
  const display = def.toDisplay(settings[def.key]);

  const update = (nextDisplay: number) => {
    const clamped = clamp(nextDisplay, def.min, def.max);
    onChange({ ...settings, [def.key]: def.fromDisplay(clamped) });
  };

  return (
    <div className="setting-row">
      <div className="setting-head">
        <span className="setting-title">{def.title}</span>
        <span className="setting-value">
          {display}
          {def.unit}
        </span>
      </div>
      <label className="setting-label" htmlFor={`setting-${def.key}`}>
        {def.label}
      </label>
      {def.control === "slider" ? (
        <input
          id={`setting-${def.key}`}
          className="setting-slider"
          type="range"
          min={def.min}
          max={def.max}
          step={def.step}
          value={display}
          onChange={(e) => update(Number(e.target.value))}
        />
      ) : (
        <input
          id={`setting-${def.key}`}
          className="setting-number"
          type="number"
          min={def.min}
          max={def.max}
          step={def.step}
          value={display}
          onChange={(e) => update(Number(e.target.value))}
        />
      )}
      <p className="setting-desc">{def.description}</p>
    </div>
  );
}

export function SettingsModal({ settings, onChange, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="settings-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      onClick={onClose}
    >
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button
            className="settings-close"
            aria-label="Close settings"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="settings-body">
          {SETTINGS_SCHEMA.map((def) => (
            <SettingRow
              key={def.key}
              def={def}
              settings={settings}
              onChange={onChange}
            />
          ))}
        </div>

        <div className="settings-footer">
          <button
            className="settings-reset"
            onClick={() => onChange(DEFAULT_SETTINGS)}
          >
            Reset to defaults
          </button>
          <button className="start-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
