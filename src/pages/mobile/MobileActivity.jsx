import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Activity, ShieldCheck, Image, Film, File, Globe, Blocks } from 'lucide-react';
import { getActivity } from '../../lib/api';

function timeAgo(ts) {
  const d = Date.now() - ts;
  if (d < 60000) return 'now';
  if (d < 3600000) return `${Math.floor(d / 60000)}m`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h`;
  return `${Math.floor(d / 86400000)}d`;
}

function MimeIcon({ type }) {
  const c = "w-4 h-4 text-ink-faint";
  if (type?.startsWith('image/')) return <Image className={c} strokeWidth={1.5} />;
  if (type?.startsWith('video/')) return <Film className={c} strokeWidth={1.5} />;
  return <File className={c} strokeWidth={1.5} />;
}

export default function MobileActivity() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() { setLoading(true); setError(null); try { setData(await getActivity()); } catch { setError('Server unreachable.'); } setLoading(false); }
  useEffect(() => { load(); }, []);

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-serif text-[26px] text-ink leading-tight tracking-tight">Activity</h1>
          <p className="text-[11px] text-ink-faint font-mono mt-1">Public · anonymized</p>
        </div>
        <button onClick={load} disabled={loading} className="w-9 h-9 flex items-center justify-center rounded-sm border border-rule active:bg-surface-raised transition">
          <RefreshCw className={`w-4 h-4 text-ink-faint ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats — horizontal scroll */}
      {data && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1 scrollbar-none">
          {[
            { icon: Activity, label: 'Records', value: data.totalRegistrations, color: 'text-ink' },
            { icon: Blocks, label: 'Blocks', value: data.chainLength, color: 'text-ink' },
            { icon: ShieldCheck, label: 'Chain', value: data.chainValid ? 'Valid' : '!', color: data.chainValid ? 'text-verified' : 'text-danger' },
            { icon: Globe, label: 'Net', value: data.onChain ? 'Sepolia' : 'Local', color: 'text-accent' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="shrink-0 border border-rule rounded-sm bg-surface px-4 py-3 min-w-[90px]"
            >
              <s.icon className="w-3.5 h-3.5 text-ink-faint mb-1.5" strokeWidth={1.5} />
              <p className={`text-[18px] font-serif ${s.color}`}>{s.value}</p>
              <p className="text-[9px] font-mono text-ink-faint mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Sepolia badge */}
      {data?.onChain && (
        <div className="border border-accent/15 bg-accent-glow rounded-sm px-3 py-2 mb-4 flex items-center justify-between">
          <span className="text-[10px] font-mono text-ink-faint">
            on-chain: <span className="text-accent">{data.onChain.totalRegistered}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-verified animate-pulse" />
            <span className="text-[10px] font-mono text-verified">live</span>
          </span>
        </div>
      )}

      {loading && !data && <p className="text-center text-ink-faint text-[13px] py-12 font-mono">loading...</p>}
      {error && <div className="border border-danger/20 bg-danger-glow rounded-sm px-3 py-2.5 text-[12px] text-danger mb-3">{error}</div>}

      {data && data.activity.length === 0 && (
        <div className="border border-rule rounded-sm bg-surface p-8 text-center">
          <Activity className="w-8 h-8 text-ink-faint mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-[14px] text-ink mb-1">No activity yet</p>
          <p className="text-[12px] text-ink-faint">Registrations will appear here.</p>
        </div>
      )}

      {/* Feed */}
      {data && data.activity.length > 0 && (
        <div className="space-y-1.5">
          {data.activity.map((item, i) => (
            <motion.div
              key={item.hash}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="border border-rule rounded-sm bg-surface p-3 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-sm bg-void border border-rule-light flex items-center justify-center shrink-0">
                <MimeIcon type={item.mimeType} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-mono text-ink-secondary truncate">{item.filename}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono text-ink-faint">{item.mimeType?.split('/')[1]}</span>
                  <span className="text-[7px] text-ink-faint">·</span>
                  <span className="text-[10px] font-mono text-ink-faint">{item.registeredBy}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="w-1 h-1 rounded-full bg-verified" />
                <span className="text-[10px] text-ink-faint font-mono">{timeAgo(item.timestamp)}</span>
              </div>
            </motion.div>
          ))}

          <p className="text-[10px] text-ink-faint text-center mt-3 font-mono">
            names redacted · identities masked
          </p>
        </div>
      )}
    </div>
  );
}
