"""
Playwright hCaptcha Fast-Pass Module
Clean, robust automation helper for resolving 1-click hCaptcha checkboxes
using human-emulated coordinate jitter.
"""

import asyncio
import random
from typing import Optional
from playwright.async_api import Page, Frame

async def auto_click_hcaptcha(page: Page, timeout_s: float = 10.0) -> bool:
    """
    Finds the hCaptcha checkbox iframe, waits for visibility,
    and emulates a natural human click with coordinate jitter.
    
    Returns True if the checkmark was verified, False otherwise.
    """
    t0 = asyncio.get_event_loop().time()
    hcaptcha_frame: Optional[Frame] = None

    # 1. Locate hcaptcha challenge/checkbox iframe
    while asyncio.get_event_loop().time() - t0 < timeout_s:
        for frame in page.frames:
            if "hcaptcha.com" in frame.url and ("checkbox" in frame.url or "custom" in frame.url or "hcaptcha.html" in frame.url):
                hcaptcha_frame = frame
                break
        if hcaptcha_frame:
            break
        await asyncio.sleep(0.3)

    if not hcaptcha_frame:
        # Fallback: look for iframe selector in main DOM
        iframe_element = await page.query_selector("iframe[src*='hcaptcha.com']")
        if iframe_element:
            hcaptcha_frame = await iframe_element.content_frame()

    if not hcaptcha_frame:
        print("[hCaptcha] No hCaptcha iframe found on page.")
        return False

    # 2. Locate the checkbox element inside the iframe
    checkbox = await hcaptcha_frame.wait_for_selector("#checkbox, [role='checkbox'], .check", timeout=5000)
    if not checkbox:
        print("[hCaptcha] Checkbox element not found inside iframe.")
        return False

    # 3. Check if already solved
    aria_checked = await checkbox.get_attribute("aria-checked")
    if aria_checked == "true":
        print("[hCaptcha] Checkbox already verified.")
        return True

    # 4. Human-emulated hover & click with coordinate jitter
    box = await checkbox.bounding_box()
    if box:
        jitter_x = box["x"] + box["width"] / 2 + random.uniform(-3, 3)
        jitter_y = box["y"] + box["height"] / 2 + random.uniform(-3, 3)
        
        # Natural cursor movement
        await page.mouse.move(jitter_x, jitter_y, steps=random.randint(5, 12))
        await asyncio.sleep(random.uniform(0.15, 0.35))
        await page.mouse.click(jitter_x, jitter_y, delay=random.uniform(50, 120))
    else:
        await checkbox.click(delay=random.uniform(50, 100))

    # 5. Wait for token or checkmark verification
    wait_start = asyncio.get_event_loop().time()
    while asyncio.get_event_loop().time() - wait_start < 5.0:
        aria_checked = await checkbox.get_attribute("aria-checked")
        if aria_checked == "true":
            print("[hCaptcha] 1-Click Pass Verified! Centang hijau sukses.")
            return True
        await asyncio.sleep(0.4)

    print("[hCaptcha] Clicked. Interactive challenge may be present.")
    return False
