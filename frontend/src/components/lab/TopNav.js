import React from 'react';
import { useRouter } from 'next/navigation';

export default function TopNav({
  session, isBooting, labTimer, gradeReport, isGrading,
  handleStart, handleStop, handleGrade, setShowResetModal
}) {
  const router = useRouter();

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m}:${s}`;
    }
    return `${m}:${s}`;
  };

  return (
    <header className="nx-header">
      {/* Left: logo + breadcrumbs */}
      <div className="nx-brand">
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.2em', color: '#FFFFFF', lineHeight: 1, paddingLeft: '0.2em' }}>REVELIO</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <div style={{ height: '2px', flex: 1, backgroundColor: '#0284c7', borderRadius: '2px' }}></div>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.4em', color: '#0284c7', lineHeight: 1, paddingLeft: '0.4em' }}>LABS</span>
            <div style={{ height: '2px', flex: 1, backgroundColor: '#0284c7', borderRadius: '2px' }}></div>
          </div>
        </div>
      </div>

      {/* Right: controls */}
      <div className="nx-toolbar">
        {session ? (
          <div className="nx-status-pill" style={{ color: isBooting ? 'var(--warning, #f59e0b)' : 'var(--green)' }}>
            <div className="nx-status-dot" style={{ background: isBooting ? 'var(--warning, #f59e0b)' : 'var(--green)' }} />
            {isBooting ? 'Booting...' : `Running ${formatTime(labTimer)}`}
          </div>
        ) : (
          <div className="nx-status-pill" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <div className="nx-status-dot" style={{ background: 'var(--text-muted)' }} />
            Stopped
          </div>
        )}

        {/* Action Button Group */}
        <div style={{ display: 'flex', gap: '8px' }}>
          
          {/* Grade */}
          <button className="nx-action-btn nx-btn-blue" onClick={handleGrade} disabled={!session || isBooting || isGrading || gradeReport?.passed} title="Grade Lab">
            {isGrading ? (
              <>
                <svg className="nx-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Grading...
              </>
            ) : gradeReport?.passed ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Graded
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Grade
              </>
            )}
          </button>

          {/* Play */}
          <button className="nx-icon-action-btn nx-btn-green" onClick={handleStart} disabled={!!session || isBooting} title="Start Lab">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>

          {/* Stop */}
          <button className="nx-icon-action-btn nx-btn-red" onClick={handleStop} disabled={!session || isBooting} title="Stop Lab">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16"/></svg>
          </button>

          {/* Refresh (Reset) */}
          <button className="nx-icon-action-btn nx-btn-gray" onClick={() => setShowResetModal(true)} disabled={!session || isBooting} title="Reset Lab">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
        </div>
        
        {/* Avatar */}
        <div className="nx-avatar">N</div>
      </div>
    </header>
  );
}
