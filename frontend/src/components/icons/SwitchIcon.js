import React from 'react';

export default function SwitchIcon({ x, y, scale = 1.4, label, active }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} style={{ filter: active ? 'drop-shadow(0 0 12px rgba(47,128,237,0.7))' : 'none', transition: 'all 0.3s ease' }}>
      {/* Top face */}
      <path d="M-30,-12 L30,-12 L45,2 L-45,2 Z" fill="#2A2D32" stroke={active ? "#2F80ED" : "#525660"} strokeWidth={active ? "2.5" : "1.9"} strokeLinejoin="round" />
      {/* Front face */}
      <path d="M-45,2 L45,2 L45,28 L-45,28 Z" fill="#222428" stroke={active ? "#2F80ED" : "#525660"} strokeWidth={active ? "2.5" : "1.9"} strokeLinejoin="round" />
      {/* Arrows on the top face */}
      <g stroke="#E2E8F0" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-12,-3 L12,-3 M8,-6 L12,-3 L8,0" />
        <path d="M12,-7 L-12,-7 M-8,-10 L-12,-7 L-8,-4" />
      </g>
      {/* Label */}
      {label && (
        <text x="0" y="19" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontWeight="600">{label}</text>
      )}
    </g>
  );
}
