import React from 'react';

const RouterIcon = ({ x, y, color = "#525660" }) => (
  <g transform={`translate(${x}, ${y}) scale(1.4)`}>
    {/* Cylinder body (drawn first so it goes behind the top face) */}
    <path d="M-38,-10 v22 a38,14 0 0,0 76,0 v-22 Z" fill="#222428" stroke={color} strokeWidth="1.9" />
    {/* Top face */}
    <ellipse cx="0" cy="-10" rx="38" ry="14" fill="#2A2D32" stroke={color} strokeWidth="1.9" />
    {/* 4 arrows: top/bottom point inward, left/right point outward */}
    <g stroke="#E2E8F0" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-4,-10 L-15,-10 M-11,-14 L-15,-10 L-11,-6" /> {/* Left arrow pointing OUT */}
      <path d="M4,-10 L15,-10 M11,-14 L15,-10 L11,-6" /> {/* Right arrow pointing OUT */}
      <path d="M0,-21 L0,-14 M-4,-18 L0,-14 L4,-18" /> {/* Top arrow pointing IN */}
      <path d="M0,1 L0,-6 M-4,-2 L0,-6 L4,-2" /> {/* Bottom arrow pointing IN */}
    </g>
  </g>
);

const CloudIcon = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <g transform="scale(1.6)">
      <path
        d="M-22,8 a14,14 0 0,1 4,-27 a18,18 0 0,1 34,-4 a16,16 0 0,1 22,12 a11,11 0 0,1 -2,20 Z"
        fill="#222428"
        stroke="#525660"
        strokeWidth="1.7"
      />
    </g>
  </g>
);

export default function TopologyDiagram({ nodes = [], activeNode = null, onNodeClick = () => {} }) {
  const nodeNames = nodes.map(n => n.name);
  const isInterVlan = nodeNames.includes('SW1');

  // Helper to determine node color based on status/active
  const getNodeColor = (name) => {
    if (activeNode === name) return '#2F80ED'; // Active terminal
    const node = nodes.find(n => n.name === name);
    if (!node || node.status === 'offline') return '#525660';
    if (node.status === 'booting') return '#F2C94C';
    return '#27AE60'; // running
  };

  if (isInterVlan) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 800 320" style={{ fontFamily: 'Inter, sans-serif' }}>
          <g transform="translate(100, 0)">
            {/* Connection Lines */}
            <line x1="300" y1="80" x2="300" y2="180" stroke="#2F80ED" strokeWidth="2.5" /> {/* R1 to SW1 */}
            <line x1="300" y1="180" x2="150" y2="280" stroke="#2F80ED" strokeWidth="2.5" /> {/* SW1 to PC1 */}
            <line x1="300" y1="180" x2="450" y2="280" stroke="#2F80ED" strokeWidth="2.5" /> {/* SW1 to PC2 */}

            {/* Labels */}
            <text x="310" y="130" fill="#E2E8F0" fontSize="13">e0/0</text>
            <text x="210" y="220" fill="#E2E8F0" fontSize="13">VLAN 10</text>
            <text x="390" y="220" fill="#E2E8F0" fontSize="13">VLAN 20</text>

            {/* Nodes */}
            <RouterIcon x="300" y="80" color={getNodeColor('R1')} />
            <text x="300" y="45" textAnchor="middle" fill="#E2E8F0" fontSize="16" fontWeight="600">R1</text>

            {/* Switch Icon (just a rectangle for simplicity) */}
            <rect x="260" y="160" width="80" height="40" rx="5" fill="#222428" stroke={getNodeColor('SW1')} strokeWidth="2" />
            <text x="300" y="185" textAnchor="middle" fill="#E2E8F0" fontSize="16" fontWeight="600">SW1</text>

            {/* PC1 */}
            <rect x="130" y="270" width="40" height="25" rx="3" fill="#222428" stroke={getNodeColor('PC1')} strokeWidth="2" />
            <text x="150" y="315" textAnchor="middle" fill="#E2E8F0" fontSize="14" fontWeight="600">PC1</text>

            {/* PC2 */}
            <rect x="430" y="270" width="40" height="25" rx="3" fill="#222428" stroke={getNodeColor('PC2')} strokeWidth="2" />
            <text x="450" y="315" textAnchor="middle" fill="#E2E8F0" fontSize="14" fontWeight="600">PC2</text>
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

          {/* Nodes (drawn after lines so they sit on top) */}
          <RouterIcon x="150" y="140" />
          <RouterIcon x="500" y="140" />

          {/* Router labels */}
          <text x="150" y="215" textAnchor="middle" fill="#E2E8F0" fontSize="16" fontWeight="600">R1</text>
          <text x="500" y="215" textAnchor="middle" fill="#E2E8F0" fontSize="16" fontWeight="600">R2</text>
        </g>
      </svg>
    </div>
  );
}