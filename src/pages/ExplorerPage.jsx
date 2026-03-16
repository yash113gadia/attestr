import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Shield, FileText, Clock, Hash, Lock, ExternalLink } from 'lucide-react';
import { getMyMedia, getChain } from '../lib/api';
import { useAuth } from '../components/AuthProvider';
import { signInWithGoogle } from '../lib/firebase';

const fade = { hidden: { opacity: 0, y: 10 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }) };

export default function ExplorerPage() {
  const user = useAuth();
  const [media, setMedia] = useState(null);
  const [chainInfo, setChainInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    if (!user?.uid) return;
    setLoading(true); setError(null);
    try {
      const [m, c] = await Promise.all([getMyMedia(user.uid), getChain()]);
      setMedia(m);
      setChainInfo(c);
    } catch { setError('Server unreachable.'); }
    setLoading(false);
  }

  useEffect(() => { if (user?.uid) load(); }, [user]);

  // Auth gate
  if (user === undefined) return null;
  if (!user) {
    return (
      <div className="max-w-lg mx-auto mt-12 md:mt-20">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-rule rounded-sm bg-surface p-8 md:p-12 text-center">
          <Shield className="w-8 h-8 text-ink-faint mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-[14px] text-ink mb-1">Sign in to view your media</p>
          <p className="text-[12px] text-ink-tertiary mb-6">The Explorer shows media registered under your account.</p>
          <button onClick={signInWithGoogle} className="bg-white text-void text-[13px] font-medium px-6 py-2.5 rounded-sm hover:bg-ink transition">
            Continue with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <motion.div initial="hidden" animate="show" className="flex items-start justify-between mb-6 md:mb-8">
        <motion.div variants={fade} custom={0}>
          <h1 className="font-serif text-[28px] md:text-[32px] text-ink leading-none tracking-tight">My Media</h1>
          <p className="text-[13px] text-ink-tertiary mt-2">Files registered under your account.</p>
        </motion.div>
        <motion.button variants={fade} custom={1} onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-ink-faint border border-rule rounded-sm hover:text-ink-secondary transition">
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </motion.button>
      </motion.div>

      {/* Stats */}
      {media && chainInfo && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6 md:mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-rule rounded-sm overflow-hidden">
            <div className="bg-surface px-4 md:px-5 py-3 md:py-4">
              <p className="text-[10px] font-mono text-ink-faint tracking-widest mb-1">YOUR MEDIA</p>
              <p className="text-[22px] md:text-[26px] font-serif text-ink">{media.count}</p>
            </div>
            <div className="bg-surface px-4 md:px-5 py-3 md:py-4">
              <p className="text-[10px] font-mono text-ink-faint tracking-widest mb-1">TOTAL ON CHAIN</p>
              <p className="text-[22px] md:text-[26px] font-serif text-ink">{chainInfo.length - 1}</p>
            </div>
            <div className="bg-surface px-4 md:px-5 py-3 md:py-4">
              <p className="text-[10px] font-mono text-ink-faint tracking-widest mb-1">CHAIN INTEGRITY</p>
              <p className={`text-[22px] md:text-[26px] font-serif ${chainInfo.valid ? 'text-verified' : 'text-danger'}`}>{chainInfo.valid ? 'Valid' : 'Broken'}</p>
            </div>
            <div className="bg-surface px-4 md:px-5 py-3 md:py-4">
              <p className="text-[10px] font-mono text-ink-faint tracking-widest mb-1">ACCOUNT</p>
              <p className="text-[13px] md:text-[14px] text-ink mt-1 truncate">{user.displayName}</p>
            </div>
          </div>

          {chainInfo.onChain && (
            <div className="mt-3 border border-accent/15 bg-accent-glow rounded-sm px-4 md:px-5 py-3 flex items-center gap-4 md:gap-6 text-[11px] font-mono flex-wrap">
              <span><span className="text-ink-faint">network </span><span className="text-accent">Sepolia</span></span>
              <span className="hidden sm:inline"><span className="text-ink-faint">contract </span><span className="text-ink-secondary">{chainInfo.onChain.contractAddress?.substring(0, 22)}...</span></span>
              <span><span className="text-ink-faint">on-chain </span><span className="text-ink">{chainInfo.onChain.totalRegistered}</span></span>
              <span className="sm:ml-auto"><span className="text-ink-faint">balance </span><span className="text-ink">{Number(chainInfo.onChain.walletBalance).toFixed(4)} ETH</span></span>
            </div>
          )}
        </motion.div>
      )}

      {loading && <p className="text-center text-ink-faint text-[13px] py-16 font-mono">loading...</p>}
      {error && <div className="border border-danger/20 bg-danger-glow rounded-sm px-4 py-3 text-[12px] text-danger mb-6">{error}</div>}

      {/* Media list */}
      {media && media.count === 0 && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-rule rounded-sm bg-surface p-8 md:p-12 text-center">
          <FileText className="w-8 h-8 text-ink-faint mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-[13px] text-ink-secondary mb-1">No media registered yet</p>
          <p className="text-[12px] text-ink-faint">Go to the Register page to add your first file.</p>
        </motion.div>
      )}

      {media && media.blocks.length > 0 && (
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="min-w-[640px]">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_140px_100px_80px_180px] gap-4 px-5 py-2 text-[10px] font-mono text-ink-faint tracking-widest border-b border-rule">
              <span>FILE</span>
              <span>TYPE</span>
              <span>SIZE</span>
              <span>BLOCK</span>
              <span>REGISTERED</span>
            </div>

            {media.blocks.map((block, i) => (
              <motion.div
                key={block.hash}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-[1fr_140px_100px_80px_180px] gap-4 px-5 py-3 border-b border-rule-light hover:bg-surface-raised transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-ink-faint shrink-0" strokeWidth={1.5} />
                  <span className="text-[13px] text-ink truncate">{block.data.filename}</span>
                </div>
                <span className="text-[12px] text-ink-tertiary font-mono self-center">{block.data.mimeType}</span>
                <span className="text-[12px] text-ink-tertiary font-mono self-center">
                  {block.data.fileSize > 1048576 ? (block.data.fileSize / 1048576).toFixed(1) + ' MB' : (block.data.fileSize / 1024).toFixed(1) + ' KB'}
                </span>
                <span className="text-[12px] text-ink-tertiary font-mono self-center">#{block.index}</span>
                <div className="flex items-center gap-2 self-center">
                  <Clock className="w-3 h-3 text-ink-faint" />
                  <span className="text-[12px] text-ink-tertiary">{new Date(block.timestamp).toLocaleDateString()} {new Date(block.timestamp).toLocaleTimeString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
