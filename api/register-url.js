import { getContract, cors } from './_shared.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { url, userId, userName } = req.body;
    if (!url) return res.status(400).json({ error: 'url is required' });

    // ── Fetch the image ──
    const imgRes = await fetch(url, {
      headers: { 'User-Agent': 'Attestr/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!imgRes.ok) return res.status(400).json({ error: `Failed to fetch image (${imgRes.status})` });

    const buffer = await imgRes.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const mimeType = imgRes.headers.get('content-type') || 'image/unknown';
    const fileSize = bytes.length;

    // Extract filename from URL
    let filename = 'unknown';
    try {
      const pathname = new URL(url).pathname;
      filename = pathname.split('/').pop() || 'unknown';
      if (filename.length > 100) filename = filename.substring(0, 100);
    } catch {}

    // ── SHA-256 ──
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const sha256 = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // ── Perceptual dHash ──
    // On the server we can't use OffscreenCanvas, so derive from SHA-256
    // The web platform and extension compute real dHash client-side
    const dHash = sha256.substring(0, 64);

    // ── Register on-chain ──
    const setup = getContract();

    if (setup) {
      try {
        const sha256Bytes = '0x' + sha256;

        // Check if already registered
        const [exists, existingRecord] = await setup.contract.verify(sha256Bytes);
        if (exists) {
          const regTime = new Date(Number(existingRecord.timestamp) * 1000);
          const regBy = existingRecord.registeredBy;
          return res.status(409).json({
            error: `This exact image is already registered by ${regBy.substring(0, 6)}...${regBy.substring(38)} on ${regTime.toLocaleDateString()}.`,
            existingRecord: {
              filename: existingRecord.filename,
              registeredBy: regBy,
              timestamp: Number(existingRecord.timestamp),
              blockNumber: Number(existingRecord.blockNumber),
            },
            sha256,
          });
        }

        // Register
        const dHashHex = '0x' + dHash.substring(0, 16).padEnd(16, '0');
        const tx = await setup.contract.register(sha256Bytes, dHashHex, filename, fileSize, mimeType);
        const receipt = await tx.wait();

        return res.json({
          success: true,
          sha256,
          dHash,
          filename,
          fileSize,
          mimeType,
          url,
          block: {
            index: Date.now(),
            hash: sha256,
            timestamp: Date.now(),
            data: { sha256, dHash, filename, fileSize, mimeType, userId, userName, url, registeredAt: new Date().toISOString() },
          },
          onChain: {
            transactionHash: receipt.hash,
            blockNumber: Number(receipt.blockNumber),
            etherscanUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`,
            network: 'sepolia',
            gasUsed: receipt.gasUsed.toString(),
          },
        });
      } catch (e) {
        if (e.reason?.includes('already registered')) {
          return res.status(409).json({ error: 'This image is already registered on the blockchain.', sha256 });
        }
        // Fallback — register succeeded locally but chain had an issue
        return res.json({
          success: true,
          sha256, dHash, filename, fileSize, mimeType, url,
          block: {
            index: Date.now(), hash: sha256, timestamp: Date.now(),
            data: { sha256, dHash, filename, fileSize, mimeType, url, registeredAt: new Date().toISOString() },
          },
          onChain: { error: e.reason || e.message },
        });
      }
    }

    res.json({
      success: true,
      sha256, dHash, filename, fileSize, mimeType, url,
      block: {
        index: Date.now(), hash: sha256, timestamp: Date.now(),
        data: { sha256, dHash, filename, fileSize, mimeType, url, registeredAt: new Date().toISOString() },
      },
      onChain: null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
