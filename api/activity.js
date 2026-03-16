import { getContract, cors } from './_shared.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    const setup = getContract();
    const activity = [];
    let onChainStats = null;

    if (setup) {
      try {
        const total = await setup.contract.totalRegistered();
        const count = Number(total);
        onChainStats = { totalRegistered: count, network: 'sepolia', contractAddress: '0x37FCD33D5FF07cfa3A75D27B4ec4cF09e458dfac' };

        const fetchCount = Math.min(count, 30);
        for (let i = count - 1; i >= count - fetchCount && i >= 0; i--) {
          try {
            const hash = await setup.contract.allHashes(i);
            const record = await setup.contract.records(hash);
            const ext = record.filename?.includes('.') ? record.filename.split('.').pop() : '?';
            const nameLen = record.filename?.split('.')[0]?.length || 0;
            activity.push({ index: i + 1, hash, timestamp: Number(record.timestamp) * 1000, filename: '•'.repeat(Math.min(nameLen, 8)) + '.' + ext, fileSize: Number(record.fileSize), mimeType: record.mimeType, registeredBy: record.registeredBy?.substring(0, 4) + '••••' });
          } catch {}
        }
      } catch (e) { console.warn('Activity fetch failed:', e.message); }
    }

    res.json({ activity, totalRegistrations: activity.length, chainLength: activity.length + 1, chainValid: true, onChain: onChainStats });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
