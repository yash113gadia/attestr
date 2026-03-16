import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Fingerprint, Blocks, Search, ShieldCheck, Camera, Shield } from 'lucide-react';
import Logo from '../../components/Logo';

const fade = (d) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { delay: d, duration: 0.5 } } });

export default function MobileLanding() {
  return (
    <div className="bg-void text-ink min-h-[100dvh] flex flex-col">
      {/* Nav */}
      <nav className="px-5 pt-[env(safe-area-inset-top)] border-b border-rule/30">
        <div className="h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={16} />
            <span className="font-serif text-[14px] text-ink">Attestr</span>
          </div>
          <Link to="/register" className="text-[11px] text-accent font-mono tracking-wider">
            LAUNCH
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col justify-center px-6 py-12">
        <motion.div {...fade(0)}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-accent" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-mono text-ink-faint tracking-[0.2em] uppercase">Blockchain verified</span>
          </div>
        </motion.div>

        <motion.h1 {...fade(0.1)} className="font-serif text-[44px] leading-[0.92] tracking-tight mb-5">
          Prove<br />what's<br />real.
        </motion.h1>

        <motion.p {...fade(0.2)} className="text-[15px] text-ink-secondary leading-relaxed mb-8 max-w-[280px]">
          Immutable cryptographic fingerprints. Recorded on Ethereum. Detect tampering instantly.
        </motion.p>

        <motion.div {...fade(0.3)} className="space-y-3 mb-10">
          <Link to="/register" className="flex items-center justify-center gap-2.5 bg-white text-void text-[15px] font-medium py-4 rounded-sm w-full active:scale-[0.98] transition-transform">
            Register Media <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/verify" className="flex items-center justify-center text-ink-secondary text-[15px] font-medium py-4 border border-rule rounded-sm w-full active:bg-surface-raised transition">
            Verify a File
          </Link>
        </motion.div>

        <motion.div {...fade(0.4)} className="flex flex-wrap gap-2">
          {['Client-side', 'Ethereum', 'Zero upload'].map((t) => (
            <span key={t} className="text-[10px] font-mono text-ink-faint border border-rule-light px-2.5 py-1 rounded-full">{t}</span>
          ))}
        </motion.div>
      </section>

      {/* Stats strip */}
      <section className="border-t border-rule grid grid-cols-3 divide-x divide-rule">
        {[
          { n: '96%', l: 'AI fakes' },
          { n: '<1s', l: 'Verify' },
          { n: '$0', l: 'To fake' },
        ].map((s) => (
          <div key={s.n} className="py-5 text-center">
            <p className="font-serif text-[22px] text-ink">{s.n}</p>
            <p className="text-[10px] text-ink-faint mt-0.5">{s.l}</p>
          </div>
        ))}
      </section>

      {/* How it works — swipeable cards */}
      <section className="py-8 border-t border-rule">
        <div className="px-5 mb-4 flex items-center justify-between">
          <span className="text-[10px] font-mono text-accent tracking-widest">HOW IT WORKS</span>
          <span className="text-[10px] font-mono text-ink-faint">swipe →</span>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 pb-3 snap-x snap-mandatory scrollbar-none">
          {[
            { num: '01', icon: Camera, title: 'Capture', desc: 'Upload or camera' },
            { num: '02', icon: Fingerprint, title: 'Hash', desc: 'SHA-256 + dHash' },
            { num: '03', icon: Blocks, title: 'Chain', desc: 'Ethereum Sepolia' },
            { num: '04', icon: ShieldCheck, title: 'Verify', desc: 'Instant check' },
            { num: '05', icon: Search, title: 'Analyze', desc: 'ELA + EXIF + AI' },
          ].map((s) => (
            <div key={s.num} className="snap-start shrink-0 w-[140px] border border-rule rounded-sm bg-surface p-4">
              <span className="text-[10px] font-mono text-ink-faint">{s.num}</span>
              <s.icon className="w-5 h-5 text-ink-tertiary mt-3 mb-2" strokeWidth={1.5} />
              <p className="text-[13px] font-medium text-ink">{s.title}</p>
              <p className="text-[11px] text-ink-faint mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities — 2x3 grid */}
      <section className="py-8 px-5 border-t border-rule">
        <span className="text-[10px] font-mono text-accent tracking-widest block mb-4">CAPABILITIES</span>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Lock, title: 'Zero upload', desc: 'Files stay local' },
            { icon: Fingerprint, title: 'Dual hash', desc: 'Exact + fuzzy' },
            { icon: Blocks, title: 'Ethereum', desc: 'On-chain proof' },
            { icon: Search, title: 'ELA', desc: 'Edit detection' },
            { icon: ShieldCheck, title: 'EXIF', desc: 'Metadata scan' },
            { icon: Camera, title: 'Capture', desc: 'In-browser' },
          ].map((f) => (
            <div key={f.title} className="border border-rule rounded-sm bg-surface p-3.5">
              <f.icon className="w-4 h-4 text-ink-faint mb-2" strokeWidth={1.5} />
              <p className="text-[12px] font-medium text-ink">{f.title}</p>
              <p className="text-[10px] text-ink-faint mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-10 border-t border-rule text-center">
        <p className="font-serif text-[28px] tracking-tight mb-2">Start now.</p>
        <p className="text-[13px] text-ink-tertiary mb-6">No account needed to verify.</p>
        <Link to="/register" className="flex items-center justify-center gap-2 bg-white text-void text-[15px] font-medium py-4 rounded-sm w-full active:scale-[0.98] transition-transform">
          Get Started <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-rule px-5 py-5 pb-[env(safe-area-inset-bottom)] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Logo size={12} />
          <span className="font-serif text-[12px] text-ink-faint">Attestr</span>
        </div>
        <span className="text-[9px] text-ink-faint font-mono">Ctrl+Alt+Diablo</span>
      </footer>
    </div>
  );
}
