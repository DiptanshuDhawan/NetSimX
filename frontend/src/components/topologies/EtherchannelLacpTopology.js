import React from 'react';
import SwitchIcon from '../icons/SwitchIcon';
import PCIcon from '../icons/PCIcon';

export default function EtherchannelLacpTopology({ activeNode }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 800 420" style={{ fontFamily: 'Inter, sans-serif' }}>
        <g transform="translate(0, 0)">

          {/* EtherChannel bundle — double parallel lines to represent LAG */}
          <line x1="265" y1="205" x2="535" y2="205" stroke="#F59E0B" strokeWidth="3" />
          <line x1="265" y1="215" x2="535" y2="215" stroke="#F59E0B" strokeWidth="3" />

          {/* EtherChannel bundle label */}
          <text x="400" y="197" fill="#F59E0B" fontSize="12" fontWeight="700" textAnchor="middle">Port-Channel 1 (LACP)</text>
          <text x="400" y="232" fill="#A1A9B6" fontSize="11" textAnchor="middle">e0/0 + e0/1</text>

          {/* PC connections */}
          <line x1="200" y1="250" x2="200" y2="340" stroke="#2F80ED" strokeWidth="2.5" />
          <line x1="600" y1="250" x2="600" y2="340" stroke="#2F80ED" strokeWidth="2.5" />

          {/* VLAN 10 background box for both PCs */}
          <rect x="120" y="340" width="160" height="60" fill="#2F80ED" opacity="0.20" stroke="#2F80ED" strokeWidth="1.5" rx="8" />
          <rect x="520" y="340" width="160" height="60" fill="#2F80ED" opacity="0.20" stroke="#2F80ED" strokeWidth="1.5" rx="8" />
          <text x="200" y="372" fill="#E2E8F0" fontSize="12" fontWeight="600" textAnchor="middle">VLAN 10 — SALES</text>
          <text x="200" y="389" fill="#A1A9B6" fontSize="11" textAnchor="middle">10.10.10.1/24</text>
          <text x="600" y="372" fill="#E2E8F0" fontSize="12" fontWeight="600" textAnchor="middle">VLAN 10 — SALES</text>
          <text x="600" y="389" fill="#A1A9B6" fontSize="11" textAnchor="middle">10.10.10.2/24</text>

          {/* Nodes */}
          <SwitchIcon x="200" y="210" scale={1.3} label="S1" active={activeNode === 'S1'} />
          <SwitchIcon x="600" y="210" scale={1.3} label="S2" active={activeNode === 'S2'} />
          <PCIcon x="200" y="350" scale={1.2} label="PC1" active={activeNode === 'PC1'} />
          <PCIcon x="600" y="350" scale={1.2} label="PC2" active={activeNode === 'PC2'} />

          {/* Link labels */}
          <text x="212" y="285" fill="#E2E8F0" fontSize="12" fontWeight="500">e0/2</text>
          <text x="612" y="285" fill="#E2E8F0" fontSize="12" fontWeight="500">e0/2</text>

          {/* Legend */}
          <line x1="30" y1="55" x2="70" y2="55" stroke="#F59E0B" strokeWidth="3" />
          <line x1="30" y1="63" x2="70" y2="63" stroke="#F59E0B" strokeWidth="3" />
          <text x="78" y="63" fill="#A1A9B6" fontSize="12">EtherChannel (LACP)</text>
        </g>
      </svg>
    </div>
  );
}
