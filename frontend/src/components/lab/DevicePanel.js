import React, { useState } from 'react';

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

export default function DevicePanel({ 
  lab, session, isBooting,
  activeTerminal, setActiveTerminal 
}) {
  const [openCategories, setOpenCategories] = useState({ Routers: true, Switches: true, EndHosts: true });

  const toggleCategory = (cat) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const routers = lab?.nodes?.filter(n => n.device_type === 'cisco_ios_telnet' || n.device_type === 'cisco_ios') || [];
  const switches = lab?.nodes?.filter(n => n.device_type === 'cisco_iol_l2') || [];
  const endHosts = lab?.nodes?.filter(n => n.device_type === 'linux' || n.device_type === 'vpcs') || [];

  return (
    <aside className="nx-sidebar-right nx-card">
      <div className="nx-section-header">
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px' }}>Devices</span>
      </div>

      <div>
        <div className="nx-right-section-label">Topology Nodes</div>
        
        {/* Routers */}
        <div className="nx-device-category">
          <div className="nx-device-category-header" onClick={() => toggleCategory('Routers')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="nx-right-topo-icon"><SidebarRouterIcon /></div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Routers</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: openCategories.Routers ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          {openCategories.Routers && (
            <div style={{ background: 'var(--bg-lighter)', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              {routers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {routers.map(node => (
                    <div
                      key={node.name}
                      className={`nx-node-row ${activeTerminal === node.name ? 'active' : ''}`}
                      onClick={() => setActiveTerminal(node.name)}
                    >
                      <div className="nx-node-icon"><SidebarRouterIcon /></div>
                      <span className="nx-node-name">{node.name}</span>
                      <div className={(session && !isBooting) ? 'nx-node-online' : 'nx-node-offline'} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Switches */}
        <div className="nx-device-category">
          <div className="nx-device-category-header" onClick={() => toggleCategory('Switches')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="nx-right-topo-icon"><SidebarSwitchIcon /></div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Switches</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: openCategories.Switches ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          {openCategories.Switches && (
            <div style={{ background: 'var(--bg-lighter)', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              {switches.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {switches.map(node => (
                    <div
                      key={node.name}
                      className={`nx-node-row ${activeTerminal === node.name ? 'active' : ''}`}
                      onClick={() => setActiveTerminal(node.name)}
                    >
                      <div className="nx-node-icon"><SidebarSwitchIcon /></div>
                      <span className="nx-node-name">{node.name}</span>
                      <div className={(session && !isBooting) ? 'nx-node-online' : 'nx-node-offline'} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* End Hosts */}
        <div className="nx-device-category">
          <div className="nx-device-category-header" onClick={() => toggleCategory('EndHosts')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="nx-right-topo-icon"><SidebarPCIcon /></div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>End Hosts</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: openCategories.EndHosts ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          {openCategories.EndHosts && (
            <div style={{ background: 'var(--bg-lighter)', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              {endHosts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {endHosts.map(node => (
                    <div
                      key={node.name}
                      className={`nx-node-row ${activeTerminal === node.name ? 'active' : ''}`}
                      onClick={() => setActiveTerminal(node.name)}
                    >
                      <div className="nx-node-icon"><SidebarPCIcon /></div>
                      <span className="nx-node-name">{node.name}</span>
                      <div className={(session && !isBooting) ? 'nx-node-online' : 'nx-node-offline'} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
