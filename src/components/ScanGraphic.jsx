import { motion } from 'framer-motion';

export default function ScanGraphic({ variant = 'register' }) {
  const color = variant === 'register' ? '#3B82F6' : '#22C55E';

  return (
    <div className="mt-12 opacity-30">
      <svg viewBox="0 0 200 120" fill="none" className="w-full max-w-[200px]">
        {/* Scanning frame corners */}
        <path d="M10 30 L10 10 L30 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M170 10 L190 10 L190 30" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M190 90 L190 110 L170 110" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M30 110 L10 110 L10 90" stroke={color} strokeWidth="2" strokeLinecap="round" />

        {/* Scan line */}
        <motion.line
          x1="20" x2="180"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
          initial={{ y1: 20, y2: 20 }}
          animate={{ y1: [20, 100, 20], y2: [20, 100, 20] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Hash blocks */}
        {[35, 55, 75, 95, 115, 135, 155].map((x, i) => (
          <motion.rect
            key={i}
            x={x}
            y={55}
            width="8"
            height="10"
            rx="1"
            fill={color}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}

        {/* Fingerprint arcs */}
        <motion.path
          d="M85 60 Q100 40 115 60"
          fill="none"
          stroke={color}
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.path
          d="M80 65 Q100 35 120 65"
          fill="none"
          stroke={color}
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.3 }}
        />
      </svg>
    </div>
  );
}
