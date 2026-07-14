import React from 'react';
import dynamic from 'next/dynamic';

const Terminal = dynamic(() => import('@/components/Terminal'), { ssr: false });

const SidebarRouterIcon = () => (
  <svg width="18" height="18" viewBox="-42 -30 84 60">
    <path d="M-38,-10 v22 a38,14 0 0,0 76,0 v-22 Z" fill="#222428" stroke="#9ca3af" strokeWidth="4" />
    <ellipse cx="0" cy="-10" rx="38" ry="14" fill="#2A2D32" stroke="#9ca3af" strokeWidth="4" />
    <g stroke="#E2E8F0" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-4,-10 L-15,-10 M-11,-14 L-15,-10 L-11,-6" />
      <path d="M4,-10 L15,-10 M11,-14 L15,-10 L11,-6" />
      <path d="M0,-21 L0,-14 M-4,-18 L0,-14 L4,-18" />
      <path d="M0,1 L0,-6 M-4,-2 L0,-6 L4,-2" />
    </g>
  </svg>
);

const SidebarSwitchIcon = () => (
  <svg width="18" height="18" viewBox="-42 -30 84 60">
    <path d="M -38 0 L 18 0 L 18 20 L -38 20 Z" fill="#222428" stroke="#9ca3af" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M -38 0 L -18 -22 L 38 -22 L 18 0 Z" fill="#2A2D32" stroke="#9ca3af" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M 18 0 L 38 -22 L 38 -2 L 18 20 Z" fill="#1A1C1E" stroke="#9ca3af" strokeWidth="4" strokeLinejoin="round"/>
    <g stroke="#E2E8F0" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M -12 -15 L 12 -15 M 6 -19 L 12 -15 L 6 -11" />
      <path d="M -12 -7 L 12 -7 M -6 -11 L -12 -7 L -6 -3" />
    </g>
  </svg>
);

const SidebarPCIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="13" rx="2" ry="2" fill="#222428"/>
    <path d="M8 20h8 M12 17v3" />
  </svg>
);

export default function TerminalPanel({
  lab, session, isBooting, bootProgress,
  activeTerminal, setActiveTerminal,
  termFontSize, setTermFontSize,
  wsRefs, bufRefs
}) {
  const nodes = lab?.nodes?.map(n => n.name) || [];

  return (
    <div className="nx-term-panel nx-card" style={{ padding: 0 }}>
      <div className="nx-term-tabs" style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {lab?.nodes?.map(node => (
            <button
              key={node.name}
              className={`nx-term-tab ${activeTerminal === node.name ? 'active' : ''}`}
              onClick={() => setActiveTerminal(node.name)}
              disabled={!session || isBooting}
            >
              <span className="tab-icon">
                {node.device_type === 'cisco_iol_l2' ? <SidebarSwitchIcon /> : 
                 (node.device_type === 'linux' || node.device_type === 'vpcs') ? <SidebarPCIcon /> : 
                 <SidebarRouterIcon />}
              </span>
              {node.name}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className="nx-btn" 
            style={{ padding: '4px 8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
            onClick={() => setTermFontSize(f => Math.max(12, f - 2))}
            title="Decrease Font Size"
          >
            A-
          </button>
          <button 
            className="nx-btn" 
            style={{ padding: '4px 8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
            onClick={() => setTermFontSize(f => Math.min(24, f + 2))}
            title="Increase Font Size"
          >
            A+
          </button>
        </div>
      </div>
      <div className="nx-term-body">
        {!session || isBooting ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)' }}>
            {isBooting ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}>
                <svg className="nx-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span style={{ fontSize: 13, letterSpacing: '0.5px' }}>BOOTING ENVIRONMENT... {bootProgress}%</span>
              </div>
            ) : (
              <>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="3" ry="3"/>
                    <polyline points="7 10 10 13 7 16"/>
                    <line x1="12" y1="16" x2="16" y2="16"/>
                  </svg>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14, letterSpacing: '0.5px', marginBottom: 6 }}>ENVIRONMENT OFFLINE</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13, letterSpacing: '0.5px' }}>PRESS THE PLAY BUTTON TO START THE LAB SESSION</div>
              </>
            )}
          </div>
        ) : (
          nodes.map(node => (
            <div key={node} style={{ display: activeTerminal === node ? 'block' : 'none', height: '100%' }}>
              <Terminal ws={wsRefs.current[node]} buffer={bufRefs.current[node]} nodeName={node} fontSize={termFontSize} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
