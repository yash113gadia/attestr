import { ethers } from 'ethers';

const ABI = [
  "function register(bytes32 _sha256Hash, bytes8 _dHash, string _filename, uint256 _fileSize, string _mimeType) external",
  "function verify(bytes32 _sha256Hash) external view returns (bool exists, tuple(bytes32 sha256Hash, bytes8 dHash, string filename, uint256 fileSize, string mimeType, address registeredBy, uint256 timestamp, uint256 blockNumber) record)",
  "function totalRegistered() external view returns (uint256)",
  "function allHashes(uint256) external view returns (bytes32)",
  "function records(bytes32) external view returns (bytes32 sha256Hash, bytes8 dHash, string filename, uint256 fileSize, string mimeType, address registeredBy, uint256 timestamp, uint256 blockNumber)",
];

const CONTRACT_ADDRESS = '0x37FCD33D5FF07cfa3A75D27B4ec4cF09e458dfac';
const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

let _provider, _wallet, _contract;

export function getContract() {
  if (!process.env.PRIVATE_KEY) return null;
  if (!_contract) {
    _provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    _wallet = new ethers.Wallet(process.env.PRIVATE_KEY, _provider);
    _contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, _wallet);
  }
  return { contract: _contract, provider: _provider, wallet: _wallet };
}

export function cors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return true; }
  return false;
}
