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
      <svg width="100%" height="100%" viewBox="0 0 680 272" style={{ fontFamily: 'Inter, sans-serif' }}>
        
        {/* Stratum Dividers */}
        <line x1="110" y1="20" x2="110" y2="252" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="240" y1="20" x2="240" y2="252" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="425" y1="20" x2="425" y2="252" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />

        {/* Stratum Labels */}
        <text x="60" y="30" textAnchor="middle" fill="#A1A9B6" fontSize="12" fontWeight="600" letterSpacing="1">STRATUM 0</text>
        <text x="175" y="30" textAnchor="middle" fill="#A1A9B6" fontSize="12" fontWeight="600" letterSpacing="1">STRATUM 1</text>
        <text x="332" y="30" textAnchor="middle" fill="#A1A9B6" fontSize="12" fontWeight="600" letterSpacing="1">STRATUM 2</text>
        <text x="550" y="30" textAnchor="middle" fill="#A1A9B6" fontSize="12" fontWeight="600" letterSpacing="1">STRATUM 3</text>

        <g transform="translate(0, 0)">
          {/* Region Bounding Boxes */}
          <rect x="15" y="45" width="210" height="195" rx="12" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" strokeDasharray="6 6" />
          <text x="120" y="65" textAnchor="middle" fill="#94A3B8" fontSize="11" fontWeight="600" letterSpacing="0.5">EXTERNAL</text>

          {/* Internal Corporate Network Box Removed as requested */}

          {/* Connection Lines */}
          {/* Atomic Clock to Stratum 1 Router */}
          <line x1="60" y1="140" x2="175" y2="140" stroke="#555" strokeWidth="2" strokeDasharray="5 5" />
          {/* R0 to R1 */}
          <line x1="175" y1="140" x2="332" y2="140" stroke="#2F80ED" strokeWidth="2.5" />
          
          {/* R1 to R2 */}
          <line x1="332" y1="140" x2="550" y2="90" stroke="#2F80ED" strokeWidth="2.5" />
          
          {/* R1 to R3 */}
          <line x1="332" y1="140" x2="550" y2="190" stroke="#2F80ED" strokeWidth="2.5" />

          {/* Sync arrows */}
          <path d="M 115 135 L 125 140 L 115 145" fill="none" stroke="#A1A9B6" strokeWidth="2" />
          <path d="M 255 135 L 265 140 L 255 145" fill="none" stroke="#2F80ED" strokeWidth="2" />
          
          {/* Sync arrow R1 -> R2 */}
          <g transform="translate(435, 115) rotate(-13)"><path d="M -5 -5 L 5 0 L -5 5" fill="none" stroke="#2F80ED" strokeWidth="2" /></g>
          {/* Sync arrow R1 -> R3 */}
          <g transform="translate(435, 165) rotate(13)"><path d="M -5 -5 L 5 0 L -5 5" fill="none" stroke="#2F80ED" strokeWidth="2" /></g>

          {/* R0-R1 Subnet Text Masking (Above line) */}
          <text x="253" y="133" textAnchor="middle" fontSize="10" fontWeight="500" stroke="#0F172A" strokeWidth="4" strokeLinejoin="round">192.168.10.0/24</text>
          <text x="253" y="133" textAnchor="middle" fill="#E2E8F0" fontSize="10" fontWeight="500">192.168.10.0/24</text>
          
          {/* R0 e0/0 (Below line) */}
          <text x="210" y="155" fontSize="10" fontWeight="500" stroke="#0F172A" strokeWidth="4" strokeLinejoin="round">e0/0</text>
          <text x="210" y="155" fill="#E2E8F0" fontSize="10" fontWeight="500">e0/0</text>
          <text x="210" y="167" fontSize="10" stroke="#0F172A" strokeWidth="4" strokeLinejoin="round">.1</text>
          <text x="210" y="167" fill="#A1A9B6" fontSize="10">.1</text>
          
          {/* R1 e0/2 (Below line) */}
          <text x="297" y="155" fontSize="10" fontWeight="500" textAnchor="end" stroke="#0F172A" strokeWidth="4" strokeLinejoin="round">e0/2</text>
          <text x="297" y="155" fill="#E2E8F0" fontSize="10" fontWeight="500" textAnchor="end">e0/2</text>
          <text x="297" y="167" fontSize="10" textAnchor="end" stroke="#0F172A" strokeWidth="4" strokeLinejoin="round">.2</text>
          <text x="297" y="167" fill="#A1A9B6" fontSize="10" textAnchor="end">.2</text>

          {/* R1-R2 Subnet Text Masking (Top edge) */}
          <text x="441" y="105" textAnchor="middle" fontSize="10" fontWeight="500" stroke="#0F172A" strokeWidth="4" strokeLinejoin="round">192.168.12.0/24</text>
          <text x="441" y="105" textAnchor="middle" fill="#E2E8F0" fontSize="10" fontWeight="500">192.168.12.0/24</text>
          
          {/* R1 e0/0 (Top edge) */}
          <text x="370" y="115" fontSize="10" fontWeight="500" stroke="#0F172A" strokeWidth="4" strokeLinejoin="round">e0/0</text>
          <text x="370" y="115" fill="#E2E8F0" fontSize="10" fontWeight="500">e0/0</text>
          <text x="370" y="127" fontSize="10" stroke="#0F172A" strokeWidth="4" strokeLinejoin="round">.1</text>
          <text x="370" y="127" fill="#A1A9B6" fontSize="10">.1</text>
          
          {/* R2 e0/0 (Top edge) */}
          <text x="515" y="80" fontSize="10" fontWeight="500" textAnchor="end" stroke="#0F172A" strokeWidth="4" strokeLinejoin="round">e0/0</text>
          <text x="515" y="80" fill="#E2E8F0" fontSize="10" fontWeight="500" textAnchor="end">e0/0</text>
          <text x="515" y="92" fontSize="10" textAnchor="end" stroke="#0F172A" strokeWidth="4" strokeLinejoin="round">.2</text>
          <text x="515" y="92" fill="#A1A9B6" fontSize="10" textAnchor="end">.2</text>

          {/* R1-R3 Subnet Text Masking (Bottom edge) */}
          <text x="441" y="180" textAnchor="middle" fontSize="10" fontWeight="500" stroke="#0F172A" strokeWidth="4" strokeLinejoin="round">192.168.13.0/24</text>
          <text x="441" y="180" textAnchor="middle" fill="#E2E8F0" fontSize="10" fontWeight="500">192.168.13.0/24</text>
          
          {/* R1 e0/1 (Bottom edge) */}
          <text x="370" y="165" fontSize="10" fontWeight="500" stroke="#0F172A" strokeWidth="4" strokeLinejoin="round">e0/1</text>
          <text x="370" y="165" fill="#E2E8F0" fontSize="10" fontWeight="500">e0/1</text>
          <text x="370" y="177" fontSize="10" stroke="#0F172A" strokeWidth="4" strokeLinejoin="round">.1</text>
          <text x="370" y="177" fill="#A1A9B6" fontSize="10">.1</text>
          
          {/* R3 e0/0 (Bottom edge) */}
          <text x="515" y="200" fontSize="10" fontWeight="500" textAnchor="end" stroke="#0F172A" strokeWidth="4" strokeLinejoin="round">e0/0</text>
          <text x="515" y="200" fill="#E2E8F0" fontSize="10" fontWeight="500" textAnchor="end">e0/0</text>
          <text x="515" y="212" fontSize="10" textAnchor="end" stroke="#0F172A" strokeWidth="4" strokeLinejoin="round">.2</text>
          <text x="515" y="212" fill="#A1A9B6" fontSize="10" textAnchor="end">.2</text>

          {/* Atomic Clock */}
          <AtomicClock x={60} y={140} />
          <text x="60" y="175" textAnchor="middle" fill="#E2E8F0" fontSize="10" fontWeight="600">Atomic Clock</text>

          {/* Lab Nodes */}
          <RouterIcon x="175" y="140" label="R0" scale={1.2} active={activeNode === 'R0'} />
          
          <RouterIcon x="332" y="140" label="R1" scale={1.2} active={activeNode === 'R1'} />
          
          <RouterIcon x="550" y="90" label="R2" scale={1.2} active={activeNode === 'R2'} />
          
          <RouterIcon x="550" y="190" label="R3" scale={1.2} active={activeNode === 'R3'} />
        </g>
      </svg>
    </div>
  );
}
