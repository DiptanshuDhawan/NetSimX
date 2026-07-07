"use client";

import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

// Props:
//   ws     - the already-open WebSocket managed by the parent
//   buffer - Uint8Array[] of all data received so far on this node
//   nodeName - string label (for key)
//   fontSize - number for the terminal font size
export default function Terminal({ ws, buffer, nodeName, fontSize = 16 }) {
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerm({
      theme: {
        background: '#141517',
        foreground: '#E5E7EB',
        cursor: '#E5E7EB',
        selectionBackground: 'rgba(255,255,255,0.2)',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontSize: fontSize,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'block',
      convertEol: true, // Crucial for correct line-ending behavior with raw Telnet
    });
    termRef.current = term;

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    
    // Only fit if visible
    if (containerRef.current.clientWidth > 0) {
      fitAddon.fit();
    }

    // Replay scrollback buffer so history is visible after a tab switch
    if (buffer && buffer.length > 0) {
      buffer.forEach(chunk => term.write(chunk));
    }

    // WebSocket listener and data sender are now handled in a separate useEffect

    // Use ResizeObserver to reliably call fit() whenever the container's dimensions change
    // This perfectly handles tab switching, window resizing, and initial render delays
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && containerRef.current.clientWidth > 0) {
        fitAddon.fit();
      }
    });
    
    // Start observing the container
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      term.dispose();
    };
  // Re-run only when the node changes (key prop guarantees this anyway)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle WebSocket connection dynamically
  useEffect(() => {
    if (!ws || !termRef.current) return;

    const term = termRef.current;

    const onMessage = (e) => {
      const chunk = typeof e.data === 'string'
        ? e.data
        : new Uint8Array(e.data);
      term.write(chunk);
    };

    ws.addEventListener('message', onMessage);

    const onData = term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    return () => {
      ws.removeEventListener('message', onMessage);
      onData.dispose();
    };
  }, [ws]);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.options.fontSize = fontSize;
      if (fitAddonRef.current) fitAddonRef.current.fit();
    }
  }, [fontSize]);

  return (
    <div style={{ height: '100%', width: '100%', background: 'var(--bg-terminal)', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
