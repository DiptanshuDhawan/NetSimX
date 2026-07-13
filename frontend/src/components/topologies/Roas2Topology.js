import React from 'react';
import RouterIcon from '../icons/RouterIcon';
import SwitchIcon from '../icons/SwitchIcon';
import PCIcon from '../icons/PCIcon';

export default function Roas2Topology({ activeNode }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 800 450" style={{ fontFamily: 'Inter, sans-serif' }}>
        <g transform="translate(0, 30)">
          {/* VLAN Backgrounds */}
          <rect x="50" y="220" width="120" height="150" fill="#2F80ED" opacity="0.40" stroke="#2F80ED" strokeWidth="2" rx="8" />
          <text x="110" y="355" fill="#FFFFFF" fontSize="15" fontWeight="600" textAnchor="middle">VLAN 10</text>
          
          <rect x="180" y="220" width="120" height="150" fill="#EB5757" opacity="0.40" stroke="#EB5757" strokeWidth="2" rx="8" />
          <text x="240" y="355" fill="#FFFFFF" fontSize="15" fontWeight="600" textAnchor="middle">VLAN 20</text>
          
          <rect x="380" y="220" width="120" height="150" fill="#9B51E0" opacity="0.40" stroke="#9B51E0" strokeWidth="2" rx="8" />
          <text x="440" y="355" fill="#FFFFFF" fontSize="15" fontWeight="600" textAnchor="middle">VLAN 30</text>
          
          <rect x="510" y="220" width="120" height="150" fill="#EB5757" opacity="0.40" stroke="#EB5757" strokeWidth="2" rx="8" />
          <text x="570" y="355" fill="#FFFFFF" fontSize="15" fontWeight="600" textAnchor="middle">VLAN 20</text>

          {/* Connection Lines */}
          <line x1="500" y1="40" x2="480" y2="150" stroke="#000000" strokeWidth="2.5" />
          <line x1="200" y1="150" x2="480" y2="150" stroke="#000000" strokeWidth="2.5" strokeDasharray="8 4" />
          <line x1="200" y1="150" x2="110" y2="290" stroke="#000000" strokeWidth="2.5" />
          <line x1="200" y1="150" x2="240" y2="290" stroke="#000000" strokeWidth="2.5" />
          <line x1="480" y1="150" x2="440" y2="290" stroke="#000000" strokeWidth="2.5" />
          <line x1="480" y1="150" x2="570" y2="290" stroke="#000000" strokeWidth="2.5" />

          {/* Interface Labels */}
          <text x="515" y="85" fill="#E2E8F0" fontSize="12" fontWeight="500">e0/0</text>
          <text x="500" y="110" fill="#E2E8F0" fontSize="12" fontWeight="500">e0/0</text>
          
          <text x="275" y="140" fill="#E2E8F0" fontSize="12" fontWeight="500">e0/0</text>
          <text x="390" y="140" fill="#E2E8F0" fontSize="12" fontWeight="500">e0/1</text>
          
          <text x="155" y="205" fill="#E2E8F0" fontSize="12" fontWeight="500">e0/1</text>
          <text x="220" y="205" fill="#E2E8F0" fontSize="12" fontWeight="500">e0/2</text>
          
          <text x="450" y="205" fill="#E2E8F0" fontSize="12" fontWeight="500">e0/2</text>
          <text x="525" y="205" fill="#E2E8F0" fontSize="12" fontWeight="500">e0/3</text>

          {/* Nodes */}
          <RouterIcon x="500" y="40" label="R1" scale={1.3} active={activeNode === 'R1'} />
          <SwitchIcon x="200" y="150" label="S1" scale={1.3} active={activeNode === 'S1'} />
          <SwitchIcon x="480" y="150" label="S2" scale={1.3} active={activeNode === 'S2'} />
          
          <PCIcon x="110" y="290" label="PC0" scale={1.2} active={activeNode === 'PC0'} />
          <PCIcon x="240" y="290" label="PC1" scale={1.2} active={activeNode === 'PC1'} />
          <PCIcon x="440" y="290" label="PC2" scale={1.2} active={activeNode === 'PC2'} />
          <PCIcon x="570" y="290" label="PC3" scale={1.2} active={activeNode === 'PC3'} />
        </g>
      </svg>
    </div>
  );
}
