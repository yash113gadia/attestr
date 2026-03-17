import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera as CameraIcon, ArrowLeft, Shield, Lock, Fingerprint, Blocks, Zap, Eye, FileCheck, Link2, Loader2 } from 'lucide-react';
import ScanGraphic from '../components/ScanGraphic';
import UploadZone from '../components/UploadZone';
import CameraCapture from '../components/CameraCapture';
import HashProgress from '../components/HashProgress';
import ResultCard from '../components/ResultCard';
import ELAViewer from '../components/ELAViewer';
import ExifPanel from '../components/ExifPanel';
import AIDetector from '../components/AIDetector';
import { hashFile } from '../lib/hash';
import { extractExif } from '../lib/exif';
import { registerMedia, registerByUrl } from '../lib/api';
import { useAuth } from '../components/AuthProvider';
import { signInWithGoogle } from '../lib/firebase';

const fade = { hidden: { opacity: 0, y: 10 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }) };

export default function RegisterPage() {
  const user = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const previewRef = useRef(null);
  const [hashing, setHashing] = useState(false);
  const [hashStage, setHashStage] = useState(null);
  const [hashes, setHashes] = useState(null);
  const [result, setResult] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [exifData, setExifData] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlSubmitting, setUrlSubmitting] = useState(false);

  function cleanupPreview() { if (previewRef.current) { URL.revokeObjectURL(previewRef.current); previewRef.current = null; } }

  async function handleFile(f) {
    cleanupPreview(); setFile(f); setResult(null); setError(null); setShowCamera(false);
    if (f.type.startsWith('image/') || f.type.startsWith('video/')) { const u = URL.createObjectURL(f); setPreview(u); previewRef.current = u; }
    setHashing(true); setHashStage('sha256');
    try {
      const [h, exif] = await Promise.all([hashFile(f), extractExif(f)]);
      setHashes(h); setExifData(exif); setHashStage(null); setHashing(false);
    } catch (e) { setError('Hash failed: ' + e.message); setHashing(false); }
  }

  async function handleRegister() {
    if (!hashes) return; setError(null); setRegistering(true);
    try {
      const r = await registerMedia({ sha256: hashes.sha256, dHash: hashes.dHash, filename: file.name, fileSize: file.size, mimeType: file.type, userId: user?.uid, userName: user?.displayName });
      if (r.error) setResult({ status: 'similar', message: r.error, block: r.block, onChain: r.onChain });
      else setResult({ status: 'registered', message: `Fingerprint recorded.${r.onChain?.transactionHash ? ' Confirmed on Ethereum Sepolia.' : ''}`, block: r.block, onChain: r.onChain });
    } catch { setError('Server unreachable.'); }
    setRegistering(false);
  }

  async function handleUrlRegister() {
    if (!urlInput) return;
    setUrlSubmitting(true); setError(null); setResult(null);
    try {
      const r = await registerByUrl({ url: urlInput, userId: user?.uid, userName: user?.displayName });
      if (r.error) {
        setResult({ status: 'similar', message: r.error, onChain: null });
      } else {
        setResult({ status: 'registered', message: `Image registered on Ethereum Sepolia. SHA-256: ${r.sha256?.substring(0, 20)}...`, block: r.block, onChain: r.onChain });
      }
      setShowUrlInput(false);
    } catch (e) { setError(e.message); }
    setUrlSubmitting(false);
  }

  function reset() { cleanupPreview(); setFile(null); setPreview(null); setHashes(null); setResult(null); setError(null); setShowUrlInput(false); setUrlInput(''); }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 md:gap-12">
      {/* ── Sidebar ── */}
      <motion.aside initial="hidden" animate="show" className="pt-1">
        <motion.h1 variants={fade} custom={0} className="font-serif text-[28px] md:text-[32px] text-ink leading-none tracking-tight">Register</motion.h1>
        <motion.p variants={fade} custom={1} className="text-[13px] text-ink-tertiary mt-3 md:mt-4 leading-relaxed">
          Create a tamper-proof record. The file is hashed locally and never leaves your device.
        </motion.p>

        {/* Steps — hidden on mobile */}
        <motion.div variants={fade} custom={2} className="hidden md:block mt-10 space-y-5 text-[12px]">
          {[
            { step: 'Upload or capture', detail: 'Drag, browse, or use camera' },
            { step: 'Fingerprint locally', detail: 'SHA-256 + perceptual hash' },
            { step: 'Write to Ethereum', detail: 'Immutable on-chain proof' },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="font-mono text-accent text-[11px] mt-px font-medium">0{i + 1}</span>
              <div>
                <span className="text-ink">{s.step}</span>
                <p className="text-ink-faint text-[11px] mt-0.5">{s.detail}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* What happens panel — hidden on mobile */}
        <motion.div variants={fade} custom={3} className="hidden md:block mt-10 border border-rule rounded-sm bg-surface p-4">
          <p className="text-[10px] font-mono text-ink-faint tracking-widest mb-3">WHAT GETS STORED</p>
          <div className="space-y-2.5">
            {[
              { icon: Lock, label: 'SHA-256 hash', desc: 'Unique cryptographic fingerprint' },
              { icon: Fingerprint, label: 'Perceptual hash', desc: 'Survives compression & resize' },
              { icon: FileCheck, label: 'File metadata', desc: 'Name, size, type, timestamp' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <item.icon className="w-3.5 h-3.5 text-ink-faint mt-0.5 shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-[11px] text-ink">{item.label}</p>
                  <p className="text-[10px] text-ink-faint">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* What doesn't get stored — hidden on mobile */}
        <motion.div variants={fade} custom={4} className="hidden md:block mt-4 border border-rule rounded-sm bg-surface p-4">
          <p className="text-[10px] font-mono text-ink-faint tracking-widest mb-3">WHAT STAYS PRIVATE</p>
          <div className="space-y-2">
            {[
              'Original file — never uploaded',
              'Image contents — only hash stored',
              'Location data — stripped before chain',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <Shield className="w-3 h-3 text-verified shrink-0" strokeWidth={1.5} />
                <span className="text-ink-secondary">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fade} custom={5} className="hidden md:block">
          <ScanGraphic variant="register" />
        </motion.div>
      </motion.aside>

      {/* ── Main ── */}
      <div className="min-w-0">
        <AnimatePresence mode="wait">
          {/* Auth gate */}
          {!user && user !== undefined && !file && (
            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="border border-rule rounded-sm bg-surface p-8 md:p-12 text-center">
              <Shield className="w-8 h-8 text-ink-faint mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-[14px] text-ink mb-1">Sign in to register media</p>
              <p className="text-[12px] text-ink-tertiary mb-6 max-w-xs mx-auto">Authentication links registrations to your identity for provenance tracking.</p>
              <button onClick={signInWithGoogle}
                className="bg-white text-void text-[13px] font-medium px-6 py-2.5 rounded-sm hover:bg-ink transition">
                Continue with Google
              </button>
            </motion.div>
          )}

          {/* Upload zone */}
          {(user || user === undefined) && !file && !showCamera && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <UploadZone onFileSelect={handleFile} />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setShowCamera(true)} className="text-[12px] text-ink-faint hover:text-ink-secondary transition">
                    <CameraIcon className="w-3.5 h-3.5 inline mr-1 -mt-px" />capture from camera
                  </button>
                  <button onClick={() => setShowUrlInput(!showUrlInput)} className="text-[12px] text-ink-faint hover:text-ink-secondary transition">
                    <Link2 className="w-3.5 h-3.5 inline mr-1 -mt-px" />register from URL
                  </button>
                </div>
                <span className="text-[11px] text-ink-faint font-mono">max 100MB</span>
              </div>

              {showUrlInput && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border border-rule rounded-sm bg-surface p-4">
                  <p className="text-[11px] font-mono text-ink-faint tracking-widest mb-3">REGISTER IMAGE BY URL</p>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-void border border-rule rounded-sm px-3 py-2">
                      <Link2 className="w-4 h-4 text-ink-faint shrink-0" strokeWidth={1.5} />
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUrlRegister()}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 bg-transparent text-[12px] text-ink font-mono outline-none placeholder:text-ink-faint"
                      />
                    </div>
                    <button onClick={handleUrlRegister} disabled={!urlInput || urlSubmitting}
                      className="flex items-center gap-2 bg-white text-void text-[12px] font-medium px-4 py-2 rounded-sm hover:bg-ink transition disabled:opacity-40">
                      {urlSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Blocks className="w-4 h-4" strokeWidth={1.5} />}
                      Register
                    </button>
                  </div>
                  <p className="text-[10px] text-ink-faint mt-2">Server fetches the image, computes SHA-256, and registers on Ethereum. The Chrome extension will recognize this image on any webpage.</p>
                </motion.div>
              )}

              {/* Feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                {[
                  { icon: Lock, title: 'Client-side hashing', desc: 'SHA-256 + dHash computed in your browser' },
                  { icon: Blocks, title: 'Ethereum settlement', desc: 'Hash permanently recorded on Sepolia' },
                  { icon: Eye, title: 'Forensic analysis', desc: 'ELA and EXIF metadata inspection' },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="border border-rule rounded-sm bg-surface p-4 group hover:border-ink-faint transition"
                  >
                    <f.icon className="w-4 h-4 text-ink-faint mb-2.5 group-hover:text-accent transition-colors" strokeWidth={1.5} />
                    <p className="text-[12px] font-medium text-ink mb-0.5">{f.title}</p>
                    <p className="text-[11px] text-ink-faint leading-relaxed">{f.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Recent activity / trust signals */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="border border-rule rounded-sm bg-surface px-4 md:px-5 py-3 flex flex-wrap items-center gap-3 md:gap-4"
              >
                <Zap className="w-3.5 h-3.5 text-accent shrink-0" strokeWidth={1.5} />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-ink-tertiary">
                  <span>Network: <span className="text-accent">Ethereum Sepolia</span></span>
                  <span className="hidden sm:inline text-ink-faint">·</span>
                  <span>Contract: <span className="text-ink-secondary">active</span></span>
                  <span className="hidden sm:inline text-ink-faint">·</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-verified animate-pulse" />
                    <span className="text-verified">online</span>
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Camera */}
          {showCamera && !file && (
            <motion.div key="cam" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CameraCapture onCapture={handleFile} onClose={() => setShowCamera(false)} />
            </motion.div>
          )}

          {/* Hashing */}
          {hashing && (
            <motion.div key="hash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HashProgress stage={hashStage} />
            </motion.div>
          )}

          {/* File + Results */}
          {file && hashes && !hashing && (
            <motion.div key="result" initial="hidden" animate="show" className="space-y-4">
              {/* File card */}
              <motion.div variants={fade} custom={0} className="border border-rule rounded-sm bg-surface overflow-hidden">
                <div className="px-4 md:px-5 py-3 border-b border-rule-light flex items-center justify-between">
                  <span className="text-[10px] font-mono text-ink-tertiary tracking-widest">FILE ANALYSIS</span>
                  <span className="text-[10px] font-mono text-ink-faint hidden sm:inline">{new Date().toLocaleString()}</span>
                </div>
                <div className="p-4 md:p-5 flex gap-4 md:gap-5">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                    className="w-20 h-20 md:w-32 md:h-32 rounded-sm overflow-hidden bg-void shrink-0 border border-rule">
                    {file.type.startsWith('image/') && preview && <img src={preview} alt="" className="w-full h-full object-cover" />}
                    {file.type.startsWith('video/') && preview && <video src={preview} className="w-full h-full object-cover" controls />}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-ink truncate">{file.name}</p>
                    <p className="text-[11px] text-ink-faint font-mono mt-0.5">
                      {file.type} · {file.size > 1048576 ? (file.size / 1048576).toFixed(2) + ' MB' : (file.size / 1024).toFixed(1) + ' KB'}
                    </p>

                    {/* Hash results */}
                    <div className="mt-3 space-y-2 font-mono text-[10px]">
                      <div className="flex items-start gap-2">
                        <Lock className="w-3 h-3 text-accent mt-0.5 shrink-0" strokeWidth={1.5} />
                        <div className="min-w-0">
                          <span className="text-ink-faint tracking-wider">SHA-256</span>
                          <p className="text-ink text-[11px] truncate mt-px">{hashes.sha256}</p>
                        </div>
                      </div>
                      {hashes.dHash && (
                        <div className="flex items-start gap-2">
                          <Fingerprint className="w-3 h-3 text-accent mt-0.5 shrink-0" strokeWidth={1.5} />
                          <div>
                            <span className="text-ink-faint tracking-wider">PERCEPTUAL</span>
                            <p className="text-ink text-[11px] mt-px">{hashes.dHash}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action bar */}
                {!result && (
                  <div className="border-t border-rule-light px-4 md:px-5 py-3 flex items-center gap-3">
                    <button onClick={handleRegister} disabled={registering}
                      className="flex-1 py-2.5 bg-white text-void text-[13px] font-medium rounded-sm hover:bg-ink transition disabled:opacity-40 flex items-center justify-center gap-2">
                      {registering ? (
                        <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
                          Writing to blockchain...
                        </motion.span>
                      ) : (
                        <>
                          <Blocks className="w-3.5 h-3.5" />
                          Register on Blockchain
                        </>
                      )}
                    </button>
                    <button onClick={reset} className="px-4 py-2.5 border border-rule text-[13px] text-ink-tertiary rounded-sm hover:text-ink hover:border-ink-faint transition">
                      Cancel
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Result */}
              {result && <motion.div variants={fade} custom={1}><ResultCard {...result} /></motion.div>}

              {/* Forensics section */}
              <motion.div variants={fade} custom={2}>
                <div className="flex items-center gap-2 mb-3 mt-6">
                  <Eye className="w-4 h-4 text-ink-faint" strokeWidth={1.5} />
                  <span className="text-[11px] font-mono text-ink-tertiary tracking-widest">FORENSIC ANALYSIS</span>
                </div>
              </motion.div>
              <motion.div variants={fade} custom={3}><AIDetector file={file} exifData={exifData} /></motion.div>
              <motion.div variants={fade} custom={4}><ELAViewer file={file} /></motion.div>
              <motion.div variants={fade} custom={5}><ExifPanel file={file} /></motion.div>

              <motion.button variants={fade} custom={5} onClick={reset} className="flex items-center gap-1.5 text-[12px] text-ink-faint hover:text-ink transition mt-2">
                <ArrowLeft className="w-3 h-3" /> Start over
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 border border-danger/20 bg-danger-glow rounded-sm px-4 py-3 text-[12px] text-danger">{error}</motion.div>}
        </AnimatePresence>
      </div>
    </div>
  );
}
