import { getContract, cors } from './_shared.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { sha256, dHash, filename, fileSize, mimeType, userId, userName } = req.body;
    if (!sha256 || !dHash) return res.status(400).json({ error: 'sha256 and dHash required' });

    const setup = getContract();

    if (setup) {
      try {
        const sha256Bytes = '0x' + sha256;

        // Check 1: Exact hash — already registered?
        const [exists, existingRecord] = await setup.contract.verify(sha256Bytes);
        if (exists) {
          const regTime = new Date(Number(existingRecord.timestamp) * 1000);
          const regBy = existingRecord.registeredBy;
          return res.status(409).json({
            error: `This exact file was already registered by ${regBy.substring(0, 6)}...${regBy.substring(38)} on ${regTime.toLocaleDateString()} at ${regTime.toLocaleTimeString()}.`,
            existingRecord: {
              filename: existingRecord.filename,
              registeredBy: regBy,
              timestamp: Number(existingRecord.timestamp),
              blockNumber: Number(existingRecord.blockNumber),
            },
          });
        }

        // Check 2: Scan recent registrations for perceptual similarity
        // (on-chain dHash is stored as bytes8, limited comparison)
        // Full perceptual check happens on local server — Vercel does exact-only

        // All checks passed — register
        const dHashHex = '0x' + dHash.substring(0, 16).padEnd(16, '0');
        const tx = await setup.contract.register(sha256Bytes, dHashHex, filename || 'unknown', fileSize || 0, mimeType || 'unknown');
        const receipt = await tx.wait();

        return res.json({
          success: true,
          block: {
            index: Date.now(),
            hash: sha256,
            timestamp: Date.now(),
            data: { sha256, dHash, filename, fileSize, mimeType, userId, userName, registeredAt: new Date().toISOString() },
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
        // If contract reverts with "already registered"
        if (e.reason?.includes('already registered')) {
          return res.status(409).json({ error: 'This file is already registered on the blockchain.' });
        }
        return res.json({
          success: true,
          block: {
            index: Date.now(),
            hash: sha256,
            timestamp: Date.now(),
            data: { sha256, dHash, filename, fileSize, mimeType, userId, userName, registeredAt: new Date().toISOString() },
          },
          onChain: { error: e.reason || e.message },
        });
      }
    }

    // No contract — local only
    res.json({
      success: true,
      block: {
        index: Date.now(),
        hash: sha256,
        timestamp: Date.now(),
        data: { sha256, dHash, filename, fileSize, mimeType, userId, userName, registeredAt: new Date().toISOString() },
      },
      onChain: null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
