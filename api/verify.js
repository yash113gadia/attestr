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
        const total = Number(await setup.contract.totalRegistered());

        // ── Check 1: Exact SHA-256 match ──
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
          });
        }

        // ── Check 2: Perceptual dHash match (survives recompression) ──
        if (dHash && dHash.length >= 16) {
          const queryDHash = dHash.substring(0, 16); // first 16 hex = 8 bytes = what's on-chain
          const scanCount = Math.min(total, 100);
          let bestMatch = null;
          let bestDistance = Infinity;

          for (let i = total - 1; i >= total - scanCount && i >= 0; i--) {
            try {
              const hash = await setup.contract.allHashes(i);
              const rec = await setup.contract.records(hash);
              // rec.dHash is bytes8 → ethers returns hex string like 0xaabbccdd...
              const onChainDHash = rec.dHash.substring(2).padEnd(16, '0'); // 16 hex chars
              const distance = hammingDistanceHex(queryDHash, onChainDHash);

              if (distance < bestDistance) {
                bestDistance = distance;
                bestMatch = {
                  sha256: hash.substring(2),
                  filename: rec.filename,
                  registeredBy: rec.registeredBy,
                  timestamp: Number(rec.timestamp),
                  blockNumber: Number(rec.blockNumber),
                  fileSize: Number(rec.fileSize),
                  mimeType: rec.mimeType,
                };
              }
            } catch {}
          }

          // 16 hex = 64 bits. Threshold 10 bits = ~84% match for the truncated hash.
          // This is intentionally looser than the full 256-bit check because on-chain
          // only stores 8 bytes of the perceptual hash.
          if (bestMatch && bestDistance <= 10) {
            const similarity = Math.round(((64 - bestDistance) / 64) * 100);
            const registeredAt = new Date(bestMatch.timestamp * 1000);
            const timeAgo = getTimeAgo(registeredAt);

            return res.json({
              status: 'similar',
              message: `Perceptual match (${similarity}% similar). A visually similar file "${bestMatch.filename}" was registered ${timeAgo} by ${bestMatch.registeredBy.substring(0, 6)}...${bestMatch.registeredBy.substring(38)}. The file may have been re-compressed, resized, or screenshotted.`,
              block: null,
              onChain: {
                verified: true,
                filename: bestMatch.filename,
                fileSize: bestMatch.fileSize,
                mimeType: bestMatch.mimeType,
                registeredBy: bestMatch.registeredBy,
                timestamp: bestMatch.timestamp,
                blockNumber: bestMatch.blockNumber,
                network: 'sepolia',
                registeredAt: registeredAt.toISOString(),
              },
              similarity,
              hammingDistance: bestDistance,
              totalRegistrations: total,
            });
          }
        }

        // ── No match ──
        return res.json({
          status: 'unverified',
          message: `No matching media found on the blockchain.${total > 0 ? ` ${total} media files are currently registered.` : ''}`,
          onChain: null,
          similarity: 0,
          totalRegistrations: total,
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

function hammingDistanceHex(hex1, hex2) {
  if (!hex1 || !hex2) return Infinity;
  const len = Math.min(hex1.length, hex2.length);
  let distance = 0;
  for (let i = 0; i < len; i++) {
    let xor = parseInt(hex1[i], 16) ^ parseInt(hex2[i], 16);
    while (xor) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

function getTimeAgo(date) {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  return `on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
}
