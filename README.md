# hCaptcha Fast Pass (Clean, Standalone)

Ekstensi browser dan modul otomasi bersih hasil ekstraksi dan penyempurnaan logika hCaptcha checkbox clicker (dari reverse engineering `script/mortar.js`).

**100% Bersih:**
- ❌ Tidak ada skimmer/keylogger
- ❌ Tidak ada koneksi C2 (`pixelx.eu.cc`)
- ❌ Tidak ada pengiriman data ke Telegram bot
- ❌ Tidak ada tracking atau modifikasi header
- ✅ Menggunakan Manifest V3 resmi
- ✅ Izin minimal hanya pada domain `hcaptcha.com`

---

## 🚀 Pilihan Cara Pakai

### 1. Pasang sebagai Ekstensi Chrome / Kiwi / Edge
1. Download file `hcaptcha-auto-pass.zip` atau buka folder `/root/hcaptcha-auto-pass`.
2. Buka `chrome://extensions` di browser PC atau Kiwi Browser di Android.
3. Aktifkan **Developer mode** di pojok kanan atas.
4. Klik **Load unpacked** dan pilih folder `hcaptcha-auto-pass`.
5. Ekstensi langsung aktif otomatis setiap kali ada iframe hCaptcha.

### 2. Pasang via Tampermonkey / Violentmonkey (Userscript)
1. Salin seluruh isi file `hcaptcha-fast-pass.user.js`.
2. Buka dashboard ekstensi Tampermonkey -> **Create a new script**.
3. Paste dan simpan (Ctrl+S).

### 3. Integrasi ke Script Bot Playwright (Python)
Import fungsi dari `playwright_hcaptcha.py`:
```python
from playwright.async_api import async_playwright
from playwright_hcaptcha import auto_click_hcaptcha

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.goto("https://target-site-with-hcaptcha.com")
        
        # Panggil fungsi auto-click
        solved = await auto_click_hcaptcha(page)
        print("hCaptcha solved:", solved)
```
