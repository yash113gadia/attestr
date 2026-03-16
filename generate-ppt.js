import pptxgen from 'pptxgenjs';

const pptx = new pptxgen();

// ── Theme ──
const GREEN = '00FF88';
const GREEN_DIM = '00CC6A';
const RED = 'FF4455';
const AMBER = 'FFAA00';
const BG = '0A0F1C';
const BG2 = '111827';
const BG3 = '1A2540';
const WHITE = 'E5E7EB';
const DIM = '6A7590';
const BRIGHT = 'F0F2F5';

pptx.author = 'Team Ctrl+Alt+Diablo';
pptx.subject = 'MediaGuard - Decentralized Media Authenticator';
pptx.title = 'MediaGuard';
pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5

const slideBg = { fill: BG };

// Footer helper
function addFooter(slide, num) {
  slide.addText(`${num}`, { x: 12.3, y: 6.8, w: 0.5, h: 0.3, fontSize: 9, fontFace: 'Consolas', color: DIM, align: 'right' });
  slide.addText('Ctrl+Alt+Diablo  •  CSBC114', { x: 0.5, y: 6.85, w: 4, h: 0.25, fontSize: 8, fontFace: 'Consolas', color: DIM });
}


// ══════════════════════════════════════════════════════════
// SLIDE 1 — TITLE (Hackathon name + tracks) — per template
// ══════════════════════════════════════════════════════════
let slide = pptx.addSlide();
slide.background = slideBg;

// Decorative glow
slide.addShape(pptx.ShapeType.ellipse, {
  x: 8.5, y: -1.5, w: 6, h: 6,
  fill: { type: 'solid', color: GREEN, transparency: 92 },
});

slide.addShape(pptx.ShapeType.ellipse, {
  x: -2, y: 4, w: 5, h: 5,
  fill: { type: 'solid', color: GREEN, transparency: 95 },
});

// Main title
slide.addText('INNOVATE BHARAT', {
  x: 0.8, y: 1.2, w: 11, h: 1.0,
  fontSize: 52, fontFace: 'Calibri', color: BRIGHT, bold: true, letterSpacing: 2,
});

slide.addText('HACKATHON 2026', {
  x: 0.8, y: 2.2, w: 11, h: 0.9,
  fontSize: 48, fontFace: 'Calibri', color: GREEN, bold: true, letterSpacing: 2,
});

// Green separator
slide.addShape(pptx.ShapeType.rect, {
  x: 0.8, y: 3.4, w: 3, h: 0.04, fill: { color: GREEN },
});

// Tracks
slide.addText('TRACKS:', {
  x: 0.8, y: 3.8, w: 2, h: 0.35, fontSize: 11, fontFace: 'Consolas', color: GREEN, bold: true,
});

const tracks = [
  'AI & Intelligent Systems (AIIS)',
  'Web App and Software Innovation (WASI)',
  'Cybersecurity and Blockchain (CSBC)',
  'Data Science and Smart Analysis (DSSA)',
  'Social Impact and Smart India Solutions (SISIS)',
  'School Student Innovation (SCHII)',
];

tracks.forEach((track, i) => {
  const isOurs = track.includes('CSBC');
  slide.addText([
    { text: '•  ', options: { fontSize: 11, color: isOurs ? GREEN : DIM } },
    { text: track, options: { fontSize: 12, fontFace: 'Calibri', color: isOurs ? GREEN : WHITE, bold: isOurs } },
  ], {
    x: 0.8, y: 4.2 + i * 0.35, w: 8, h: 0.35,
  });
});

addFooter(slide, 1);


// ══════════════════════════════════════════════════════════
// SLIDE 2 — PROJECT TITLE + TEAM INFO — per template
// ══════════════════════════════════════════════════════════
slide = pptx.addSlide();
slide.background = slideBg;

// Glow
slide.addShape(pptx.ShapeType.ellipse, {
  x: 7, y: -1, w: 7, h: 7,
  fill: { type: 'solid', color: GREEN, transparency: 93 },
});

// Project title
slide.addText([
  { text: 'Media', options: { fontSize: 60, fontFace: 'Calibri', color: BRIGHT, bold: true } },
  { text: 'Guard', options: { fontSize: 60, fontFace: 'Calibri', color: GREEN, bold: true } },
], { x: 0.8, y: 0.6, w: 11, h: 1.1 });

slide.addText('Decentralized Media Authenticator', {
  x: 0.8, y: 1.7, w: 8, h: 0.5,
  fontSize: 18, fontFace: 'Consolas', color: DIM, letterSpacing: 2,
});

// Separator
slide.addShape(pptx.ShapeType.rect, {
  x: 0.8, y: 2.5, w: 11.5, h: 0.02, fill: { color: BG3 },
});

// Team info row
const teamMeta = [
  { label: 'TEAM NAME', value: 'Ctrl+Alt+Diablo' },
  { label: 'TEAM ID', value: 'CSBC114' },
  { label: 'TRACK', value: 'Cybersecurity & Blockchain' },
  { label: 'PANEL', value: 'Panel 6' },
];

teamMeta.forEach((item, i) => {
  const x = 0.8 + i * 3.0;
  slide.addText(item.label, {
    x, y: 2.8, w: 2.8, h: 0.3,
    fontSize: 9, fontFace: 'Consolas', color: GREEN, bold: true,
  });
  slide.addText(item.value, {
    x, y: 3.1, w: 2.8, h: 0.35,
    fontSize: 15, fontFace: 'Calibri', color: BRIGHT, bold: true,
  });
});

// Separator
slide.addShape(pptx.ShapeType.rect, {
  x: 0.8, y: 3.8, w: 11.5, h: 0.02, fill: { color: BG3 },
});

// Team Members
slide.addText('TEAM MEMBERS', {
  x: 0.8, y: 4.1, w: 4, h: 0.3,
  fontSize: 10, fontFace: 'Consolas', color: GREEN, bold: true,
});

const members = [
  { num: '01', name: 'Yash Gadia' },
  { num: '02', name: 'Sweta Kumari' },
  { num: '03', name: 'Priyanshi Shrotriya' },
  { num: '04', name: 'Shreyansh Khemka' },
];

members.forEach((m, i) => {
  const x = 0.8 + i * 3.0;
  // Card background
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y: 4.5, w: 2.7, h: 1.2, rectRadius: 0.12,
    fill: { color: BG2 }, line: { color: BG3, width: 1 },
  });
  // Number circle badge
  slide.addShape(pptx.ShapeType.ellipse, {
    x: x + 0.2, y: 4.7, w: 0.5, h: 0.5,
    fill: { color: GREEN }, line: { width: 0 },
  });
  slide.addText(m.num, {
    x: x + 0.2, y: 4.7, w: 0.5, h: 0.5,
    fontSize: 14, fontFace: 'Consolas', color: BG, bold: true, align: 'center', valign: 'middle',
  });
  // Member label
  slide.addText('MEMBER', {
    x: x + 0.85, y: 4.65, w: 1.6, h: 0.25,
    fontSize: 8, fontFace: 'Consolas', color: DIM,
  });
  // Name
  slide.addText(m.name, {
    x: x + 0.85, y: 4.88, w: 1.7, h: 0.4,
    fontSize: 14, fontFace: 'Calibri', color: BRIGHT, bold: true, valign: 'middle',
  });
  // Green accent line at bottom of card
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.15, y: 5.5, w: 2.4, h: 0.03, fill: { color: GREEN, transparency: 70 },
  });
});

addFooter(slide, 2);


// ══════════════════════════════════════════════════════════
// SLIDE 3 — PROBLEM STATEMENT — per template
// ══════════════════════════════════════════════════════════
slide = pptx.addSlide();
slide.background = slideBg;

slide.addText('PROBLEM STATEMENT', {
  x: 0.8, y: 0.5, w: 5, h: 0.3, fontSize: 10, fontFace: 'Consolas', color: GREEN, bold: true, letterSpacing: 2,
});

slide.addText('Trust in Digital Media is Broken', {
  x: 0.8, y: 1.0, w: 10, h: 0.7, fontSize: 32, fontFace: 'Calibri', color: BRIGHT, bold: true,
});

slide.addText('In an era of AI-generated deepfakes and sophisticated media manipulation, there is no reliable, accessible way to verify whether a photo or video is authentic. Journalists, legal professionals, and investigators need proof — not guesswork.', {
  x: 0.8, y: 1.8, w: 9, h: 0.9, fontSize: 13, fontFace: 'Calibri', color: DIM, lineSpacing: 22,
});

// Stat cards
const stats = [
  { stat: '96%', title: 'Deepfakes are AI-generated', desc: 'Readily available AI tools make manipulation trivially easy' },
  { stat: '10x', title: 'YoY growth in deepfakes', desc: 'Outpacing detection capabilities of traditional forensic methods' },
  { stat: '$0', title: 'Cost to create a deepfake', desc: 'Free open-source tools enable anyone to create convincing fakes' },
];

stats.forEach((item, i) => {
  const x = 0.8 + i * 3.9;
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y: 3.2, w: 3.6, h: 3.2, rectRadius: 0.15,
    fill: { color: BG2 }, line: { color: BG3, width: 1 },
  });
  slide.addText(item.stat, {
    x: x + 0.3, y: 3.5, w: 3, h: 0.8,
    fontSize: 40, fontFace: 'Consolas', color: RED, bold: true,
  });
  slide.addText(item.title, {
    x: x + 0.3, y: 4.4, w: 3, h: 0.4,
    fontSize: 14, fontFace: 'Calibri', color: BRIGHT, bold: true,
  });
  slide.addText(item.desc, {
    x: x + 0.3, y: 4.9, w: 3, h: 0.8,
    fontSize: 11, fontFace: 'Calibri', color: DIM, lineSpacing: 18,
  });
});

addFooter(slide, 3);


// ══════════════════════════════════════════════════════════
// SLIDE 4 — PROPOSED SOLUTION / IDEA — per template
// ══════════════════════════════════════════════════════════
slide = pptx.addSlide();
slide.background = slideBg;

slide.addText('PROPOSED SOLUTION / IDEA', {
  x: 0.8, y: 0.5, w: 6, h: 0.3, fontSize: 10, fontFace: 'Consolas', color: GREEN, bold: true, letterSpacing: 2,
});

slide.addText('MediaGuard: Blockchain-Powered Media Verification', {
  x: 0.8, y: 1.0, w: 11, h: 0.7, fontSize: 30, fontFace: 'Calibri', color: BRIGHT, bold: true,
});

slide.addText('A browser-based platform that creates tamper-proof digital fingerprints of media files and stores them on a decentralized blockchain ledger — enabling instant, trustless verification of authenticity.', {
  x: 0.8, y: 1.8, w: 9, h: 0.8, fontSize: 13, fontFace: 'Calibri', color: DIM, lineSpacing: 22,
});

// Flow steps with shape-based icons
const flowSteps = [
  { label: 'CAPTURE', desc: 'Upload file or\nuse browser camera' },
  { label: 'HASH', desc: 'SHA-256 + dHash\nclient-side' },
  { label: 'REGISTER', desc: 'Hash stored on\nblockchain ledger' },
  { label: 'VERIFY', desc: 'Compare hash\nagainst chain' },
  { label: 'ANALYZE', desc: 'ELA + EXIF\nforensics' },
];

flowSteps.forEach((step, i) => {
  const x = 0.6 + i * 2.5;
  const cx = x + 0.55; // icon box x
  const cy = 3.1;      // icon box y

  // Icon container
  slide.addShape(pptx.ShapeType.roundRect, {
    x: cx, y: cy, w: 0.9, h: 0.9, rectRadius: 0.15,
    fill: { color: BG2 }, line: { color: GREEN, width: 2 },
  });

  // Draw custom shape icon per step
  if (i === 0) {
    // CAPTURE — Camera: outer rounded rect body + circle lens
    slide.addShape(pptx.ShapeType.roundRect, {
      x: cx + 0.18, y: cy + 0.3, w: 0.54, h: 0.38, rectRadius: 0.06,
      fill: { color: GREEN }, line: { width: 0 },
    });
    // Lens circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx + 0.32, y: cy + 0.35, w: 0.26, h: 0.26,
      fill: { color: BG2 }, line: { color: BG2, width: 1.5 },
    });
    // Flash bump
    slide.addShape(pptx.ShapeType.roundRect, {
      x: cx + 0.3, y: cy + 0.22, w: 0.3, h: 0.12, rectRadius: 0.03,
      fill: { color: GREEN }, line: { width: 0 },
    });
  } else if (i === 1) {
    // HASH — Fingerprint: "#" symbol stylized
    slide.addText('#', {
      x: cx, y: cy + 0.05, w: 0.9, h: 0.8,
      fontSize: 36, fontFace: 'Consolas', color: GREEN, bold: true, align: 'center', valign: 'middle',
    });
  } else if (i === 2) {
    // REGISTER — Chain: three linked rectangles
    const chainColors = [GREEN, GREEN_DIM, GREEN];
    for (let c = 0; c < 3; c++) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: cx + 0.15 + c * 0.2, y: cy + 0.28 + (c === 1 ? 0.1 : 0), w: 0.22, h: 0.32,
        rectRadius: 0.06,
        fill: { color: 'FFFFFF', transparency: 100 },
        line: { color: chainColors[c], width: 2 },
      });
    }
  } else if (i === 3) {
    // VERIFY — Shield with checkmark
    // Shield body (diamond-ish via triangle-like shapes)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: cx + 0.25, y: cy + 0.18, w: 0.4, h: 0.5, rectRadius: 0.08,
      fill: { color: GREEN, transparency: 85 }, line: { color: GREEN, width: 1.5 },
    });
    // Checkmark
    slide.addText('\u2713', {
      x: cx, y: cy + 0.1, w: 0.9, h: 0.7,
      fontSize: 30, fontFace: 'Calibri', color: GREEN, bold: true, align: 'center', valign: 'middle',
    });
  } else if (i === 4) {
    // ANALYZE — Magnifying glass: circle + diagonal line handle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx + 0.2, y: cy + 0.18, w: 0.38, h: 0.38,
      fill: { color: 'FFFFFF', transparency: 100 }, line: { color: GREEN, width: 2.5 },
    });
    // Handle (diagonal line via thin rect, rotated effect)
    slide.addShape(pptx.ShapeType.rect, {
      x: cx + 0.52, y: cy + 0.52, w: 0.22, h: 0.06,
      fill: { color: GREEN }, rotate: 45,
    });
  }

  // Arrow between steps — smooth gradient line with proper arrowhead
  if (i < flowSteps.length - 1) {
    // Dashed segments for a sleek look
    const arrowStartX = cx + 0.95;
    const arrowY = cy + 0.43;
    const segW = 0.12;
    const gap = 0.08;
    for (let s = 0; s < 3; s++) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: arrowStartX + s * (segW + gap), y: arrowY, w: segW, h: 0.05,
        rectRadius: 0.025,
        fill: { color: GREEN },
      });
    }
    // Arrowhead — triangle using three small rects to form a chevron ›
    const tipX = arrowStartX + 3 * (segW + gap) - 0.02;
    slide.addShape(pptx.ShapeType.rect, {
      x: tipX, y: arrowY - 0.08, w: 0.18, h: 0.05,
      fill: { color: GREEN }, rotate: 35,
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: tipX, y: arrowY + 0.08, w: 0.18, h: 0.05,
      fill: { color: GREEN }, rotate: -35,
    });
  }

  // Label
  slide.addText(step.label, {
    x: x + 0.1, y: 4.2, w: 1.8, h: 0.35,
    fontSize: 11, fontFace: 'Consolas', color: BRIGHT, bold: true, align: 'center',
  });
  slide.addText(step.desc, {
    x: x + 0.1, y: 4.55, w: 1.8, h: 0.6,
    fontSize: 9, fontFace: 'Consolas', color: DIM, align: 'center', lineSpacing: 14,
  });
});

// Privacy callout
slide.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 5.6, w: 11.5, h: 0.7, rectRadius: 0.1,
  fill: { color: '0A1A10' }, line: { color: '1A3A20', width: 1 },
});
slide.addText('\u25C8  ZERO TRUST  \u2014  Your file NEVER leaves the browser. Only the cryptographic hash touches the network.', {
  x: 1.2, y: 5.65, w: 10.5, h: 0.6,
  fontSize: 12, fontFace: 'Consolas', color: GREEN, bold: true, valign: 'middle',
});

addFooter(slide, 4);


// ══════════════════════════════════════════════════════════
// SLIDE 5 — INNOVATION & UNIQUENESS — per template
// ══════════════════════════════════════════════════════════
slide = pptx.addSlide();
slide.background = slideBg;

slide.addText('INNOVATION & UNIQUENESS', {
  x: 0.8, y: 0.5, w: 6, h: 0.3, fontSize: 10, fontFace: 'Consolas', color: GREEN, bold: true, letterSpacing: 2,
});

slide.addText('What Exists vs. What We Built', {
  x: 0.8, y: 1.0, w: 10, h: 0.6, fontSize: 30, fontFace: 'Calibri', color: BRIGHT, bold: true,
});

// Competitor table
const tableRows = [
  [
    { text: 'SOLUTION', options: { fontSize: 8, fontFace: 'Consolas', color: GREEN, bold: true, fill: { color: BG2 } } },
    { text: 'BLOCKCHAIN?', options: { fontSize: 8, fontFace: 'Consolas', color: GREEN, bold: true, fill: { color: BG2 } } },
    { text: 'KEY LIMITATION', options: { fontSize: 8, fontFace: 'Consolas', color: GREEN, bold: true, fill: { color: BG2 } } },
  ],
  [
    { text: 'C2PA (Adobe, MS, Google)', options: { fontSize: 9, color: BRIGHT } },
    { text: 'No — PKI', options: { fontSize: 9, color: RED, fontFace: 'Consolas' } },
    { text: 'Metadata stripped by screenshots', options: { fontSize: 9, color: DIM } },
  ],
  [
    { text: 'Truepic ($26M)', options: { fontSize: 9, color: BRIGHT } },
    { text: 'Abandoned', options: { fontSize: 9, color: RED, fontFace: 'Consolas' } },
    { text: 'Requires hardware, not retroactive', options: { fontSize: 9, color: DIM } },
  ],
  [
    { text: 'Numbers Protocol', options: { fontSize: 9, color: BRIGHT } },
    { text: 'Yes — own token', options: { fontSize: 9, color: AMBER, fontFace: 'Consolas' } },
    { text: 'Requires their app; token complexity', options: { fontSize: 9, color: DIM } },
  ],
  [
    { text: 'OpenOrigins ($4.5M)', options: { fontSize: 9, color: BRIGHT } },
    { text: 'Permissioned', options: { fontSize: 9, color: AMBER, fontFace: 'Consolas' } },
    { text: 'Not truly decentralized', options: { fontSize: 9, color: DIM } },
  ],
  [
    { text: 'Reality Defender (YC)', options: { fontSize: 9, color: BRIGHT } },
    { text: 'No', options: { fontSize: 9, color: RED, fontFace: 'Consolas' } },
    { text: 'Detection only, no provenance', options: { fontSize: 9, color: DIM } },
  ],
  [
    { text: '► MediaGuard (Ours)', options: { fontSize: 9, color: GREEN, bold: true } },
    { text: '✓ Public PoW', options: { fontSize: 9, color: GREEN, fontFace: 'Consolas', bold: true } },
    { text: 'None of the above ✓', options: { fontSize: 9, color: GREEN, bold: true } },
  ],
];

slide.addTable(tableRows, {
  x: 0.8, y: 1.8, w: 5.5,
  border: { type: 'solid', pt: 0.5, color: BG3 },
  colW: [2.2, 1.4, 1.9],
  rowH: [0.32, 0.3, 0.3, 0.3, 0.3, 0.3, 0.35],
  fill: { color: BG },
  margin: [4, 6, 4, 6],
});

// Differentiators
slide.addText('OUR EDGE', {
  x: 7.0, y: 1.8, w: 5, h: 0.3, fontSize: 10, fontFace: 'Consolas', color: GREEN, bold: true,
});

const diffs = [
  { title: 'Detection + Provenance', desc: 'Both in one platform, not either/or' },
  { title: 'Survives Screenshots', desc: 'Perceptual hashing beats C2PA metadata' },
  { title: 'Truly Decentralized', desc: 'Public PoW chain, not permissioned' },
  { title: 'Zero Hardware', desc: 'Works in any modern browser' },
  { title: 'Retroactive Verification', desc: 'Analyze existing unregistered media' },
  { title: 'Privacy-Preserving', desc: 'Files never leave the browser' },
];

diffs.forEach((d, i) => {
  const y = 2.3 + i * 0.72;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.0, y, w: 5.5, h: 0.62, rectRadius: 0.08,
    fill: { color: BG2 }, line: { color: BG3, width: 0.5 },
  });
  slide.addText('✓', {
    x: 7.15, y, w: 0.35, h: 0.62, fontSize: 14, color: GREEN, bold: true, valign: 'middle', align: 'center',
  });
  slide.addText(d.title, {
    x: 7.55, y: y + 0.04, w: 4.5, h: 0.3, fontSize: 11, fontFace: 'Calibri', color: BRIGHT, bold: true,
  });
  slide.addText(d.desc, {
    x: 7.55, y: y + 0.3, w: 4.5, h: 0.25, fontSize: 9, fontFace: 'Calibri', color: DIM,
  });
});

addFooter(slide, 5);


// ══════════════════════════════════════════════════════════
// SLIDE 6 — TECHNOLOGY USED — per template
// ══════════════════════════════════════════════════════════
slide = pptx.addSlide();
slide.background = slideBg;

slide.addText('TECHNOLOGY USED', {
  x: 0.8, y: 0.5, w: 5, h: 0.3, fontSize: 10, fontFace: 'Consolas', color: GREEN, bold: true, letterSpacing: 2,
});

slide.addText('Built With Modern, Open Tools', {
  x: 0.8, y: 1.0, w: 10, h: 0.6, fontSize: 30, fontFace: 'Calibri', color: BRIGHT, bold: true,
});

const stacks = [
  { title: 'FRONTEND', items: ['React 19', 'Vite 8', 'Tailwind CSS 4', 'Framer Motion', 'React Router'] },
  { title: 'BACKEND', items: ['Node.js', 'Express 5', 'Custom Blockchain', 'Proof-of-Work Mining', 'REST API'] },
  { title: 'CRYPTOGRAPHY', items: ['SubtleCrypto (SHA-256)', 'dHash (Perceptual)', 'Web Workers', 'Canvas-based ELA', 'EXIF via exifr'] },
];

stacks.forEach((stack, i) => {
  const x = 0.8 + i * 4.1;
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y: 1.9, w: 3.8, h: 4.5, rectRadius: 0.15,
    fill: { color: BG2 }, line: { color: BG3, width: 1 },
  });
  slide.addText(stack.title, {
    x: x + 0.3, y: 2.1, w: 3.2, h: 0.4, fontSize: 10, fontFace: 'Consolas', color: GREEN, bold: true,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.3, y: 2.55, w: 3.2, h: 0.02, fill: { color: BG3 },
  });
  stack.items.forEach((item, j) => {
    slide.addText([
      { text: '•  ', options: { fontSize: 12, color: GREEN } },
      { text: item, options: { fontSize: 13, fontFace: 'Calibri', color: WHITE } },
    ], {
      x: x + 0.3, y: 2.75 + j * 0.55, w: 3.2, h: 0.45, valign: 'middle',
    });
  });
});

addFooter(slide, 6);


// ══════════════════════════════════════════════════════════
// SLIDE 7 — FEATURES & FUNCTIONALITIES — per template
// ══════════════════════════════════════════════════════════
slide = pptx.addSlide();
slide.background = slideBg;

slide.addText('FEATURES & FUNCTIONALITIES', {
  x: 0.8, y: 0.5, w: 6, h: 0.3, fontSize: 10, fontFace: 'Consolas', color: GREEN, bold: true, letterSpacing: 2,
});

slide.addText('What MediaGuard Can Do', {
  x: 0.8, y: 1.0, w: 10, h: 0.6, fontSize: 30, fontFace: 'Calibri', color: BRIGHT, bold: true,
});

const features = [
  'Drag-and-drop & in-browser camera capture',
  'Client-side SHA-256 hashing — file never leaves browser',
  'Perceptual hash (dHash) — survives compression & screenshots',
  'Blockchain registration with proof-of-work mining',
  'Instant verification — exact match + fuzzy perceptual match',
  'Error Level Analysis with adjustable amplification',
  'EXIF metadata extraction with anomaly flagging',
  'Visual blockchain explorer with block inspection',
  'Side-by-side tamper comparison view',
  'Zero-upload privacy model',
];

features.forEach((f, i) => {
  const col = i < 5 ? 0 : 1;
  const row = i % 5;
  const x = 0.8 + col * 6;
  const y = 1.9 + row * 0.95;

  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w: 5.7, h: 0.78, rectRadius: 0.08,
    fill: { color: BG2 }, line: { color: BG3, width: 0.5 },
  });
  slide.addText('✓', {
    x: x + 0.15, y, w: 0.4, h: 0.78, fontSize: 16, color: GREEN, bold: true, valign: 'middle', align: 'center',
  });
  slide.addText(f, {
    x: x + 0.55, y, w: 5, h: 0.78, fontSize: 12, fontFace: 'Calibri', color: WHITE, valign: 'middle',
  });
});

addFooter(slide, 7);


// ══════════════════════════════════════════════════════════
// SLIDE 8 — IMPLEMENTATION PLAN / ROADMAP — per template
// ══════════════════════════════════════════════════════════
slide = pptx.addSlide();
slide.background = slideBg;

slide.addText('IMPLEMENTATION PLAN / ROADMAP', {
  x: 0.8, y: 0.5, w: 8, h: 0.3, fontSize: 10, fontFace: 'Consolas', color: GREEN, bold: true, letterSpacing: 2,
});

slide.addText('What We\'ve Built & What\'s Next', {
  x: 0.8, y: 1.0, w: 10, h: 0.6, fontSize: 30, fontFace: 'Calibri', color: BRIGHT, bold: true,
});

// Timeline line
slide.addShape(pptx.ShapeType.rect, {
  x: 1.9, y: 1.9, w: 0.04, h: 5.0, fill: { color: BG3 },
});

const roadmap = [
  { status: 'done', title: 'Core Blockchain Engine', desc: 'Block class, PoW mining, chain validation, SHA-256 linking', tag: 'COMPLETE', tagColor: GREEN },
  { status: 'done', title: 'Client-Side Hashing', desc: 'Web Worker with SubtleCrypto SHA-256 + OffscreenCanvas dHash', tag: 'COMPLETE', tagColor: GREEN },
  { status: 'done', title: 'Register & Verify Flows', desc: 'Full pipeline: upload → hash → register → verify with exact + fuzzy match', tag: 'COMPLETE', tagColor: GREEN },
  { status: 'done', title: 'Forensic Analysis Suite', desc: 'ELA with adjustable amplification, EXIF extraction + anomaly flagging', tag: 'COMPLETE', tagColor: GREEN },
  { status: 'done', title: 'Camera Capture & Explorer', desc: 'Browser camera (front/back), visual blockchain explorer', tag: 'COMPLETE', tagColor: GREEN },
  { status: 'next', title: 'AI Deepfake Detection', desc: 'ML-based confidence scoring, frequency-domain analysis', tag: 'NEXT', tagColor: AMBER },
  { status: 'future', title: 'L2 Deployment + API/SDK', desc: 'Polygon/Base testnet, IPFS backup, public verification API', tag: 'PLANNED', tagColor: DIM },
];

roadmap.forEach((item, i) => {
  const y = 2.0 + i * 0.72;
  const dotColor = item.status === 'done' ? GREEN : item.status === 'next' ? AMBER : BG3;
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 1.72, y: y + 0.1, w: 0.38, h: 0.38,
    fill: { color: dotColor },
    line: item.status === 'done' ? undefined : { color: item.status === 'next' ? AMBER : DIM, width: 1.5 },
  });
  slide.addText([
    { text: item.title + '  ', options: { fontSize: 13, fontFace: 'Calibri', color: BRIGHT, bold: true } },
    { text: `[${item.tag}]`, options: { fontSize: 9, fontFace: 'Consolas', color: item.tagColor, bold: true } },
  ], {
    x: 2.5, y, w: 9, h: 0.35,
  });
  slide.addText(item.desc, {
    x: 2.5, y: y + 0.32, w: 9, h: 0.3, fontSize: 10, fontFace: 'Calibri', color: DIM,
  });
});

addFooter(slide, 8);


// ══════════════════════════════════════════════════════════
// GENERATE
// ══════════════════════════════════════════════════════════
await pptx.writeFile({ fileName: 'MediaGuard_Presentation.pptx' });
console.log('Generated: MediaGuard_Presentation.pptx');
