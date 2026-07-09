import React from 'react';
import OspfBasicTopology from './OspfBasicTopology';
import InterVlanTopology from './InterVlanTopology';
import ComprehensiveTopology from './ComprehensiveTopology';

export default function TopologyRenderer({ slug, activeNode }) {
  switch (slug) {
    case 'comprehensive-lab':
      return <ComprehensiveTopology activeNode={activeNode} />;
    case 'inter-vlan-routing':
      return <InterVlanTopology activeNode={activeNode} />;
    case 'ospf-basic':
    default:
      return <OspfBasicTopology activeNode={activeNode} />;
  }
}
