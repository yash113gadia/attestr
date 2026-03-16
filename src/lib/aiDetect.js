// AI-Generated Media Detection — Multi-signal forensic analysis
// Checks metadata, pixel statistics, noise patterns, and frequency characteristics

export async function detectAIGenerated(file, exifData) {
  const signals = [];
  let totalWeight = 0;
  let aiScore = 0;

  // ── Signal 1: EXIF Metadata Analysis (weight: 25) ──
  const metaSignal = analyzeMetadata(exifData);
  signals.push(metaSignal);
  totalWeight += metaSignal.weight;
  aiScore += metaSignal.score * metaSignal.weight;

  // ── Signal 2: Pixel Statistics (weight: 20) ──
  if (file.type.startsWith('image/')) {
    const pixelSignal = await analyzePixelStats(file);
    signals.push(pixelSignal);
    totalWeight += pixelSignal.weight;
    aiScore += pixelSignal.score * pixelSignal.weight;

    // ── Signal 3: Noise Pattern Analysis (weight: 20) ──
    const noiseSignal = await analyzeNoise(file);
    signals.push(noiseSignal);
    totalWeight += noiseSignal.weight;
    aiScore += noiseSignal.score * noiseSignal.weight;

    // ── Signal 4: Color Distribution (weight: 15) ──
    const colorSignal = await analyzeColorDistribution(file);
    signals.push(colorSignal);
    totalWeight += colorSignal.weight;
    aiScore += colorSignal.score * colorSignal.weight;

    // ── Signal 5: Edge Coherence (weight: 20) ──
    const edgeSignal = await analyzeEdgeCoherence(file);
    signals.push(edgeSignal);
    totalWeight += edgeSignal.weight;
    aiScore += edgeSignal.score * edgeSignal.weight;

    // ── Signal 6: Benford's Law (weight: 15) ──
    const benfordSignal = await analyzeBenford(file);
    signals.push(benfordSignal);
    totalWeight += benfordSignal.weight;
    aiScore += benfordSignal.score * benfordSignal.weight;

    // ── Signal 7: Frequency Domain (weight: 15) ──
    const freqSignal = await analyzeFrequency(file);
    signals.push(freqSignal);
    totalWeight += freqSignal.weight;
    aiScore += freqSignal.score * freqSignal.weight;
  }

  const confidence = totalWeight > 0 ? Math.round((aiScore / totalWeight) * 100) : 0;

  let verdict;
  if (confidence >= 70) verdict = 'likely_ai';
  else if (confidence >= 40) verdict = 'suspicious';
  else verdict = 'likely_authentic';

  return { confidence, verdict, signals };
}

// ── Metadata Analysis ──
function analyzeMetadata(exifData) {
  let score = 0;
  const findings = [];

  if (!exifData) {
    score += 0.4;
    findings.push('No EXIF metadata — common in AI-generated images');
  } else {
    const { organized, raw } = exifData;

    // No camera make/model
    if (!organized?.camera?.Make && !organized?.camera?.Model) {
      score += 0.3;
      findings.push('No camera information found');
    }

    // No GPS data
    if (!organized?.location?.Latitude) {
      score += 0.1;
      findings.push('No GPS coordinates');
    }

    // Check for AI software signatures
    const software = (raw?.Software || raw?.ProcessingSoftware || '').toLowerCase();
    const aiSoftware = ['dall-e', 'midjourney', 'stable diffusion', 'imagen', 'firefly', 'copilot', 'gemini', 'leonardo', 'playground'];
    for (const ai of aiSoftware) {
      if (software.includes(ai)) {
        score += 0.8;
        findings.push(`AI software detected: ${raw.Software || raw.ProcessingSoftware}`);
        break;
      }
    }

    // Check for suspiciously clean metadata
    const fieldCount = Object.values(organized || {}).reduce((s, f) => s + Object.keys(f).length, 0);
    if (fieldCount < 3 && exifData) {
      score += 0.15;
      findings.push('Unusually sparse metadata');
    }

    // No DateTimeOriginal but has other data
    if (!organized?.datetime?.['Date Taken'] && fieldCount > 0) {
      score += 0.1;
      findings.push('No original capture date');
    }
  }

  return {
    name: 'Metadata Analysis',
    weight: 25,
    score: Math.min(score, 1),
    findings,
    detail: findings.length > 0 ? findings[0] : 'Metadata appears consistent with camera capture',
  };
}

// ── Pixel Statistics ──
function analyzePixelStats(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const size = 256;
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      const findings = [];
      let score = 0;

      // Calculate mean and std dev per channel
      const channels = [[], [], []];
      for (let i = 0; i < data.length; i += 4) {
        channels[0].push(data[i]);
        channels[1].push(data[i + 1]);
        channels[2].push(data[i + 2]);
      }

      const stats = channels.map((ch) => {
        const mean = ch.reduce((a, b) => a + b, 0) / ch.length;
        const variance = ch.reduce((a, b) => a + (b - mean) ** 2, 0) / ch.length;
        const std = Math.sqrt(variance);
        const skewness = ch.reduce((a, b) => a + ((b - mean) / std) ** 3, 0) / ch.length;
        return { mean, std, skewness };
      });

      // AI images tend to have very balanced channel means
      const meanSpread = Math.max(...stats.map(s => s.mean)) - Math.min(...stats.map(s => s.mean));
      if (meanSpread < 8) {
        score += 0.3;
        findings.push('Unusually balanced color channels');
      }

      // AI images often have low skewness (symmetric distributions)
      const avgSkewness = stats.reduce((a, s) => a + Math.abs(s.skewness), 0) / 3;
      if (avgSkewness < 0.3) {
        score += 0.25;
        findings.push('Symmetric color distribution — uncommon in natural photos');
      }

      // Check for unusually uniform standard deviation across channels
      const stdSpread = Math.max(...stats.map(s => s.std)) - Math.min(...stats.map(s => s.std));
      if (stdSpread < 5) {
        score += 0.2;
        findings.push('Uniform variance across color channels');
      }

      resolve({
        name: 'Pixel Statistics',
        weight: 20,
        score: Math.min(score, 1),
        findings,
        detail: findings.length > 0 ? findings[0] : 'Pixel distribution consistent with camera capture',
      });
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ name: 'Pixel Statistics', weight: 20, score: 0, findings: [], detail: 'Unable to analyze' }); };
    img.src = url;
  });
}

// ── Noise Pattern Analysis ──
function analyzeNoise(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const size = 128;
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      const findings = [];
      let score = 0;

      // Compute local noise via adjacent pixel differences
      let totalDiff = 0;
      let diffCount = 0;
      const localDiffs = [];

      for (let y = 0; y < size - 1; y++) {
        for (let x = 0; x < size - 1; x++) {
          const idx = (y * size + x) * 4;
          const rightIdx = (y * size + x + 1) * 4;
          const downIdx = ((y + 1) * size + x) * 4;

          const hDiff = Math.abs(data[idx] - data[rightIdx]) + Math.abs(data[idx + 1] - data[rightIdx + 1]) + Math.abs(data[idx + 2] - data[rightIdx + 2]);
          const vDiff = Math.abs(data[idx] - data[downIdx]) + Math.abs(data[idx + 1] - data[downIdx + 1]) + Math.abs(data[idx + 2] - data[downIdx + 2]);

          const diff = (hDiff + vDiff) / 6;
          totalDiff += diff;
          diffCount++;
          localDiffs.push(diff);
        }
      }

      const avgNoise = totalDiff / diffCount;

      // AI images tend to have very smooth noise (low average)
      if (avgNoise < 5) {
        score += 0.4;
        findings.push('Unusually low noise level — typical of AI-generated content');
      } else if (avgNoise < 10) {
        score += 0.15;
        findings.push('Below-average noise level');
      }

      // Check noise uniformity — AI has more uniform noise, cameras have varying noise
      const noiseStd = Math.sqrt(localDiffs.reduce((a, d) => a + (d - avgNoise) ** 2, 0) / localDiffs.length);
      const noiseCV = noiseStd / (avgNoise || 1); // coefficient of variation

      if (noiseCV < 0.8) {
        score += 0.3;
        findings.push('Uniform noise distribution — inconsistent with camera sensor patterns');
      }

      resolve({
        name: 'Noise Analysis',
        weight: 20,
        score: Math.min(score, 1),
        findings,
        detail: findings.length > 0 ? findings[0] : 'Noise pattern consistent with camera sensor',
      });
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ name: 'Noise Analysis', weight: 20, score: 0, findings: [], detail: 'Unable to analyze' }); };
    img.src = url;
  });
}

// ── Color Distribution Analysis ──
function analyzeColorDistribution(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const size = 128;
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      const findings = [];
      let score = 0;

      // Build histogram for each channel
      const histR = new Array(256).fill(0);
      const histG = new Array(256).fill(0);
      const histB = new Array(256).fill(0);

      for (let i = 0; i < data.length; i += 4) {
        histR[data[i]]++;
        histG[data[i + 1]]++;
        histB[data[i + 2]]++;
      }

      // Check for gaps in histogram — AI images tend to use fewer unique values
      const uniqueR = histR.filter(v => v > 0).length;
      const uniqueG = histG.filter(v => v > 0).length;
      const uniqueB = histB.filter(v => v > 0).length;
      const avgUnique = (uniqueR + uniqueG + uniqueB) / 3;

      if (avgUnique < 180) {
        score += 0.3;
        findings.push(`Limited color range (${Math.round(avgUnique)}/256 unique values)`);
      }

      // Check for perfectly smooth gradients — high count at few values
      const maxBinR = Math.max(...histR);
      const maxBinG = Math.max(...histG);
      const maxBinB = Math.max(...histB);
      const totalPixels = size * size;
      const maxConcentration = Math.max(maxBinR, maxBinG, maxBinB) / totalPixels;

      if (maxConcentration > 0.05) {
        score += 0.2;
        findings.push('High color concentration — possible synthetic gradient');
      }

      resolve({
        name: 'Color Distribution',
        weight: 15,
        score: Math.min(score, 1),
        findings,
        detail: findings.length > 0 ? findings[0] : 'Color distribution appears natural',
      });
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ name: 'Color Distribution', weight: 15, score: 0, findings: [], detail: 'Unable to analyze' }); };
    img.src = url;
  });
}

// ── Edge Coherence Analysis ──
function analyzeEdgeCoherence(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const size = 128;
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      const findings = [];
      let score = 0;

      // Simple Sobel edge detection
      const edges = [];
      for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
          const idx = (y * size + x) * 4;
          const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;

          // Horizontal gradient
          const leftIdx = (y * size + x - 1) * 4;
          const rightIdx = (y * size + x + 1) * 4;
          const grayL = data[leftIdx] * 0.299 + data[leftIdx + 1] * 0.587 + data[leftIdx + 2] * 0.114;
          const grayR = data[rightIdx] * 0.299 + data[rightIdx + 1] * 0.587 + data[rightIdx + 2] * 0.114;

          // Vertical gradient
          const topIdx = ((y - 1) * size + x) * 4;
          const botIdx = ((y + 1) * size + x) * 4;
          const grayT = data[topIdx] * 0.299 + data[topIdx + 1] * 0.587 + data[topIdx + 2] * 0.114;
          const grayB = data[botIdx] * 0.299 + data[botIdx + 1] * 0.587 + data[botIdx + 2] * 0.114;

          const gx = grayR - grayL;
          const gy = grayB - grayT;
          edges.push(Math.sqrt(gx * gx + gy * gy));
        }
      }

      const avgEdge = edges.reduce((a, b) => a + b, 0) / edges.length;
      const edgeStd = Math.sqrt(edges.reduce((a, e) => a + (e - avgEdge) ** 2, 0) / edges.length);

      // AI images tend to have softer, more uniform edges
      if (avgEdge < 8) {
        score += 0.3;
        findings.push('Unusually soft edges — typical of diffusion model output');
      }

      // Low edge variance = unnaturally consistent sharpness
      if (edgeStd / (avgEdge || 1) < 1.2) {
        score += 0.25;
        findings.push('Uniform edge sharpness — inconsistent with optical lens behavior');
      }

      // Very few strong edges relative to total
      const strongEdges = edges.filter(e => e > avgEdge * 2).length / edges.length;
      if (strongEdges < 0.08) {
        score += 0.2;
        findings.push('Few prominent edges — possible AI smoothing');
      }

      resolve({
        name: 'Edge Coherence',
        weight: 20,
        score: Math.min(score, 1),
        findings,
        detail: findings.length > 0 ? findings[0] : 'Edge patterns consistent with optical capture',
      });
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ name: 'Edge Coherence', weight: 20, score: 0, findings: [], detail: 'Unable to analyze' }); };
    img.src = url;
  });
}

// ── Benford's Law Analysis ──
// Natural images follow Benford's law in DCT coefficients. AI-generated images often don't.
function analyzeBenford(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const size = 128;
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      const findings = [];
      let score = 0;

      // Extract first digits of pixel gradient magnitudes
      const firstDigits = new Array(10).fill(0);
      let total = 0;

      for (let y = 0; y < size - 1; y++) {
        for (let x = 0; x < size - 1; x++) {
          const idx = (y * size + x) * 4;
          const nextIdx = (y * size + x + 1) * 4;
          const diff = Math.abs(
            (data[idx] + data[idx + 1] + data[idx + 2]) -
            (data[nextIdx] + data[nextIdx + 1] + data[nextIdx + 2])
          );
          if (diff > 0) {
            const firstDigit = parseInt(String(diff)[0]);
            if (firstDigit >= 1 && firstDigit <= 9) {
              firstDigits[firstDigit]++;
              total++;
            }
          }
        }
      }

      // Benford's expected distribution
      const benford = [0, 0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046];

      if (total > 100) {
        let chiSquared = 0;
        for (let d = 1; d <= 9; d++) {
          const observed = firstDigits[d] / total;
          const expected = benford[d];
          chiSquared += ((observed - expected) ** 2) / expected;
        }

        // High chi-squared = doesn't follow Benford's law = likely AI
        if (chiSquared > 0.1) {
          score += 0.5;
          findings.push(`Significant Benford's law deviation (χ²=${chiSquared.toFixed(3)}) — gradient distribution inconsistent with natural photography`);
        } else if (chiSquared > 0.05) {
          score += 0.2;
          findings.push(`Moderate Benford's law deviation (χ²=${chiSquared.toFixed(3)})`);
        }
      }

      resolve({
        name: "Benford's Law",
        weight: 15,
        score: Math.min(score, 1),
        findings,
        detail: findings.length > 0 ? findings[0] : "Gradient distribution follows Benford's law — consistent with natural image",
      });
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ name: "Benford's Law", weight: 15, score: 0, findings: [], detail: 'Unable to analyze' }); };
    img.src = url;
  });
}

// ── Frequency Domain Analysis ──
// Analyzes spatial frequency patterns. AI images have distinct frequency signatures.
function analyzeFrequency(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const size = 64; // Small for fast FFT-like analysis
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      const findings = [];
      let score = 0;

      // Convert to grayscale
      const gray = [];
      for (let i = 0; i < data.length; i += 4) {
        gray.push(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
      }

      // Compute power spectrum via horizontal/vertical differences at multiple scales
      const scales = [1, 2, 4, 8, 16];
      const powerByScale = [];

      for (const s of scales) {
        let power = 0;
        let count = 0;
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size - s; x++) {
            const diff = gray[y * size + x] - gray[y * size + x + s];
            power += diff * diff;
            count++;
          }
        }
        powerByScale.push(power / count);
      }

      // In natural images, power drops off gradually with frequency (1/f noise)
      // AI images often have an unnatural power spectrum — too smooth at high freq
      const highFreqRatio = powerByScale[0] / (powerByScale[4] || 1);

      if (highFreqRatio < 3) {
        score += 0.35;
        findings.push('Flat frequency spectrum — missing natural 1/f noise falloff typical of camera sensors');
      } else if (highFreqRatio < 6) {
        score += 0.15;
        findings.push('Slightly flattened frequency response');
      }

      // Check for periodic patterns (GAN artifacts)
      // Measure autocorrelation at specific offsets
      let periodicScore = 0;
      const offsets = [8, 16, 32];
      for (const off of offsets) {
        let corr = 0;
        let count2 = 0;
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size - off; x++) {
            corr += gray[y * size + x] * gray[y * size + x + off];
            count2++;
          }
        }
        const avgCorr = corr / count2;
        const mean = gray.reduce((a, b) => a + b, 0) / gray.length;
        const normalizedCorr = avgCorr / (mean * mean || 1);
        if (normalizedCorr > 1.02) periodicScore++;
      }

      if (periodicScore >= 2) {
        score += 0.3;
        findings.push('Periodic spatial patterns detected — possible GAN grid artifacts');
      }

      resolve({
        name: 'Frequency Analysis',
        weight: 15,
        score: Math.min(score, 1),
        findings,
        detail: findings.length > 0 ? findings[0] : 'Frequency spectrum consistent with optical capture',
      });
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ name: 'Frequency Analysis', weight: 15, score: 0, findings: [], detail: 'Unable to analyze' }); };
    img.src = url;
  });
}
