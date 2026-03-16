# Attestr

**Decentralized media authenticator** — blockchain-verified media provenance on Ethereum.

Built for **Innovate Bharat Hackathon 2026** by Team **Ctrl+Alt+Diablo**.

![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?logo=ethereum) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)

## What is this?

Attestr lets you register media files on the Ethereum blockchain to create a permanent, tamper-proof record of origin. Anyone can then verify a piece of media against the on-chain ledger to check if it's authentic.

On top of that, it runs AI-powered deepfake and tampering detection using forensic analysis and ML models — so you get both cryptographic proof and intelligent analysis in one tool.

## Features

- **Blockchain registration** — SHA-256 + perceptual hash (dHash) stored on-chain via `MediaRegistry.sol`
- **On-chain verification** — check any media file against the Ethereum ledger
- **7-signal forensic analysis** — EXIF metadata, pixel statistics, noise patterns, color distribution, edge coherence, Benford's Law analysis, frequency domain inspection
- **ML-based detection** — ViT and ResNet models via Hugging Face Inference API
- **Error Level Analysis (ELA)** — visual compression artifact detection
- **3D interface** — Three.js-powered visuals with Framer Motion transitions
- **Firebase auth** — user accounts and session management
- **Mobile-optimized** — responsive design, works on phones

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, Three.js, Framer Motion |
| Backend | Express 5, Node.js |
| Blockchain | Solidity, Hardhat 3, Ethers.js 6, Sepolia testnet |
| Auth | Firebase |
| AI/ML | Hugging Face Inference API (ViT, ResNet) |

## Getting Started

### Prerequisites

- Node.js >= 18
- A Sepolia testnet wallet with some test ETH ([faucet](https://sepoliafaucet.com/))
- Firebase project credentials
- Hugging Face API token

### Setup

```bash
git clone <repo-url>
cd hackathon
npm install
```

Create a `.env` file in the root:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=your_rpc_url
CONTRACT_ADDRESS=deployed_contract_address
HF_API_TOKEN=your_huggingface_token
```

### Run

```bash
# Frontend
npm run dev

# Backend (separate terminal)
npm run server
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:3000`.

## Smart Contract

**MediaRegistry.sol** — deployed on Ethereum Sepolia.

Stores SHA-256 and perceptual hashes for registered media. Handles registration, lookup, and verification. Compile and deploy with Hardhat:

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/verify` | Verify media against blockchain records |
| POST | `/api/detect` | Run AI deepfake/tampering detection |
| POST | `/api/register` | Register new media on-chain |
| GET | `/api/status/:hash` | Check registration status by hash |

## Team — Ctrl+Alt+Diablo

- **Yash Gadia** — Full-stack dev, blockchain integration
- Built at Innovate Bharat Hackathon 2026

---

*If you're reading this and want to try it out, grab some Sepolia ETH and give it a spin.*
