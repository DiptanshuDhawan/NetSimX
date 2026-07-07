"use client";

import { useState, useEffect, use, useRef } from 'react';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
const Terminal = dynamic(() => import('@/components/Terminal'), { ssr: false });
import TopologyDiagram from '@/components/TopologyDiagram';
import { Play, Square, CheckCircle, RotateCcw, Copy, Folder, ChevronRight, Server, Search, FileText, MousePointer2, Settings, HelpCircle, Save, Printer, Network } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    <path d="M-38,-10 v22 a38,14 0 0,0 76,0 v-22 Z" fill="#222428" stroke="#9ca3af" strokeWidth="4" />
    <ellipse cx="0" cy="-10" rx="38" ry="14" fill="#2A2D32" stroke="#9ca3af" strokeWidth="4" />
    <g stroke="#E2E8F0" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-15,-14 L15,-14 M10,-18 L15,-14 L10,-10" />
      <path d="M-15,-6 L15,-6 M-10,-10 L-15,-6 L-10,-2" />
    </g>
  </svg>
);

const SidebarPCIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="13" rx="2" ry="2" fill="#222428"/>
    <path d="M8 20h8 M12 17v3" />
  </svg>
);

export default function LabEnvironment({ params }) {
  const router = useRouter();
  const { slug } = use(params);
  
  const [lab, setLab] = useState(null);
  const [allLabs, setAllLabs] = useState([]);
  const [session, setSession] = useState(null);
  
  const [activeTerminal, setActiveTerminal] = useState('IOU1');
  const [activeCenterTab, setActiveCenterTab] = useState('instructions'); // 'instructions' or 'topology'
  
  const [isGrading, setIsGrading] = useState(false);
  const [gradeReport, setGradeReport] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [visibleHints, setVisibleHints] = useState({});
  const [visibleAnswers, setVisibleAnswers] = useState({});
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  // New UX States
  const [labTimer, setLabTimer] = useState(0);
  const [isBooting, setIsBooting] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [linkStatus, setLinkStatus] = useState([]);
  const [taskProgress, setTaskProgress] = useState([]);
  const [passedTaskIds, setPassedTaskIds] = useState([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [openCategories, setOpenCategories] = useState({ Routers: true, Switches: false, PCs: false });

  // Sidebar drag resizer state
  const [sidebarTopHeight, setSidebarTopHeight] = useState(25);
  const [isCommandSummaryOpen, setIsCommandSummaryOpen] = useState(false);
  const [isLabContentOpen, setIsLabContentOpen] = useState(true);
  const [isLabInstructionsOpen, setIsLabInstructionsOpen] = useState(true);
  const isSidebarDragging = useRef(false);
  const sidebarRef = useRef(null);

  // Dynamic list of node names for this lab
  const nodes = lab?.nodes?.map(n => n.name) || [];

  // Persistent WebSocket connections and scroll-back buffers — one per node
  const wsRefs = useRef({});   // { IOU1: WebSocket, IOU2: WebSocket }
  const bufRefs = useRef({});  // { IOU1: Uint8Array[], IOU2: Uint8Array[] }

  const handleSidebarDragStart = (e) => {
    e.preventDefault();
    isSidebarDragging.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isSidebarDragging.current || !sidebarRef.current) return;
      const rect = sidebarRef.current.getBoundingClientRect();
      const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
      if (newHeight >= 15 && newHeight <= 85) {
        setSidebarTopHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      if (isSidebarDragging.current) {
        isSidebarDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Load current lab and all labs for tree
  useEffect(() => {
    Promise.all([
      api.getLab(slug),
      api.getLabs()
    ])
    .then(([currentLab, allLabsData]) => {
      setLab(currentLab);
      setAllLabs(allLabsData);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [slug]);

  // Restore session
  useEffect(() => {
    const saved = localStorage.getItem('netlabx_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.slug === slug) {
        setSession(parsed);
        setActiveTerminal('IOU1');
        const tasks = JSON.parse(localStorage.getItem(`netlabx_tasks_${parsed.session_id}`) || '[]');
        setTaskProgress(tasks);
        setPassedTaskIds(tasks.map(t => t.task_id));
        setLabTimer(Math.floor((Date.now() - parsed.startedAt) / 1000));
      }
    }
  }, [slug]);


  // Timer
  useEffect(() => {
    if (!session || isBooting) return;
    const interval = setInterval(() => setLabTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [session, isBooting]);

  // Removed old fake boot animation effect

  const handleStopLocally = () => {
    setSession(null);
    setGradeReport(null);
    setVisibleHints({});
    setVisibleAnswers({});
    setTaskProgress([]);
    setPassedTaskIds([]);
    setLabTimer(0);
    localStorage.removeItem('netlabx_session');
  };

  // Polling status and incremental grade
  useEffect(() => {
    if (!session || isBooting) return;
    
    const statusInterval = setInterval(() => {
      api.getSessionStatus(session.session_id)
        .then(res => {
          if (res.status === 'stopped') {
            handleStopLocally();
          } else if (res.links) {
            setLinkStatus(res.links);
          }
        }).catch(err => {
          console.warn("Session polling network error (ignoring):", err);
        });
    }, 5000);

    return () => {
      clearInterval(statusInterval);
    }
  }, [session, isBooting, passedTaskIds]);

  // Open WebSocket connections for every node once the lab is live
  useEffect(() => {
    if (!session) return;

    let opened = 0;

    nodes.forEach(node => {
      if (wsRefs.current[node]) return; // already open
      bufRefs.current[node] = [];
      const ws = new WebSocket(api.getTerminalWsUrl(session.session_id, node));
      ws.binaryType = 'arraybuffer';
      ws.onopen = () => {
        ws.send('\r\n'); // wake up console
        opened++;
        setBootProgress(Math.floor(90 + (opened / nodes.length) * 10));
        
        // Once all websockets are connected, finish booting
        if (opened === nodes.length) {
          setTimeout(() => {
            setIsBooting(false);
            setSession(s => {
              if (s && !s.startedAt) {
                const newS = { ...s, startedAt: Date.now() };
                localStorage.setItem('netlabx_session', JSON.stringify(newS));
                return newS;
              }
              return s;
            });
          }, 300);
        }
      };
      ws.onmessage = (e) => {
        const chunk = typeof e.data === 'string'
          ? new TextEncoder().encode(e.data)
          : new Uint8Array(e.data);
        bufRefs.current[node] = bufRefs.current[node] || [];
        bufRefs.current[node].push(chunk);
        // cap buffer at ~500 KB to avoid unbounded memory
        const MAX = 500;
        while (bufRefs.current[node].length > MAX) bufRefs.current[node].shift();
      };
      wsRefs.current[node] = ws;
    });

    return () => {
      // Clean up all WebSockets when session ends
      Object.values(wsRefs.current).forEach(ws => ws.close());
      wsRefs.current = {};
      bufRefs.current = {};
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.session_id]);


  const handleStart = async () => {
    try {
      setIsBooting(true);
      setBootProgress(0);
      setLabTimer(0);
      
      // Simulate progress while waiting for backend API
      const apiInterval = setInterval(() => {
        setBootProgress(p => p < 85 ? p + 5 : p);
      }, 400);
      
      const sess = await api.startSession(slug);
      
      clearInterval(apiInterval);
      setBootProgress(90);
      
      sess.slug = slug;
      setSession(sess);
      setActiveTerminal('IOU1');
      localStorage.setItem('netlabx_session', JSON.stringify(sess));
      localStorage.setItem(`netlabx_tasks_${sess.session_id}`, JSON.stringify([]));
    } catch (e) {
      alert("Failed to start lab: " + e.message);
      setIsBooting(false);
    }
  };

  const handleStop = async () => {
    if (!session) return;
    try {
      await api.stopSession(session.session_id);
    } catch (e) {
      console.warn("Server couldn't stop session:", e.message);
    } finally {
      handleStopLocally();
    }
  };

  const handleGrade = async () => {
    if (!session) return;
    setIsGrading(true);
    try {
      const report = await api.gradeSession(session.session_id);
      setGradeReport(report);
      // Update local task progress with the final grade report
      if (report.tasks) {
        setTaskProgress(report.tasks);
        setPassedTaskIds(report.tasks.filter(t => t.passed).map(t => t.task_id));
      }
      
      if (report.passed) {
        setShowCompletionModal(true);
        localStorage.setItem(`netlabx_grade_${slug}`, '100');
      }
      
    } catch (e) {
      alert("Grading failed: " + e.message);
    } finally {
      setIsGrading(false);
    }
  };

  const handleReset = async () => {
    if (!session) return;
    setShowResetModal(false);
    setIsBooting(true);
    setBootProgress(0);
    try {
      await api.resetSession(session.session_id);
      setTaskProgress([]);
      setPassedTaskIds([]);
      setGradeReport(null);
      localStorage.setItem(`netlabx_tasks_${session.session_id}`, JSON.stringify([]));
    } catch (e) {
      alert("Reset failed: " + e.message);
    }
  };

  const toggleHint = (taskId) => {
    setVisibleHints(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };
  
  const toggleAnswer = (taskId) => {
    setVisibleAnswers(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m}:${s}`;
    }
    return `${m}:${s}`;
  };

  if (loading || !lab) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Environment...</div>;
  }

  // Merge tasks from definition with live incremental progress
  const mergedTasks = lab.tasks.map(task => {
    const progress = taskProgress.find(t => t.task_id === task.id);
    return {
      ...task,
      task_id: task.id, // normalize key
      passed: progress ? progress.passed : null
    };
  });
  
  // Group labs by topic for the left tree
  const topics = {};
  allLabs.forEach(l => {
    if (!topics[l.topic]) topics[l.topic] = [];
    topics[l.topic].push(l);
  });

  return (
    <div className="nx-layout">

      {/* ── TOP NAV ── */}
      <header className="nx-header">
        {/* Left: logo + breadcrumbs */}
        <div className="nx-brand">
          <div className="nx-logo" onClick={() => router.push('/')}>NX</div>
          <div className="nx-breadcrumbs">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#E5E7EB' }} onClick={() => router.push('/')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span>Labs</span>
            </div>
            <span className="sep">{'>'}</span>
            <span className="crumb-topic">{lab.topic}</span>
            <span className="sep">{'>'}</span>
            <span className="crumb-title">{lab.title}</span>
          </div>
        </div>

        {/* Right: controls */}
        <div className="nx-toolbar">
          {session ? (
            <div className="nx-status-pill">
              <div className="nx-status-dot" style={{ background: isBooting ? 'var(--warning, #f59e0b)' : 'var(--green)' }} />
              {isBooting ? `Booting ${bootProgress}%` : `Running ${formatTime(labTimer)}`}
            </div>
          ) : (
            <div className="nx-status-pill" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <div className="nx-status-dot" style={{ background: 'var(--text-muted)' }} />
              Stopped
            </div>
          )}

          {/* Action Button Group */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {/* Play */}
            <button className={`nx-icon-btn ${!session && !isBooting ? 'start-highlight' : ''}`} onClick={handleStart} disabled={!!session || isBooting} title="Start Lab">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>

            {/* Stop */}
            <button className={`nx-icon-btn ${session && !isBooting ? 'stop-highlight' : ''}`} onClick={handleStop} disabled={!session || isBooting} title="Stop Lab">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16"/></svg>
            </button>

            {/* Refresh (Reset) */}
            <button className="nx-icon-btn" onClick={() => setShowResetModal(true)} disabled={!session || isBooting} title="Reset Lab">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </button>
          </div>

          {/* Grade */}
          <button className="nx-grade-btn" onClick={handleGrade} disabled={!session || isBooting || isGrading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Grade
          </button>
          
          {/* Avatar */}
          <div className="nx-avatar">N</div>
        </div>
      </header>

      {/* ── LEFT SIDEBAR ── */}
      <aside className="nx-sidebar-left nx-card" ref={sidebarRef}>
        
        {/* Top Section */}
        <div style={{ flex: isLabContentOpen ? (isLabInstructionsOpen ? `0 0 ${sidebarTopHeight}%` : '1') : '0 0 auto', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'flex 0.2s ease-out' }}>
          
          {/* Section 1 – Lab Content */}
          <div className="nx-section-header" style={{ flexShrink: 0, cursor: 'pointer' }} onClick={() => setIsLabContentOpen(!isLabContentOpen)}>
            <span className="nx-section-title">Lab Content</span>
            <svg className="nx-section-chevron" style={{ transform: isLabContentOpen ? 'none' : 'rotate(-90deg)', transition: 'transform 0.2s ease-out' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          {isLabContentOpen && (
            <>
              {/* Search */}
              <div className="nx-search-wrap" style={{ flexShrink: 0 }}>
                <div className="nx-search-inner">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="text" placeholder="Search Labs..." />
                </div>
              </div>

              {/* Labs tree */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {Object.entries(topics).map(([topic, topicLabs]) => (
                <div key={topic}>
                  <div className="nx-tree-section-label">{topic}</div>
                  {topicLabs.map(l => (
                    <div
                      key={l.slug}
                      className={`nx-tree-item ${l.slug === slug ? 'selected' : ''}`}
                      onClick={() => router.push(`/labs/${l.slug}`)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span>{l.title}</span>
                    </div>
                  ))}
                </div>
              ))}
              </div>
            </>
          )}
        </div>

        {/* Resizer Handle */}
        {isLabContentOpen && isLabInstructionsOpen && (
          <div 
            onMouseDown={handleSidebarDragStart}
            style={{
              height: '4px',
              background: 'var(--bg-card)',
              borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
              cursor: 'row-resize',
              flexShrink: 0,
              zIndex: 10
            }}
          />
        )}

        {/* Bottom Section */}
        <div style={{ flex: isLabInstructionsOpen ? '1' : '0 0 auto', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'flex 0.2s ease-out' }}>
          {/* Section 2 – Lab Instructions */}
          <div className="nx-section-header" style={{ flexShrink: 0, marginTop: 0, cursor: 'pointer' }} onClick={() => setIsLabInstructionsOpen(!isLabInstructionsOpen)}>
            <span className="nx-section-title">Lab Instructions</span>
            <svg className="nx-section-chevron" style={{ transform: isLabInstructionsOpen ? 'none' : 'rotate(-90deg)', transition: 'transform 0.2s ease-out' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          {isLabInstructionsOpen && (
            <div className="nx-instructions-body" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            
            {/* Overview Card */}
            {lab?.objective && (
              <div className="nx-overview-card">
                <div className="nx-overview-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  Overview
                </div>
                <div className="nx-overview-desc" style={{ whiteSpace: 'pre-line' }}>
                  {lab.objective}
                </div>
              </div>
            )}

            {/* Vertical Timeline */}
            <div className="nx-timeline">
              {lab?.tasks?.map((task, index) => {
                const isPassed = passedTaskIds.includes(task.id);
                const isCurrent = !isPassed && (index === 0 || passedTaskIds.includes(lab.tasks[index - 1].id));
                const statusClass = isPassed ? 'is-completed' : (isCurrent ? 'is-current' : 'is-pending');
                
                return (
                  <div key={task.id} className={`nx-timeline-step ${statusClass}`}>
                    <div className="nx-timeline-node">
                      {isPassed ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                      )}
                    </div>
                    <div className="nx-timeline-content">
                      <div className="nx-timeline-title">{task.description}</div>
                      <div className="nx-timeline-desc" style={{ whiteSpace: 'pre-line', marginTop: '8px' }}>
                        {task.instructions}
                      </div>
                      
                      {!isPassed && isCurrent && task.hint && (
                        <div style={{ marginTop: '12px', background: 'rgba(245, 158, 11, 0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                          <strong>Hint: </strong> {task.hint}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className={`nx-timeline-step ${isGrading || gradeReport ? 'is-current' : 'is-pending'}`}>
                <div className="nx-timeline-node">
                  {gradeReport && gradeReport.passed ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  )}
                </div>
                <div className="nx-timeline-content">
                  <div className="nx-timeline-title">Verify Lab Completion</div>
                  <div className="nx-timeline-desc">Click Grade to evaluate all tasks.</div>
                </div>
              </div>

            </div>

            {/* Collapsible Command Summary */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <button className="nx-command-summary-btn" onClick={() => setIsCommandSummaryOpen(!isCommandSummaryOpen)}>
                {isCommandSummaryOpen ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                )}
                View Command Summary
              </button>

              {isCommandSummaryOpen && (
                <div style={{ marginTop: '12px' }}>
                  {lab?.command_reference ? lab.command_reference.map((cmd, i) => (
                    <div className="nx-command-block" key={i}>
                      <div className="nx-command-text">{cmd.command}</div>
                      <div className="nx-command-desc">{cmd.description}</div>
                    </div>
                  )) : (
                    <>
                      <div className="nx-command-block">
                        <div className="nx-command-text">router ospf 1</div>
                        <div className="nx-command-desc">Enter OSPF process mode</div>
                      </div>
                      <div className="nx-command-block">
                        <div className="nx-command-text">network 192.168.1.0 0.0.0.255 area 0</div>
                        <div className="nx-command-desc">Advertise subnet into OSPF Area 0</div>
                      </div>
                      <div className="nx-command-block">
                        <div className="nx-command-text">show ip ospf neighbor</div>
                        <div className="nx-command-desc">Verify OSPF adjacencies</div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </aside>

      {/* ── CENTER WORKSPACE ── */}
      <div className="nx-workspace">

        {/* Topology panel */}
        <div className="nx-topo-panel nx-card">
          <div className="nx-topo-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            Persistent Topology · OSPF Lab
          </div>
          <div className="nx-topo-canvas">
            <TopologyDiagram
              nodes={nodes.map(n => ({ name: n, status: session ? (isBooting ? 'booting' : 'running') : 'offline' }))}
              linkStatus={linkStatus}
              activeNode={activeTerminal}
              onNodeClick={(name) => setActiveTerminal(name)}
            />
          </div>
        </div>

        {/* Terminal panel */}
        <div className="nx-term-panel nx-card" style={{ padding: 0 }}>
          <div className="nx-term-tabs">
            {nodes.map(node => (
              <button
                key={node}
                className={`nx-term-tab ${activeTerminal === node ? 'active' : ''}`}
                onClick={() => setActiveTerminal(node)}
                disabled={!session || isBooting}
              >
                <span className="tab-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="3" ry="3"/>
                    <polyline points="7 10 10 13 7 16"/>
                    <line x1="12" y1="16" x2="16" y2="16"/>
                  </svg>
                </span>
                {node}
              </button>
            ))}
          </div>
          <div className="nx-term-body">
            {!session || isBooting ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontSize: 12 }}>
                {isBooting ? `Booting devices… ${bootProgress}%` : 'Environment is offline. Press ▶ to start.'}
              </div>
            ) : (
              nodes.map(node => (
                <div key={node} style={{ display: activeTerminal === node ? 'block' : 'none', height: '100%' }}>
                  <Terminal ws={wsRefs.current[node]} buffer={bufRefs.current[node]} nodeName={node} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <aside className="nx-sidebar-right nx-card">
        {/* Header */}
        <div className="nx-section-header">
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px' }}>Devices</span>
        </div>

        {/* Dynamic Topology Accordions */}
        <div>
          <div className="nx-right-section-label">Topology Nodes</div>
          
          {/* Routers Category */}
          <div className="nx-device-category">
            <div className="nx-device-category-header" onClick={() => setOpenCategories(prev => ({ ...prev, Routers: !prev.Routers }))} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="nx-right-topo-icon">
                  <SidebarRouterIcon />
                </div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Routers</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: openCategories.Routers ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            {openCategories.Routers && (
              <div style={{ background: 'var(--bg-lighter)', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                {lab?.nodes?.filter(n => n.device_type === 'cisco_ios_telnet').length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {lab.nodes.filter(n => n.device_type === 'cisco_ios_telnet').map(node => (
                      <div
                        key={node.name}
                        className={`nx-node-row ${activeTerminal === node.name ? 'active' : ''}`}
                        onClick={() => setActiveTerminal(node.name)}
                      >
                        <div className="nx-node-icon">
                          <SidebarRouterIcon />
                        </div>
                        <span className="nx-node-name">{node.name}</span>
                        <div className={(session && !isBooting) ? 'nx-node-online' : 'nx-node-offline'} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Switches Category */}
          <div className="nx-device-category">
            <div className="nx-device-category-header" onClick={() => setOpenCategories(prev => ({ ...prev, Switches: !prev.Switches }))} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="nx-right-topo-icon">
                  <SidebarSwitchIcon />
                </div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Switches</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: openCategories.Switches ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            {openCategories.Switches && (
              <div style={{ background: 'var(--bg-lighter)', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                {lab?.nodes?.filter(n => n.device_type === 'cisco_iol_l2').length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {lab.nodes.filter(n => n.device_type === 'cisco_iol_l2').map(node => (
                      <div
                        key={node.name}
                        className={`nx-node-row ${activeTerminal === node.name ? 'active' : ''}`}
                        onClick={() => setActiveTerminal(node.name)}
                      >
                        <div className="nx-node-icon">
                          <SidebarSwitchIcon />
                        </div>
                        <span className="nx-node-name">{node.name}</span>
                        <div className={(session && !isBooting) ? 'nx-node-online' : 'nx-node-offline'} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PCs Category */}
          <div className="nx-device-category">
            <div className="nx-device-category-header" onClick={() => setOpenCategories(prev => ({ ...prev, PCs: !prev.PCs }))} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="nx-right-topo-icon">
                  <SidebarPCIcon />
                </div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>PCs</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: openCategories.PCs ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            {openCategories.PCs && (
              <div style={{ background: 'var(--bg-lighter)', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                {lab?.nodes?.filter(n => n.device_type === 'linux' || n.device_type === 'vpcs').length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {lab.nodes.filter(n => n.device_type === 'linux' || n.device_type === 'vpcs').map(node => (
                      <div
                        key={node.name}
                        className={`nx-node-row ${activeTerminal === node.name ? 'active' : ''}`}
                        onClick={() => setActiveTerminal(node.name)}
                      >
                        <div className="nx-node-icon">
                          <SidebarPCIcon />
                        </div>
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

      {/* ── MODALS ── */}
      {showResetModal && (
        <div className="nx-modal-overlay">
          <div className="nx-modal-box">
            <h3 style={{ marginBottom: 8, fontSize: 15 }}>Reset Lab Environment</h3>
            <p style={{ marginBottom: 24, color: 'var(--text-secondary)', fontSize: 13 }}>Are you sure you want to wipe all configurations? You will lose all unsaved progress.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="nx-btn" onClick={() => setShowResetModal(false)}>Cancel</button>
              <button className="nx-btn nx-btn-primary" onClick={handleReset}>Yes, Reset</button>
            </div>
          </div>
        </div>
      )}

      {showCompletionModal && gradeReport && (
        <div className="nx-modal-overlay">
          <div className="nx-modal-box" style={{ textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, background: 'var(--green-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>Lab Complete!</h3>
            <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Great job. You've successfully configured all requirements.</p>
            <div style={{ display: 'flex', gap: 16, background: '#f9fafb', padding: 16, borderRadius: 12, marginBottom: 24, border: '1px solid var(--border)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Score</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{gradeReport.percentage}%</div>
              </div>
              <div style={{ width: 1, background: 'var(--border)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Time</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{formatTime(labTimer)}</div>
              </div>
            </div>
            <button className="nx-btn nx-btn-primary" style={{ width: '100%', borderRadius: 12, padding: '10px 0' }} onClick={() => { setShowCompletionModal(false); router.push('/'); }}>Return to Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
}
