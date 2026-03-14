import { useState, useEffect } from "react";

export default function LangSwitchPopup({ targetLang, onConfirm, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleConfirm() {
    setVisible(false);
    setTimeout(onConfirm, 320);
  }

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 320);
  }

  const isBg = targetLang === "bg";

  return (
    <div
      className={`lsp-overlay${isBg ? " lsp-overlay-bg" : " lsp-overlay-en"}${visible ? " lsp-visible" : ""}`}
      onClick={handleClose}
    >
      <div
        className={`lsp-card${isBg ? " lsp-card-bg" : " lsp-card-en"}${visible ? " lsp-card-visible" : ""}`}
        onClick={e => e.stopPropagation()}
      >
        {isBg && <div className="lsp-flag-stripe" />}
        <div className="lsp-inner">
          <span className="lsp-icon">{isBg ? "🇧🇬" : "🌍"}</span>

          {isBg ? (
            <>
              <h2 className="lsp-title lsp-title-bg">Българско предизвикателство</h2>
              <p className="lsp-body">
                Сега играта ще бъде на български и ще тества знанията ти за България – история, личности и интересни факти. Готов ли си?
              </p>
              <button className="lsp-confirm lsp-confirm-bg" onClick={handleConfirm}>
                Готов съм! 🚀
              </button>
              <button className="lsp-skip" onClick={handleClose}>Отказ</button>
            </>
          ) : (
            <>
              <h2 className="lsp-title lsp-title-en">International Challenge</h2>
              <p className="lsp-body lsp-body-en">
                The game will switch to English, and the questions will be about the whole world – countries, inventions, famous people and more. Ready for the global challenge?
              </p>
              <button className="lsp-confirm lsp-confirm-en" onClick={handleConfirm}>
                Let's go! 🌐
              </button>
              <button className="lsp-skip lsp-skip-en" onClick={handleClose}>Cancel</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
