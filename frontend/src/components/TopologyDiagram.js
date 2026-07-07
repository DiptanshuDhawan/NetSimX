import React from 'react';

const RouterIcon = ({ x, y, scale = 1.4, label }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    {/* Cylinder body (made taller to fit text on the front face) */}
    <path d="M-38,-10 v28 a38,14 0 0,0 76,0 v-28 Z" fill="#222428" stroke="#525660" strokeWidth="1.9" />
    {/* Top face */}
    <ellipse cx="0" cy="-10" rx="38" ry="14" fill="#2A2D32" stroke="#525660" strokeWidth="1.9" />
    {/* 4 arrows perfectly centered on top face */}
    <g stroke="#E2E8F0" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-4,-10 L-15,-10 M-11,-13 L-15,-10 L-11,-7" /> {/* Left arrow pointing OUT */}
      <path d="M4,-10 L15,-10 M11,-13 L15,-10 L11,-7" /> {/* Right arrow pointing OUT */}
      <path d="M0,-16 L0,-24 M-3,-20 L0,-24 L3,-20" /> {/* Top arrow pointing IN */}
      <path d="M0,-4 L0,4 M-3,0 L0,4 L3,0" /> {/* Bottom arrow pointing IN */}
    </g>
    {/* Label properly placed on the visible front face */}
    {label && (
      <text x="0" y="15" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontWeight="600">{label}</text>
    )}
  </g>
);

const SwitchIcon = ({ x, y, scale = 1.4, label }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    {/* Top face */}
    <path d="M-30,-12 L30,-12 L45,2 L-45,2 Z" fill="#2A2D32" stroke="#525660" strokeWidth="1.9" strokeLinejoin="round" />
    {/* Front face (made taller) */}
    <path d="M-45,2 L45,2 L45,22 L-45,22 Z" fill="#222428" stroke="#525660" strokeWidth="1.9" strokeLinejoin="round" />
    {/* Arrows on the top face */}
    <g stroke="#E2E8F0" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-12,-3 L12,-3 M8,-6 L12,-3 L8,0" />
      <path d="M12,-7 L-12,-7 M-8,-10 L-12,-7 L-8,-4" />
    </g>
    {/* Label on the front face */}
    {label && (
      <text x="0" y="17" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontWeight="600">{label}</text>
    )}
  </g>
);

const PCIcon = ({ x, y, scale = 1.4, label }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    {/* Monitor Frame */}
    <rect x="-24" y="-18" width="48" height="30" rx="3" fill="#2A2D32" stroke="#525660" strokeWidth="1.9" />
    {/* Monitor Screen */}
    <rect x="-20" y="-14" width="40" height="22" rx="1" fill="#222428" stroke="none" />
    {/* Stand */}
    <path d="M-6,12 L-10,20 L10,20 L6,12 Z" fill="#2A2D32" stroke="#525660" strokeWidth="1.9" strokeLinejoin="round" />
    {/* Base */}
    <rect x="-16" y="20" width="32" height="3" rx="1.5" fill="#525660" />
    {/* Label inside the monitor screen */}
    {label && (
      <text x="0" y="2" textAnchor="middle" fill="#E2E8F0" fontSize="10" fontWeight="600">{label}</text>
    )}
  </g>
);

export default function TopologyDiagram({ nodes = [], activeNode = null, onNodeClick = () => {} }) {
  const nodeNames = nodes.map(n => n.name);
  const isInterVlan = nodeNames.includes('SW1');

  if (isInterVlan) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 800 380" style={{ fontFamily: 'Inter, sans-serif' }}>
          <g transform="translate(0, 0)">
            {/* Connection Lines */}
            <line x1="400" y1="60" x2="400" y2="190" stroke="#2F80ED" strokeWidth="2.5" />
            <line x1="400" y1="190" x2="250" y2="320" stroke="#2F80ED" strokeWidth="2.5" />
            <line x1="400" y1="190" x2="550" y2="320" stroke="#2F80ED" strokeWidth="2.5" />

            {/* Link Labels */}
            <text x="415" y="125" fill="#E2E8F0" fontSize="13" fontWeight="500">e0/0</text>
            <text x="315" y="250" fill="#E2E8F0" fontSize="13" fontWeight="500" textAnchor="end">VLAN 10</text>
            <text x="485" y="250" fill="#E2E8F0" fontSize="13" fontWeight="500" textAnchor="start">VLAN 20</text>

            {/* Nodes with embedded labels */}
            <RouterIcon x="400" y="60" scale={1.2} label="R1" />
            <SwitchIcon x="400" y="190" scale={1.2} label="SW1" />
            <PCIcon x="250" y="320" scale={1.2} label="PC1" />
            <PCIcon x="550" y="320" scale={1.2} label="PC2" />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 800 320" style={{ fontFamily: 'Inter, sans-serif' }}>
        <g transform="translate(75, 0)">
          {/* Connection Line: R1 to R2 */}
          <line x1="150" y1="140" x2="500" y2="140" stroke="#2F80ED" strokeWidth="2.5" />

          {/* Subnet & Area labels between R1 and R2 */}
          <text x="325" y="115" textAnchor="middle" fill="#E2E8F0" fontSize="15" fontWeight="600">192.168.1.0/24</text>
          <text x="325" y="170" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="500">OSPF Area 0</text>

          {/* R1 Interface & Host IP */}
          <text x="215" y="130" fill="#E2E8F0" fontSize="13" fontWeight="500">e0/0</text>
          <text x="215" y="160" fill="#A1A9B6" fontSize="13">.1</text>

          {/* R2 Interface & Host IP (Left side) */}
          <text x="435" y="130" fill="#E2E8F0" fontSize="13" fontWeight="500" textAnchor="end">e0/1</text>
          <text x="435" y="160" fill="#A1A9B6" fontSize="13" textAnchor="end">.2</text>

          {/* Nodes with embedded labels */}
          <RouterIcon x="150" y="140" label="R1" />
          <RouterIcon x="500" y="140" label="R2" />
        </g>
      </svg>
    </div>
  );
}