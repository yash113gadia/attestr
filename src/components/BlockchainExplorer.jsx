import { motion } from 'framer-motion';

export default function BlockchainExplorer({ chain }) {
  if (!chain?.length) return <p className="text-center text-ink-faint text-[13px] py-12 font-mono">empty chain</p>;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-0 min-w-max">
        {chain.map((block, i) => (
          <div key={block.hash} className="flex items-start">
            {i > 0 && (
              <div className="flex items-center h-full pt-6 px-0.5">
                <div className="w-4 h-px bg-rule" />
                <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[4px] border-l-rule" />
              </div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`w-52 border border-rule rounded-sm bg-surface p-3 shrink-0 ${i === 0 ? 'border-l-2 border-l-accent' : ''}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-semibold text-ink tracking-wider">#{block.index}</span>
                {i === 0 && <span className="text-[9px] font-mono text-accent">GENESIS</span>}
              </div>
              <div className="space-y-0.5 text-[10px] font-mono text-ink-tertiary">
                <p><span className="text-ink-faint">hash </span><span className="text-ink-secondary">{block.hash.substring(0, 18)}...</span></p>
                <p><span className="text-ink-faint">prev </span><span className="text-ink-secondary">{block.previousHash.substring(0, 18)}...</span></p>
                <p><span className="text-ink-faint">nonce </span><span className="text-ink-secondary">{block.nonce}</span></p>
                <p className="text-ink-faint pt-1">{new Date(block.timestamp).toLocaleString()}</p>
                {block.data?.filename && !block.data?.message && (
                  <p className="pt-1 mt-1 border-t border-rule-light text-ink-secondary">{block.data.filename}</p>
                )}
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
