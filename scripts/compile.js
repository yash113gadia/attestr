import solc from 'solc';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const source = readFileSync('contracts/MediaRegistry.sol', 'utf8');

const input = {
  language: 'Solidity',
  sources: { 'MediaRegistry.sol': { content: source } },
  settings: {
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
    optimizer: { enabled: true, runs: 200 },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  const errors = output.errors.filter((e) => e.severity === 'error');
  if (errors.length > 0) {
    console.error('Compilation errors:');
    errors.forEach((e) => console.error(e.formattedMessage));
    process.exit(1);
  }
}

const contract = output.contracts['MediaRegistry.sol']['MediaRegistry'];
const artifact = {
  abi: contract.abi,
  bytecode: '0x' + contract.evm.bytecode.object,
};

mkdirSync('artifacts', { recursive: true });
writeFileSync('artifacts/MediaRegistry.json', JSON.stringify(artifact, null, 2));
console.log('Compiled: artifacts/MediaRegistry.json');
console.log(`ABI: ${artifact.abi.length} functions`);
console.log(`Bytecode: ${artifact.bytecode.length} chars`);
