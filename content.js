/**
 * hCaptcha Fast Pass - Clean Automation Engine
 * Auto-detects and emulates human checkbox clicks inside hCaptcha iframes.
 * Zero tracking, zero external network calls, zero malware.
 */

(function initHCaptchaEngine() {
  "use strict";

  // Only run inside hCaptcha iframes or assets
  if (!location.hostname.includes("hcaptcha.com")) return;

  // Prevent double-loading in the same iframe
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

    // Dispatch full sequence: pointerdown -> mousedown -> pointerup -> mouseup -> click
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
      // If checkbox element is not rendered yet, poll quickly
      setTimeout(checkAndClick, randomJitter(150, 300));
      return;
    }

    const ariaChecked = checkbox.getAttribute("aria-checked");
    const dataChecked = checkbox.getAttribute("data-checked");

    if (ariaChecked === "true" || dataChecked === "true") {
      console.log("[hCaptcha-FastPass] Already verified / checked.");
      return;
    }

    // Apply human randomized pause before clicking
    const delay = randomJitter(200, 450);
    setTimeout(() => {
      // Re-verify before clicking
      if (checkbox.getAttribute("aria-checked") !== "true") {
        console.log(`[hCaptcha-FastPass] Emulating human click (jitter delay: ${delay}ms)...`);
        simulateHumanClick(checkbox);

        // Verification check after click
        setTimeout(() => {
          const pass = checkbox.getAttribute("aria-checked") === "true" || 
                       checkbox.getAttribute("data-checked") === "true";
          if (pass) {
            console.log("[hCaptcha-FastPass] 1-Click Pass Succeeded! Checkmark verified.");
          } else {
            console.log("[hCaptcha-FastPass] Checkbox clicked. Waiting for token or visual challenge.");
          }
        }, randomJitter(600, 1000));
      }
    }, delay);
  }

  // Polling watchdog to handle dynamically loaded frames
  let pollInterval = setInterval(() => {
    const checkbox = document.querySelector("#checkbox");
    if (checkbox && checkbox.getAttribute("aria-checked") === "true") {
      clearInterval(pollInterval);
      return;
    }
    checkAndClick();
  }, randomJitter(2500, 4000));

  // Run initial check
  if (document.readyState === "complete" || document.readyState === "interactive") {
    checkAndClick();
  } else {
    window.addEventListener("DOMContentLoaded", checkAndClick);
  }
})();
