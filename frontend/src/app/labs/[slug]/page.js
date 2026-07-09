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
    <div key={slug} className="nx-layout nx-fade-in">
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

      {/* Completion Modal */}
      {sessionData.showCompletionModal && (
        <div className="nx-modal-overlay">
          <div className="nx-modal-content" style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ margin: '0 auto 16px auto', background: 'rgba(34, 197, 94, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#fff' }}>Lab Completed!</h3>
            <p style={{ margin: '0 0 24px 0', color: 'var(--text-muted)' }}>You have successfully completed all tasks and configurations for this lab.</p>
            <button className="nx-btn nx-btn-blue" onClick={() => sessionData.setShowCompletionModal(false)} style={{ width: '100%', padding: '10px' }}>Continue</button>
          </div>
        </div>
      )}

      {/* Fail Modal */}
      {sessionData.showFailModal && (
        <div className="nx-modal-overlay">
          <div className="nx-modal-content" style={{ textAlign: 'center', padding: '32px' }}>
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

    </div>
  );
}