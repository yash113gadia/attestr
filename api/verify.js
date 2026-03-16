import { getContract, cors } from './_shared.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { sha256, dHash } = req.body;
    if (!sha256) return res.status(400).json({ error: 'sha256 required' });

    const setup = getContract();

    if (setup) {
      try {
        const sha256Bytes = '0x' + sha256;
        const [exists, record] = await setup.contract.verify(sha256Bytes);
        if (exists) {
          return res.json({
            status: 'verified',
            message: 'Verified on Ethereum Sepolia blockchain. Media is authentic and untampered.',
            block: null,
            onChain: {
              verified: true,
              filename: record.filename,
              fileSize: Number(record.fileSize),
              mimeType: record.mimeType,
              registeredBy: record.registeredBy,
              timestamp: Number(record.timestamp),
              blockNumber: Number(record.blockNumber),
              network: 'sepolia',
            },
            similarity: 100,
          });
        }
      } catch (e) {
        console.warn('Sepolia verify failed:', e.message);
      }
    }

    res.json({
      status: 'unverified',
      message: 'No matching media found on the blockchain.',
      onChain: null,
      similarity: 0,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
