import { getContract, cors } from '../_shared.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    const setup = getContract();
    const blocks = [];

    if (setup) {
      try {
        const total = await setup.contract.totalRegistered();
        const count = Number(total);
        for (let i = 0; i < count; i++) {
          try {
            const hash = await setup.contract.allHashes(i);
            const record = await setup.contract.records(hash);
            blocks.push({ index: i + 1, hash, timestamp: Number(record.timestamp) * 1000, data: { sha256: hash.substring(2), filename: record.filename, fileSize: Number(record.fileSize), mimeType: record.mimeType, registeredBy: record.registeredBy, registeredAt: new Date(Number(record.timestamp) * 1000).toISOString() } });
          } catch {}
        }
      } catch (e) { console.warn('My media fetch failed:', e.message); }
    }

    res.json({ blocks, count: blocks.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
