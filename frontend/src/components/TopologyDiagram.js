import React from 'react';

const RouterIcon = ({ x, y }) => (
  <g transform={`translate(${x}, ${y}) scale(1.09)`}>
    {/* Cylinder body (drawn first so it goes behind the top face) */}
    <path d="M-38,-10 v22 a38,14 0 0,0 76,0 v-22 Z" fill="#222428" stroke="#525660" strokeWidth="1.9" />
    {/* Top face */}
    <ellipse cx="0" cy="-10" rx="38" ry="14" fill="#2A2D32" stroke="#525660" strokeWidth="1.9" />
    {/* 4 arrows pointing inward, perfectly centered around (0, -10) */}
    <g stroke="#E2E8F0" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-15,-10 L-4,-10 M-8,-14 L-4,-10 L-8,-6" />
      <path d="M15,-10 L4,-10 M8,-14 L4,-10 L8,-6" />
      <path d="M0,-21 L0,-14 M-4,-18 L0,-14 L4,-18" />
      <path d="M0,1 L0,-6 M-4,-2 L0,-6 L4,-2" />
    </g>
  </g>
);

const CloudIcon = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <g transform="scale(1.29)">
      <path
        d="M-22,8 a14,14 0 0,1 4,-27 a18,18 0 0,1 34,-4 a16,16 0 0,1 22,12 a11,11 0 0,1 -2,20 Z"
        fill="#222428"
        stroke="#525660"
        strokeWidth="1.7"
      />
    </g>
  </g>
);

export default function TopologyDiagram() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="620" height="220" viewBox="0 0 620 220" style={{ fontFamily: 'Inter, sans-serif' }}>
        <g transform="translate(0, -20)">
          {/* Subnet label above link */}
          <text x="275" y="55" textAnchor="middle" fill="#E2E8F0" fontSize="13" fontWeight="600">192.168.1.0/24</text>

          {/* OSPF Area 0 text */}
          <text x="275" y="75" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="500">OSPF Area 0</text>

          {/* Connection Line: IOU1 to IOU2 */}
          <line x1="173" y1="105" x2="365" y2="105" stroke="#2F80ED" strokeWidth="2.0" />

          {/* Interface labels on link */}
          <text x="180" y="98" fill="#E2E8F0" fontSize="10">e0/0</text>
          <text x="353" y="98" fill="#E2E8F0" fontSize="10" textAnchor="end">e0/1</text>

          {/* Connection Line: IOU2 to Cloud */}
          <line x1="433" y1="105" x2="510" y2="105" stroke="#2F80ED" strokeWidth="2.0" />
          <text x="437" y="120" fill="#E2E8F0" fontSize="10">e0/1</text>

          {/* Nodes */}
          <RouterIcon x="155" y="105" />
          <RouterIcon x="395" y="105" />
          <CloudIcon x="535" y="95" />

          {/* Router labels */}
          <text x="155" y="162" textAnchor="middle" fill="#E2E8F0" fontSize="13" fontWeight="500">IOU1</text>
          <text x="155" y="179" textAnchor="middle" fill="#A1A9B6" fontSize="11">192.168.1.1/24</text>

          <text x="395" y="162" textAnchor="middle" fill="#E2E8F0" fontSize="13" fontWeight="500">IOU2</text>
          <text x="395" y="179" textAnchor="middle" fill="#A1A9B6" fontSize="11">192.168.1.2/24</text>
        </g>
      </svg>
    </div>
  );
}