export function hammingDistance(hash1, hash2) {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return hash1?.length ? hash1.length * 4 : 256;
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

export function similarityPercent(hash1, hash2) {
  const totalBits = (hash1?.length || 64) * 4;
  const dist = hammingDistance(hash1, hash2);
  return Math.round(((totalBits - dist) / totalBits) * 100);
}
