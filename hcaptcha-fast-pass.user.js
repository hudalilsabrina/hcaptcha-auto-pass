// ==UserScript==
// @name         hCaptcha Fast Pass (Clean Auto-Clicker)
// @namespace    https://github.com/hudalilsabrina
// @version      1.0.0
// @description  Lightweight, clean hCaptcha checkbox auto-clicker with human randomized jitter. No malware, zero tracking.
// @author       Ari Nata & MiMo
// @match        *://*.hcaptcha.com/*
// @match        *://hcaptcha.com/*
// @match        *://newassets.hcaptcha.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  if (!location.hostname.includes("hcaptcha.com")) return;
  if (window.__hCaptchaAutoPassActive) return;
  window.__hCaptchaAutoPassActive = true;

  function randomJitter(minMs, maxMs) {
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  }

  function simulateHumanClick(element) {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + (Math.random() * 4 - 2);
    const y = rect.top + rect.height / 2 + (Math.random() * 4 - 2);

    const eventOptions = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: x,
      clientY: y
    };

    ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach(eventType => {
      const MouseEventClass = window.PointerEvent && eventType.startsWith("pointer")
        ? PointerEvent
        : MouseEvent;
      element.dispatchEvent(new MouseEventClass(eventType, eventOptions));
    });
  }

  function checkAndClick() {
    const checkbox = document.querySelector("#checkbox") ||
                     document.querySelector("[role='checkbox']") ||
                     document.querySelector(".check");

    if (!checkbox) {
      setTimeout(checkAndClick, randomJitter(150, 300));
      return;
    }

    if (checkbox.getAttribute("aria-checked") === "true" || checkbox.getAttribute("data-checked") === "true") {
      return;
    }

    const delay = randomJitter(200, 450);
    setTimeout(() => {
      if (checkbox.getAttribute("aria-checked") !== "true") {
        console.log(`[hCaptcha-FastPass] Emulating human click (${delay}ms jitter)...`);
        simulateHumanClick(checkbox);
      }
    }, delay);
  }

  let poll = setInterval(() => {
    const cb = document.querySelector("#checkbox");
    if (cb && cb.getAttribute("aria-checked") === "true") {
      clearInterval(poll);
      return;
    }
    checkAndClick();
  }, randomJitter(2500, 4000));

  if (document.readyState === "complete" || document.readyState === "interactive") {
    checkAndClick();
  } else {
    window.addEventListener("DOMContentLoaded", checkAndClick);
  }
})();
