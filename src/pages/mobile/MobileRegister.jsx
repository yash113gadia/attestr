import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera as CameraIcon, ArrowLeft, Shield, Lock, Fingerprint, Blocks, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import UploadZone from '../../components/UploadZone';
import CameraCapture from '../../components/CameraCapture';
import HashProgress from '../../components/HashProgress';
import ResultCard from '../../components/ResultCard';
import ELAViewer from '../../components/ELAViewer';
import ExifPanel from '../../components/ExifPanel';
import AIDetector from '../../components/AIDetector';
import { hashFile } from '../../lib/hash';
import { extractExif } from '../../lib/exif';
import { registerMedia } from '../../lib/api';
import { useAuth } from '../../components/AuthProvider';
import { signInWithGoogle } from '../../lib/firebase';

const slide = { hidden: { opacity: 0, y: 12 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.25 } }) };

export default function MobileRegister() {
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
  const [showHashes, setShowHashes] = useState(false);
  const [showForensics, setShowForensics] = useState(false);

  function cleanupPreview() { if (previewRef.current) { URL.revokeObjectURL(previewRef.current); previewRef.current = null; } }

  async function handleFile(f) {
    cleanupPreview(); setFile(f); setResult(null); setError(null); setShowCamera(false); setShowForensics(false);
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
      else setResult({ status: 'registered', message: `Recorded on blockchain.${r.onChain?.transactionHash ? ' Confirmed on Sepolia.' : ''}`, block: r.block, onChain: r.onChain });
    } catch { setError('Server unreachable.'); }
    setRegistering(false);
  }

  function reset() { cleanupPreview(); setFile(null); setPreview(null); setHashes(null); setResult(null); setError(null); setExifData(null); setShowHashes(false); setShowForensics(false); }

  return (
    <div className="pb-6">
      {/* Header — left-aligned, compact */}
      <div className="mb-5">
        <h1 className="font-serif text-[26px] text-ink leading-tight tracking-tight">Register</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="w-1 h-1 rounded-full bg-verified animate-pulse" />
          <span className="text-[11px] font-mono text-ink-faint">Ethereum Sepolia · client-side hashing</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Auth */}
        {!user && user !== undefined && !file && (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="border border-rule rounded-sm bg-surface overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-surface-raised flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-ink-faint" strokeWidth={1.5} />
              </div>
              <p className="text-[15px] text-ink mb-1 font-medium">Sign in to register</p>
              <p className="text-[12px] text-ink-tertiary mb-5 max-w-[240px] mx-auto">Registrations are linked to your identity for provenance.</p>
            </div>
            <div className="px-4 pb-4">
              <button onClick={signInWithGoogle}
                className="w-full bg-white text-void text-[14px] font-medium py-3.5 rounded-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
            </div>
          </motion.div>
        )}

        {/* Upload */}
        {(user || user === undefined) && !file && !showCamera && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <UploadZone onFileSelect={handleFile} />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowCamera(true)}
                className="py-3 border border-rule rounded-sm text-[13px] text-ink-secondary active:bg-surface transition flex items-center justify-center gap-2">
                <CameraIcon className="w-4 h-4" /> Camera
              </button>
              <div className="py-3 border border-rule-light rounded-sm text-[13px] text-ink-faint text-center font-mono">
                max 100MB
              </div>
            </div>
          </motion.div>
        )}

        {showCamera && !file && (
          <motion.div key="cam" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CameraCapture onCapture={handleFile} onClose={() => setShowCamera(false)} />
          </motion.div>
        )}

        {hashing && (
          <motion.div key="hash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HashProgress stage={hashStage} />
          </motion.div>
        )}

        {/* Results */}
        {file && hashes && !hashing && (
          <motion.div key="result" initial="hidden" animate="show" className="space-y-3">
            {/* File card */}
            <motion.div variants={slide} custom={0} className="border border-rule rounded-sm bg-surface overflow-hidden">
              {/* Preview row */}
              <div className="p-3 flex gap-3 items-center">
                {preview && (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-14 h-14 rounded-sm overflow-hidden bg-void shrink-0 border border-rule">
                    {file.type.startsWith('image/') && <img src={preview} alt="" className="w-full h-full object-cover" />}
                    {file.type.startsWith('video/') && <video src={preview} className="w-full h-full object-cover" />}
                  </motion.div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-ink truncate">{file.name}</p>
                  <p className="text-[11px] text-ink-faint font-mono mt-0.5">
                    {file.type.split('/')[1]} · {file.size > 1048576 ? (file.size / 1048576).toFixed(1) + 'MB' : (file.size / 1024).toFixed(0) + 'KB'}
                  </p>
                </div>
              </div>

              {/* Hash accordion */}
              <button onClick={() => setShowHashes(!showHashes)}
                className="w-full px-3 py-2.5 border-t border-rule-light flex items-center justify-between active:bg-surface-raised transition">
                <span className="flex items-center gap-2 text-[11px] font-mono text-ink-faint">
                  <Lock className="w-3 h-3" strokeWidth={1.5} /> Fingerprints
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-ink-faint transition-transform duration-200 ${showHashes ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showHashes && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-rule-light">
                    <div className="p-3 bg-void space-y-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Lock className="w-2.5 h-2.5 text-accent" strokeWidth={2} />
                          <span className="text-[9px] text-ink-faint tracking-[0.15em]">SHA-256</span>
                        </div>
                        <p className="text-[10px] font-mono text-ink-secondary break-all leading-relaxed">{hashes.sha256}</p>
                      </div>
                      {hashes.dHash && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Fingerprint className="w-2.5 h-2.5 text-accent" strokeWidth={2} />
                            <span className="text-[9px] text-ink-faint tracking-[0.15em]">PERCEPTUAL</span>
                          </div>
                          <p className="text-[10px] font-mono text-ink-secondary break-all leading-relaxed">{hashes.dHash}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Register button */}
              {!result && (
                <div className="p-3 border-t border-rule-light">
                  <button onClick={handleRegister} disabled={registering}
                    className="w-full py-3.5 bg-white text-void text-[14px] font-medium rounded-sm active:scale-[0.98] transition-transform disabled:opacity-40 flex items-center justify-center gap-2">
                    {registering ? (
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-[13px]">
                        Writing to blockchain...
                      </motion.span>
                    ) : (
                      <><Blocks className="w-4 h-4" /> Register</>
                    )}
                  </button>
                </div>
              )}
            </motion.div>

            {/* Result */}
            {result && <motion.div variants={slide} custom={1}><ResultCard {...result} /></motion.div>}

            {/* Forensics — expandable section */}
            <motion.div variants={slide} custom={2}>
              <button onClick={() => setShowForensics(!showForensics)}
                className="w-full border border-rule rounded-sm bg-surface px-4 py-3.5 flex items-center justify-between active:bg-surface-raised transition">
                <span className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-ink-faint" strokeWidth={1.5} />
                  <span className="text-[13px] text-ink">Forensic Analysis</span>
                </span>
                <ChevronRight className={`w-4 h-4 text-ink-faint transition-transform duration-200 ${showForensics ? 'rotate-90' : ''}`} />
              </button>
            </motion.div>

            <AnimatePresence>
              {showForensics && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 overflow-hidden">
                  <AIDetector file={file} exifData={exifData} />
                  <ELAViewer file={file} />
                  <ExifPanel file={file} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reset */}
            <motion.button variants={slide} custom={3} onClick={reset}
              className="w-full py-3.5 border border-rule rounded-sm text-[13px] text-ink-faint active:bg-surface transition flex items-center justify-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Start Over
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 border border-danger/20 bg-danger-glow rounded-sm px-4 py-3 text-[12px] text-danger">{error}</motion.div>}
      </AnimatePresence>
    </div>
  );
}
