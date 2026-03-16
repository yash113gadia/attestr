import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { detectAIGenerated } from '../lib/aiDetect';
import { detectAI } from '../lib/api';
import { Bot, ShieldCheck, AlertTriangle, ChevronRight, Brain, Cpu, Sparkles } from 'lucide-react';

const verdictConfig = {
  likely_ai: { label: 'LIKELY AI-GENERATED', color: 'text-danger', dot: 'bg-danger', bg: 'bg-danger-glow', barColor: 'bg-danger' },
  suspicious: { label: 'SUSPICIOUS', color: 'text-caution', dot: 'bg-caution', bg: 'bg-caution-glow', barColor: 'bg-caution' },
  likely_authentic: { label: 'LIKELY AUTHENTIC', color: 'text-verified', dot: 'bg-verified', bg: 'bg-verified-glow', barColor: 'bg-verified' },
  unknown: { label: 'ANALYZING', color: 'text-ink-tertiary', dot: 'bg-ink-faint', bg: 'bg-surface-raised', barColor: 'bg-ink-faint' },
};

function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

export default function AIDetector({ file, exifData }) {
  const [localResult, setLocalResult] = useState(null);
  const [mlResult, setMlResult] = useState(null);
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [loadingML, setLoadingML] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!file?.type.startsWith('image/')) { setLoadingLocal(false); setLoadingML(false); return; }

    // Run local heuristics
    setLoadingLocal(true);
    detectAIGenerated(file, exifData).then((r) => {
      if (mountedRef.current) { setLocalResult(r); setLoadingLocal(false); }
    });

    // Run ML models via server
    setLoadingML(true);
    fileToBase64(file).then((b64) => {
      detectAI(b64).then((r) => {
        if (mountedRef.current) { setMlResult(r); setLoadingML(false); }
      }).catch(() => {
        if (mountedRef.current) { setMlResult({ verdict: 'unknown', aiScore: null, models: [] }); setLoadingML(false); }
      });
    });

    return () => { mountedRef.current = false; };
  }, [file, exifData]);

  if (!file?.type.startsWith('image/')) {
    return <div className="border border-rule rounded-sm p-4 text-[12px] text-ink-tertiary text-center font-mono">AI detection: images only</div>;
  }

  const loading = loadingLocal || loadingML;

  // Combined score: ML 50%, local heuristics 50% — balanced for reliability
  // If ML models disagree strongly, reduce ML weight
  const mlScore = mlResult?.aiScore;
  const localScore = localResult ? localResult.confidence : null;
  let combinedScore = null;
  let combinedVerdict = 'unknown';

  if (mlScore != null && localScore != null) {
    // Check if ML models disagree with each other
    const modelScores = mlResult?.models?.filter(m => m.aiScore != null).map(m => m.aiScore) || [];
    const mlDisagreement = modelScores.length >= 2 ? Math.abs(modelScores[0] - modelScores[1]) : 0;

    // If models disagree a lot (>50%), reduce ML influence
    const mlWeight = mlDisagreement > 50 ? 0.3 : 0.5;
    const localWeight = 1 - mlWeight;

    combinedScore = Math.round(mlScore * mlWeight + localScore * localWeight);
  } else if (mlScore != null) {
    combinedScore = mlScore;
  } else if (localScore != null) {
    combinedScore = localScore;
  }

  if (combinedScore != null) {
    if (combinedScore >= 60) combinedVerdict = 'likely_ai';
    else if (combinedScore >= 35) combinedVerdict = 'suspicious';
    else combinedVerdict = 'likely_authentic';
  }

  const cfg = verdictConfig[loading ? 'unknown' : combinedVerdict];

  return (
    <div className="border border-rule rounded-sm bg-surface overflow-hidden">
      {/* Header */}
      <div className={`${cfg.bg} px-5 py-3 flex items-center gap-3`}>
        <Bot className={`w-4 h-4 ${cfg.color}`} strokeWidth={1.5} />
        <span className={`text-[11px] font-mono font-semibold tracking-wider ${cfg.color}`}>
          {loading ? 'ANALYZING...' : cfg.label}
        </span>
        {combinedScore != null && !loading && (
          <span className="text-[11px] font-mono text-ink-tertiary ml-auto">{combinedScore}% AI confidence</span>
        )}
        {loading && (
          <motion.div className="flex gap-1 ml-auto" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }}>
            <span className="text-[11px] font-mono text-ink-faint">running models</span>
          </motion.div>
        )}
      </div>

      {/* Combined confidence bar */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-ink-faint mb-1.5">
          <span>AUTHENTIC</span>
          <span>AI-GENERATED</span>
        </div>
        <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: loading ? '50%' : `${combinedScore || 0}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${loading ? 'bg-ink-faint animate-pulse' : cfg.barColor}`}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-ink-faint mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Model results */}
      <div className="px-5 pb-3">
        {/* ML Models */}
        <div className="flex items-center gap-2 mt-2 mb-2">
          <Brain className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
          <span className="text-[10px] font-mono text-ink-faint tracking-widest">ML MODELS</span>
        </div>

        <div className="space-y-1.5">
          {loadingML ? (
            <div className="border border-rule-light rounded-sm bg-void px-3 py-2.5 flex items-center gap-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
              </motion.div>
              <span className="text-[11px] font-mono text-ink-faint">Querying HuggingFace models...</span>
            </div>
          ) : mlResult?.models?.map((m, i) => (
            <div key={i} className="border border-rule-light rounded-sm bg-void px-3 py-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-ink-secondary">{m.model}</span>
                {m.error ? (
                  <span className="text-[10px] font-mono text-ink-faint">{m.error}</span>
                ) : (
                  <span className={`text-[10px] font-mono font-semibold ${
                    m.aiScore >= 65 ? 'text-danger' : m.aiScore >= 35 ? 'text-caution' : 'text-verified'
                  }`}>{m.aiScore}% AI</span>
                )}
              </div>
              {m.scores && (
                <div className="flex gap-3 mt-1">
                  {m.scores.map((s, j) => (
                    <div key={j} className="flex items-center gap-1.5">
                      <div className="h-1 w-12 bg-surface-raised rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.label?.toLowerCase().includes('ai') || s.label?.toLowerCase().includes('artificial') || s.label?.toLowerCase().includes('fake') ? 'bg-danger' : 'bg-verified'}`}
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-ink-faint">{s.label}: {s.score}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Heuristic Analysis */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 mt-4 mb-1"
        >
          <Cpu className="w-3.5 h-3.5 text-ink-faint" strokeWidth={1.5} />
          <span className="text-[10px] font-mono text-ink-faint tracking-widest">FORENSIC HEURISTICS</span>
          <ChevronRight className={`w-3 h-3 text-ink-faint transition-transform ${expanded ? 'rotate-90' : ''}`} />
          {localResult && (
            <span className={`text-[10px] font-mono ml-auto ${
              localResult.confidence >= 70 ? 'text-danger' : localResult.confidence >= 40 ? 'text-caution' : 'text-verified'
            }`}>{localResult.confidence}%</span>
          )}
        </button>

        {expanded && localResult && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1.5 mt-2">
            {localResult.signals.map((signal, i) => (
              <div key={i} className="border border-rule-light rounded-sm bg-void p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono text-ink-secondary">{signal.name}</span>
                  <span className={`text-[10px] font-mono ${
                    signal.score >= 0.5 ? 'text-danger' : signal.score >= 0.2 ? 'text-caution' : 'text-verified'
                  }`}>{Math.round(signal.score * 100)}%</span>
                </div>
                <div className="h-1 bg-surface-raised rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${signal.score >= 0.5 ? 'bg-danger' : signal.score >= 0.2 ? 'bg-caution' : 'bg-verified'}`}
                    style={{ width: `${signal.score * 100}%` }}
                  />
                </div>
                {signal.findings.length > 0 ? (
                  <div className="space-y-1">
                    {signal.findings.map((f, j) => (
                      <div key={j} className="flex items-start gap-2 text-[10px]">
                        <AlertTriangle className="w-3 h-3 text-caution shrink-0 mt-px" strokeWidth={1.5} />
                        <span className="text-ink-tertiary">{f}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[10px]">
                    <ShieldCheck className="w-3 h-3 text-verified" strokeWidth={1.5} />
                    <span className="text-ink-faint">{signal.detail}</span>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="px-5 py-2 border-t border-rule-light text-[10px] text-ink-faint leading-relaxed">
        Combined analysis from ML vision transformers (HuggingFace) and local forensic heuristics. Confidence scores are indicative, not definitive.
      </div>
    </div>
  );
}
