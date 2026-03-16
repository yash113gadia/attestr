# Attestr - Media Verifier Chrome Extension

Verify the authenticity of any image against the Attestr blockchain directly from your browser.

## Installation

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer Mode** (toggle in the top-right corner)
3. Click **"Load unpacked"**
4. Select the `extension/` folder

## Usage

1. Right-click any image on any webpage
2. Select **"Verify with Attestr"** from the context menu
3. The extension computes the image's SHA-256 hash and checks it against the Attestr blockchain
4. A badge overlay appears on the image:
   - **Blue ?** — Verification in progress
   - **Green checkmark** — Verified on blockchain
   - **Red X** — Not found on blockchain
5. Click the extension icon in the toolbar to see your recent verification history

## How It Works

- The image is fetched and its SHA-256 hash is computed using the Web Crypto API
- The hash is sent to the Attestr verification API at `https://hackathon-six-eosin.vercel.app/api/verify`
- Results are stored locally and displayed in the popup

## Icons

The included PNG icons were generated from `icons/icon.svg`. To regenerate higher-quality icons, convert the SVG using any image editor or a tool like ImageMagick:

```bash
# If you have ImageMagick installed:
convert -background none icons/icon.svg -resize 16x16 icons/icon16.png
convert -background none icons/icon.svg -resize 48x48 icons/icon48.png
convert -background none icons/icon.svg -resize 128x128 icons/icon128.png
```

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (Manifest V3) |
| `background.js` | Service worker — context menu, hashing, API calls |
| `popup.html/css/js` | Extension popup UI — history display |
| `content.js/css` | Content script — badge overlays on images |
| `icons/` | Extension icons |
