/**
 * Call this from a button's onClick (pass the event).
 * Creates a radial ripple that expands from the click point.
 * The button must have position: relative and overflow: hidden (set in CSS).
 */
export function ripple(e) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2.2;
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top  - size / 2;

  const circle = document.createElement("span");
  circle.className = "ripple-wave";
  circle.style.width  = `${size}px`;
  circle.style.height = `${size}px`;
  circle.style.left   = `${x}px`;
  circle.style.top    = `${y}px`;

  btn.appendChild(circle);
  circle.addEventListener("animationend", () => circle.remove(), { once: true });
}
