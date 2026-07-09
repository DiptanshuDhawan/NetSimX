import React from 'react';
import TopologyPanel from './TopologyPanel';
import TerminalPanel from './TerminalPanel';

export default function Workspace({
  lab, session, isBooting, bootProgress, linkStatus,
  activeTerminal, setActiveTerminal,
  termFontSize, setTermFontSize,
  wsRefs, bufRefs
}) {
  return (
    <div className="nx-workspace">
      <TopologyPanel 
        lab={lab} 
        activeTerminal={activeTerminal} 
        setActiveTerminal={setActiveTerminal} 
      />
      <TerminalPanel 
        lab={lab}
        session={session}
        isBooting={isBooting}
        bootProgress={bootProgress}
        activeTerminal={activeTerminal}
        setActiveTerminal={setActiveTerminal}
        termFontSize={termFontSize}
        setTermFontSize={setTermFontSize}
        wsRefs={wsRefs}
        bufRefs={bufRefs}
      />
    </div>
  );
}
