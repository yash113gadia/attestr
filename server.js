import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import { readFileSync, existsSync } from 'fs';
import blockchain from './server/blockchain.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '50mb' }));

// ── Hugging Face AI Detection ──
const HF_TOKEN = process.env.HF_TOKEN || '';
const HF_BASE = 'https://router.huggingface.co/hf-inference/models';
const AI_MODELS = [
  { id: 'umm-maybe/AI-image-detector', name: 'ViT Vision Transformer', weight: 2 },
  { id: 'haywoodsloan/ai-image-detector-deploy', name: 'ResNet Classifier', weight: 2 },
];

app.post('/api/ai-detect', async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' });

  const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  const results = [];

  for (const model of AI_MODELS) {
    try {
      const headers = { 'Content-Type': 'application/octet-stream' };
      if (HF_TOKEN) headers['Authorization'] = `Bearer ${HF_TOKEN}`;

      const response = await fetch(`${HF_BASE}/${model.id}`, {
        method: 'POST',
        headers,
        body: imageBuffer,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`HF ${model.name} error:`, errText);
        results.push({ model: model.name, error: 'Model unavailable', scores: null });
        continue;
      }

      const data = await response.json();

      // HF returns array of { label, score }
      if (Array.isArray(data)) {
        const aiLabel = data.find((d) => {
          const l = d.label?.toLowerCase();
          return l?.includes('ai') || l?.includes('artificial') || l?.includes('fake') || l?.includes('generated');
        });
        const humanLabel = data.find((d) => {
          const l = d.label?.toLowerCase();
          return l?.includes('human') || l?.includes('real') || l?.includes('authentic') || l?.includes('natural');
        });

        results.push({
          model: model.name,
          scores: data.map((d) => ({ label: d.label, score: Math.round(d.score * 100) })),
          aiScore: aiLabel ? Math.round(aiLabel.score * 100) : (humanLabel ? Math.round((1 - humanLabel.score) * 100) : null),
          humanScore: humanLabel ? Math.round(humanLabel.score * 100) : null,
        });
      } else if (data?.error?.includes('loading')) {
        results.push({ model: model.name, error: 'Model warming up — retry in 30s', scores: null });
      } else {
        results.push({ model: model.name, error: 'Unexpected response', raw: data });
      }
    } catch (err) {
      console.warn(`HF ${model.name} failed:`, err.message);
      results.push({ model: model.name, error: err.message, scores: null });
    }
  }

  // Weighted aggregate
  const validResults = results.filter((r) => r.aiScore != null);
  let avgAiScore = null;
  if (validResults.length > 0) {
    let totalWeight = 0;
    let weightedSum = 0;
    for (const r of validResults) {
      const model = AI_MODELS.find((m) => m.name === r.model);
      const w = model?.weight || 1;
      weightedSum += r.aiScore * w;
      totalWeight += w;
    }
    avgAiScore = Math.round(weightedSum / totalWeight);
  }

  let verdict = 'unknown';
  if (avgAiScore != null) {
    if (avgAiScore >= 65) verdict = 'likely_ai';
    else if (avgAiScore >= 35) verdict = 'suspicious';
    else verdict = 'likely_authentic';
  }

  res.json({ verdict, aiScore: avgAiScore, models: results });
});

// ── Sepolia Contract Setup ──
let contract = null;
let wallet = null;
let provider = null;
const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (PRIVATE_KEY && existsSync('artifacts/deployment.json') && existsSync('artifacts/MediaRegistry.json')) {
  try {
    const deployment = JSON.parse(readFileSync('artifacts/deployment.json', 'utf8'));
    const artifact = JSON.parse(readFileSync('artifacts/MediaRegistry.json', 'utf8'));
    provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    contract = new ethers.Contract(deployment.address, artifact.abi, wallet);
    console.log(`Sepolia contract: ${deployment.address}`);
    console.log(`Etherscan: ${deployment.etherscanUrl}`);
  } catch (err) {
    console.warn('Failed to load Sepolia contract:', err.message);
    console.log('Falling back to local blockchain only.');
  }
} else {
  console.log('No Sepolia config found. Using local blockchain only.');
  if (!PRIVATE_KEY) console.log('  Set PRIVATE_KEY env var to enable Sepolia.');
  if (!existsSync('artifacts/deployment.json')) console.log('  Run: node scripts/deploy.js');
}

// ── Register ──
app.post('/api/register', async (req, res) => {
  const { sha256, dHash, filename, fileSize, mimeType, userId, userName } = req.body;

  if (!sha256 || !dHash) {
    return res.status(400).json({ error: 'sha256 and dHash are required' });
  }

  // Check 1: Exact hash match — same file already registered
  const existing = blockchain.findBySha256(sha256);
  if (existing) {
    const regBy = existing.data?.userName || 'unknown';
    const regTime = new Date(existing.timestamp);
    return res.status(409).json({
      error: `This exact file was already registered by ${regBy} on ${regTime.toLocaleDateString()} at ${regTime.toLocaleTimeString()}.`,
      block: existing,
    });
  }

  // Check 2: Perceptual match — visually similar content already registered
  // Only run perceptual matching for images (video dHashes are SHA-256-derived, not perceptual)
  const isImage = mimeType && mimeType.startsWith('image/');
  if (dHash && isImage) {
    const similar = blockchain.findByDHash(dHash);
    if (similar && similar.block.data?.mimeType?.startsWith('image/')) {
      const totalBits = similar.block.data.dHash.length * 4;
      const similarity = Math.round(((totalBits - similar.distance) / totalBits) * 100);
      const regBy = similar.block.data?.userName || 'unknown';
      const regTime = new Date(similar.block.timestamp);
      return res.status(409).json({
        error: `Visually similar content (${similarity}% match) was already registered by ${regBy} on ${regTime.toLocaleDateString()} at ${regTime.toLocaleTimeString()}. File: ${similar.block.data?.filename}`,
        block: similar.block,
        similarity,
      });
    }
  }

  // Check 3: On-chain exact match (Sepolia)
  if (contract) {
    try {
      const [existsOnChain] = await contract.verify('0x' + sha256);
      if (existsOnChain) {
        return res.status(409).json({
          error: 'This exact file is already registered on Ethereum Sepolia.',
        });
      }
    } catch {}
  }

  // All checks passed — register
  const block = blockchain.addBlock({
    sha256,
    dHash,
    filename: filename || 'unknown',
    fileSize: fileSize || 0,
    mimeType: mimeType || 'unknown',
    userId: userId || 'anonymous',
    userName: userName || 'Anonymous',
    registeredAt: new Date().toISOString(),
  });

  // Also register on Sepolia if available
  let onChain = null;
  if (contract) {
    try {
      const sha256Bytes = '0x' + sha256;
      const dHashHex = '0x' + dHash.padEnd(16, '0');
      const tx = await contract.register(
        sha256Bytes,
        dHashHex,
        filename || 'unknown',
        fileSize || 0,
        mimeType || 'unknown'
      );
      const receipt = await tx.wait();
      onChain = {
        transactionHash: receipt.hash,
        blockNumber: Number(receipt.blockNumber),
        etherscanUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`,
        network: 'sepolia',
        gasUsed: receipt.gasUsed.toString(),
      };
      console.log(`On-chain tx: ${receipt.hash}`);
    } catch (err) {
      console.warn('Sepolia registration failed:', err.reason || err.message);
      onChain = { error: err.reason || err.message };
    }
  }

  res.json({ success: true, block, onChain });
});

// ── Verify ──
app.post('/api/verify', async (req, res) => {
  const { sha256, dHash } = req.body;

  if (!sha256) {
    return res.status(400).json({ error: 'sha256 is required' });
  }

  // Count total registrations for context
  const chain = blockchain.getChain();
  const totalRegistrations = chain.length - 1;

  // Check on-chain first if available
  let onChain = null;
  if (contract) {
    try {
      const sha256Bytes = '0x' + sha256;
      const [exists, record] = await contract.verify(sha256Bytes);
      if (exists) {
        const registeredAt = new Date(Number(record.timestamp) * 1000);
        onChain = {
          verified: true,
          filename: record.filename,
          fileSize: Number(record.fileSize),
          mimeType: record.mimeType,
          registeredBy: record.registeredBy,
          timestamp: Number(record.timestamp),
          blockNumber: Number(record.blockNumber),
          network: 'sepolia',
          registeredAt: registeredAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn('Sepolia verify failed:', err.message);
    }
  }

  // Check local chain
  const exactMatch = blockchain.findBySha256(sha256);

  if (exactMatch || onChain?.verified) {
    const registrant = onChain?.registeredBy
      ? `${onChain.registeredBy.substring(0, 6)}...${onChain.registeredBy.substring(38)}`
      : exactMatch?.data?.userName || 'unknown';
    const regTime = onChain?.registeredAt
      ? new Date(onChain.registeredAt)
      : exactMatch ? new Date(exactMatch.timestamp) : null;
    const timeStr = regTime ? formatTimeAgo(regTime) : 'unknown time';

    return res.json({
      status: 'verified',
      message: `Exact match found. First registered ${timeStr} by ${registrant}.`,
      block: exactMatch || null,
      onChain,
      similarity: 100,
      totalRegistrations,
    });
  }

  // Perceptual match (local only)
  if (dHash) {
    const perceptualMatch = blockchain.findByDHash(dHash);
    if (perceptualMatch) {
      const totalBits = perceptualMatch.block.data.dHash.length * 4;
      const similarity = Math.round(((totalBits - perceptualMatch.distance) / totalBits) * 100);
      const regUser = perceptualMatch.block.data?.userName || 'unknown';
      const regTime = new Date(perceptualMatch.block.timestamp);

      return res.json({
        status: 'similar',
        message: `Content matches a registered file (${similarity}% similar), registered ${formatTimeAgo(regTime)} by ${regUser}. The file may have been re-compressed, resized, or screenshotted.`,
        block: perceptualMatch.block,
        onChain,
        similarity,
        hammingDistance: perceptualMatch.distance,
        totalRegistrations,
      });
    }
  }

  res.json({
    status: 'unverified',
    message: `No matching media found. This file has not been registered on the blockchain.${totalRegistrations > 0 ? ` ${totalRegistrations} files are currently registered.` : ''}`,
    onChain: null,
    similarity: 0,
    totalRegistrations,
  });
});

function formatTimeAgo(date) {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  return `on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
}

// ── Chain explorer ──
app.get('/api/chain', async (req, res) => {
  let onChainStats = null;
  if (contract) {
    try {
      const total = await contract.totalRegistered();
      const balance = await provider.getBalance(wallet.address);
      onChainStats = {
        network: 'sepolia',
        contractAddress: await contract.getAddress(),
        totalRegistered: Number(total),
        walletBalance: ethers.formatEther(balance),
      };
    } catch (err) {
      console.warn('Failed to get on-chain stats:', err.message);
    }
  }

  res.json({
    chain: blockchain.getChain(),
    length: blockchain.getChain().length,
    valid: blockchain.isChainValid(),
    onChain: onChainStats,
  });
});

// ── User's media (auth-gated on frontend) ──
app.get('/api/my-media/:userId', (req, res) => {
  const { userId } = req.params;
  const chain = blockchain.getChain();
  const userBlocks = chain.filter((b) => b.data?.userId === userId);
  res.json({
    blocks: userBlocks,
    count: userBlocks.length,
  });
});

// ── Public activity feed (anonymous) ──
app.get('/api/activity', async (req, res) => {
  const chain = blockchain.getChain();
  // Return all non-genesis blocks, anonymized
  const activity = chain
    .filter((b) => b.data && !b.data.message)
    .map((b) => {
      // Censor filename — show extension only
      const ext = b.data.filename?.includes('.') ? b.data.filename.split('.').pop() : '?';
      const nameLen = b.data.filename?.split('.')[0]?.length || 0;
      const censored = '•'.repeat(Math.min(nameLen, 8)) + '.' + ext;

      return {
        index: b.index,
        hash: b.hash,
        timestamp: b.timestamp,
        filename: censored,
        fileSize: b.data.fileSize,
        mimeType: b.data.mimeType,
        registeredBy: b.data.userId ? b.data.userId.substring(0, 2) + '••••' : 'anon',
      };
    })
    .reverse();

  let onChainStats = null;
  if (contract) {
    try {
      const total = await contract.totalRegistered();
      onChainStats = {
        totalRegistered: Number(total),
        network: 'sepolia',
        contractAddress: await contract.getAddress(),
      };
    } catch {}
  }

  res.json({
    activity,
    totalRegistrations: activity.length,
    chainLength: chain.length,
    chainValid: blockchain.isChainValid(),
    onChain: onChainStats,
  });
});

// ── Block lookup ──
app.get('/api/block/:sha256', (req, res) => {
  const block = blockchain.findBySha256(req.params.sha256);
  if (!block) {
    return res.status(404).json({ error: 'Block not found' });
  }
  res.json(block);
});

// ── Status ──
app.get('/api/status', async (req, res) => {
  const status = {
    localChain: {
      blocks: blockchain.getChain().length,
      valid: blockchain.isChainValid(),
    },
    sepolia: null,
  };

  if (contract) {
    try {
      const total = await contract.totalRegistered();
      const balance = await provider.getBalance(wallet.address);
      status.sepolia = {
        connected: true,
        contract: await contract.getAddress(),
        totalRegistered: Number(total),
        walletBalance: ethers.formatEther(balance),
        network: 'sepolia',
      };
    } catch {
      status.sepolia = { connected: false };
    }
  }

  res.json(status);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Local chain: ${blockchain.getChain().length} blocks | Valid: ${blockchain.isChainValid()}`);
  console.log(`Sepolia: ${contract ? 'ENABLED' : 'DISABLED (local only)'}`);
});
