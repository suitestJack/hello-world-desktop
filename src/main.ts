let clickCountEl: HTMLElement | null;
let clickCount = 0;

function renderClickCount() {
  if (clickCountEl) {
    clickCountEl.textContent = String(clickCount);
  }
}

function handleClickMe() {
  clickCount += 1;
  renderClickCount();
}

window.addEventListener("DOMContentLoaded", () => {
  clickCountEl = document.querySelector("#click-count");
  renderClickCount();
  document
    .querySelector("#click-me-btn")
    ?.addEventListener("click", handleClickMe);
});
