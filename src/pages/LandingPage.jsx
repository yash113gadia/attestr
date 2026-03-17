import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Fingerprint, Blocks, Search, ShieldCheck, Camera, Shield } from 'lucide-react';
import Logo from '../components/Logo';
import { lazy, Suspense } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
const ShieldScene = lazy(() => import('../components/ShieldScene'));
const BlockchainOrb = lazy(() => import('../components/BlockchainOrb'));
const FingerprintViz = lazy(() => import('../components/FingerprintViz'));
const ChainViz = lazy(() => import('../components/ChainViz'));
const LockViz = lazy(() => import('../components/LockViz'));

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { delay, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
});

export default function LandingPage() {
  return (
    <div className="bg-void text-ink overflow-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-void/60 backdrop-blur-2xl border-b border-rule/50">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={22} />
            <span className="font-serif text-[17px] text-ink tracking-tight">Attestr</span>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <a href="#how" className="hidden md:inline text-[13px] text-ink-tertiary hover:text-ink transition">How it Works</a>
            <a href="#features" className="hidden md:inline text-[13px] text-ink-tertiary hover:text-ink transition">Capabilities</a>
            <Link to="/demo" className="hidden md:inline text-[13px] text-accent hover:text-accent/80 transition font-medium">Demo</Link>
            <Link to="/register" className="text-[12px] md:text-[13px] text-ink bg-surface-raised hover:bg-surface-hover border border-rule px-3 md:px-4 py-1.5 rounded-sm transition">
              Launch Platform
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-accent/[0.04] rounded-full blur-[150px]" />

        <div className="relative max-w-[1200px] mx-auto px-4 md:px-8 pt-24 md:pt-28 pb-16 md:pb-20 grid grid-cols-1 md:grid-cols-[1fr_480px] gap-8 items-center">
          {/* Left — Text */}
          <div>
            <motion.div {...fade(0.1)} className="inline-flex items-center gap-2 text-[10px] md:text-[11px] font-mono text-ink-tertiary tracking-widest uppercase mb-6 md:mb-8 border border-rule px-3 md:px-4 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-verified animate-pulse" />
              Blockchain-verified media integrity
            </motion.div>

            <motion.h1 {...fade(0.2)} className="font-serif text-[clamp(36px,6vw,80px)] leading-[0.95] tracking-tight mb-6">
              Prove what's<br />real.
            </motion.h1>

            <motion.p {...fade(0.35)} className="text-[15px] md:text-[17px] text-ink-secondary leading-relaxed max-w-lg mb-8 md:mb-10">
              Attestr creates immutable cryptographic fingerprints of media files — permanently
              recorded on the Ethereum blockchain. Detect tampering. Establish provenance. Protect truth.
            </motion.p>

            <motion.div {...fade(0.5)} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link to="/register" className="group flex items-center justify-center gap-3 bg-white text-void text-[14px] font-medium px-7 py-3.5 rounded-sm hover:bg-ink transition">
                Start Registering
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/verify" className="flex items-center justify-center gap-3 text-ink-secondary text-[14px] font-medium px-7 py-3.5 border border-rule rounded-sm hover:border-ink-faint hover:text-ink transition">
                Verify a File
              </Link>
            </motion.div>

            <motion.div {...fade(0.65)} className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 md:mt-14 text-[11px] text-ink-tertiary font-mono tracking-wider uppercase">
              <span>Client-side only</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-ink-faint" />
              <span>Ethereum Sepolia</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-ink-faint" />
              <span>Zero data collection</span>
            </motion.div>
          </div>

          {/* Right — 3D Shield */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.5 }}
            className="relative hidden md:block"
          >
            <ErrorBoundary fallback={<div className="w-[480px] h-[480px]" />}>
              <Suspense fallback={<div className="w-[480px] h-[480px]" />}>
                <ShieldScene height="480px" />
              </Suspense>
            </ErrorBoundary>
            {/* Glow behind 3D */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent/[0.06] rounded-full blur-[80px] -z-10" />
          </motion.div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-void to-transparent" />
      </section>

      {/* ── NUMBERS ── */}
      <section className="border-y border-rule">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 divide-x divide-rule">
          {[
            { n: '96%', label: 'of deepfakes are AI-generated' },
            { n: '10x', label: 'year-over-year growth' },
            { n: '<1s', label: 'verification time' },
            { n: '$0', label: 'cost to create a deepfake' },
          ].map((s) => (
            <motion.div key={s.n} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="py-8 md:py-12 px-4 md:px-8">
              <p className="font-serif text-[28px] md:text-[40px] text-ink tracking-tight">{s.n}</p>
              <p className="text-[12px] md:text-[13px] text-ink-tertiary mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-16 md:py-32">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="flex items-start justify-between mb-12 md:mb-20">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-xl">
              <p className="text-[11px] font-mono text-accent tracking-widest uppercase mb-4">How it works</p>
              <h2 className="font-serif text-[32px] md:text-[42px] leading-[1.05] tracking-tight">
                From capture to<br />immutable proof.
              </h2>
            </motion.div>
            <div className="hidden lg:block">
              <ErrorBoundary>
                <Suspense fallback={null}>
                  <FingerprintViz size={160} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-rule">
            {[
              { num: '01', icon: Camera, title: 'Capture', desc: 'Upload a file or capture directly from your browser camera.' },
              { num: '02', icon: Fingerprint, title: 'Fingerprint', desc: 'SHA-256 and perceptual hash computed client-side. Nothing uploaded.' },
              { num: '03', icon: Blocks, title: 'Register', desc: 'Cryptographic proof stored on Ethereum with proof-of-work.' },
              { num: '04', icon: ShieldCheck, title: 'Verify', desc: 'Any file checked against the ledger. Instant authenticity result.' },
              { num: '05', icon: Search, title: 'Analyze', desc: 'Error Level Analysis and EXIF forensics detect manipulation.' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-void p-6 md:p-8 group"
              >
                <span className="text-[11px] font-mono text-ink-faint">{step.num}</span>
                <step.icon className="w-5 h-5 text-ink-tertiary mt-4 mb-4 group-hover:text-accent transition-colors duration-300" strokeWidth={1.5} />
                <h3 className="text-[15px] font-medium text-ink mb-2">{step.title}</h3>
                <p className="text-[13px] text-ink-tertiary leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES ── */}
      <section id="features" className="py-16 md:py-32 border-t border-rule">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="flex items-start justify-between mb-12 md:mb-20">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-xl">
              <p className="text-[11px] font-mono text-accent tracking-widest uppercase mb-4">Capabilities</p>
              <h2 className="font-serif text-[32px] md:text-[42px] leading-[1.05] tracking-tight">
                Built for those who<br />need to prove truth.
              </h2>
            </motion.div>
            <div className="hidden lg:flex items-center gap-4">
              <ErrorBoundary>
                <Suspense fallback={null}>
                  <LockViz size={120} />
                </Suspense>
              </ErrorBoundary>
              <ErrorBoundary>
                <Suspense fallback={null}>
                  <ChainViz size={200} height={120} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-rule">
            {[
              { icon: Lock, title: 'Nothing Leaves Your Device', desc: 'Your media is processed entirely in your browser. Only the cryptographic fingerprint is sent — the original file never reaches our servers.' },
              { icon: Fingerprint, title: 'Dual-Hash Verification', desc: 'SHA-256 for exact matching. Perceptual dHash survives compression, screenshots, and re-encoding.' },
              { icon: Blocks, title: 'Ethereum Settlement', desc: 'Hashes recorded on Ethereum Sepolia via smart contract. Immutable. Publicly verifiable on Etherscan.' },
              { icon: Search, title: 'Error Level Analysis', desc: 'Canvas-based ELA detects compression inconsistencies — regions that compress differently reveal edits.' },
              { icon: ShieldCheck, title: 'EXIF Forensics', desc: 'Extracts camera data, GPS, timestamps, editing software. Flags anomalies that suggest post-processing.' },
              { icon: Camera, title: 'In-Browser Capture', desc: 'Capture evidence directly. Front and rear camera support. Hash generated the moment you capture.' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-void p-6 md:p-8 group"
              >
                <f.icon className="w-5 h-5 text-ink-faint mb-5 group-hover:text-accent transition-colors duration-300" strokeWidth={1.5} />
                <h3 className="text-[15px] font-medium text-ink mb-2">{f.title}</h3>
                <p className="text-[13px] text-ink-tertiary leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE ── */}
      <section className="py-16 md:py-32 border-t border-rule">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-8 items-start mb-12 md:mb-16">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-xl">
              <p className="text-[11px] font-mono text-accent tracking-widest uppercase mb-4">Architecture</p>
              <h2 className="font-serif text-[32px] md:text-[42px] leading-[1.05] tracking-tight">
                Zero trust by design.
              </h2>
              <p className="text-[14px] text-ink-tertiary mt-4 leading-relaxed">
                Raw media never leaves your browser. Only mathematical proofs cross the network boundary and settle on Ethereum.
              </p>
            </motion.div>
            <div className="hidden md:block">
              <ErrorBoundary>
                <Suspense fallback={null}>
                  <BlockchainOrb size={200} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-rule rounded-sm bg-surface p-4 md:p-10 font-mono text-[11px] md:text-[12px] space-y-6 overflow-x-auto"
          >
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <span className="text-accent w-16 md:w-24 shrink-0 text-[10px] md:text-[12px]">CLIENT</span>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {['Upload / Camera', 'SHA-256 Worker', 'dHash Worker', 'ELA / EXIF'].map((b) => (
                  <div key={b} className="border border-rule bg-surface-raised px-2 md:px-4 py-2 md:py-3 text-center text-ink-secondary text-[10px] md:text-[12px]">{b}</div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-4 text-ink-faint">
              <span className="w-16 md:w-24 shrink-0" />
              <div className="flex-1 text-center text-[10px] md:text-[11px] tracking-wider">── hash + metadata only ──</div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-caution w-16 md:w-24 shrink-0 text-[10px] md:text-[12px]">SERVER</span>
              <div className="flex-1 grid grid-cols-3 gap-2 md:gap-3">
                {['POST /register', 'POST /verify', 'GET /chain'].map((b) => (
                  <div key={b} className="border border-rule bg-surface-raised px-2 md:px-4 py-2 md:py-3 text-center text-ink-secondary text-[10px] md:text-[12px]">{b}</div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-4 text-ink-faint">
              <span className="w-16 md:w-24 shrink-0" />
              <div className="flex-1 text-center text-[10px] md:text-[11px] tracking-wider">──</div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-verified w-16 md:w-24 shrink-0 text-[10px] md:text-[12px]">CHAIN</span>
              <div className="flex-1 border border-verified/20 bg-verified-glow px-2 md:px-4 py-2 md:py-3 text-center text-verified text-[10px] md:text-[12px]">
                Ethereum Sepolia · Smart Contract · Immutable · Proof-of-Work
              </div>
            </div>
            <div className="border-t border-rule pt-4 text-ink-tertiary text-[10px] md:text-[11px]">
              Raw media files never leave the browser. Only cryptographic hashes cross the network boundary.
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 md:py-32 border-t border-rule">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-serif text-[36px] md:text-[48px] tracking-tight mb-4">Start verifying.</h2>
            <p className="text-[15px] md:text-[16px] text-ink-secondary mb-8 md:mb-10 max-w-md mx-auto">
              No account needed to verify. Register your first file in under 30 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
              <Link to="/register" className="group flex items-center justify-center gap-3 bg-white text-void text-[14px] font-medium px-7 py-3.5 rounded-sm hover:bg-ink transition">
                Register Media <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/verify" className="flex items-center justify-center text-ink-secondary text-[14px] font-medium px-7 py-3.5 border border-rule rounded-sm hover:border-ink-faint hover:text-ink transition">
                Verify a File
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-rule py-8">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Logo size={16} />
            <span className="font-serif text-[14px] text-ink-tertiary">Attestr</span>
          </div>
          <p className="text-[11px] text-ink-faint font-mono text-center">
            Team Ctrl+Alt+Diablo · CSBC114 · Innovate Bharat 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
