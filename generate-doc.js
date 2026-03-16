import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType,
  TableLayoutType, convertInchesToTwip, PageBreak,
} from 'docx';
import { writeFileSync } from 'fs';

// ── Colors ──
const GREEN = '00CC6A';
const RED = 'FF4455';
const AMBER = 'FFAA00';
const DARK = '0A0F1C';
const DARK2 = '111827';
const WHITE = 'FFFFFF';
const GRAY = '9CA3AF';
const LIGHT = 'E5E7EB';

// ── Helpers ──
const spacer = (size = 200) => new Paragraph({ spacing: { after: size } });

const heading = (text, level = HeadingLevel.HEADING_1) =>
  new Paragraph({
    heading: level,
    spacing: { before: 300, after: 100 },
    children: [new TextRun({ text, bold: true, font: 'Calibri', size: level === HeadingLevel.HEADING_1 ? 36 : level === HeadingLevel.HEADING_2 ? 28 : 24, color: DARK })],
  });

const sectionLabel = (num, label) =>
  new Paragraph({
    spacing: { before: 400, after: 80 },
    children: [
      new TextRun({ text: `${num} — `, font: 'Consolas', size: 18, color: GREEN }),
      new TextRun({ text: label, font: 'Consolas', size: 18, color: GREEN }),
    ],
  });

const bodyText = (text) =>
  new Paragraph({
    spacing: { after: 160 },
    children: [new TextRun({ text, font: 'Calibri', size: 22, color: '333333' })],
  });

const bulletItem = (text, bold = '') =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [
      ...(bold ? [new TextRun({ text: bold + ' ', bold: true, font: 'Calibri', size: 22, color: '111111' })] : []),
      new TextRun({ text, font: 'Calibri', size: 22, color: '444444' }),
    ],
  });

const checkItem = (text) =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [
      new TextRun({ text: '\u2713 ', font: 'Calibri', size: 22, color: GREEN, bold: true }),
      new TextRun({ text, font: 'Calibri', size: 22, color: '333333' }),
    ],
  });

// ── Table helpers ──
const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

const headerCell = (text) =>
  new TableCell({
    borders,
    shading: { type: ShadingType.SOLID, color: DARK, fill: DARK },
    width: { size: 25, type: WidthType.PERCENTAGE },
    children: [new Paragraph({
      spacing: { before: 60, after: 60 },
      children: [new TextRun({ text, bold: true, font: 'Calibri', size: 18, color: GREEN })],
    })],
  });

const dataCell = (text, color = '333333') =>
  new TableCell({
    borders,
    width: { size: 25, type: WidthType.PERCENTAGE },
    children: [new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text, font: 'Calibri', size: 18, color })],
    })],
  });

const tagCell = (text, tagColor) =>
  new TableCell({
    borders,
    width: { size: 25, type: WidthType.PERCENTAGE },
    children: [new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text, font: 'Consolas', size: 18, color: tagColor, bold: true })],
    })],
  });

// ── Document ──
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: 22 } },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: { top: convertInchesToTwip(0.8), bottom: convertInchesToTwip(0.8), left: convertInchesToTwip(1), right: convertInchesToTwip(1) },
      },
    },
    children: [
      // ═══════ TITLE PAGE ═══════
      spacer(2000),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: 'INNOVATE BHARAT HACKATHON 2026', font: 'Consolas', size: 20, color: GREEN, bold: true })],
      }),
      spacer(200),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({ text: 'Media', font: 'Calibri', size: 72, bold: true, color: DARK }),
          new TextRun({ text: 'Guard', font: 'Calibri', size: 72, bold: true, color: GREEN }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: 'DECENTRALIZED MEDIA AUTHENTICATOR', font: 'Consolas', size: 22, color: GRAY, characterSpacing: 120 })],
      }),
      spacer(400),

      // Team info table
      new Table({
        layout: TableLayoutType.FIXED,
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                width: { size: 25, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: 'TEAM', font: 'Consolas', size: 16, color: GRAY })] }),
                  new Paragraph({ children: [new TextRun({ text: 'Ctrl+Alt+Diablo', font: 'Calibri', size: 22, bold: true, color: DARK })] }),
                ],
              }),
              new TableCell({
                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                width: { size: 25, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: 'TEAM ID', font: 'Consolas', size: 16, color: GRAY })] }),
                  new Paragraph({ children: [new TextRun({ text: 'CSBC114', font: 'Calibri', size: 22, bold: true, color: DARK })] }),
                ],
              }),
              new TableCell({
                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                width: { size: 25, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: 'TRACK', font: 'Consolas', size: 16, color: GRAY })] }),
                  new Paragraph({ children: [new TextRun({ text: 'Cybersecurity & Blockchain', font: 'Calibri', size: 22, bold: true, color: DARK })] }),
                ],
              }),
              new TableCell({
                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                width: { size: 25, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: 'PANEL', font: 'Consolas', size: 16, color: GRAY })] }),
                  new Paragraph({ children: [new TextRun({ text: 'Panel 6', font: 'Calibri', size: 22, bold: true, color: DARK })] }),
                ],
              }),
            ],
          }),
        ],
      }),

      spacer(800),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Sharda University \u2022 Department of Computer Science & Engineering', font: 'Calibri', size: 18, color: GRAY })],
      }),

      // Page break
      new Paragraph({ children: [new PageBreak()] }),

      // ═══════ 01 — PROBLEM STATEMENT ═══════
      sectionLabel('01', 'PROBLEM STATEMENT'),
      heading('Trust in Digital Media is Broken', HeadingLevel.HEADING_1),
      bodyText('In an era of AI-generated deepfakes and sophisticated media manipulation, there is no reliable, accessible way to verify whether a photo or video is authentic. Journalists, legal professionals, and investigators need proof — not guesswork.'),
      spacer(100),
      bulletItem('The vast majority of deepfake content is created using readily available AI tools, making manipulation trivially easy.', '96% of deepfakes are AI-generated —'),
      bulletItem('Deepfake content is increasing exponentially, outpacing detection capabilities of traditional forensic methods.', '10x year-over-year growth —'),
      bulletItem('Free, open-source tools make it possible for anyone to create convincing manipulated media with zero investment.', '$0 cost to create a deepfake —'),

      spacer(300),

      // ═══════ 02 — MARKET LANDSCAPE ═══════
      sectionLabel('02', 'MARKET LANDSCAPE'),
      heading('Existing Solutions & Their Limitations', HeadingLevel.HEADING_1),
      bodyText('Several players have attempted to solve media authentication, but every existing solution has critical gaps that leave users vulnerable.'),
      spacer(100),

      new Table({
        layout: TableLayoutType.FIXED,
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [headerCell('SOLUTION'), headerCell('HOW IT WORKS'), headerCell('BLOCKCHAIN?'), headerCell('KEY LIMITATION')] }),
          new TableRow({ children: [
            dataCell('C2PA / CAI (Adobe, Microsoft, Google)'),
            dataCell('Embeds signed metadata into media files via PKI certificates'),
            tagCell('No \u2014 PKI', RED),
            dataCell('Metadata stripped by screenshots & social media uploads', RED),
          ]}),
          new TableRow({ children: [
            dataCell('Truepic ($26M funded)'),
            dataCell('Hardware-level signing at capture (Qualcomm chips, Leica cameras)'),
            tagCell('Abandoned', RED),
            dataCell('Requires hardware integration, not retroactive', RED),
          ]}),
          new TableRow({ children: [
            dataCell('Numbers Protocol'),
            dataCell('Mobile Capture App + EVM blockchain + IPFS storage'),
            tagCell('Yes \u2014 EVM + NUM', GREEN),
            dataCell('Requires their app; token complexity', RED),
          ]}),
          new TableRow({ children: [
            dataCell('OpenOrigins ($4.5M funded)'),
            dataCell('Hash media \u2192 store on Hyperledger for newsrooms'),
            tagCell('Permissioned', AMBER),
            dataCell('Not truly decentralized', RED),
          ]}),
          new TableRow({ children: [
            dataCell('SWEAR'),
            dataCell('"Digital DNA" fingerprinting per frame, stored on blockchain'),
            tagCell('Hyperledger', AMBER),
            dataCell('Permissioned chain, capture-forward only', RED),
          ]}),
          new TableRow({ children: [
            dataCell('Reality Defender (YC-backed)'),
            dataCell('AI deepfake detection only'),
            tagCell('No', RED),
            dataCell('Detection only, no provenance proof', RED),
          ]}),
          new TableRow({ children: [
            dataCell('Starling Lab (Stanford + USC)'),
            dataCell('IPFS + Filecoin storage, Hedera timestamping'),
            tagCell('Yes', GREEN),
            dataCell('Research framework, not a product', RED),
          ]}),
          new TableRow({ children: [
            dataCell('ProofMode (Guardian Project)'),
            dataCell('Open-source mobile app, SHA-256 + PGP signing'),
            tagCell('Optional', AMBER),
            dataCell('Android only, basic UX', RED),
          ]}),
        ],
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════ 03 — OUR EDGE ═══════
      sectionLabel('03', 'OUR EDGE'),
      heading('What Makes MediaGuard Different', HeadingLevel.HEADING_1),
      bodyText('MediaGuard is the first open, browser-based media authenticator that combines blockchain provenance with forensic analysis — no hardware, no app downloads, no compromises.'),
      spacer(100),

      bulletItem('Existing tools do either AI detection or blockchain provenance. MediaGuard does both in one unified platform.', 'Detection + Provenance \u2014'),
      bulletItem('Perceptual hashing (dHash) stays intact through compression, resizing, and social media re-uploads — unlike C2PA metadata.', 'Survives Screenshots \u2014'),
      bulletItem('Public blockchain with proof-of-work — not a permissioned Hyperledger chain controlled by a single entity.', 'Truly Decentralized \u2014'),
      bulletItem('Works in any modern browser. No Qualcomm chips, no special cameras, no app downloads.', 'Zero Hardware Required \u2014'),
      bulletItem('Analyze existing media with forensic tools (ELA, EXIF) even if it was never registered on the blockchain.', 'Retroactive Verification \u2014'),
      bulletItem('Files never leave the browser. Only cryptographic hashes are stored on-chain under anonymous addresses.', 'Privacy-Preserving \u2014'),

      spacer(300),

      // ═══════ 04 — HOW IT WORKS ═══════
      sectionLabel('04', 'HOW IT WORKS'),
      heading('From Capture to Verification', HeadingLevel.HEADING_1),
      bodyText('A zero-trust pipeline where the original file never leaves the user\'s device. Only the mathematical fingerprint touches the network.'),
      spacer(100),

      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({ text: 'STEP 1 \u2192 ', font: 'Consolas', size: 20, bold: true, color: GREEN }),
          new TextRun({ text: 'CAPTURE', font: 'Consolas', size: 20, bold: true, color: DARK }),
          new TextRun({ text: '  \u2014  Upload file or use in-browser camera', font: 'Calibri', size: 20, color: '555555' }),
        ],
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({ text: 'STEP 2 \u2192 ', font: 'Consolas', size: 20, bold: true, color: GREEN }),
          new TextRun({ text: 'HASH', font: 'Consolas', size: 20, bold: true, color: DARK }),
          new TextRun({ text: '  \u2014  SHA-256 + dHash computed entirely client-side via Web Worker', font: 'Calibri', size: 20, color: '555555' }),
        ],
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({ text: 'STEP 3 \u2192 ', font: 'Consolas', size: 20, bold: true, color: GREEN }),
          new TextRun({ text: 'REGISTER', font: 'Consolas', size: 20, bold: true, color: DARK }),
          new TextRun({ text: '  \u2014  Hash stored on blockchain ledger with proof-of-work', font: 'Calibri', size: 20, color: '555555' }),
        ],
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({ text: 'STEP 4 \u2192 ', font: 'Consolas', size: 20, bold: true, color: GREEN }),
          new TextRun({ text: 'VERIFY', font: 'Consolas', size: 20, bold: true, color: DARK }),
          new TextRun({ text: '  \u2014  Upload any media \u2192 compare hash against chain \u2192 instant result', font: 'Calibri', size: 20, color: '555555' }),
        ],
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({ text: 'STEP 5 \u2192 ', font: 'Consolas', size: 20, bold: true, color: GREEN }),
          new TextRun({ text: 'ANALYZE', font: 'Consolas', size: 20, bold: true, color: DARK }),
          new TextRun({ text: '  \u2014  Error Level Analysis + EXIF metadata forensic inspection', font: 'Calibri', size: 20, color: '555555' }),
        ],
      }),

      spacer(300),

      // ═══════ 05 — TECH STACK ═══════
      sectionLabel('05', 'TECHNOLOGY STACK'),
      heading('Built With Modern, Open Tools', HeadingLevel.HEADING_1),
      spacer(100),

      new Table({
        layout: TableLayoutType.FIXED,
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [headerCell('FRONTEND'), headerCell('BACKEND'), headerCell('CRYPTOGRAPHY')] }),
          new TableRow({ children: [
            new TableCell({ borders, children: [
              new Paragraph({ spacing: { before: 40, after: 30 }, children: [new TextRun({ text: '\u2022 React 19', font: 'Calibri', size: 20, color: '333333' })] }),
              new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: '\u2022 Vite 8', font: 'Calibri', size: 20, color: '333333' })] }),
              new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: '\u2022 Tailwind CSS 4', font: 'Calibri', size: 20, color: '333333' })] }),
              new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: '\u2022 Framer Motion', font: 'Calibri', size: 20, color: '333333' })] }),
              new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: '\u2022 React Router', font: 'Calibri', size: 20, color: '333333' })] }),
            ]}),
            new TableCell({ borders, children: [
              new Paragraph({ spacing: { before: 40, after: 30 }, children: [new TextRun({ text: '\u2022 Node.js', font: 'Calibri', size: 20, color: '333333' })] }),
              new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: '\u2022 Express 5', font: 'Calibri', size: 20, color: '333333' })] }),
              new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: '\u2022 Custom Blockchain', font: 'Calibri', size: 20, color: '333333' })] }),
              new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: '\u2022 Proof-of-Work Mining', font: 'Calibri', size: 20, color: '333333' })] }),
              new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: '\u2022 REST API', font: 'Calibri', size: 20, color: '333333' })] }),
            ]}),
            new TableCell({ borders, children: [
              new Paragraph({ spacing: { before: 40, after: 30 }, children: [new TextRun({ text: '\u2022 SubtleCrypto (SHA-256)', font: 'Calibri', size: 20, color: '333333' })] }),
              new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: '\u2022 dHash (Perceptual)', font: 'Calibri', size: 20, color: '333333' })] }),
              new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: '\u2022 Web Workers', font: 'Calibri', size: 20, color: '333333' })] }),
              new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: '\u2022 Canvas-based ELA', font: 'Calibri', size: 20, color: '333333' })] }),
              new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: '\u2022 EXIF via exifr', font: 'Calibri', size: 20, color: '333333' })] }),
            ]}),
          ]}),
        ],
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════ 06 — FEATURES ═══════
      sectionLabel('06', 'FEATURES'),
      heading('What MediaGuard Can Do', HeadingLevel.HEADING_1),
      spacer(100),

      checkItem('Drag-and-drop & in-browser camera capture'),
      checkItem('Client-side cryptographic hashing (SHA-256) — file never leaves browser'),
      checkItem('Perceptual hash (dHash) — survives compression, resizing, screenshots'),
      checkItem('Blockchain registration with proof-of-work mining'),
      checkItem('Instant verification — exact match + fuzzy perceptual matching'),
      checkItem('Error Level Analysis with adjustable amplification slider'),
      checkItem('EXIF metadata extraction with suspicious field flagging'),
      checkItem('Visual blockchain explorer with block inspection'),
      checkItem('Side-by-side tamper comparison view'),
      checkItem('Zero-upload privacy model — only hashes touch the network'),

      spacer(300),

      // ═══════ 07 — ARCHITECTURE ═══════
      sectionLabel('07', 'ARCHITECTURE'),
      heading('System Design', HeadingLevel.HEADING_1),
      spacer(100),

      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: '\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 CLIENT (BROWSER) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510', font: 'Consolas', size: 18, color: GREEN })] }),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: '\u2502  Upload/Camera   \u2502   Web Worker      \u2502   ELA Engine    \u2502   EXIF Parser  \u2502', font: 'Consolas', size: 18, color: '555555' })] }),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: '\u2502  MediaDevices API \u2502   SHA-256 + dHash  \u2502   Canvas        \u2502   exifr         \u2502', font: 'Consolas', size: 18, color: '555555' })] }),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: '\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518', font: 'Consolas', size: 18, color: GREEN })] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: '\u2193  hash + metadata only  \u2193', font: 'Consolas', size: 18, color: GREEN, bold: true })] }),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: '\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 API SERVER \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510', font: 'Consolas', size: 18, color: AMBER })] }),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: '\u2502   POST /register       \u2502   POST /verify         \u2502   GET /chain          \u2502', font: 'Consolas', size: 18, color: '555555' })] }),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: '\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518', font: 'Consolas', size: 18, color: AMBER })] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: '\u2193', font: 'Consolas', size: 18, color: AMBER, bold: true })] }),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: '\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 BLOCKCHAIN LEDGER \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510', font: 'Consolas', size: 18, color: GREEN })] }),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: '\u2502   Proof-of-Work  \u2022  SHA-256 linked blocks  \u2022  Immutable  \u2022  Difficulty=2  \u2502', font: 'Consolas', size: 18, color: '555555' })] }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: '\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518', font: 'Consolas', size: 18, color: GREEN })] }),

      new Paragraph({
        spacing: { before: 100, after: 40 },
        shading: { type: ShadingType.SOLID, color: 'E8FFF0', fill: 'E8FFF0' },
        children: [new TextRun({ text: '  \ud83d\udd12  Raw media files NEVER leave the browser. Only hashes cross the network boundary.', font: 'Consolas', size: 18, color: GREEN, bold: true })] }),

      spacer(300),

      // ═══════ 08 — ROADMAP ═══════
      sectionLabel('08', 'IMPLEMENTATION ROADMAP'),
      heading('What\'s Built & What\'s Next', HeadingLevel.HEADING_1),
      spacer(100),

      new Paragraph({ spacing: { after: 80 }, children: [
        new TextRun({ text: '\u25cf ', font: 'Calibri', size: 22, color: GREEN }),
        new TextRun({ text: 'Core Blockchain Engine', font: 'Calibri', size: 22, bold: true, color: DARK }),
        new TextRun({ text: '  [COMPLETE]', font: 'Consolas', size: 18, color: GREEN }),
      ]}),
      bodyText('    Block class, proof-of-work mining, chain validation, SHA-256 linking, genesis block, search by hash.'),

      new Paragraph({ spacing: { after: 80 }, children: [
        new TextRun({ text: '\u25cf ', font: 'Calibri', size: 22, color: GREEN }),
        new TextRun({ text: 'Client-Side Hashing', font: 'Calibri', size: 22, bold: true, color: DARK }),
        new TextRun({ text: '  [COMPLETE]', font: 'Consolas', size: 18, color: GREEN }),
      ]}),
      bodyText('    Web Worker with SubtleCrypto SHA-256 + OffscreenCanvas dHash. Files processed entirely in-browser.'),

      new Paragraph({ spacing: { after: 80 }, children: [
        new TextRun({ text: '\u25cf ', font: 'Calibri', size: 22, color: GREEN }),
        new TextRun({ text: 'Register & Verify Flows', font: 'Calibri', size: 22, bold: true, color: DARK }),
        new TextRun({ text: '  [COMPLETE]', font: 'Consolas', size: 18, color: GREEN }),
      ]}),
      bodyText('    Full upload \u2192 hash \u2192 register pipeline. Verify with exact SHA-256 match + fuzzy perceptual matching.'),

      new Paragraph({ spacing: { after: 80 }, children: [
        new TextRun({ text: '\u25cf ', font: 'Calibri', size: 22, color: GREEN }),
        new TextRun({ text: 'Forensic Analysis', font: 'Calibri', size: 22, bold: true, color: DARK }),
        new TextRun({ text: '  [COMPLETE]', font: 'Consolas', size: 18, color: GREEN }),
      ]}),
      bodyText('    Error Level Analysis with adjustable amplification. EXIF metadata extraction with suspicious field detection.'),

      new Paragraph({ spacing: { after: 80 }, children: [
        new TextRun({ text: '\u25cf ', font: 'Calibri', size: 22, color: GREEN }),
        new TextRun({ text: 'Camera Capture & Explorer', font: 'Calibri', size: 22, bold: true, color: DARK }),
        new TextRun({ text: '  [COMPLETE]', font: 'Consolas', size: 18, color: GREEN }),
      ]}),
      bodyText('    In-browser camera with front/back toggle. Visual blockchain explorer with block inspection.'),

      spacer(100),

      new Paragraph({ spacing: { after: 80 }, children: [
        new TextRun({ text: '\u25cb ', font: 'Calibri', size: 22, color: AMBER }),
        new TextRun({ text: 'AI Deepfake Detection', font: 'Calibri', size: 22, bold: true, color: DARK }),
        new TextRun({ text: '  [NEXT]', font: 'Consolas', size: 18, color: AMBER }),
      ]}),
      bodyText('    Integrate ML-based deepfake confidence scoring using frequency-domain analysis and GAN fingerprint detection.'),

      new Paragraph({ spacing: { after: 80 }, children: [
        new TextRun({ text: '\u25cb ', font: 'Calibri', size: 22, color: GRAY }),
        new TextRun({ text: 'Public Testnet Deployment', font: 'Calibri', size: 22, bold: true, color: DARK }),
        new TextRun({ text: '  [PLANNED]', font: 'Consolas', size: 18, color: GRAY }),
      ]}),
      bodyText('    Deploy to Polygon/Base L2 for real decentralized storage. IPFS integration for optional media backup.'),

      new Paragraph({ spacing: { after: 80 }, children: [
        new TextRun({ text: '\u25cb ', font: 'Calibri', size: 22, color: GRAY }),
        new TextRun({ text: 'API & SDK', font: 'Calibri', size: 22, bold: true, color: DARK }),
        new TextRun({ text: '  [PLANNED]', font: 'Consolas', size: 18, color: GRAY }),
      ]}),
      bodyText('    Public verification API and JavaScript SDK for third-party integration into newsrooms and legal platforms.'),

      spacer(600),

      // Footer
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: 'Ctrl+Alt+Diablo', font: 'Calibri', size: 20, bold: true, color: GREEN }),
          new TextRun({ text: '  \u2022  CSBC114  \u2022  Innovate Bharat Hackathon 2026', font: 'Calibri', size: 20, color: GRAY }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60 },
        children: [new TextRun({ text: 'Sharda University \u2022 Department of Computer Science & Engineering', font: 'Calibri', size: 18, color: GRAY })],
      }),
    ],
  }],
});

// Generate
const buffer = await Packer.toBuffer(doc);
writeFileSync('MediaGuard_ProjectPlan.docx', buffer);
console.log('Generated: MediaGuard_ProjectPlan.docx');
