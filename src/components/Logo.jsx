export default function Logo({ size = 20, className = '', light = false }) {
  const stroke = light ? '#E8E9ED' : '#3B82F6';
  const fill = light ? '#E8E9ED' : '#1A1A2E';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      fill="none"
      width={size}
      height={size}
      className={className}
    >
      {/* ── Outer hexagon frame (blockchain network) ── */}
      <polygon
        points="100,10 180,46 180,154 100,190 20,154 20,46"
        fill="none"
        stroke={stroke}
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* ── Vertex nodes ── */}
      {[
        [100, 10], [180, 46], [180, 154], [100, 190], [20, 154], [20, 46]
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="7" fill={stroke} />
      ))}

      {/* ── Diagonal network lines from vertices to center region ── */}
      <line x1="100" y1="10" x2="100" y2="60" stroke={stroke} strokeWidth="3.5" opacity="0.5" />
      <line x1="180" y1="46" x2="145" y2="75" stroke={stroke} strokeWidth="3.5" opacity="0.5" />
      <line x1="180" y1="154" x2="145" y2="125" stroke={stroke} strokeWidth="3.5" opacity="0.5" />
      <line x1="100" y1="190" x2="100" y2="140" stroke={stroke} strokeWidth="3.5" opacity="0.5" />
      <line x1="20" y1="154" x2="55" y2="125" stroke={stroke} strokeWidth="3.5" opacity="0.5" />
      <line x1="20" y1="46" x2="55" y2="75" stroke={stroke} strokeWidth="3.5" opacity="0.5" />

      {/* ── Inner shield ── */}
      <path
        d="M100 55 L140 72 V112 C140 132 122 148 100 155 C78 148 60 132 60 112 V72 Z"
        fill={fill}
        fillOpacity="0.15"
        stroke={stroke}
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* ── Camera aperture / shutter blades ── */}
      <circle cx="100" cy="102" r="22" fill="none" stroke={stroke} strokeWidth="4" />

      {/* Aperture blades — 5 curved segments */}
      <path d="M100 80 Q112 90 108 102" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M120 92 Q114 106 102 108" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M114 118 Q102 116 94 106" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M86 118 Q88 104 98 96" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M80 98 Q92 88 104 94" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />

      {/* Center dot */}
      <circle cx="100" cy="102" r="5" fill={stroke} opacity="0.3" />

      {/* ── Blue verification checkmark ── */}
      <polyline
        points="108,96 118,108 138,82"
        fill="none"
        stroke="#3B82F6"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
