import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const cfg = {
  verified:   { label: 'VERIFIED',      dot: 'bg-verified', bg: 'bg-verified-glow', text: 'text-verified' },
  similar:    { label: 'SIMILAR MATCH', dot: 'bg-caution',  bg: 'bg-caution-glow',  text: 'text-caution' },
  unverified: { label: 'NOT FOUND',    dot: 'bg-danger',   bg: 'bg-danger-glow',   text: 'text-danger' },
  registered: { label: 'REGISTERED',   dot: 'bg-verified', bg: 'bg-verified-glow', text: 'text-verified' },
};

export default function ResultCard({ status, message, block, similarity, onChain }) {
  const c = cfg[status] || cfg.unverified;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border border-rule rounded-sm overflow-hidden">
      <div className={`${c.bg} px-5 py-3 flex items-center gap-3`}>
        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
        <span className={`text-[11px] font-mono font-semibold tracking-wider ${c.text}`}>{c.label}</span>
        {similarity != null && similarity !== 100 && <span className="text-[11px] font-mono text-ink-tertiary ml-auto">{similarity}%</span>}
        {onChain?.transactionHash && <span className="text-[10px] font-mono text-accent bg-accent-glow px-2 py-0.5 rounded-sm ml-auto">SEPOLIA</span>}
      </div>
      <div className="bg-surface px-5 py-4">
        <p className="text-[13px] text-ink-secondary leading-relaxed">{message}</p>
        {onChain?.transactionHash && (
          <div className="mt-4 pt-3 border-t border-rule-light font-mono text-[11px] space-y-1">
            <div className="flex"><span className="text-ink-faint w-12">tx</span><span className="text-ink truncate">{onChain.transactionHash}</span></div>
            <div className="flex"><span className="text-ink-faint w-12">block</span><span className="text-ink">#{onChain.blockNumber}</span></div>
            {onChain.gasUsed && <div className="flex"><span className="text-ink-faint w-12">gas</span><span className="text-ink">{Number(onChain.gasUsed).toLocaleString()}</span></div>}
            <a href={onChain.etherscanUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline mt-1">
              Etherscan <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
        {onChain?.verified && !onChain.transactionHash && (
          <div className="mt-4 pt-3 border-t border-rule-light font-mono text-[11px] space-y-1">
            <div className="flex"><span className="text-ink-faint w-16">address</span><span className="text-ink truncate">{onChain.registeredBy}</span></div>
            <div className="flex"><span className="text-ink-faint w-16">block</span><span className="text-ink">#{onChain.blockNumber}</span></div>
            <div className="flex"><span className="text-ink-faint w-16">time</span><span className="text-ink">{new Date(onChain.timestamp * 1000).toLocaleString()}</span></div>
          </div>
        )}
        {block && (
          <div className="mt-4 pt-3 border-t border-rule-light font-mono text-[11px] space-y-1">
            <div className="flex"><span className="text-ink-faint w-12">block</span><span className="text-ink">#{block.index}</span></div>
            <div className="flex"><span className="text-ink-faint w-12">hash</span><span className="text-ink truncate">{block.hash}</span></div>
            <div className="flex"><span className="text-ink-faint w-12">time</span><span className="text-ink">{new Date(block.timestamp).toLocaleString()}</span></div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
