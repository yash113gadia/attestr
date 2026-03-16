import crypto from 'crypto';
import { getContract, cors } from '../_shared.js';

const HF_TOKEN = process.env.HF_TOKEN || '';
const HF_BASE = 'https://router.huggingface.co/hf-inference/models';
const AI_MODELS = [
  { id: 'umm-maybe/AI-image-detector', name: 'ViT Vision Transformer', weight: 2 },
  { id: 'haywoodsloan/ai-image-detector-deploy', name: 'ResNet Classifier', weight: 2 },
];

function setCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  if (req.method === 'OPTIONS') { res.status(200).end(); return true; }
  return false;
}

function computeDHash(buffer) {
  // Simplified dHash placeholder — returns 16 hex chars from content
  const hash = crypto.createHash('md5').update(buffer).digest('hex');
  return hash.substring(0, 16);
}

async function detectAI(imageBuffer) {
  const results = [];

  for (const model of AI_MODELS) {
    try {
      const headers = { 'Content-Type': 'application/octet-stream' };
      if (HF_TOKEN) headers['Authorization'] = `Bearer ${HF_TOKEN}`;
      const response = await fetch(`${HF_BASE}/${model.id}`, {
        method: 'POST', headers, body: imageBuffer,
      });
      if (!response.ok) {
        results.push({ model: model.name, error: 'Model unavailable', scores: null });
        continue;
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        const aiLabel = data.find((d) => {
          const l = d.label?.toLowerCase();
          return l?.includes('ai') || l?.includes('artificial') || l?.includes('fake');
        });
        const humanLabel = data.find((d) => {
          const l = d.label?.toLowerCase();
          return l?.includes('human') || l?.includes('real') || l?.includes('authentic');
        });
        results.push({
          model: model.name,
          scores: data.map((d) => ({ label: d.label, score: Math.round(d.score * 100) })),
          aiScore: aiLabel ? Math.round(aiLabel.score * 100) : (humanLabel ? Math.round((1 - humanLabel.score) * 100) : null),
          humanScore: humanLabel ? Math.round(humanLabel.score * 100) : null,
        });
      } else {
        results.push({ model: model.name, error: data?.error || 'Unexpected response', scores: null });
      }
    } catch (e) {
      results.push({ model: model.name, error: e.message, scores: null });
    }
  }

  const valid = results.filter((r) => r.aiScore != null);
  let avgAiScore = null;
  if (valid.length > 0) {
    let tw = 0, ws = 0;
    for (const r of valid) {
      const w = AI_MODELS.find((m) => m.name === r.model)?.weight || 1;
      ws += r.aiScore * w;
      tw += w;
    }
    avgAiScore = Math.round(ws / tw);
  }

  let verdict = 'unknown';
  if (avgAiScore != null) {
    if (avgAiScore >= 65) verdict = 'likely_ai';
    else if (avgAiScore >= 35) verdict = 'suspicious';
    else verdict = 'likely_authentic';
  }

  return { verdict, confidence: avgAiScore, models: results };
}

async function fetchImageFromUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image from URL: ${response.status}`);
  const contentType = response.headers.get('content-type') || 'application/octet-stream';
  const arrayBuffer = await response.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), mimeType: contentType };
}

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // Rate limit headers (informational)
  res.setHeader('X-RateLimit-Limit', '100');
  res.setHeader('X-RateLimit-Remaining', '99');
  res.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + 3600);

  try {
    const { image, includeAI = true } = req.body || {};
    if (!image) return res.status(400).json({ error: 'image is required (base64 string or URL)' });

    let imageBuffer;
    let mimeType = 'image/unknown';

    // Determine if image is a URL or base64
    const isUrl = typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'));

    if (isUrl) {
      const fetched = await fetchImageFromUrl(image);
      imageBuffer = fetched.buffer;
      mimeType = fetched.mimeType;
    } else {
      // base64
      const raw = image.replace(/^data:image\/\w+;base64,/, '');
      const dataUriMatch = image.match(/^data:(image\/\w+);base64,/);
      if (dataUriMatch) mimeType = dataUriMatch[1];
      imageBuffer = Buffer.from(raw, 'base64');
    }

    // Compute hashes
    const sha256 = crypto.createHash('sha256').update(imageBuffer).digest('hex');
    const dHash = computeDHash(imageBuffer);
    const fileSize = imageBuffer.length;

    // Blockchain verification
    let blockchain = { verified: false };
    const setup = getContract();
    if (setup) {
      try {
        const sha256Bytes = '0x' + sha256;
        const [exists, record] = await setup.contract.verify(sha256Bytes);
        if (exists) {
          blockchain = {
            verified: true,
            filename: record.filename,
            fileSize: Number(record.fileSize),
            mimeType: record.mimeType,
            registeredBy: record.registeredBy,
            timestamp: Number(record.timestamp),
            blockNumber: Number(record.blockNumber),
            network: 'sepolia',
          };
        }
      } catch (e) {
        blockchain = { verified: false, error: e.message };
      }
    }

    // AI Detection (optional)
    let aiDetection = null;
    if (includeAI) {
      aiDetection = await detectAI(imageBuffer);
    }

    res.json({
      sha256,
      dHash,
      blockchain,
      aiDetection,
      meta: { fileSize, mimeType },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
