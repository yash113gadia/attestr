import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Fingerprint, Eye, ChevronRight } from 'lucide-react';
import UploadZone from '../../components/UploadZone';
import HashProgress from '../../components/HashProgress';
import ResultCard from '../../components/ResultCard';
import CompareView from '../../components/CompareView';
import ELAViewer from '../../components/ELAViewer';
import ExifPanel from '../../components/ExifPanel';
import AIDetector from '../../components/AIDetector';
import { hashFile } from '../../lib/hash';
import { extractExif } from '../../lib/exif';
import { verifyMedia } from '../../lib/api';

const slide = { hidden: { opacity: 0, y: 12 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.25 } }) };

export default function MobileVerify() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const previewRef = useRef(null);
  const [hashing, setHashing] = useState(false);
  const [hashStage, setHashStage] = useState(null);
  const [hashes, setHashes] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [exifData, setExifData] = useState(null);
  const [showForensics, setShowForensics] = useState(false);

  function cleanupPreview() { if (previewRef.current) { URL.revokeObjectURL(previewRef.current); previewRef.current = null; } }

  async function handleFile(f) {
    cleanupPreview(); setFile(f); setResult(null); setError(null); setShowForensics(false);
    if (f.type.startsWith('image/') || f.type.startsWith('video/')) { const u = URL.createObjectURL(f); setPreview(u); previewRef.current = u; }
    setHashing(true); setHashStage('sha256');
    try {
      const [h, exif] = await Promise.all([hashFile(f), extractExif(f)]);
      setHashes(h); setExifData(exif); setHashStage(null); setHashing(false);
      f._sha256 = h.sha256; setResult(await verifyMedia({ sha256: h.sha256, dHash: h.dHash }));
    } catch { setError('Server unreachable.'); setHashing(false); }
  }

  function reset() { cleanupPreview(); setFile(null); setPreview(null); setHashes(null); setResult(null); setError(null); setExifData(null); setShowForensics(false); }

  return (
    <div className="pb-6">
      <div className="mb-5">
        <h1 className="font-serif text-[26px] text-ink leading-tight tracking-tight">Verify</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[11px] font-mono text-ink-faint">No sign-in required · instant results</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!file && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <UploadZone onFileSelect={handleFile} />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['Instant lookup', 'Fuzzy match', 'AI detection'].map((t) => (
                <span key={t} className="text-[10px] font-mono text-ink-faint border border-rule-light px-2.5 py-1.5 rounded-full shrink-0">{t}</span>
              ))}
            </div>
          </motion.div>
        )}

        {hashing && (
          <motion.div key="hash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HashProgress stage={hashStage} />
          </motion.div>
        )}

        {file && result && (
          <motion.div key="result" initial="hidden" animate="show" className="space-y-3">
            {/* File info */}
            <motion.div variants={slide} custom={0} className="border border-rule rounded-sm bg-surface p-3 flex gap-3 items-center">
              {preview && (
                <div className="w-12 h-12 rounded-sm overflow-hidden bg-void shrink-0 border border-rule">
                  {file.type.startsWith('image/') && <img src={preview} alt="" className="w-full h-full object-cover" />}
                  {file.type.startsWith('video/') && <video src={preview} className="w-full h-full object-cover" />}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-ink truncate">{file.name}</p>
                <p className="text-[10px] font-mono text-ink-faint mt-0.5 truncate">{hashes?.sha256?.substring(0, 32)}...</p>
              </div>
            </motion.div>

            {/* Verdict */}
            <motion.div variants={slide} custom={1}><ResultCard {...result} /></motion.div>

            {result.block && <motion.div variants={slide} custom={2}><CompareView currentFile={file} block={result.block} /></motion.div>}

            {/* Forensics — collapsed */}
            <motion.div variants={slide} custom={3}>
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

            <motion.button variants={slide} custom={4} onClick={reset}
              className="w-full py-3.5 border border-rule rounded-sm text-[13px] text-ink-faint active:bg-surface transition flex items-center justify-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Verify Another
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
