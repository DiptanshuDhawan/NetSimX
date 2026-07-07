import React from 'react';

const RouterIcon = ({ x, y, scale = 1.4, label }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    {/* Cylinder body (drawn first so it goes behind the top face) */}
    <path d="M-38,-10 v20 a38,14 0 0,0 76,0 v-20 Z" fill="#222428" stroke="#525660" strokeWidth="1.9" />
    {/* Top face */}
    <ellipse cx="0" cy="-10" rx="38" ry="14" fill="#2A2D32" stroke="#525660" strokeWidth="1.9" />
    {/* 4 arrows forming a perfectly symmetrical cross centered at (0, -10) */}
    <g stroke="#E2E8F0" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-11,-10 L-3,-10 M-6,-13 L-3,-10 L-6,-7" /> {/* Left arrow IN */}
      <path d="M11,-10 L3,-10 M6,-13 L3,-10 L6,-7" /> {/* Right arrow IN */}
      <path d="M0,-13 L0,-21 M-3,-18 L0,-21 L3,-18" /> {/* Top arrow OUT */}
      <path d="M0,-7 L0,1 M-3,-2 L0,1 L3,-2" /> {/* Bottom arrow OUT */}
    </g>
    {/* Label perfectly placed in the vertical center of the visible front face */}
    {label && (
      <text x="0" y="18" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontWeight="600">{label}</text>
    )}
  </g>
);

const SwitchIcon = ({ x, y, scale = 1.4, label }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    {/* Top face */}
    <path d="M-30,-12 L30,-12 L45,2 L-45,2 Z" fill="#2A2D32" stroke="#525660" strokeWidth="1.9" strokeLinejoin="round" />
    {/* Front face (made taller) */}
    <path d="M-45,2 L45,2 L45,28 L-45,28 Z" fill="#222428" stroke="#525660" strokeWidth="1.9" strokeLinejoin="round" />
    {/* Arrows on the top face */}
    <g stroke="#E2E8F0" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-12,-3 L12,-3 M8,-6 L12,-3 L8,0" />
      <path d="M12,-7 L-12,-7 M-8,-10 L-12,-7 L-8,-4" />
    </g>
    {/* Label on the front face */}
    {label && (
      <text x="0" y="20" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontWeight="600">{label}</text>
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
            <line x1="400" y1="80" x2="400" y2="190" stroke="#2F80ED" strokeWidth="2.5" />
            <line x1="400" y1="190" x2="260" y2="300" stroke="#2F80ED" strokeWidth="2.5" />
            <line x1="400" y1="190" x2="540" y2="300" stroke="#2F80ED" strokeWidth="2.5" />

            {/* Link Labels */}
            <text x="415" y="135" fill="#E2E8F0" fontSize="13" fontWeight="500">e0/0</text>
            <text x="315" y="240" fill="#E2E8F0" fontSize="13" fontWeight="500" textAnchor="end">VLAN 10</text>
            <text x="485" y="240" fill="#E2E8F0" fontSize="13" fontWeight="500" textAnchor="start">VLAN 20</text>

            {/* Nodes with embedded labels */}
            <RouterIcon x="400" y="80" scale={1.3} label="R1" />
            <SwitchIcon x="400" y="190" scale={1.3} label="SW1" />
            <PCIcon x="260" y="300" scale={1.3} label="PC1" />
            <PCIcon x="540" y="300" scale={1.3} label="PC2" />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 680 272" style={{ fontFamily: 'Inter, sans-serif' }}>
        <g transform="translate(15, -10)">
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
          <RouterIcon x="150" y="140" label="R1" scale={1.5} />
          <RouterIcon x="500" y="140" label="R2" scale={1.5} />
        </g>
      </svg>
    </div>
  );
}