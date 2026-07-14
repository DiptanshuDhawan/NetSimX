import React from 'react';
import RouterIcon from '../icons/RouterIcon';

const AtomicClock = ({ x, y }) => (
  <g transform={`translate(${x}, ${y}) scale(0.6)`}>
    <circle cx="0" cy="0" r="28" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
    <ellipse cx="0" cy="0" rx="20" ry="7" fill="none" stroke="#38BDF8" strokeWidth="1.5" transform="rotate(30)" />
    <ellipse cx="0" cy="0" rx="20" ry="7" fill="none" stroke="#38BDF8" strokeWidth="1.5" transform="rotate(90)" />
    <ellipse cx="0" cy="0" rx="20" ry="7" fill="none" stroke="#38BDF8" strokeWidth="1.5" transform="rotate(150)" />
    <circle cx="0" cy="0" r="3" fill="#38BDF8" />
  </g>
);

export default function NtpFundamentalsTopology({ activeNode }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 1000 380" style={{ fontFamily: 'Inter, sans-serif' }}>
        
        {/* Stratum Dividers */}
        <line x1="225" y1="20" x2="225" y2="360" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="500" y1="20" x2="500" y2="360" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="775" y1="20" x2="775" y2="360" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />

        {/* Stratum Labels */}
        <text x="100" y="40" textAnchor="middle" fill="#A1A9B6" fontSize="13" fontWeight="600" letterSpacing="1">STRATUM 0</text>
        <text x="350" y="40" textAnchor="middle" fill="#A1A9B6" fontSize="13" fontWeight="600" letterSpacing="1">STRATUM 1</text>
        <text x="650" y="40" textAnchor="middle" fill="#A1A9B6" fontSize="13" fontWeight="600" letterSpacing="1">STRATUM 2</text>
        <text x="900" y="40" textAnchor="middle" fill="#A1A9B6" fontSize="13" fontWeight="600" letterSpacing="1">STRATUM 3</text>

        {/* Connection Lines */}
        <line x1="100" y1="190" x2="350" y2="190" stroke="#555" strokeWidth="2" strokeDasharray="5 5" />
        <line x1="350" y1="190" x2="650" y2="190" stroke="#2F80ED" strokeWidth="2.5" />
        <line x1="650" y1="190" x2="900" y2="90" stroke="#2F80ED" strokeWidth="2.5" />
        <line x1="650" y1="190" x2="900" y2="290" stroke="#2F80ED" strokeWidth="2.5" />

        {/* Nodes (Drawn after lines, so lines are under nodes) */}
        <AtomicClock x={100} y={190} />
        <RouterIcon x="350" y="190" label="R0" scale={1.3} active={activeNode === 'R0'} />
        <RouterIcon x="650" y="190" label="R1" scale={1.3} active={activeNode === 'R1'} />
        <RouterIcon x="900" y="90" label="R2" scale={1.3} active={activeNode === 'R2'} />
        <RouterIcon x="900" y="290" label="R3" scale={1.3} active={activeNode === 'R3'} />

        {/* Text and Arrows (Drawn last, so they are always on top of everything) */}
        <text x="100" y="230" textAnchor="middle" fill="#E2E8F0" fontSize="12" fontWeight="600">Atomic Clock</text>

        {/* Sync arrows */}
        <path d="M 215 185 L 225 190 L 215 195" fill="none" stroke="#A1A9B6" strokeWidth="2" />
        <path d="M 490 185 L 500 190 L 490 195" fill="none" stroke="#2F80ED" strokeWidth="2" />
        <g transform="translate(775, 140) rotate(-21)"><path d="M -5 -5 L 5 0 L -5 5" fill="none" stroke="#2F80ED" strokeWidth="2" /></g>
        <g transform="translate(775, 240) rotate(21)"><path d="M -5 -5 L 5 0 L -5 5" fill="none" stroke="#2F80ED" strokeWidth="2" /></g>

        {/* R0-R1 Texts */}
        <text x="500" y="175" textAnchor="middle" fill="#A1A9B6" fontSize="12">192.168.10.0/24</text>
        <text x="430" y="180" textAnchor="middle" fill="#E2E8F0" fontSize="13" fontWeight="500">e0/0</text>
        <text x="430" y="205" textAnchor="middle" fill="#A1A9B6" fontSize="12">.1</text>
        <text x="570" y="180" textAnchor="middle" fill="#E2E8F0" fontSize="13" fontWeight="500">e0/2</text>
        <text x="570" y="205" textAnchor="middle" fill="#A1A9B6" fontSize="12">.2</text>

        {/* R1-R2 Texts */}
        <text x="775" y="120" textAnchor="middle" fill="#A1A9B6" fontSize="12">192.168.12.0/24</text>
        <text x="725" y="150" textAnchor="middle" fill="#E2E8F0" fontSize="13" fontWeight="500">e0/0</text>
        <text x="725" y="175" textAnchor="middle" fill="#A1A9B6" fontSize="12">.1</text>
        <text x="825" y="110" textAnchor="middle" fill="#E2E8F0" fontSize="13" fontWeight="500">e0/0</text>
        <text x="825" y="135" textAnchor="middle" fill="#A1A9B6" fontSize="12">.2</text>

        {/* R1-R3 Texts */}
        <text x="775" y="225" textAnchor="middle" fill="#A1A9B6" fontSize="12">192.168.13.0/24</text>
        <text x="725" y="210" textAnchor="middle" fill="#E2E8F0" fontSize="13" fontWeight="500">e0/1</text>
        <text x="725" y="235" textAnchor="middle" fill="#A1A9B6" fontSize="12">.1</text>
        <text x="825" y="250" textAnchor="middle" fill="#E2E8F0" fontSize="13" fontWeight="500">e0/0</text>
        <text x="825" y="275" textAnchor="middle" fill="#A1A9B6" fontSize="12">.2</text>

      </svg>
    </div>
  );
}
