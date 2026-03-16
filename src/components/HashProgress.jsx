import { motion } from 'framer-motion';

export default function HashProgress({ stage }) {
  const steps = [
    { key: 'sha256', label: 'SHA-256 cryptographic hash' },
    { key: 'dhash', label: 'Perceptual fingerprint (dHash)' },
  ];
  const idx = steps.findIndex((s) => s.key === stage);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-rule rounded-sm bg-surface p-6">
      <div className="flex items-center gap-3 mb-5">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-accent" />
        <p className="text-[13px] text-ink">Computing fingerprints</p>
        <p className="text-[11px] text-ink-faint font-mono ml-auto">local only</p>
      </div>
      {steps.map((s, i) => {
        const active = s.key === stage, done = idx > i || stage === null;
        return (
          <div key={s.key} className="flex items-center gap-3 py-2.5 border-t border-rule-light">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono border ${
              done ? 'bg-verified-glow border-verified/30 text-verified' : active ? 'bg-accent-glow border-accent/30 text-accent' : 'border-rule text-ink-faint'
            }`}>{done ? '✓' : i + 1}</span>
            <span className={`text-[12px] font-mono ${active ? 'text-ink' : done ? 'text-verified' : 'text-ink-tertiary'}`}>{s.label}</span>
            {active && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-[11px] text-accent font-mono ml-auto">processing</motion.span>}
            {done && <span className="text-[11px] text-verified font-mono ml-auto">done</span>}
          </div>
        );
      })}
    </motion.div>
  );
}
