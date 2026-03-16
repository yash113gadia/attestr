import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const CHAIN_FILE = 'data/chain.json';

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return createHash('sha256')
      .update(
        this.index +
          this.previousHash +
          this.timestamp +
          JSON.stringify(this.data) +
          this.nonce
      )
      .digest('hex');
  }

  mineBlock(difficulty) {
    const target = '0'.repeat(difficulty);
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

class Blockchain {
  constructor() {
    this.difficulty = 2;
    this.chain = this.loadChain();
  }

  loadChain() {
    try {
      if (existsSync(CHAIN_FILE)) {
        const raw = JSON.parse(readFileSync(CHAIN_FILE, 'utf8'));
        // Reconstruct Block instances so calculateHash works
        const chain = raw.map((b) => {
          const block = new Block(b.index, b.timestamp, b.data, b.previousHash);
          block.nonce = b.nonce;
          block.hash = b.hash;
          return block;
        });
        if (chain.length > 0) {
          console.log(`Loaded ${chain.length} blocks from disk.`);
          return chain;
        }
      }
    } catch (err) {
      console.warn('Failed to load chain from disk:', err.message);
    }
    return [this.createGenesisBlock()];
  }

  saveChain() {
    try {
      const dir = CHAIN_FILE.substring(0, CHAIN_FILE.lastIndexOf('/'));
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(CHAIN_FILE, JSON.stringify(this.chain, null, 2));
    } catch (err) {
      console.warn('Failed to save chain:', err.message);
    }
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), { message: 'Genesis Block - Media Authenticator Ledger' }, '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data) {
    const block = new Block(
      this.chain.length,
      Date.now(),
      data,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);
    this.chain.push(block);
    this.saveChain();
    return block;
  }

  findBySha256(sha256) {
    return this.chain.find(
      (block) => block.data && block.data.sha256 === sha256
    );
  }

  findByDHash(dHash, threshold = 15) {
    // 256-bit hash: threshold 15 out of 256 = ~94% match required
    let bestMatch = null;
    let bestDistance = Infinity;

    for (const block of this.chain) {
      if (!block.data || !block.data.dHash) continue;
      const distance = hammingDistance(dHash, block.data.dHash);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = block;
      }
    }

    if (bestDistance <= threshold) {
      return { block: bestMatch, distance: bestDistance };
    }
    return null;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      if (current.hash !== current.calculateHash()) return false;
      if (current.previousHash !== previous.hash) return false;
    }
    return true;
  }

  getChain() {
    return this.chain;
  }
}

function hammingDistance(hash1, hash2) {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return Infinity;
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    const b1 = parseInt(hash1[i], 16);
    const b2 = parseInt(hash2[i], 16);
    let xor = b1 ^ b2;
    while (xor) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

const blockchain = new Blockchain();
export default blockchain;
