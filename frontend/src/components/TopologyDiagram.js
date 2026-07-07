import React from 'react';

const RouterIcon = ({ x, y }) => (
  <g transform={`translate(${x}, ${y}) scale(1.4)`}>
    {/* Cylinder body (drawn first so it goes behind the top face) */}
    <path d="M-38,-10 v22 a38,14 0 0,0 76,0 v-22 Z" fill="#222428" stroke="#525660" strokeWidth="1.9" />
    {/* Top face */}
    <ellipse cx="0" cy="-10" rx="38" ry="14" fill="#2A2D32" stroke="#525660" strokeWidth="1.9" />
    {/* 4 arrows: top/bottom point inward, left/right point outward */}
    <g stroke="#E2E8F0" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-4,-10 L-15,-10 M-11,-14 L-15,-10 L-11,-6" /> {/* Left arrow pointing OUT */}
      <path d="M4,-10 L15,-10 M11,-14 L15,-10 L11,-6" /> {/* Right arrow pointing OUT */}
      <path d="M0,-21 L0,-14 M-4,-18 L0,-14 L4,-18" /> {/* Top arrow pointing IN */}
      <path d="M0,1 L0,-6 M-4,-2 L0,-6 L4,-2" /> {/* Bottom arrow pointing IN */}
    </g>
  </g>
);

const SwitchIcon = ({ x, y }) => (
  <g transform={`translate(${x}, ${y}) scale(1.4)`}>
    {/* Cylinder body */}
    <path d="M-38,-10 v22 a38,14 0 0,0 76,0 v-22 Z" fill="#222428" stroke="#525660" strokeWidth="1.9" />
    {/* Top face */}
    <ellipse cx="0" cy="-10" rx="38" ry="14" fill="#2A2D32" stroke="#525660" strokeWidth="1.9" />
    {/* Parallel arrows for switch */}
    <g stroke="#E2E8F0" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-10,-15 L10,-15 M6,-18 L10,-15 L6,-12" />
      <path d="M10,-10 L-10,-10 M-6,-13 L-10,-10 L-6,-7" />
      <path d="M-10,-5 L10,-5 M6,-8 L10,-5 L6,-2" />
    </g>
  </g>
);

const PCIcon = ({ x, y }) => (
  <g transform={`translate(${x}, ${y}) scale(1.4)`}>
    {/* Monitor Frame */}
    <rect x="-24" y="-18" width="48" height="30" rx="3" fill="#2A2D32" stroke="#525660" strokeWidth="1.9" />
    {/* Monitor Screen */}
    <rect x="-20" y="-14" width="40" height="22" rx="1" fill="#222428" stroke="none" />
    {/* Stand */}
    <path d="M-6,12 L-10,20 L10,20 L6,12 Z" fill="#2A2D32" stroke="#525660" strokeWidth="1.9" strokeLinejoin="round" />
    {/* Base */}
    <rect x="-16" y="20" width="32" height="3" rx="1.5" fill="#525660" />
  </g>
);

export default function TopologyDiagram({ nodes = [], activeNode = null, onNodeClick = () => {} }) {
  const nodeNames = nodes.map(n => n.name);
  const isInterVlan = nodeNames.includes('SW1');

  if (isInterVlan) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 800 320" style={{ fontFamily: 'Inter, sans-serif' }}>
          <g transform="translate(0, 0)">
            {/* Connection Lines */}
            <line x1="400" y1="55" x2="400" y2="165" stroke="#2F80ED" strokeWidth="2.5" /> {/* R1 to SW1 */}
            <line x1="400" y1="165" x2="250" y2="265" stroke="#2F80ED" strokeWidth="2.5" /> {/* SW1 to PC1 */}
            <line x1="400" y1="165" x2="550" y2="265" stroke="#2F80ED" strokeWidth="2.5" /> {/* SW1 to PC2 */}

            {/* Link Labels */}
            <text x="415" y="115" fill="#E2E8F0" fontSize="13" fontWeight="500">e0/0</text>
            <text x="310" y="215" fill="#E2E8F0" fontSize="13" fontWeight="500" textAnchor="end">VLAN 10</text>
            <text x="490" y="215" fill="#E2E8F0" fontSize="13" fontWeight="500" textAnchor="start">VLAN 20</text>

            {/* Nodes */}
            <RouterIcon x="400" y="55" />
            <SwitchIcon x="400" y="165" />
            <PCIcon x="250" y="265" />
            <PCIcon x="550" y="265" />

            {/* Node Labels */}
            <text x="400" y="15" textAnchor="middle" fill="#E2E8F0" fontSize="16" fontWeight="600">R1</text>
            <text x="480" y="170" textAnchor="start" fill="#E2E8F0" fontSize="16" fontWeight="600">SW1</text>
            <text x="250" y="315" textAnchor="middle" fill="#E2E8F0" fontSize="16" fontWeight="600">PC1</text>
            <text x="550" y="315" textAnchor="middle" fill="#E2E8F0" fontSize="16" fontWeight="600">PC2</text>
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