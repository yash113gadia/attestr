import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Shield, FileText, Image, Film, File, Clock, ChevronRight } from 'lucide-react';
import { getMyMedia, getChain } from '../../lib/api';
import { useAuth } from '../../components/AuthProvider';
import { signInWithGoogle } from '../../lib/firebase';

function MimeIcon({ type }) {
  const c = "w-5 h-5 text-ink-faint";
  if (type?.startsWith('image/')) return <Image className={c} strokeWidth={1.5} />;
  if (type?.startsWith('video/')) return <Film className={c} strokeWidth={1.5} />;
  return <File className={c} strokeWidth={1.5} />;
}

export default function MobileExplorer() {
  const user = useAuth();
  const [media, setMedia] = useState(null);
  const [chainInfo, setChainInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    if (!user?.uid) return; setLoading(true); setError(null);
    try {
      const [m, c] = await Promise.all([getMyMedia(user.uid), getChain()]);
      setMedia(m); setChainInfo(c);
    } catch { setError('Server unreachable.'); }
    setLoading(false);
  }

  useEffect(() => { if (user?.uid) load(); }, [user]);

  if (user === undefined) return null;

  if (!user) {
    return (
      <div className="pt-8">
        <div className="border border-rule rounded-sm bg-surface overflow-hidden">
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-raised flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-ink-faint" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] text-ink font-medium mb-1">Sign in</p>
            <p className="text-[12px] text-ink-tertiary mb-5">View files registered under your account.</p>
          </div>
          <div className="px-4 pb-4">
            <button onClick={signInWithGoogle}
              className="w-full bg-white text-void text-[14px] font-medium py-3.5 rounded-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-serif text-[26px] text-ink leading-tight tracking-tight">My Media</h1>
          <p className="text-[11px] text-ink-faint font-mono mt-1">{user.displayName}</p>
        </div>
        <button onClick={load} disabled={loading} className="w-9 h-9 flex items-center justify-center rounded-sm border border-rule active:bg-surface-raised transition">
          <RefreshCw className={`w-4 h-4 text-ink-faint ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      {media && chainInfo && (
        <div className="grid grid-cols-3 gap-px bg-rule rounded-sm overflow-hidden mb-5">
          <div className="bg-surface px-3 py-3 text-center">
            <p className="text-[20px] font-serif text-ink">{media.count}</p>
            <p className="text-[9px] font-mono text-ink-faint mt-0.5">YOUR FILES</p>
          </div>
          <div className="bg-surface px-3 py-3 text-center">
            <p className="text-[20px] font-serif text-ink">{chainInfo.length - 1}</p>
            <p className="text-[9px] font-mono text-ink-faint mt-0.5">ON CHAIN</p>
          </div>
          <div className="bg-surface px-3 py-3 text-center">
            <p className={`text-[20px] font-serif ${chainInfo.valid ? 'text-verified' : 'text-danger'}`}>
              {chainInfo.valid ? '✓' : '!'}
            </p>
            <p className="text-[9px] font-mono text-ink-faint mt-0.5">INTEGRITY</p>
          </div>
        </div>
      )}

      {loading && <p className="text-center text-ink-faint text-[13px] py-12 font-mono">loading...</p>}
      {error && <div className="border border-danger/20 bg-danger-glow rounded-sm px-3 py-2.5 text-[12px] text-danger mb-3">{error}</div>}

      {media && media.count === 0 && !loading && (
        <div className="border border-rule rounded-sm bg-surface p-8 text-center">
          <FileText className="w-8 h-8 text-ink-faint mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-[14px] text-ink mb-1">No files yet</p>
          <p className="text-[12px] text-ink-faint">Register your first media to see it here.</p>
        </div>
      )}

      {/* File cards */}
      {media && media.blocks.length > 0 && (
        <div className="space-y-2">
          {media.blocks.map((block, i) => (
            <motion.div
              key={block.hash}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="border border-rule rounded-sm bg-surface p-3.5 flex items-center gap-3 active:bg-surface-raised transition"
            >
              <div className="w-11 h-11 rounded-sm bg-void border border-rule-light flex items-center justify-center shrink-0">
                <MimeIcon type={block.data.mimeType} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-ink font-medium truncate">{block.data.filename}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-mono text-ink-faint">{block.data.mimeType?.split('/')[1]}</span>
                  <span className="text-[8px] text-ink-faint">·</span>
                  <span className="text-[10px] font-mono text-ink-faint">
                    {block.data.fileSize > 1048576 ? (block.data.fileSize / 1048576).toFixed(1) + 'MB' : (block.data.fileSize / 1024).toFixed(0) + 'KB'}
                  </span>
                  <span className="text-[8px] text-ink-faint">·</span>
                  <span className="text-[10px] text-ink-faint">{new Date(block.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-ink-faint shrink-0">#{block.index}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
