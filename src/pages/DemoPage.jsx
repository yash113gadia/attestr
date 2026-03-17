import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Fingerprint, Blocks, Camera, Search, ShieldCheck, Lock,
  ExternalLink, ArrowRight, Monitor, Chrome, Terminal, Eye,
  Globe, TrendingUp, Activity, Hash, AlertTriangle, Bot,
  FolderOpen, HardDrive, RotateCcw, Image, Check, X, CircleDot,
  ArrowUpFromLine, Link2, Loader2, Upload
} from 'lucide-react';
import Logo from '../components/Logo';
import ResultCard from '../components/ResultCard';
import { hashFile } from '../lib/hash';
import { registerMedia, verifyMedia, registerByUrl } from '../lib/api';

const CONTRACT = '0x37FCD33D5FF07cfa3A75D27B4ec4cF09e458dfac';
const ETHERSCAN = `https://sepolia.etherscan.io/address/${CONTRACT}`;
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');

const fade = (d = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { delay: d, duration: 0.5 } },
});

const sectionFade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6 },
};

function Stat({ icon: Icon, label, value, color = 'text-accent' }) {
  return (
    <div className="bg-surface border border-rule rounded-sm px-5 py-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-3.5 h-3.5 ${color}`} strokeWidth={1.5} />
        <span className="text-[10px] font-mono text-ink-faint tracking-widest uppercase">{label}</span>
      </div>
      <p className="text-[28px] font-serif text-ink">{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT 1: WEB PLATFORM — Live Register + Verify
   ═══════════════════════════════════════════════════════════ */
function LiveWebDemo() {
  const [mode, setMode] = useState('register'); // register | verify | url
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [hashing, setHashing] = useState(false);
  const [hashStage, setHashStage] = useState(null);
  const [hashes, setHashes] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const inputRef = useRef(null);

  function reset() {
    setFile(null); setPreview(null); setHashing(false); setHashStage(null);
    setHashes(null); setSubmitting(false); setResult(null); setError(null); setUrlInput('');
  }

  async function handleFile(f) {
    reset();
    setFile(f);
    if (f.type.startsWith('image/') || f.type.startsWith('video/')) setPreview(URL.createObjectURL(f));
    setHashing(true); setHashStage('sha256');
    try {
      const h = await hashFile(f);
      setHashes(h); setHashStage(null); setHashing(false);

      if (mode === 'verify') {
        setSubmitting(true);
        const r = await verifyMedia({ sha256: h.sha256, dHash: h.dHash });
        setResult({ ...r, _mode: 'verify' });
        setSubmitting(false);
      }
    } catch (e) { setError(e.message); setHashing(false); }
  }

  async function handleRegister() {
    if (!hashes || !file) return;
    setSubmitting(true); setError(null);
    try {
      const r = await registerMedia({
        sha256: hashes.sha256, dHash: hashes.dHash,
        filename: file.name, fileSize: file.size, mimeType: file.type,
      });
      if (r.error) setResult({ status: 'similar', message: r.error, block: r.block, onChain: r.onChain, _mode: 'register' });
      else setResult({ status: 'registered', message: `${file.name} registered on Ethereum Sepolia.`, block: r.block, onChain: r.onChain, _mode: 'register' });
    } catch (e) { setError(e.message); }
    setSubmitting(false);
  }

  async function handleUrlRegister() {
    if (!urlInput) return;
    setSubmitting(true); setError(null); setResult(null);
    setPreview(urlInput);
    try {
      const r = await registerByUrl({ url: urlInput });
      if (r.error) {
        setResult({ status: 'similar', message: r.error, block: null, onChain: null, _mode: 'url' });
      } else {
        setResult({
          status: 'registered',
          message: `Image registered on Ethereum Sepolia. SHA-256: ${r.sha256?.substring(0, 16)}...`,
          block: r.block,
          onChain: r.onChain,
          _mode: 'url',
        });
      }
    } catch (e) { setError(e.message); }
    setSubmitting(false);
  }

  const steps = [
    { key: 'sha256', label: 'SHA-256 cryptographic hash' },
    { key: 'dhash', label: 'Perceptual fingerprint (dHash)' },
  ];

  return (
    <div className="border border-rule rounded-sm overflow-hidden">
      {/* Tab bar */}
      <div className="bg-surface-raised border-b border-rule flex">
        {[
          { key: 'register', label: 'Register', icon: Upload },
          { key: 'url', label: 'Register URL', icon: Link2 },
          { key: 'verify', label: 'Verify', icon: ShieldCheck },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => { setMode(key); reset(); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-medium transition border-b-2 ${
              mode === key ? 'text-accent border-accent bg-accent/5' : 'text-ink-tertiary border-transparent hover:text-ink-secondary'
            }`}>
            <Icon className="w-4 h-4" strokeWidth={1.5} /> {label}
          </button>
        ))}
      </div>

      <div className="bg-[#0A0B0F] p-6">

        {/* ── URL Register mode ── */}
        {mode === 'url' && !result && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-surface border border-rule rounded-sm px-3 py-2.5">
                <Link2 className="w-4 h-4 text-ink-faint shrink-0" strokeWidth={1.5} />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlRegister()}
                  placeholder="Paste any image URL to register..."
                  className="flex-1 bg-transparent text-[12px] text-ink font-mono outline-none placeholder:text-ink-faint"
                />
              </div>
              <button onClick={handleUrlRegister} disabled={!urlInput || submitting}
                className="flex items-center gap-2 bg-white text-void text-[12px] font-medium px-4 py-2.5 rounded-sm hover:bg-ink transition disabled:opacity-40">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Blocks className="w-4 h-4" strokeWidth={1.5} />}
                Register
              </button>
            </div>
            {preview && (
              <div className="w-full h-[160px] rounded-sm border border-rule overflow-hidden bg-surface">
                <img src={preview} alt="" className="w-full h-full object-contain" onError={() => setPreview(null)} />
              </div>
            )}
            {submitting && (
              <div className="flex items-center justify-center gap-3 py-4">
                <Loader2 className="w-5 h-5 text-accent animate-spin" />
                <span className="text-[13px] text-ink-secondary">Fetching image → hashing → writing to Ethereum...</span>
              </div>
            )}
            <p className="text-[11px] text-ink-faint text-center">
              The server fetches the image, computes SHA-256, and registers it on Ethereum Sepolia.
              The extension will then recognize this exact image on any webpage.
            </p>
          </div>
        )}

        {/* ── File upload zone (register / verify modes) ── */}
        {mode !== 'url' && !file && !result && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files?.[0] && handleFile(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer border border-dashed border-rule rounded-sm py-16 text-center hover:border-ink-faint transition"
          >
            <input ref={inputRef} type="file" accept="image/*,video/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
            <ArrowUpFromLine className="w-5 h-5 mx-auto mb-3 text-ink-faint" strokeWidth={1.5} />
            <p className="text-[13px] text-ink-secondary">
              Drop a file to <span className="text-accent font-medium">{mode}</span>, or <span className="text-accent cursor-pointer">browse</span>
            </p>
            <p className="text-[11px] text-ink-tertiary mt-1 font-mono">JPG · PNG · WebP · MP4 · WebM · MOV</p>
          </div>
        )}

        {/* File selected — show progress */}
        {mode !== 'url' && file && !result && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {preview && file.type.startsWith('image/') && (
                <img src={preview} alt="" className="w-16 h-16 rounded-sm object-cover border border-rule" />
              )}
              {preview && file.type.startsWith('video/') && (
                <video src={preview} className="w-16 h-16 rounded-sm object-cover border border-rule" muted />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-ink font-medium truncate">{file.name}</p>
                <p className="text-[11px] text-ink-faint font-mono">
                  {file.type} · {file.size > 1048576 ? (file.size / 1048576).toFixed(1) + ' MB' : (file.size / 1024).toFixed(0) + ' KB'}
                </p>
              </div>
              <button onClick={reset} className="text-[11px] text-ink-faint hover:text-ink-tertiary transition">Reset</button>
            </div>

            {hashing && (
              <div className="border border-rule rounded-sm bg-surface p-4">
                <div className="flex items-center gap-2 mb-3">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-accent" />
                  <p className="text-[12px] text-ink">Computing fingerprints</p>
                  <p className="text-[10px] text-ink-faint font-mono ml-auto">local only</p>
                </div>
                {steps.map((s, i) => {
                  const active = s.key === hashStage;
                  const done = hashStage === 'dhash' && i === 0;
                  return (
                    <div key={s.key} className="flex items-center gap-2 py-1.5 text-[11px] font-mono">
                      <span className={active ? 'text-accent' : done ? 'text-verified' : 'text-ink-faint'}>
                        {done ? '✓' : active ? '●' : '○'}
                      </span>
                      <span className={active ? 'text-ink' : done ? 'text-verified' : 'text-ink-tertiary'}>{s.label}</span>
                      {active && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-accent ml-auto">processing</motion.span>}
                    </div>
                  );
                })}
              </div>
            )}

            {hashes && !submitting && mode === 'register' && (
              <div className="space-y-3">
                <div className="border border-rule rounded-sm bg-surface p-4 font-mono text-[11px] space-y-1.5">
                  <div className="flex"><span className="text-ink-faint w-14">sha256</span><span className="text-ink truncate">{hashes.sha256}</span></div>
                  <div className="flex"><span className="text-ink-faint w-14">dHash</span><span className="text-ink truncate">{hashes.dHash || 'n/a'}</span></div>
                </div>
                <button onClick={handleRegister}
                  className="w-full flex items-center justify-center gap-2 bg-white text-void text-[13px] font-medium py-3 rounded-sm hover:bg-ink transition">
                  <Blocks className="w-4 h-4" strokeWidth={1.5} /> Register on Ethereum
                </button>
              </div>
            )}

            {submitting && (
              <div className="flex items-center justify-center gap-3 py-6">
                <Loader2 className="w-5 h-5 text-accent animate-spin" />
                <span className="text-[13px] text-ink-secondary">
                  {mode === 'register' ? 'Writing to Ethereum Sepolia...' : 'Checking blockchain...'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {preview && mode === 'url' && (
              <div className="w-full h-[120px] rounded-sm border border-rule overflow-hidden bg-surface">
                <img src={preview} alt="" className="w-full h-full object-contain" onError={() => {}} />
              </div>
            )}
            <ResultCard status={result.status} message={result.message} block={result.block} similarity={result.similarity} onChain={result.onChain} />
            <button onClick={reset}
              className="w-full text-[12px] text-ink-tertiary hover:text-ink transition py-2 border border-rule rounded-sm">
              {mode === 'verify' ? 'Verify Another' : 'Register Another'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-3 border border-danger/20 bg-danger-glow rounded-sm px-4 py-3 text-[12px] text-danger">{error}</div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT 2: DESKTOP AGENT — Live terminal with real API
   ═══════════════════════════════════════════════════════════ */
function LiveAgentDemo() {
  const [lines, setLines] = useState([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [watching, setWatching] = useState(true);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  function log(text, cls) {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLines(prev => [...prev, { text: `  ${text.charAt(0)} ${time}  ${text.substring(2)}`, cls, id: Date.now() + Math.random() }]);
  }

  useEffect(() => {
    setLines([
      { text: '  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', cls: 'text-[#06B6D4]', id: 'h1' },
      { text: '    Attestr Desktop Agent', cls: 'text-ink font-bold', id: 'h2' },
      { text: '    Watched folder auto-registration', cls: 'text-ink-faint', id: 'h3' },
      { text: '  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', cls: 'text-[#06B6D4]', id: 'h4' },
      { text: '', cls: '', id: 'h5' },
    ]);
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLines(prev => [
      ...prev,
      { text: `  ● ${time}  Watching: ~/Demo/Drop-Zone`, cls: 'text-[#06B6D4]', id: 'w1' },
      { text: `  ● ${time}  API: ${API_BASE}`, cls: 'text-[#06B6D4]', id: 'w2' },
      { text: `  ● ${time}  Waiting for new files...`, cls: 'text-[#06B6D4]', id: 'w3' },
      { text: '', cls: '', id: 'w4' },
    ]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  async function handleFileDrop(f) {
    const name = f.name;
    const sizeStr = f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`;

    log(`● New file detected: ${name}`, 'text-[#06B6D4]');
    log(`# Hashing ${name} (${sizeStr})...`, 'text-[#A855F7]');

    try {
      const hashes = await hashFile(f);
      log(`# SHA-256: ${hashes.sha256.substring(0, 24)}...`, 'text-[#A855F7]');
      log(`● Registering on blockchain...`, 'text-[#06B6D4]');

      const r = await registerMedia({
        sha256: hashes.sha256, dHash: hashes.dHash || hashes.sha256.substring(0, 64),
        filename: f.name, fileSize: f.size, mimeType: f.type,
      });

      if (r.error) {
        log(`! Already registered: ${name}`, 'text-[#EAB308]');
      } else {
        setSessionCount(c => c + 1);
        log(`✓ Registered: ${name}`, 'text-[#22C55E] font-medium');
        if (r.onChain?.etherscanUrl) {
          log(`✓ Etherscan: ${r.onChain.etherscanUrl.replace('https://', '')}`, 'text-[#22C55E]');
        }
        log(`● Total registered this session: ${sessionCount + 1}`, 'text-[#06B6D4]');
      }
    } catch (err) {
      log(`✗ Error: ${err.message}`, 'text-[#EF4444]');
    }

    setLines(prev => [...prev, { text: '', cls: '', id: Date.now() }]);
    log(`● Waiting for new files...`, 'text-[#06B6D4]');
  }

  return (
    <div className="border border-rule rounded-sm overflow-hidden"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFileDrop(f); }}
    >
      {/* Title bar */}
      <div className="bg-surface-raised border-b border-rule px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <span className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <span className="text-[11px] font-mono text-ink-faint ml-2">node agent.js ~/Demo/Drop-Zone</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-verified animate-pulse" />
          <span className="text-[10px] font-mono text-verified">live</span>
        </div>
      </div>

      {/* Terminal body */}
      <div ref={scrollRef}
        className="bg-[#0A0B0F] p-4 h-[380px] overflow-y-auto font-mono text-[11px] leading-[1.7]">
        {lines.map((line) => (
          <motion.div key={line.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }} className={line.cls || 'text-ink-faint'}>
            {line.text || '\u00A0'}
          </motion.div>
        ))}
        <span className="inline-block w-2 h-4 bg-accent/60 animate-pulse ml-1" />
      </div>

      {/* Drop zone prompt */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-t border-rule bg-surface-raised px-4 py-3 text-center cursor-pointer hover:bg-surface-hover transition"
      >
        <input ref={inputRef} type="file" accept="image/*,video/*" multiple
          onChange={(e) => { for (const f of e.target.files) handleFileDrop(f); e.target.value = ''; }}
          className="hidden" />
        <p className="text-[12px] text-ink-tertiary">
          <span className="text-accent font-medium">Drop files here</span> or click to add — they'll register on the real blockchain
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT 3: CHROME EXTENSION — Live URL verification
   ═══════════════════════════════════════════════════════════ */
function LiveExtensionDemo() {
  const [url, setUrl] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [history, setHistory] = useState([]);

  async function verifyUrl(imageUrl) {
    if (!imageUrl) return;
    setChecking(true); setResult(null); setError(null); setImgPreview(imageUrl);

    try {
      // Fetch the image and compute SHA-256 — exactly like the extension does
      const res = await fetch(imageUrl);
      if (!res.ok) throw new Error(`Failed to fetch image (${res.status})`);
      const buffer = await res.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const sha256 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Verify against the blockchain
      const verifyRes = await verifyMedia({ sha256, dHash: sha256.substring(0, 64) });

      const entry = {
        url: imageUrl,
        sha256,
        status: verifyRes.status === 'verified' || verifyRes.status === 'similar' ? 'verified' : 'unverified',
        message: verifyRes.message,
        time: Date.now(),
      };

      setResult(entry);
      setHistory(prev => [entry, ...prev].slice(0, 10));
    } catch (err) {
      setError(err.message);
    }
    setChecking(false);
  }

  const badgeColor = checking ? 'bg-accent' : result?.status === 'verified' ? 'bg-verified' : result?.status === 'unverified' ? 'bg-danger' : null;
  const badgeIcon = checking ? '?' : result?.status === 'verified' ? '✓' : result?.status === 'unverified' ? '✗' : null;

  return (
    <div className="space-y-4">
      {/* Browser mockup */}
      <div className="border border-rule rounded-sm overflow-hidden">
        {/* Chrome title bar */}
        <div className="bg-surface-raised border-b border-rule px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <span className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 mx-3 bg-surface border border-rule rounded-md px-3 py-1 text-[11px] font-mono text-ink-faint truncate">
            any-website.com — right-click any image → "Verify with Attestr"
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-verified animate-pulse" />
            <span className="text-[10px] font-mono text-verified">live</span>
          </div>
        </div>

        <div className="bg-[#0A0B0F] p-5">
          {/* URL input — simulating what the extension does */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 bg-surface border border-rule rounded-sm px-3 py-2">
              <Link2 className="w-4 h-4 text-ink-faint shrink-0" strokeWidth={1.5} />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verifyUrl(url)}
                placeholder="Paste any image URL to verify..."
                className="flex-1 bg-transparent text-[12px] text-ink font-mono outline-none placeholder:text-ink-faint"
              />
            </div>
            <button onClick={() => verifyUrl(url)} disabled={!url || checking}
              className="flex items-center gap-2 bg-accent text-white text-[12px] font-medium px-4 py-2 rounded-sm hover:bg-accent/80 transition disabled:opacity-40">
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" strokeWidth={1.5} />}
              Verify
            </button>
          </div>

          {/* Image preview with badge overlay */}
          {(imgPreview || checking) && (
            <div className="relative mb-4">
              <div className="w-full h-[180px] rounded-sm border border-rule overflow-hidden bg-surface flex items-center justify-center">
                {imgPreview ? (
                  <img src={imgPreview} alt="" className="w-full h-full object-contain"
                    onError={() => setImgPreview(null)} />
                ) : (
                  <Image className="w-10 h-10 text-ink-faint" strokeWidth={1} />
                )}
              </div>
              {/* Badge overlay — just like the real extension */}
              <AnimatePresence>
                {badgeColor && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className={`absolute top-3 right-3 w-7 h-7 rounded-full ${badgeColor} text-white flex items-center justify-center text-[16px] font-bold shadow-lg`}>
                    {checking ? (
                      <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1 }}>?</motion.span>
                    ) : badgeIcon}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Status */}
          {checking && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-accent">
              <CircleDot className="w-3 h-3 animate-spin" /> Fetching image → SHA-256 → checking blockchain...
            </div>
          )}
          {result && !checking && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 p-3 rounded-sm border ${result.status === 'verified' ? 'border-verified/20 bg-verified-glow' : 'border-danger/20 bg-danger-glow'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[12px] font-bold text-white ${result.status === 'verified' ? 'bg-verified' : 'bg-danger'}`}>
                {result.status === 'verified' ? '✓' : '✗'}
              </span>
              <div>
                <p className={`text-[12px] font-medium ${result.status === 'verified' ? 'text-verified' : 'text-danger'}`}>
                  {result.status === 'verified' ? 'Verified on Blockchain' : 'Not Found on Blockchain'}
                </p>
                <p className="text-[11px] text-ink-tertiary mt-0.5">{result.message}</p>
                <p className="text-[10px] font-mono text-ink-faint mt-1">sha256: {result.sha256?.substring(0, 32)}...</p>
              </div>
            </motion.div>
          )}
          {error && !checking && (
            <div className="border border-danger/20 bg-danger-glow rounded-sm px-3 py-2 text-[11px] text-danger">{error}</div>
          )}
        </div>
      </div>

      {/* Verification history — like the extension popup */}
      {history.length > 0 && (
        <div className="border border-rule rounded-sm overflow-hidden">
          <div className="bg-surface-raised border-b border-rule px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-accent flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" strokeWidth={2} />
              </div>
              <span className="text-[13px] font-semibold text-ink">Extension Popup</span>
            </div>
            <span className="text-[9px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full">MEDIA VERIFIER</span>
          </div>
          <div className="bg-[#0A0B0F] px-4 py-3">
            <p className="text-[10px] font-mono text-ink-faint tracking-wider uppercase mb-2">Recent Verifications</p>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {history.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-surface border border-rule rounded-md px-3 py-2">
                  <div className="w-8 h-8 rounded bg-surface-raised overflow-hidden shrink-0">
                    <img src={item.url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${item.status === 'verified' ? 'text-verified' : 'text-danger'}`}>
                      <span className={`w-[6px] h-[6px] rounded-full ${item.status === 'verified' ? 'bg-verified' : 'bg-danger'}`} />
                      {item.status === 'verified' ? 'Verified on Blockchain' : 'Not Found'}
                    </div>
                    <p className="text-[10px] font-mono text-ink-faint truncate">{item.sha256?.substring(0, 16)}...{item.sha256?.substring(56)}</p>
                  </div>
                  <span className="text-[10px] text-ink-faint shrink-0">now</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN DEMO PAGE
   ═══════════════════════════════════════════════════════════ */
export default function DemoPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/activity`).then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <div className="bg-void text-ink min-h-screen">
      {/* ── HEADER BAR ── */}
      <div className="fixed top-0 inset-x-0 z-50 bg-void/80 backdrop-blur-2xl border-b border-rule">
        <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={22} />
            <span className="font-serif text-[17px] text-ink tracking-tight">Attestr</span>
            <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full ml-2">LIVE DEMO</span>
          </div>
          <div className="flex items-center gap-4">
            <a href={ETHERSCAN} target="_blank" rel="noopener" className="text-[11px] font-mono text-ink-tertiary hover:text-accent transition flex items-center gap-1.5">
              Etherscan <ExternalLink className="w-3 h-3" />
            </a>
            <Link to="/" className="text-[12px] text-ink-tertiary hover:text-ink transition">Home</Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 pt-24 pb-20">

        {/* ── HERO ── */}
        <motion.div {...fade(0.1)} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono text-ink-tertiary tracking-widest uppercase mb-6 border border-rule px-4 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-verified animate-pulse" />
            Innovate Bharat 2026 · CSBC114 · Cybersecurity &amp; Blockchain
          </div>
          <h1 className="font-serif text-[52px] md:text-[64px] leading-[0.95] tracking-tight mb-5">
            Attestr
          </h1>
          <p className="text-[17px] text-ink-secondary max-w-xl mx-auto leading-relaxed">
            Decentralized media authenticator. Register, verify, and forensically analyze
            media files — anchored immutably on the Ethereum blockchain.
          </p>
          <p className="text-[13px] text-ink-faint mt-3 font-mono">
            Team Ctrl+Alt+Diablo · Yash Gadia
          </p>
        </motion.div>

        {/* ── LIVE STATS ── */}
        <motion.section {...fade(0.25)} className="mb-16">
          <p className="text-[11px] font-mono text-accent tracking-widest uppercase mb-4">Live Production Stats</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-rule rounded-sm overflow-hidden">
            <Stat icon={TrendingUp} label="On-Chain Records" value={stats?.onChain?.totalRegistered ?? '...'} />
            <Stat icon={Blocks} label="Local Blocks" value={stats?.chainLength ?? '...'} />
            <Stat icon={ShieldCheck} label="Chain Integrity" value={stats?.chainValid ? 'Valid' : '...'} color="text-verified" />
            <Stat icon={Globe} label="Network" value="Sepolia" />
          </div>
          {stats?.onChain && (
            <div className="mt-3 border border-accent/15 bg-accent-glow rounded-sm px-5 py-3 flex items-center gap-6 text-[11px] font-mono flex-wrap">
              <span><span className="text-ink-faint">contract </span><span className="text-ink-secondary">{CONTRACT.substring(0, 22)}...</span></span>
              <span className="flex items-center gap-1.5 ml-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-verified animate-pulse" />
                <span className="text-verified">live on Ethereum Sepolia</span>
              </span>
            </div>
          )}
        </motion.section>

        {/* ── THE PROBLEM ── */}
        <motion.section {...sectionFade} className="mb-16">
          <p className="text-[11px] font-mono text-accent tracking-widest uppercase mb-4">The Problem</p>
          <div className="border border-rule rounded-sm bg-surface p-8">
            <h2 className="font-serif text-[28px] tracking-tight mb-4">Digital media can no longer be trusted.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[13px] text-ink-secondary leading-relaxed">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-caution shrink-0 mt-0.5" strokeWidth={1.5} />
                <p><span className="text-ink font-medium">Deepfakes</span> are indistinguishable from real media. AI-generated content costs $0 and takes seconds.</p>
              </div>
              <div className="flex gap-3">
                <Eye className="w-5 h-5 text-danger shrink-0 mt-0.5" strokeWidth={1.5} />
                <p><span className="text-ink font-medium">Tampered evidence</span> undermines journalism, legal proceedings, and public trust.</p>
              </div>
              <div className="flex gap-3">
                <Lock className="w-5 h-5 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
                <p><span className="text-ink font-medium">No provenance</span> — once a file leaves its origin, there's no way to prove it's unaltered.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── THE SOLUTION ── */}
        <motion.section {...sectionFade} className="mb-16">
          <p className="text-[11px] font-mono text-accent tracking-widest uppercase mb-4">Our Solution</p>
          <div className="border border-rule rounded-sm bg-surface p-8">
            <h2 className="font-serif text-[28px] tracking-tight mb-6">Attestr: Prove what's real.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Fingerprint, title: 'Dual-Hash Fingerprinting', desc: 'SHA-256 for exact matching + perceptual dHash that survives compression, screenshots, and resizing.' },
                { icon: Blocks, title: 'Ethereum Smart Contract', desc: 'Hashes permanently stored on Sepolia. Publicly verifiable via Etherscan. Immutable proof of existence.' },
                { icon: Bot, title: 'AI Deepfake Detection', desc: '7-signal forensic pipeline + Hugging Face ViT/ResNet models. EXIF, ELA, noise, frequency analysis.' },
                { icon: Lock, title: 'Zero-Knowledge Privacy', desc: 'Media never leaves your device. Only cryptographic hashes cross the network. Nothing to leak.' },
              ].map((f) => (
                <div key={f.title} className="flex gap-3 p-4 bg-surface-raised rounded-sm">
                  <f.icon className="w-5 h-5 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="text-[14px] text-ink font-medium">{f.title}</p>
                    <p className="text-[12px] text-ink-tertiary mt-1 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── ARCHITECTURE ── */}
        <motion.section {...sectionFade} className="mb-16">
          <p className="text-[11px] font-mono text-accent tracking-widest uppercase mb-4">Architecture</p>
          <div className="border border-rule rounded-sm bg-surface p-6 md:p-8 font-mono text-[12px] space-y-5 overflow-x-auto">
            <div className="flex items-center gap-4">
              <span className="text-accent w-24 shrink-0 text-[11px]">CLIENT</span>
              <div className="flex-1 grid grid-cols-4 gap-2">
                {['Upload / Camera', 'SHA-256 Worker', 'dHash Worker', 'ELA / EXIF'].map((b) => (
                  <div key={b} className="border border-rule bg-surface-raised px-3 py-2.5 text-center text-ink-secondary text-[11px]">{b}</div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 text-ink-faint">
              <span className="w-24 shrink-0" />
              <div className="flex-1 text-center text-[10px] tracking-wider">── hash + metadata only ──</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-caution w-24 shrink-0 text-[11px]">API</span>
              <div className="flex-1 grid grid-cols-4 gap-2">
                {['POST /register', 'POST /verify', 'POST /ai-detect', 'GET /chain'].map((b) => (
                  <div key={b} className="border border-rule bg-surface-raised px-3 py-2.5 text-center text-ink-secondary text-[11px]">{b}</div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 text-ink-faint">
              <span className="w-24 shrink-0" />
              <div className="flex-1 text-center text-[10px] tracking-wider">── ethers.js ──</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-verified w-24 shrink-0 text-[11px]">CHAIN</span>
              <div className="flex-1 border border-verified/20 bg-verified-glow px-4 py-2.5 text-center text-verified text-[11px]">
                Ethereum Sepolia · MediaRegistry.sol · Immutable · Proof-of-Work
              </div>
            </div>
            <div className="border-t border-rule pt-4 text-ink-tertiary text-[11px]">
              Raw media files never leave the browser. Only cryptographic hashes cross the network boundary.
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════
           THREE LIVE PRODUCTS
           ═══════════════════════════════════════════════════ */}

        <motion.div {...sectionFade} className="mb-6">
          <div className="text-center mb-10">
            <p className="text-[11px] font-mono text-accent tracking-widest uppercase mb-3">3 Products, 1 API, 1 Blockchain</p>
            <h2 className="font-serif text-[36px] tracking-tight">Try them all. Live.</h2>
            <p className="text-[14px] text-ink-tertiary mt-2">Everything below hits the real Ethereum Sepolia smart contract.</p>
          </div>
        </motion.div>

        {/* ── PRODUCT 1: WEB PLATFORM ── */}
        <motion.section {...sectionFade} className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-sm bg-accent/15 flex items-center justify-center">
              <Monitor className="w-4 h-4 text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[11px] font-mono text-accent tracking-widest uppercase">Product 1</p>
              <h3 className="text-[18px] font-serif text-ink tracking-tight">Web Platform</h3>
            </div>
            <Link to="/register" className="ml-auto text-[11px] text-ink-tertiary hover:text-accent transition flex items-center gap-1">
              Full version <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
            <LiveWebDemo />
            <div className="space-y-3">
              <div className="border border-rule rounded-sm bg-surface p-4 text-[12px] text-ink-tertiary leading-relaxed">
                <p className="text-ink font-medium mb-2">How it works</p>
                <ol className="space-y-1.5 list-decimal list-inside">
                  <li>Upload or capture a file</li>
                  <li>SHA-256 + dHash computed <span className="text-accent">in your browser</span></li>
                  <li>Hashes sent to API → written to Ethereum</li>
                  <li>Get Etherscan transaction link</li>
                </ol>
              </div>
              <div className="border border-rule rounded-sm bg-surface p-4 text-[12px]">
                <p className="text-ink-faint font-mono text-[11px] mb-1">Also includes</p>
                <p className="text-ink-tertiary">AI deepfake detection, EXIF forensics, Error Level Analysis, camera capture, activity feed</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── PRODUCT 2: DESKTOP AGENT ── */}
        <motion.section {...sectionFade} className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-sm bg-[#A855F7]/15 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-[#A855F7]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[11px] font-mono text-[#A855F7] tracking-widest uppercase">Product 2</p>
              <h3 className="text-[18px] font-serif text-ink tracking-tight">Desktop Agent</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
            <LiveAgentDemo />
            <div className="space-y-3">
              <div className="border border-rule rounded-sm bg-surface p-4 text-[12px] text-ink-tertiary leading-relaxed">
                <p className="text-ink font-medium mb-2">How it works</p>
                <ol className="space-y-1.5 list-decimal list-inside">
                  <li>Point at any folder: <span className="font-mono text-[#A855F7]">node agent.js ~/Photos</span></li>
                  <li>Agent watches for new files</li>
                  <li>Automatically hashes + registers each file</li>
                  <li>Returns Etherscan link per file</li>
                </ol>
              </div>
              <div className="border border-rule rounded-sm bg-surface p-4 text-[12px]">
                <p className="text-ink-faint font-mono text-[11px] mb-1">Use cases</p>
                <p className="text-ink-tertiary">Camera SD card imports, Dropbox sync, newsroom ingestion, automated evidence logging</p>
              </div>
              <div className="border border-rule rounded-sm bg-surface p-4 font-mono text-[11px]">
                <p className="text-ink-faint mb-1">Formats</p>
                <p className="text-ink-secondary">JPG, PNG, WebP, GIF, TIFF, MP4, MOV, WebM, AVI, MKV + RAW (CR2, CR3, NEF, ARW, DNG)</p>
              </div>
              <a href="/downloads/attestr-agent.js" download="attestr-agent.js"
                className="flex items-center justify-center gap-2 w-full bg-[#A855F7]/10 border border-[#A855F7]/20 text-[#A855F7] text-[12px] font-medium py-2.5 rounded-sm hover:bg-[#A855F7]/20 transition">
                <ArrowUpFromLine className="w-3.5 h-3.5 rotate-180" strokeWidth={2} /> Download agent.js
              </a>
            </div>
          </div>
        </motion.section>

        {/* ── PRODUCT 3: CHROME EXTENSION ── */}
        <motion.section {...sectionFade} className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-sm bg-verified/15 flex items-center justify-center">
              <Chrome className="w-4 h-4 text-verified" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[11px] font-mono text-verified tracking-widest uppercase">Product 3</p>
              <h3 className="text-[18px] font-serif text-ink tracking-tight">Chrome Extension</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
            <LiveExtensionDemo />
            <div className="space-y-3">
              <div className="border border-rule rounded-sm bg-surface p-4 text-[12px] text-ink-tertiary leading-relaxed">
                <p className="text-ink font-medium mb-2">How it works</p>
                <ol className="space-y-1.5 list-decimal list-inside">
                  <li>Right-click any image on any webpage</li>
                  <li>Select <span className="text-verified font-medium">"Verify with Attestr"</span></li>
                  <li>Extension fetches + hashes via Web Crypto</li>
                  <li>Badge overlay: green ✓ or red ✗</li>
                </ol>
              </div>
              <div className="border border-rule rounded-sm bg-surface p-4 text-[12px]">
                <p className="text-ink-faint font-mono text-[11px] mb-1">Try it</p>
                <p className="text-ink-tertiary">Paste any public image URL in the box. The demo runs the exact same code as the Chrome extension.</p>
              </div>
              <div className="border border-rule rounded-sm bg-surface p-4 text-[12px]">
                <p className="text-ink-faint font-mono text-[11px] mb-1">Install</p>
                <p className="text-ink-tertiary">Download → Unzip → Chrome → <span className="font-mono">chrome://extensions</span> → Developer Mode ON → Load Unpacked → select folder</p>
              </div>
              <a href="/downloads/attestr-extension.zip" download="attestr-extension.zip"
                className="flex items-center justify-center gap-2 w-full bg-verified/10 border border-verified/20 text-verified text-[12px] font-medium py-2.5 rounded-sm hover:bg-verified/20 transition">
                <ArrowUpFromLine className="w-3.5 h-3.5 rotate-180" strokeWidth={2} /> Download Chrome Extension (.zip)
              </a>
            </div>
          </div>
        </motion.section>

        {/* ── ALL SURFACES TABLE ── */}
        <motion.section {...sectionFade} className="mb-16">
          <p className="text-[11px] font-mono text-accent tracking-widest uppercase mb-4">All Surfaces, One API</p>
          <div className="border border-rule rounded-sm bg-surface p-6 md:p-8 font-mono text-[12px] space-y-4">
            <div className="grid grid-cols-[80px_1fr_120px] gap-3 text-[10px] text-ink-faint tracking-widest border-b border-rule pb-3">
              <span>SURFACE</span><span>DESCRIPTION</span><span className="text-right">ENDPOINT</span>
            </div>
            {[
              { surface: 'Web App', desc: 'React 19 SPA — register, verify, explore, activity feed', endpoint: '/api/*', color: 'text-accent' },
              { surface: 'Agent', desc: 'Node.js CLI — watches folders, auto-registers new media', endpoint: '/api/register', color: 'text-[#A855F7]' },
              { surface: 'Extension', desc: 'Chrome Manifest V3 — right-click verify any web image', endpoint: '/api/verify', color: 'text-verified' },
              { surface: 'External', desc: 'Any HTTP client — cURL, Postman, third-party integrations', endpoint: '/api/*', color: 'text-ink-secondary' },
            ].map((r) => (
              <div key={r.surface} className="grid grid-cols-[80px_1fr_120px] gap-3 items-center">
                <span className={`text-[12px] font-medium ${r.color}`}>{r.surface}</span>
                <span className="text-ink-tertiary text-[12px]">{r.desc}</span>
                <span className="text-ink-faint text-[11px] text-right">{r.endpoint}</span>
              </div>
            ))}
            <div className="border-t border-rule pt-3 text-ink-tertiary text-[11px]">
              All surfaces hit the same Vercel production deployment. Same smart contract. Same blockchain.
            </div>
          </div>
        </motion.section>

        {/* ── TECH STACK ── */}
        <motion.section {...sectionFade} className="mb-16">
          <p className="text-[11px] font-mono text-accent tracking-widest uppercase mb-4">Tech Stack</p>
          <div className="border border-rule rounded-sm bg-surface overflow-hidden">
            <div className="grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr] divide-y divide-rule text-[13px]">
              {[
                ['Frontend', 'React 19, Vite 8, Tailwind CSS 4, Three.js, Framer Motion'],
                ['Backend', 'Express 5, Vercel Serverless Functions'],
                ['Blockchain', 'Solidity 0.8.24, Hardhat 3, Ethers.js 6, Ethereum Sepolia'],
                ['AI / ML', 'Hugging Face (ViT, ResNet), 7-signal forensic pipeline'],
                ['Auth', 'Firebase Authentication (Google OAuth)'],
                ['Hashing', 'SHA-256 (Web Crypto) + Perceptual dHash (Web Worker)'],
                ['Agent', 'Node.js CLI with fs.watch file watcher'],
                ['Extension', 'Chrome Manifest V3, Web Crypto API'],
              ].map(([label, tech]) => (
                <div key={label} className="grid grid-cols-subgrid col-span-2">
                  <div className="px-5 py-3 bg-surface-raised text-[12px] text-ink-tertiary font-mono">{label}</div>
                  <div className="px-5 py-3 text-ink-secondary">{tech}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── FOOTER ── */}
        <motion.div {...sectionFade} className="text-center border-t border-rule pt-12">
          <Logo size={32} className="mx-auto mb-3" />
          <p className="font-serif text-[24px] tracking-tight mb-2">Attestr</p>
          <p className="text-[13px] text-ink-tertiary mb-1">Decentralized Media Authenticator</p>
          <p className="text-[11px] text-ink-faint font-mono">
            Team Ctrl+Alt+Diablo · CSBC114 · Innovate Bharat 2026
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <a href={ETHERSCAN} target="_blank" rel="noopener" className="text-[11px] font-mono text-accent hover:text-accent/80 transition flex items-center gap-1.5">
              View Contract on Etherscan <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
