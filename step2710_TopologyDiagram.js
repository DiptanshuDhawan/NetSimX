import React from 'react';

const RouterIcon = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <ellipse cx="0" cy="-10" rx="32" ry="12" fill="transparent" stroke="#f1f5f9" strokeWidth="1.5" />
    <path d="M-32,-10 v20 a32,12 0 0,0 64,0 v-20" fill="transparent" stroke="#f1f5f9" strokeWidth="1.5" />
    {/* 4 arrows in center */}
    <g stroke="#f1f5f9" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Left arrow pointing right */}
      <path d="M-12,-10 L-2,-10 M-6,-14 L-2,-10 L-6,-6" />
      {/* Right arrow pointing left */}
      <path d="M12,-10 L2,-10 M6,-14 L2,-10 L6,-6" />
      {/* Top arrow pointing down */}
      <path d="M0,-22 L0,-12 M-4,-16 L0,-12 L4,-16" />
      {/* Bottom arrow pointing up */}
      <path d="M0,2 L0,-8 M-4,-4 L0,-8 L4,-4" />
    </g>
  </g>
);

const CloudIcon = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <path 
      d="M-20,0 a12,12 0 0,1 0,-24 a16,16 0 0,1 32,-8 a14,14 0 0,1 24,12 a10,10 0 0,1 0,20 Z" 
      fill="transparent" 
      stroke="#f1f5f9" 
      strokeWidth="1.5" 
    />
  </g>
);

export default function TopologyDiagram() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="600" height="200" viewBox="0 0 600 200" style={{ fontFamily: 'Inter, sans-serif' }}>
        
        {/* Connection Line: IOU1 to IOU2 */}
        <line x1="180" y1="100" x2="350" y2="100" stroke="#3b82f6" strokeWidth="2" />
        
        {/* Connection Line: IOU2 to Cloud */}
        <line x1="410" y1="100" x2="490" y2="100" stroke="#f1f5f9" strokeWidth="1.5" />

        {/* Routers and Cloud */}
        <RouterIcon x="150" y="100" />
        <RouterIcon x="380" y="100" />
        <CloudIcon x="510" y="90" />

        {/* Main Network Labels */}
        <text x="265" y="75" textAnchor="middle" fill="#f1f5f9" fontSize="14" fontWeight="600">192.168.1.0/24</text>
        <text x="265" y="90" textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="500">OSPF Area 0</text>

        {/* Interface Labels */}
        <text x="185" y="92" fill="#94a3b8" fontSize="11">e0/0</text>
        <text x="340" y="92" fill="#94a3b8" fontSize="11" textAnchor="end">e0/1</text>
        <text x="420" y="115" fill="#94a3b8" fontSize="11">e0/1</text>

        {/* Router 1 Labels */}
        <text x="150" y="145" textAnchor="middle" fill="#f1f5f9" fontSize="14" fontWeight="500">IOU1</text>
        <text x="150" y="165" textAnchor="middle" fill="#94a3b8" fontSize="12">192.168.1.1/24</text>

        {/* Router 2 Labels */}
        <text x="380" y="145" textAnchor="middle" fill="#f1f5f9" fontSize="14" fontWeight="500">IOU2</text>
        <text x="380" y="165" textAnchor="middle" fill="#94a3b8" fontSize="12">192.168.1.2/24</text>

      </svg>
    </div>
  );
}