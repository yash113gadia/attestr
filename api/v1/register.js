import crypto from 'crypto';
import { getContract } from '../_shared.js';

function setCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  if (req.method === 'OPTIONS') { res.status(200).end(); return true; }
  return false;
}

function computeDHash(buffer) {
  const hash = crypto.createHash('md5').update(buffer).digest('hex');
  return hash.substring(0, 16);
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

  // API key validation
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey.trim() === '') {
    return res.status(401).json({ error: 'Missing or empty x-api-key header' });
  }

  // Rate limit headers
  res.setHeader('X-RateLimit-Limit', '50');
  res.setHeader('X-RateLimit-Remaining', '49');
  res.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + 3600);

  try {
    const { image, filename } = req.body || {};
    if (!image) return res.status(400).json({ error: 'image is required (base64 string or URL)' });

    let imageBuffer;
    let mimeType = 'image/unknown';

    const isUrl = typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'));

    if (isUrl) {
      const fetched = await fetchImageFromUrl(image);
      imageBuffer = fetched.buffer;
      mimeType = fetched.mimeType;
    } else {
      const raw = image.replace(/^data:image\/\w+;base64,/, '');
      const dataUriMatch = image.match(/^data:(image\/\w+);base64,/);
      if (dataUriMatch) mimeType = dataUriMatch[1];
      imageBuffer = Buffer.from(raw, 'base64');
    }

    const sha256 = crypto.createHash('sha256').update(imageBuffer).digest('hex');
    const dHash = computeDHash(imageBuffer);
    const fileSize = imageBuffer.length;
    const resolvedFilename = filename || 'api-upload';

    let onChain = null;
    const setup = getContract();

    if (setup) {
      try {
        const sha256Bytes = '0x' + sha256;
        const dHashHex = '0x' + dHash.padEnd(16, '0');

        const [exists] = await setup.contract.verify(sha256Bytes);
        if (exists) return res.status(409).json({ error: 'Media already registered on-chain' });

        const tx = await setup.contract.register(sha256Bytes, dHashHex, resolvedFilename, fileSize, mimeType);
        const receipt = await tx.wait();
        onChain = {
          transactionHash: receipt.hash,
          blockNumber: Number(receipt.blockNumber),
          etherscanUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`,
          network: 'sepolia',
          gasUsed: receipt.gasUsed.toString(),
        };
      } catch (e) {
        onChain = { error: e.reason || e.message };
      }
    }

    res.json({
      success: true,
      sha256,
      dHash,
      meta: { fileSize, mimeType, filename: resolvedFilename },
      onChain,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
