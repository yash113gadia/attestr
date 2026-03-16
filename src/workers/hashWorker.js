// Web Worker for client-side SHA-256 + dHash computation
// Files never leave the browser — only hashes are sent to the server

self.onmessage = async (e) => {
  const { arrayBuffer, type } = e.data;

  try {
    self.postMessage({ type: 'progress', stage: 'sha256', progress: 0 });

    // SHA-256 via SubtleCrypto
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha256 = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    self.postMessage({ type: 'progress', stage: 'sha256', progress: 100 });

    // dHash (perceptual hash) for images — 16x16 = 256 bits for better accuracy
    let dHash = null;
    if (type && type.startsWith('image/')) {
      self.postMessage({ type: 'progress', stage: 'dhash', progress: 0 });
      const blob = new Blob([arrayBuffer], { type });
      const bitmap = await createImageBitmap(blob);

      const W = 17; // 17 columns, 16 rows → 16x16 = 256 bit hash
      const H = 16;
      const canvas = new OffscreenCanvas(W, H);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0, W, H);
      const imageData = ctx.getImageData(0, 0, W, H);
      const pixels = imageData.data;

      // Convert to grayscale and compute difference hash
      let hashBits = '';
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < H; x++) {  // 16 comparisons per row
          const leftIdx = (y * W + x) * 4;
          const rightIdx = (y * W + x + 1) * 4;
          const leftGray =
            pixels[leftIdx] * 0.299 +
            pixels[leftIdx + 1] * 0.587 +
            pixels[leftIdx + 2] * 0.114;
          const rightGray =
            pixels[rightIdx] * 0.299 +
            pixels[rightIdx + 1] * 0.587 +
            pixels[rightIdx + 2] * 0.114;
          hashBits += leftGray < rightGray ? '1' : '0';
        }
      }

      // Convert 256-bit binary to 64-char hex
      dHash = '';
      for (let i = 0; i < 256; i += 4) {
        dHash += parseInt(hashBits.substring(i, i + 4), 2).toString(16);
      }

      bitmap.close();
      self.postMessage({ type: 'progress', stage: 'dhash', progress: 100 });
    }

    self.postMessage({ type: 'result', sha256, dHash });
  } catch (err) {
    self.postMessage({ type: 'error', error: err.message });
  }
};
