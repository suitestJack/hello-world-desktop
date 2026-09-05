import { invoke } from "@tauri-apps/api/core";

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;
let clickMeMsgEl: HTMLElement | null;
let clickCount = 0;

async function greet() {
  if (greetMsgEl && greetInputEl) {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    greetMsgEl.textContent = await invoke("greet", {
      name: greetInputEl.value,
    });
  }
}

function handleClickMe() {
  clickCount += 1;
  if (clickMeMsgEl) {
    clickMeMsgEl.textContent =
      clickCount === 1 ? "Clicked 1 time" : `Clicked ${clickCount} times`;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  clickMeMsgEl = document.querySelector("#click-me-msg");
  document
    .querySelector("#click-me-btn")
    ?.addEventListener("click", handleClickMe);
  document.querySelector("#greet-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
});
