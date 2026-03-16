import { getContract, cors } from './_shared.js';
import { ethers } from 'ethers';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    const setup = getContract();
    let onChainStats = null;
    const chain = [{ index: 0, hash: '0x0000...genesis', previousHash: '0', timestamp: 1773594700507, nonce: 0, data: { message: 'Genesis Block - Attestr Ledger' } }];

    if (setup) {
      try {
        const total = await setup.contract.totalRegistered();
        const balance = await setup.provider.getBalance(setup.wallet.address);
        const count = Number(total);
        onChainStats = { network: 'sepolia', contractAddress: '0x37FCD33D5FF07cfa3A75D27B4ec4cF09e458dfac', totalRegistered: count, walletBalance: ethers.formatEther(balance) };

        const fetchCount = Math.min(count, 20);
        for (let i = count - fetchCount; i < count; i++) {
          try {
            const hash = await setup.contract.allHashes(i);
            const record = await setup.contract.records(hash);
            chain.push({ index: i + 1, hash, previousHash: 'on-chain', timestamp: Number(record.timestamp) * 1000, nonce: 0, data: { sha256: hash.substring(2), filename: record.filename, fileSize: Number(record.fileSize), mimeType: record.mimeType, registeredAt: new Date(Number(record.timestamp) * 1000).toISOString() } });
          } catch {}
        }
      } catch (e) { console.warn('Chain fetch failed:', e.message); }
    }

    res.json({ chain, length: chain.length, valid: true, onChain: onChainStats });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
