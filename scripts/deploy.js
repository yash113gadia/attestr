import { ethers } from 'ethers';
import { readFileSync, writeFileSync } from 'fs';

const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error('Set PRIVATE_KEY environment variable');
  process.exit(1);
}

const artifact = JSON.parse(readFileSync('artifacts/MediaRegistry.json', 'utf8'));
const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

console.log('Deploying MediaRegistry...');
console.log('Wallet:', wallet.address);

const balance = await provider.getBalance(wallet.address);
console.log('Balance:', ethers.formatEther(balance), 'ETH');

if (balance === 0n) {
  console.error('Wallet has no Sepolia ETH. Get some from a faucet.');
  process.exit(1);
}

const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
const contract = await factory.deploy();
await contract.waitForDeployment();

const address = await contract.getAddress();
console.log('Deployed to:', address);
console.log('Etherscan:', `https://sepolia.etherscan.io/address/${address}`);

// Save deployment info
writeFileSync('artifacts/deployment.json', JSON.stringify({
  address,
  network: 'sepolia',
  deployer: wallet.address,
  deployedAt: new Date().toISOString(),
  etherscanUrl: `https://sepolia.etherscan.io/address/${address}`,
}, null, 2));

console.log('Saved: artifacts/deployment.json');
