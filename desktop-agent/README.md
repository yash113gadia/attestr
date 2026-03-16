# Attestr Desktop Agent

Watches a folder and automatically registers any new media file on the Attestr blockchain.

## Usage

```bash
# Watch current directory
node agent.js

# Watch a specific folder
node agent.js ~/Photos/Imports

# Watch your Lightroom import folder
node agent.js ~/Pictures/Lightroom/Imports

# Watch an SD card mount point
node agent.js /Volumes/EOS_DIGITAL
```

## How It Works

1. You point the agent at any folder
2. Drop files into that folder (or import from camera/SD card)
3. Agent detects new files → computes SHA-256 → registers on Ethereum
4. You get an Etherscan link for each file

## Supported Formats

**Images:** JPG, JPEG, PNG, WebP, GIF, BMP, TIFF
**RAW:** CR2, CR3 (Canon), NEF (Nikon), ARW (Sony), DNG (Adobe), ORF (Olympus), RW2 (Panasonic)
**Video:** MP4, WebM, MOV, AVI, MKV, M4V

## Environment Variables

- `ATTESTR_API` — API endpoint (default: https://attestr-app.vercel.app/api)
- `ATTESTR_API_KEY` — API key for registration
