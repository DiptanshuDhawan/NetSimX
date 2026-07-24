import React from 'react';
import SwitchIcon from '../icons/SwitchIcon';
import PCIcon from '../icons/PCIcon';

export default function EtherchannelLacpTopology({ activeNode }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 800 400" style={{ fontFamily: 'Inter, sans-serif' }}>

        {/* Legend — top left, small and unobtrusive */}
        <line x1="20" y1="22" x2="55" y2="22" stroke="#F59E0B" strokeWidth="3" />
        <line x1="20" y1="30" x2="55" y2="30" stroke="#F59E0B" strokeWidth="3" />
        <text x="62" y="30" fill="#A1A9B6" fontSize="11">EtherChannel (LACP)</text>

        {/* EtherChannel bundle — double parallel lines between switches */}
        <line x1="268" y1="143" x2="532" y2="143" stroke="#F59E0B" strokeWidth="3" />
        <line x1="268" y1="153" x2="532" y2="153" stroke="#F59E0B" strokeWidth="3" />

        {/* EtherChannel label above the bundle */}
        <text x="400" y="133" fill="#F59E0B" fontSize="12" fontWeight="700" textAnchor="middle">Port-Channel 1 (LACP)</text>
        <text x="400" y="170" fill="#A1A9B6" fontSize="11" textAnchor="middle">e0/0 + e0/1</text>

        {/* Switch nodes */}
        <SwitchIcon x="200" y="148" scale={1.3} label="S1" active={activeNode === 'S1'} />
        <SwitchIcon x="600" y="148" scale={1.3} label="S2" active={activeNode === 'S2'} />

        {/* Vertical lines from switch down to PC */}
        <line x1="200" y1="190" x2="200" y2="255" stroke="#2F80ED" strokeWidth="2.5" />
        <line x1="600" y1="190" x2="600" y2="255" stroke="#2F80ED" strokeWidth="2.5" />

        {/* Link labels on the vertical wires */}
        <text x="212" y="228" fill="#E2E8F0" fontSize="12" fontWeight="500">e0/2</text>
        <text x="612" y="228" fill="#E2E8F0" fontSize="12" fontWeight="500">e0/2</text>

        {/* PC nodes */}
        <PCIcon x="200" y="265" scale={1.2} label="PC1" active={activeNode === 'PC1'} />
        <PCIcon x="600" y="265" scale={1.2} label="PC2" active={activeNode === 'PC2'} />

        {/* VLAN info boxes — clearly below the PCs with a gap */}
        <rect x="110" y="320" width="180" height="58" fill="#2F80ED" opacity="0.18" stroke="#2F80ED" strokeWidth="1.5" rx="8" />
        <text x="200" y="346" fill="#E2E8F0" fontSize="12" fontWeight="600" textAnchor="middle">VLAN 10 — SALES</text>
        <text x="200" y="364" fill="#A1A9B6" fontSize="11" textAnchor="middle">10.10.10.1/24</text>

        <rect x="510" y="320" width="180" height="58" fill="#2F80ED" opacity="0.18" stroke="#2F80ED" strokeWidth="1.5" rx="8" />
        <text x="600" y="346" fill="#E2E8F0" fontSize="12" fontWeight="600" textAnchor="middle">VLAN 10 — SALES</text>
        <text x="600" y="364" fill="#A1A9B6" fontSize="11" textAnchor="middle">10.10.10.2/24</text>

      </svg>
    </div>
  );
}
