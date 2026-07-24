import React from 'react';
import SwitchIcon from '../icons/SwitchIcon';
import PCIcon from '../icons/PCIcon';

export default function EtherchannelLacpTopology({ activeNode }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 800 360" style={{ fontFamily: 'Inter, sans-serif' }}>

        {/* Legend — top RIGHT, floated, not part of main layout flow */}
        <line x1="592" y1="18" x2="628" y2="18" stroke="#F59E0B" strokeWidth="3" />
        <line x1="592" y1="27" x2="628" y2="27" stroke="#F59E0B" strokeWidth="3" />
        <text x="636" y="27" fill="#A1A9B6" fontSize="11">EtherChannel (LACP)</text>

        {/* ── Main topology — vertically centered in viewBox ── */}

        {/* EtherChannel bundle label */}
        <text x="400" y="75" fill="#F59E0B" fontSize="12" fontWeight="700" textAnchor="middle">Port-Channel 1 (LACP)</text>

        {/* EtherChannel bundle — double parallel lines */}
        <line x1="268" y1="87" x2="532" y2="87" stroke="#F59E0B" strokeWidth="3" />
        <line x1="268" y1="97" x2="532" y2="97" stroke="#F59E0B" strokeWidth="3" />

        {/* e0/0 + e0/1 label below bundle */}
        <text x="400" y="116" fill="#A1A9B6" fontSize="11" textAnchor="middle">e0/0 + e0/1</text>

        {/* Switch nodes — centered on bundle */}
        <SwitchIcon x="200" y="92" scale={1.3} label="S1" active={activeNode === 'S1'} />
        <SwitchIcon x="600" y="92" scale={1.3} label="S2" active={activeNode === 'S2'} />

        {/* Vertical wires from switch down to PC */}
        <line x1="200" y1="128" x2="200" y2="188" stroke="#2F80ED" strokeWidth="2.5" />
        <line x1="600" y1="128" x2="600" y2="188" stroke="#2F80ED" strokeWidth="2.5" />

        {/* Interface labels */}
        <text x="212" y="165" fill="#E2E8F0" fontSize="12" fontWeight="500">e0/2</text>
        <text x="612" y="165" fill="#E2E8F0" fontSize="12" fontWeight="500">e0/2</text>

        {/* PC nodes */}
        <PCIcon x="200" y="200" scale={1.2} label="PC1" active={activeNode === 'PC1'} />
        <PCIcon x="600" y="200" scale={1.2} label="PC2" active={activeNode === 'PC2'} />

        {/* VLAN info boxes — clearly below PCs */}
        <rect x="110" y="244" width="180" height="56" fill="#2F80ED" opacity="0.18" stroke="#2F80ED" strokeWidth="1.5" rx="8" />
        <text x="200" y="269" fill="#E2E8F0" fontSize="12" fontWeight="600" textAnchor="middle">VLAN 10 — SALES</text>
        <text x="200" y="287" fill="#A1A9B6" fontSize="11" textAnchor="middle">10.10.10.1/24</text>

        <rect x="510" y="244" width="180" height="56" fill="#2F80ED" opacity="0.18" stroke="#2F80ED" strokeWidth="1.5" rx="8" />
        <text x="600" y="269" fill="#E2E8F0" fontSize="12" fontWeight="600" textAnchor="middle">VLAN 10 — SALES</text>
        <text x="600" y="287" fill="#A1A9B6" fontSize="11" textAnchor="middle">10.10.10.2/24</text>

      </svg>
    </div>
  );
}
