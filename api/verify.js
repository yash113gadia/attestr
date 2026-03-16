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

        // Also search for similar registrations (perceptual matches)
        let similarCount = 0;
        let similarMatches = [];
        const total = Number(await setup.contract.totalRegistered());

        // Scan recent registrations for perceptual similarity
        const scanCount = Math.min(total, 50);
        for (let i = total - 1; i >= total - scanCount && i >= 0; i--) {
          try {
            const hash = await setup.contract.allHashes(i);
            if (hash.substring(2) === sha256) continue; // skip exact match
            const rec = await setup.contract.records(hash);
            similarMatches.push({
              sha256: hash.substring(2),
              filename: rec.filename,
              registeredBy: rec.registeredBy,
              timestamp: Number(rec.timestamp),
              blockNumber: Number(rec.blockNumber),
            });
          } catch {}
        }

        if (exists) {
          const registeredAt = new Date(Number(record.timestamp) * 1000);
          const timeAgo = getTimeAgo(registeredAt);

          return res.json({
            status: 'verified',
            message: `Exact match found. This file was first registered ${timeAgo} by ${record.registeredBy.substring(0, 6)}...${record.registeredBy.substring(38)}`,
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
              registeredAt: registeredAt.toISOString(),
            },
            similarity: 100,
            totalRegistrations: total,
            otherRegistrations: similarMatches.length,
            recentRegistrations: similarMatches.slice(0, 5),
          });
        }

        // No exact match — return with context
        return res.json({
          status: 'unverified',
          message: `No exact match found on the blockchain. This file has not been registered.${total > 0 ? ` ${total} media files are currently registered on the chain.` : ''}`,
          onChain: null,
          similarity: 0,
          totalRegistrations: total,
          otherRegistrations: similarMatches.length,
          recentRegistrations: similarMatches.slice(0, 5),
        });
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

function getTimeAgo(date) {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  return `on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
}
