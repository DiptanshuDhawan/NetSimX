import React from 'react';
import RouterIcon from '../icons/RouterIcon';
import SwitchIcon from '../icons/SwitchIcon';
import PCIcon from '../icons/PCIcon';

export default function InterVlanTopology({ activeNode }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 800 380" style={{ fontFamily: 'Inter, sans-serif' }}>
        <g transform="translate(0, 0)">
          {/* Connection Lines */}
          <line x1="400" y1="60" x2="400" y2="190" stroke="#2F80ED" strokeWidth="2.5" />
          <line x1="400" y1="190" x2="250" y2="320" stroke="#2F80ED" strokeWidth="2.5" />
          <line x1="400" y1="190" x2="550" y2="320" stroke="#2F80ED" strokeWidth="2.5" />

          {/* Nodes */}
          <RouterIcon x="400" y="60" scale={1.3} label="R1" active={activeNode === 'R1'} />
          <SwitchIcon x="400" y="190" scale={1.3} label="SW1" active={activeNode === 'SW1'} />
          <PCIcon x="250" y="320" scale={1.3} label="PC1" active={activeNode === 'PC1'} />
          <PCIcon x="550" y="320" scale={1.3} label="PC2" active={activeNode === 'PC2'} />

          {/* Link Labels */}
          <text x="410" y="105" fill="#E2E8F0" fontSize="13" fontWeight="500">e0/0</text>
          <text x="410" y="162" fill="#E2E8F0" fontSize="13" fontWeight="500">e0/0</text>
          
          <text x="352" y="245" fill="#E2E8F0" fontSize="13" fontWeight="500" textAnchor="start">e0/1</text>
          <text x="448" y="245" fill="#E2E8F0" fontSize="13" fontWeight="500" textAnchor="end">e0/2</text>

          {/* VLAN subnets */}
          <text x="295" y="255" fill="#E2E8F0" fontSize="13" fontWeight="500" textAnchor="end">VLAN 10</text>
          <text x="295" y="270" fill="#A1A9B6" fontSize="12" textAnchor="end">192.168.10.0/24</text>
          
          <text x="505" y="255" fill="#E2E8F0" fontSize="13" fontWeight="500" textAnchor="start">VLAN 20</text>
          <text x="505" y="270" fill="#A1A9B6" fontSize="12" textAnchor="start">192.168.20.0/24</text>
        </g>
      </svg>
    </div>
  );
}
