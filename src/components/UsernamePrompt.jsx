import { useState } from "react";
import { ripple } from "../utils/ripple";

export default function UsernamePrompt({ onSave, onSkip, t }) {
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
        <h2 className="up-title">{t.up_title}</h2>
        <p className="up-sub">{t.up_sub}</p>
        <input
          className="up-input"
          type="text"
          placeholder={t.up_ph}
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
          {saving ? t.up_saving : t.up_save}
        </button>
        <button className="up-skip" onClick={onSkip}>
          {t.up_skip}
        </button>
      </div>
    </div>
  );
}
