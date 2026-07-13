import React from 'react';
import OspfBasicTopology from './OspfBasicTopology';
import Roas1Topology from './Roas1Topology';
import Roas2Topology from './Roas2Topology';
import NtpFundamentalsTopology from './NtpFundamentalsTopology';
import SshHardeningTopology from './SshHardeningTopology';

export default function TopologyRenderer({ slug, activeNode }) {
  switch (slug) {
    case 'ssh-hardening':
      return <SshHardeningTopology activeNode={activeNode} />;
    case 'ntp-fundamentals':
      return <NtpFundamentalsTopology activeNode={activeNode} />;
    case 'roas-2':
      return <Roas2Topology activeNode={activeNode} />;
    case 'roas-1':
      return <Roas1Topology activeNode={activeNode} />;
    case 'ospf-basic':
    default:
      return <OspfBasicTopology activeNode={activeNode} />;
  }
}
