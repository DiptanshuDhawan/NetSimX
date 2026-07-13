import React from 'react';
import RouterIcon from '../icons/RouterIcon';
import SwitchIcon from '../icons/SwitchIcon';
import PCIcon from '../icons/PCIcon';

export default function SshHardeningTopology({ activeNode }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 800 380" style={{ fontFamily: 'Inter, sans-serif' }}>
        <g transform="translate(0, 0)">
          {/* Connection Lines */}
          <line x1="400" y1="60" x2="400" y2="190" stroke="#2F80ED" strokeWidth="2.5" />
          <line x1="400" y1="190" x2="400" y2="320" stroke="#2F80ED" strokeWidth="2.5" />

          {/* Nodes (Standard Order) */}
          <RouterIcon x="400" y="60" scale={1.3} label="R1" active={activeNode === 'R1'} />
          <SwitchIcon x="400" y="190" scale={1.3} label="SW1" active={activeNode === 'SW1'} />
          <PCIcon x="400" y="320" scale={1.3} label="PC1" active={activeNode === 'PC1'} />

          {/* Link Labels */}
          <text x="410" y="105" fill="#E2E8F0" fontSize="13" fontWeight="500">e0/0</text>
          <text x="410" y="162" fill="#E2E8F0" fontSize="13" fontWeight="500">e0/1</text>
          
          <text x="410" y="245" fill="#E2E8F0" fontSize="13" fontWeight="500">e0/2</text>
          <text x="410" y="280" fill="#E2E8F0" fontSize="13" fontWeight="500">e0/0</text>

          {/* Subnet / IP Info */}
          {/* R1 IP */}
          <text x="460" y="65" fill="#E2E8F0" fontSize="13" fontWeight="500" textAnchor="start">192.168.10.1/24</text>
          
          {/* SW1 IP */}
          <text x="460" y="185" fill="#E2E8F0" fontSize="13" fontWeight="500" textAnchor="start">VLAN1 Mgmt</text>
          <text x="460" y="200" fill="#A1A9B6" fontSize="12" textAnchor="start">192.168.10.2/24</text>
          
          {/* PC1 IP */}
          <text x="460" y="315" fill="#E2E8F0" fontSize="13" fontWeight="500" textAnchor="start">192.168.10.10/24</text>
          <text x="460" y="330" fill="#A1A9B6" fontSize="12" textAnchor="start">GW: 192.168.10.1</text>

          {/* Network label */}
          <text x="340" y="120" fill="#E2E8F0" fontSize="16" fontWeight="600" textAnchor="end">Management Network</text>
          <text x="340" y="140" fill="#A1A9B6" fontSize="14" textAnchor="end">192.168.10.0/24</text>
        </g>
      </svg>
    </div>
  );
}
