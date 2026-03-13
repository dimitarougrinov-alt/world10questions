import { useState } from "react";
import { ripple } from "../utils/ripple";

export default function UsernamePrompt({ onSave, onSkip }) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    const name = value.trim();
    if (!name) return;
    setSaving(true);
    await onSave(name);
  }

  return (
    <div className="up-overlay">
      <div className="up-card">
        <div className="up-icon">✨</div>
        <h2 className="up-title">What's your name?</h2>
        <p className="up-sub">Show up on the leaderboard with a name you choose.</p>
        <input
          className="up-input"
          type="text"
          placeholder="Enter your name…"
          maxLength={20}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave(e)}
          autoFocus
        />
        <button
          className="up-save-btn"
          disabled={!value.trim() || saving}
          onClick={(e) => { ripple(e); handleSave(e); }}
        >
          {saving ? "Saving…" : "Save my name"}
        </button>
        <button className="up-skip" onClick={onSkip}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
