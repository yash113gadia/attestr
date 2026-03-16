import { getContract, cors } from './_shared.js';
import { ethers } from 'ethers';

export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    const status = { localChain: { blocks: 1, valid: true }, sepolia: null };
    const setup = getContract();

    if (setup) {
      try {
        const total = await setup.contract.totalRegistered();
        const balance = await setup.provider.getBalance(setup.wallet.address);
        status.sepolia = {
          connected: true,
          contract: '0x37FCD33D5FF07cfa3A75D27B4ec4cF09e458dfac',
          totalRegistered: Number(total),
          walletBalance: ethers.formatEther(balance),
          network: 'sepolia',
        };
      } catch (e) {
        status.sepolia = { connected: false, error: e.message };
      }
    }

    res.json(status);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
