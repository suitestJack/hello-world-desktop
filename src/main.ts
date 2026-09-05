import { invoke } from "@tauri-apps/api/core";

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;
let clickCountEl: HTMLElement | null;
let clickCount = 0;

async function greet() {
  if (greetMsgEl && greetInputEl) {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    greetMsgEl.textContent = await invoke("greet", {
      name: greetInputEl.value,
    });
  }
}

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
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  clickCountEl = document.querySelector("#click-count");
  renderClickCount();
  document
    .querySelector("#click-me-btn")
    ?.addEventListener("click", handleClickMe);
  document.querySelector("#greet-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
});
