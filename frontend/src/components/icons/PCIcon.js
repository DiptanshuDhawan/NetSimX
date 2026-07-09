import React from 'react';

export default function PCIcon({ x, y, scale = 1.4, label, active }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} style={{ filter: active ? 'drop-shadow(0 0 12px rgba(47,128,237,0.7))' : 'none', transition: 'all 0.3s ease' }}>
      {/* Monitor Frame */}
      <rect x="-24" y="-18" width="48" height="30" rx="3" fill="#2A2D32" stroke={active ? "#2F80ED" : "#525660"} strokeWidth={active ? "2.5" : "1.9"} />
      {/* Monitor Screen */}
      <rect x="-20" y="-14" width="40" height="22" rx="1" fill="#222428" stroke="none" />
      {/* Stand */}
      <path d="M-6,12 L-10,20 L10,20 L6,12 Z" fill="#2A2D32" stroke="#525660" strokeWidth="1.9" strokeLinejoin="round" />
      {/* Base */}
      <rect x="-16" y="20" width="32" height="3" rx="1.5" fill="#525660" />
      {/* Label */}
      {label && (
        <text x="0" y="0" textAnchor="middle" fill="#E2E8F0" fontSize="10" fontWeight="600">{label}</text>
      )}
    </g>
  );
}
