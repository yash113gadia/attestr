import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Activity, Blocks, ShieldCheck, Clock, Globe, TrendingUp, Users, Image, Film, File, Lock } from 'lucide-react';
import { getActivity } from '../lib/api';

const fade = { hidden: { opacity: 0, y: 10 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }) };

function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function MimeIcon({ type }) {
  const cls = "w-3.5 h-3.5 text-ink-faint";
  if (type?.startsWith('image/')) return <Image className={cls} strokeWidth={1.5} />;
  if (type?.startsWith('video/')) return <Film className={cls} strokeWidth={1.5} />;
  return <File className={cls} strokeWidth={1.5} />;
}

export default function ActivityPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() { setLoading(true); setError(null); try { setData(await getActivity()); } catch { setError('Server unreachable.'); } setLoading(false); }
  useEffect(() => { load(); }, []);

  return (
    <div>
      <motion.div initial="hidden" animate="show" className="flex items-start justify-between mb-6 md:mb-8">
        <motion.div variants={fade} custom={0}>
          <h1 className="font-serif text-[28px] md:text-[32px] text-ink leading-none tracking-tight">Activity</h1>
          <p className="text-[13px] text-ink-tertiary mt-2">Public ledger. Filenames and identities are anonymized.</p>
        </motion.div>
        <motion.button variants={fade} custom={1} onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-ink-faint border border-rule rounded-sm hover:text-ink-secondary transition">
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </motion.button>
      </motion.div>

      {/* Stats */}
      {data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6 md:mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-rule rounded-sm overflow-hidden">
            <div className="bg-surface px-4 md:px-5 py-4 md:py-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                <p className="text-[9px] md:text-[10px] font-mono text-ink-faint tracking-widest">TOTAL REGISTRATIONS</p>
              </div>
              <p className="text-[24px] md:text-[30px] font-serif text-ink">{data.totalRegistrations}</p>
            </div>
            <div className="bg-surface px-4 md:px-5 py-4 md:py-5">
              <div className="flex items-center gap-2 mb-2">
                <Blocks className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                <p className="text-[9px] md:text-[10px] font-mono text-ink-faint tracking-widest">BLOCKCHAIN BLOCKS</p>
              </div>
              <p className="text-[24px] md:text-[30px] font-serif text-ink">{data.chainLength}</p>
            </div>
            <div className="bg-surface px-4 md:px-5 py-4 md:py-5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-verified" strokeWidth={1.5} />
                <p className="text-[9px] md:text-[10px] font-mono text-ink-faint tracking-widest">CHAIN INTEGRITY</p>
              </div>
              <p className={`text-[24px] md:text-[30px] font-serif ${data.chainValid ? 'text-verified' : 'text-danger'}`}>
                {data.chainValid ? 'Valid' : 'Broken'}
              </p>
            </div>
            <div className="bg-surface px-4 md:px-5 py-4 md:py-5">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                <p className="text-[9px] md:text-[10px] font-mono text-ink-faint tracking-widest">NETWORK</p>
              </div>
              <p className="text-[14px] md:text-[16px] font-serif text-ink mt-1 md:mt-2">
                {data.onChain ? 'Ethereum Sepolia' : 'Local Ledger'}
              </p>
            </div>
          </div>

          {data.onChain && (
            <div className="mt-3 border border-accent/15 bg-accent-glow rounded-sm px-4 md:px-5 py-3 flex items-center gap-4 md:gap-6 text-[11px] font-mono flex-wrap">
              <span><span className="text-ink-faint">contract </span><span className="text-ink-secondary hidden sm:inline">{data.onChain.contractAddress?.substring(0, 22)}...</span><span className="text-ink-secondary sm:hidden">{data.onChain.contractAddress?.substring(0, 10)}...</span></span>
              <span><span className="text-ink-faint">on-chain records </span><span className="text-accent font-medium">{data.onChain.totalRegistered}</span></span>
              <span className="flex items-center gap-1.5 sm:ml-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-verified animate-pulse" />
                <span className="text-verified">live</span>
              </span>
            </div>
          )}
        </motion.div>
      )}

      {loading && !data && <p className="text-center text-ink-faint text-[13px] py-16 font-mono">loading activity...</p>}
      {error && <div className="border border-danger/20 bg-danger-glow rounded-sm px-4 py-3 text-[12px] text-danger mb-6">{error}</div>}

      {/* Empty state */}
      {data && data.activity.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-rule rounded-sm bg-surface p-8 md:p-12 text-center">
          <Activity className="w-8 h-8 text-ink-faint mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-[13px] text-ink-secondary">No registrations yet</p>
          <p className="text-[12px] text-ink-faint mt-1">Activity will appear here as users register media.</p>
        </motion.div>
      )}

      {/* Feed */}
      {data && data.activity.length > 0 && (
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-ink-faint" strokeWidth={1.5} />
            <span className="text-[11px] font-mono text-ink-tertiary tracking-widest">RECENT REGISTRATIONS</span>
            <div className="hidden sm:flex items-center gap-1.5 ml-auto">
              <Lock className="w-3 h-3 text-ink-faint" strokeWidth={1.5} />
              <span className="text-[10px] font-mono text-ink-faint">names & identities redacted</span>
            </div>
          </div>

          <div className="border border-rule rounded-sm bg-surface overflow-hidden overflow-x-auto -mx-4 md:mx-0">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-[28px_1fr_90px_70px_90px_110px] gap-3 px-5 py-2.5 text-[10px] font-mono text-ink-faint tracking-widest border-b border-rule bg-surface-raised">
                <span></span>
                <span>FILE</span>
                <span>FORMAT</span>
                <span>SIZE</span>
                <span>USER</span>
                <span className="text-right">TIME</span>
              </div>

              {data.activity.map((item, i) => (
                <motion.div
                  key={item.hash}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="grid grid-cols-[28px_1fr_90px_70px_90px_110px] gap-3 px-5 py-3 border-b border-rule-light last:border-0 hover:bg-surface-hover transition-colors"
                >
                  <div className="self-center flex items-center justify-center">
                    <MimeIcon type={item.mimeType} />
                  </div>
                  <div className="self-center min-w-0">
                    <p className="text-[12px] text-ink-tertiary font-mono truncate">{item.filename}</p>
                  </div>
                  <span className="text-[11px] text-ink-tertiary font-mono self-center">{item.mimeType?.split('/')[1]}</span>
                  <span className="text-[11px] text-ink-tertiary font-mono self-center">
                    {item.fileSize > 1048576 ? (item.fileSize / 1048576).toFixed(1) + 'M' : (item.fileSize / 1024).toFixed(0) + 'K'}
                  </span>
                  <span className="text-[11px] text-ink-faint font-mono self-center">{item.registeredBy}</span>
                  <div className="flex items-center justify-end gap-1.5 self-center">
                    <span className="w-1 h-1 rounded-full bg-verified" />
                    <span className="text-[11px] text-ink-tertiary">{timeAgo(item.timestamp)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-[11px] text-ink-faint">
            <Users className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
            <span>All filenames are masked and user identities partially redacted. Only the registrant can view their full records in My Media.</span>
          </div>
        </div>
      )}
    </div>
  );
}
