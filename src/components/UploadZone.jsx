import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpFromLine } from 'lucide-react';

export default function UploadZone({ onFileSelect, accept = 'image/*,video/*' }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onDragEnter={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDrag(false); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); setDrag(false); e.dataTransfer.files?.[0] && onFileSelect(e.dataTransfer.files[0]); }}
      onClick={() => ref.current?.click()}
      className={`cursor-pointer border border-dashed rounded-sm py-20 text-center transition-all duration-200 ${
        drag ? 'border-accent bg-accent-glow' : 'border-rule hover:border-ink-faint'
      }`}
    >
      <input ref={ref} type="file" accept={accept} onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])} className="hidden" />
      <ArrowUpFromLine className={`w-5 h-5 mx-auto mb-4 ${drag ? 'text-accent' : 'text-ink-faint'}`} strokeWidth={1.5} />
      <p className="text-[13px] text-ink-secondary">
        Drop a file here, or <span className="text-accent cursor-pointer">browse</span>
      </p>
      <p className="text-[11px] text-ink-tertiary mt-1.5 font-mono">JPG · PNG · WebP · MP4 · WebM</p>
    </motion.div>
  );
}
