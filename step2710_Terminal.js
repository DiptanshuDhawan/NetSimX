"use client";

import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

// Props:
//   ws     - the already-open WebSocket managed by the parent
//   buffer - Uint8Array[] of all data received so far on this node
//   nodeName - string label (for key)
export default function Terminal({ ws, buffer, nodeName }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerm({
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#aeafad',
        selectionBackground: 'rgba(38,79,120,0.5)',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontSize: 14,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'block',
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();

    // Replay scrollback buffer so history is visible after a tab switch
    if (buffer && buffer.length > 0) {
      buffer.forEach(chunk => term.write(chunk));
    }

    // Hook into the shared WebSocket's future messages
    const onMessage = (e) => {
      const chunk = typeof e.data === 'string'
        ? e.data
        : new Uint8Array(e.data);
      term.write(chunk);
    };

    if (ws) {
      ws.addEventListener('message', onMessage);
    }

    // Send keystrokes through the shared WebSocket
    term.onData((data) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (ws) ws.removeEventListener('message', onMessage);
      term.dispose();
    };
  // Re-run only when the node changes (key prop guarantees this anyway)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', background: '#1e1e1e', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
