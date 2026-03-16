import { useState, useEffect, useRef } from 'react';
import { extractExif } from '../lib/exif';
import { ChevronRight } from 'lucide-react';

export default function ExifPanel({ file }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const m = useRef(true);

  useEffect(() => {
    m.current = true; if (!file) return; setLoading(true);
    extractExif(file).then((d) => { if (m.current) { setData(d); setLoading(false); } });
    return () => { m.current = false; };
  }, [file]);

  if (loading) return <div className="border border-rule rounded-sm p-4 text-[12px] font-mono text-ink-faint text-center">reading metadata...</div>;
  if (!data) return <div className="border border-rule rounded-sm p-4 text-[12px] text-ink-tertiary text-center">No EXIF data found.</div>;

  const { organized, flags } = data;
  const cats = Object.entries(organized).filter(([, f]) => Object.keys(f).length > 0);

  return (
    <div className="border border-rule rounded-sm bg-surface overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full px-5 py-3 flex items-center justify-between hover:bg-surface-raised transition">
        <span className="text-[10px] font-mono text-ink-tertiary tracking-widest">EXIF METADATA</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-ink-faint">{cats.reduce((s, [, f]) => s + Object.keys(f).length, 0)}</span>
          <ChevronRight className={`w-3 h-3 text-ink-faint transition-transform ${open ? 'rotate-90' : ''}`} />
        </div>
      </button>
      {flags.length > 0 && (
        <div className="px-5 py-3 border-t border-rule-light space-y-2">
          {flags.map((f, i) => (
            <div key={i} className="text-[12px] bg-caution-glow border border-caution/15 px-3 py-2 rounded-sm">
              <span className="font-mono font-medium text-caution">{f.field}</span>
              <span className="text-ink-secondary"> — {f.value}</span>
              <p className="text-ink-tertiary text-[11px] mt-0.5">{f.reason}</p>
            </div>
          ))}
        </div>
      )}
      {open && cats.map(([cat, fields]) => (
        <div key={cat} className="border-t border-rule-light">
          <div className="px-5 py-1.5 bg-surface-raised text-[10px] font-mono text-ink-faint tracking-widest uppercase">{cat}</div>
          {Object.entries(fields).map(([k, v]) => (
            <div key={k} className="px-5 py-1.5 flex justify-between text-[12px] border-t border-rule-light">
              <span className="text-ink-tertiary">{k}</span>
              <span className="text-ink font-mono">{String(v)}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
