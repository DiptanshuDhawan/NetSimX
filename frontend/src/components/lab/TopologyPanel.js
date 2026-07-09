import React from 'react';
import TopologyRenderer from '../topologies/TopologyRenderer';

export default function TopologyPanel({ lab, activeTerminal, setActiveTerminal }) {
  return (
    <div className="nx-topo-panel nx-card">
      <div className="nx-topo-header">
        Topology · {lab?.title || 'Lab'}
      </div>
      <div className="nx-topo-canvas" onClick={(e) => {
        // Find if they clicked near a node (optional enhancement later)
      }}>
        <TopologyRenderer 
          slug={lab?.slug} 
          activeNode={activeTerminal}
        />
      </div>
    </div>
  );
}
