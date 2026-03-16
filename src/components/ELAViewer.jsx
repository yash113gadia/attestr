import { useState, useEffect, useRef, useCallback } from 'react';
import { performELA } from '../lib/ela';

export default function ELAViewer({ file }) {
  const [elaImage, setElaImage] = useState(null);
  const [scale, setScale] = useState(10);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const prevRef = useRef(null);
  const debounceRef = useRef(null);
  const mountedRef = useRef(true);

  const run = useCallback(async (f, s) => {
    setAnalyzing(true);
    try {
      const result = await performELA(f, 95, s);
      if (mountedRef.current) setElaImage(result);
    } catch {
      if (mountedRef.current) setElaImage(null);
    }
    if (mountedRef.current) setAnalyzing(false);
  }, []);

  // Initial load when file changes
  useEffect(() => {
    mountedRef.current = true;
    if (prevRef.current) URL.revokeObjectURL(prevRef.current);
    if (!file?.type.startsWith('image/')) { setOriginalUrl(null); prevRef.current = null; return; }
    const u = URL.createObjectURL(file);
    setOriginalUrl(u);
    prevRef.current = u;
    run(file, scale);
    return () => { mountedRef.current = false; if (prevRef.current) { URL.revokeObjectURL(prevRef.current); prevRef.current = null; } };
  }, [file]);

  // Debounced scale change — don't re-run ELA on every slider tick
  function handleScaleChange(newScale) {
    setScale(newScale);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (file?.type.startsWith('image/')) run(file, newScale);
    }, 200);
  }

  if (!file?.type.startsWith('image/')) {
    return <div className="border border-rule rounded-sm p-4 text-[12px] text-ink-tertiary text-center font-mono">ELA: images only</div>;
  }

  return (
    <div className="border border-rule rounded-sm bg-surface overflow-hidden">
      <div className="px-5 py-3 border-b border-rule-light flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-ink-tertiary tracking-widest">ERROR LEVEL ANALYSIS</span>
          {analyzing && (
            <span className="text-[9px] font-mono text-accent animate-pulse">updating</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-ink-faint">
          <span className="w-6 text-right">{scale}x</span>
          <input
            type="range"
            min="1"
            max="30"
            value={scale}
            onChange={(e) => handleScaleChange(+e.target.value)}
            className="w-20 accent-accent h-0.5"
          />
        </div>
      </div>

      {/* Always show images — never unmount them. Overlay a subtle indicator when updating */}
      <div className="grid grid-cols-2 relative">
        <div className="border-r border-rule-light">
          <div className="px-4 py-1.5 border-b border-rule-light text-[10px] font-mono text-ink-faint tracking-wider">ORIGINAL</div>
          {originalUrl && <img src={originalUrl} alt="" className="w-full block" />}
        </div>
        <div>
          <div className="px-4 py-1.5 border-b border-rule-light text-[10px] font-mono text-ink-faint tracking-wider">ELA</div>
          {elaImage ? (
            <img
              src={elaImage}
              alt=""
              className={`w-full block transition-opacity duration-200 ${analyzing ? 'opacity-50' : 'opacity-100'}`}
            />
          ) : (
            <div className="h-40 flex items-center justify-center text-[12px] text-ink-faint font-mono">
              {analyzing ? 'analyzing...' : '—'}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-2 border-t border-rule-light text-[11px] text-ink-faint leading-relaxed">
        Bright regions = compression inconsistencies. Uniform = likely unmodified.
      </div>
    </div>
  );
}
