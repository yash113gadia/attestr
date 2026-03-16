import { getContract, cors } from './_shared.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { sha256, dHash, filename, fileSize, mimeType, userId, userName } = req.body;
    if (!sha256 || !dHash) return res.status(400).json({ error: 'sha256 and dHash required' });

    let onChain = null;
    const setup = getContract();

    if (setup) {
      try {
        const sha256Bytes = '0x' + sha256;
        const dHashHex = '0x' + dHash.substring(0, 16).padEnd(16, '0');

        const [exists] = await setup.contract.verify(sha256Bytes);
        if (exists) return res.status(409).json({ error: 'Media already registered on-chain' });

        const tx = await setup.contract.register(sha256Bytes, dHashHex, filename || 'unknown', fileSize || 0, mimeType || 'unknown');
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
      block: {
        index: Date.now(),
        hash: sha256,
        timestamp: Date.now(),
        data: { sha256, dHash, filename, fileSize, mimeType, userId, userName, registeredAt: new Date().toISOString() },
      },
      onChain,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
