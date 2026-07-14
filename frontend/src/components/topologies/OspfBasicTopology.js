import React from 'react';
import RouterIcon from '../icons/RouterIcon';

export default function OspfBasicTopology({ activeNode }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 680 272" style={{ fontFamily: 'Inter, sans-serif' }}>
        <g transform="translate(15, -10)">
          {/* Connection Line: R1 to R2 */}
          <line x1="150" y1="140" x2="500" y2="140" stroke="#2F80ED" strokeWidth="2.5" />

          {/* Subnet & Area labels between R1 and R2 */}
          <text x="325" y="115" textAnchor="middle" fill="#E2E8F0" fontSize="13" fontWeight="500">OSPF Area 0</text>
          <text x="325" y="130" textAnchor="middle" fill="#A1A9B6" fontSize="12">192.168.1.0/24</text>

          {/* R1 Interface & Host IP */}
          <text x="215" y="130" fill="#E2E8F0" fontSize="13" fontWeight="500">e0/0</text>
          <text x="215" y="160" fill="#A1A9B6" fontSize="12">.1</text>

          {/* R2 Interface & Host IP (Left side) */}
          <text x="435" y="130" fill="#E2E8F0" fontSize="13" fontWeight="500" textAnchor="end">e0/1</text>
          <text x="435" y="160" fill="#A1A9B6" fontSize="12" textAnchor="end">.2</text>

          {/* Nodes with embedded labels */}
          <RouterIcon x="150" y="140" label="R1" scale={1.3} active={activeNode === 'R1'} />
          <RouterIcon x="500" y="140" label="R2" scale={1.3} active={activeNode === 'R2'} />
        </g>
      </svg>
    </div>
  );
}
