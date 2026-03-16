#!/usr/bin/env node

/**
 * Attestr Desktop Agent — Watched Folder Auto-Registration
 *
 * Monitors a folder for new media files and automatically registers them
 * on the Attestr blockchain. Works with any camera, any software, any workflow.
 *
 * Usage:
 *   node agent.js [folder-path]
 *   node agent.js ~/Photos/Imports
 *   node agent.js .
 *
 * The agent will watch the folder and automatically hash + register any new
 * image or video file that appears.
 */

import { watch } from 'fs';
import { readFile, stat } from 'fs/promises';
import { createHash } from 'crypto';
import { basename, extname, resolve } from 'path';

const API_BASE = process.env.ATTESTR_API || 'https://attestr-app.vercel.app/api';
const API_KEY = process.env.ATTESTR_API_KEY || 'desktop-agent';
const WATCH_DIR = resolve(process.argv[2] || '.');

const MEDIA_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif',
  '.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v',
  '.raw', '.cr2', '.cr3', '.nef', '.arw', '.dng', '.orf', '.rw2',
]);

const processed = new Set();
let registrationCount = 0;

function log(msg, type = 'info') {
  const time = new Date().toLocaleTimeString();
  const prefix = {
    info: '\x1b[36m●\x1b[0m',
    success: '\x1b[32m✓\x1b[0m',
    error: '\x1b[31m✗\x1b[0m',
    warn: '\x1b[33m!\x1b[0m',
    hash: '\x1b[35m#\x1b[0m',
  }[type] || '●';
  console.log(`  ${prefix} \x1b[90m${time}\x1b[0m  ${msg}`);
}

async function hashFile(filePath) {
  const buffer = await readFile(filePath);
  const sha256 = createHash('sha256').update(buffer).digest('hex');
  return { sha256, buffer, size: buffer.length };
}

function getMimeType(ext) {
  const map = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.webp': 'image/webp', '.gif': 'image/gif', '.bmp': 'image/bmp',
    '.tiff': 'image/tiff', '.tif': 'image/tiff',
    '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo', '.mkv': 'video/x-matroska', '.m4v': 'video/x-m4v',
    '.raw': 'image/raw', '.cr2': 'image/x-canon-cr2', '.cr3': 'image/x-canon-cr3',
    '.nef': 'image/x-nikon-nef', '.arw': 'image/x-sony-arw',
    '.dng': 'image/x-adobe-dng', '.orf': 'image/x-olympus-orf',
    '.rw2': 'image/x-panasonic-rw2',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

async function registerFile(filePath) {
  const name = basename(filePath);
  const ext = extname(filePath).toLowerCase();

  if (!MEDIA_EXTENSIONS.has(ext)) return;
  if (processed.has(filePath)) return;

  // Wait a moment for file to finish writing
  await new Promise((r) => setTimeout(r, 500));

  try {
    const fileStat = await stat(filePath);
    if (fileStat.size === 0) return;

    log(`New file detected: ${name}`, 'info');

    // Hash the file
    log(`Hashing ${name} (${(fileStat.size / 1024).toFixed(0)} KB)...`, 'hash');
    const { sha256, size } = await hashFile(filePath);
    log(`SHA-256: ${sha256.substring(0, 24)}...`, 'hash');

    // Register via API
    log(`Registering on blockchain...`, 'info');
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        sha256,
        dHash: '0'.repeat(64), // Desktop agent doesn't compute perceptual hash (needs canvas)
        filename: name,
        fileSize: size,
        mimeType: getMimeType(ext),
      }),
    });

    const data = await response.json();

    if (data.success || data.onChain?.transactionHash) {
      registrationCount++;
      log(`Registered: ${name}`, 'success');
      if (data.onChain?.transactionHash) {
        log(`Etherscan: ${data.onChain.etherscanUrl}`, 'success');
      }
      log(`Total registered this session: ${registrationCount}`, 'info');
    } else if (data.error?.includes('already registered')) {
      log(`Already registered: ${name}`, 'warn');
    } else {
      log(`Failed: ${data.error || 'Unknown error'}`, 'error');
    }

    processed.add(filePath);
  } catch (err) {
    log(`Error processing ${name}: ${err.message}`, 'error');
  }
}

// ── Start ──
console.log('');
console.log('  \x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
console.log('  \x1b[1m  Attestr Desktop Agent\x1b[0m');
console.log('  \x1b[90m  Watched folder auto-registration\x1b[0m');
console.log('  \x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
console.log('');
log(`Watching: ${WATCH_DIR}`, 'info');
log(`API: ${API_BASE}`, 'info');
log(`Supported: ${[...MEDIA_EXTENSIONS].join(', ')}`, 'info');
console.log('');
log('Waiting for new files...', 'info');
console.log('');

// Watch the directory
watch(WATCH_DIR, { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  if (eventType !== 'rename' && eventType !== 'change') return;

  const ext = extname(filename).toLowerCase();
  if (!MEDIA_EXTENSIONS.has(ext)) return;

  const fullPath = resolve(WATCH_DIR, filename);
  registerFile(fullPath);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('');
  log(`Session complete. ${registrationCount} files registered.`, 'info');
  console.log('');
  process.exit(0);
});
