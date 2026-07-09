import React from 'react';

export default function RouterIcon({ x, y, scale = 1.4, label, active }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} style={{ filter: active ? 'drop-shadow(0 0 12px rgba(47,128,237,0.7))' : 'none', transition: 'all 0.3s ease' }}>
      {/* Cylinder body */}
      <path d="M-38,-10 v20 a38,14 0 0,0 76,0 v-20 Z" fill="#222428" stroke={active ? "#2F80ED" : "#525660"} strokeWidth={active ? "2.5" : "1.9"} />
      {/* Top face */}
      <ellipse cx="0" cy="-10" rx="38" ry="14" fill="#2A2D32" stroke={active ? "#2F80ED" : "#525660"} strokeWidth={active ? "2.5" : "1.9"} />
      {/* 4 arrows forming a perfectly symmetrical cross centered at (0, -10) */}
      <g stroke="#E2E8F0" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-11,-10 L-3,-10 M-6,-13 L-3,-10 L-6,-7" />
        <path d="M11,-10 L3,-10 M6,-13 L3,-10 L6,-7" />
        <path d="M0,-13 L0,-21 M-3,-18 L0,-21 L3,-18" />
        <path d="M0,-7 L0,1 M-3,-2 L0,1 L3,-2" />
      </g>
      {/* Label */}
      {label && (
        <text x="0" y="18" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontWeight="600">{label}</text>
      )}
    </g>
  );
}
