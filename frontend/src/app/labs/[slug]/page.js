"use client";

import { use } from 'react';
import { useLabSession } from '@/hooks/useLabSession';

import TopNav from '@/components/lab/TopNav';
import LabSidebar from '@/components/lab/LabSidebar';
import Workspace from '@/components/lab/Workspace';
import DevicePanel from '@/components/lab/DevicePanel';

export default function LabEnvironment({ params }) {
  const { slug } = use(params);
  const sessionData = useLabSession(slug);

  if (sessionData.loading || !sessionData.lab) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Environment...</div>;
  }

  return (
    <>
      <div key={slug} className="nx-layout">
        <TopNav 
          session={sessionData.session}
          isBooting={sessionData.isBooting}
          labTimer={sessionData.labTimer}
          gradeReport={sessionData.gradeReport}
          isGrading={sessionData.isGrading}
          handleStart={sessionData.handleStart}
          handleStop={sessionData.handleStop}
          handleGrade={sessionData.handleGrade}
          setShowResetModal={sessionData.setShowResetModal}
        />

        <LabSidebar
          lab={sessionData.lab}
          allLabs={sessionData.allLabs}
          slug={slug}
          gradeReport={sessionData.gradeReport}
          isGrading={sessionData.isGrading}
          visibleAnswers={sessionData.visibleAnswers}
          setVisibleAnswers={sessionData.setVisibleAnswers}
        />

        <Workspace
          lab={sessionData.lab}
          session={sessionData.session}
          isBooting={sessionData.isBooting}
          bootProgress={sessionData.bootProgress}
          linkStatus={sessionData.linkStatus}
          activeTerminal={sessionData.activeTerminal}
          setActiveTerminal={sessionData.setActiveTerminal}
          termFontSize={sessionData.termFontSize}
          setTermFontSize={sessionData.setTermFontSize}
          wsRefs={sessionData.wsRefs}
          bufRefs={sessionData.bufRefs}
        />

        <DevicePanel
          lab={sessionData.lab}
          session={sessionData.session}
          isBooting={sessionData.isBooting}
          activeTerminal={sessionData.activeTerminal}
          setActiveTerminal={sessionData.setActiveTerminal}
        />
      </div>

      {/* Grading Loading Screen */}
      {sessionData.isGrading && (
        <div className="nx-modal-overlay" style={{ zIndex: 2000 }}>
          <div className="nx-modal-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', width: '400px', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '64px', height: '64px', marginBottom: '24px' }}>
              <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
              <div style={{ position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite' }}></div>
            </div>
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, letterSpacing: '0.05em', margin: '0 0 8px 0' }}>Grading in Progress</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Analyzing device configurations and states...</p>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {sessionData.showCompletionModal && (
        <div className="nx-modal-overlay">
          <div className="nx-modal-box" style={{ textAlign: 'center', padding: '32px', width: '400px' }}>
            <div style={{ margin: '0 auto 24px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#fff' }}>Graded!</h3>
            <p style={{ margin: '0 0 24px 0', color: 'var(--text-muted)' }}>You have successfully completed all tasks and configurations for this lab.</p>
            
            <div style={{ display: 'flex', gap: '16px', background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Score</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>{sessionData.gradeReport?.percentage || 100}%</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border-subtle)' }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Time</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>
                  {(() => {
                    const totalSeconds = sessionData.labTimer || 0;
                    const h = Math.floor(totalSeconds / 3600);
                    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
                    const s = (totalSeconds % 60).toString().padStart(2, '0');
                    return h > 0 ? `${h.toString().padStart(2, '0')}:${m}:${s}` : `${m}:${s}`;
                  })()}
                </div>
              </div>
            </div>

            <button className="nx-btn nx-btn-blue" onClick={() => sessionData.setShowCompletionModal(false)} style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 600 }}>Continue</button>
          </div>
        </div>
      )}

      {/* Fail Modal */}
      {sessionData.showFailModal && (
        <div className="nx-modal-overlay">
          <div className="nx-modal-box" style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ margin: '0 auto 16px auto', background: 'rgba(239, 68, 68, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#fff' }}>Configuration Mismatch</h3>
            <p style={{ margin: '0 0 24px 0', color: 'var(--text-muted)' }}>Some of your configurations do not match the expected solution. Check the tasks for details.</p>
            <button className="nx-btn nx-btn-blue" onClick={() => sessionData.setShowFailModal(false)} style={{ width: '100%', padding: '10px' }}>Review Errors</button>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {sessionData.showResetModal && (
        <div className="nx-modal-overlay">
          <div className="nx-modal-content" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#fff' }}>Reset Lab?</h3>
            <p style={{ margin: '0 0 24px 0', color: 'var(--text-muted)', lineHeight: 1.5 }}>Are you sure you want to reset this lab? This will wipe all configurations on all devices and reboot them. This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="nx-btn" onClick={() => sessionData.setShowResetModal(false)} style={{ padding: '8px 16px' }}>Cancel</button>
              <button className="nx-btn nx-btn-red" onClick={sessionData.handleReset} style={{ padding: '8px 16px' }}>Reset Devices</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}