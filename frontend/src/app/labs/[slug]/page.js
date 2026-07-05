"use client";

import { useState, useEffect, use, useRef } from 'react';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
const Terminal = dynamic(() => import('@/components/Terminal'), { ssr: false });

import { Play, Square, CheckCircle, RotateCcw, Copy, Folder, ChevronRight, Server, Search, FileText, MousePointer2, Settings, HelpCircle, Save, Printer, Network, TerminalSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LabEnvironment({ params }) {
  const router = useRouter();
  const { slug } = use(params);
  
  const [lab, setLab] = useState(null);
  const [allLabs, setAllLabs] = useState([]);
  const [session, setSession] = useState(null);
  
  const [activeTerminal, setActiveTerminal] = useState('IOU1');
  const [activeCenterTab, setActiveCenterTab] = useState('topology'); // 'instructions' or 'topology'
  
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

  // Static list of node names for this lab
  const nodes = ['IOU1', 'IOU2'];

  // Persistent WebSocket connections and scroll-back buffers — one per node
  const wsRefs = useRef({});   // { IOU1: WebSocket, IOU2: WebSocket }
  const bufRefs = useRef({});  // { IOU1: Uint8Array[], IOU2: Uint8Array[] }

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

  // Boot animation
  useEffect(() => {
    if (isBooting) {
      const interval = setInterval(() => {
        setBootProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setIsBooting(false);
            return 100;
          }
          return p + 10;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isBooting]);

  // Polling status and incremental grade
  useEffect(() => {
    if (!session || isBooting) return;
    
    const statusInterval = setInterval(() => {
      api.getSessionStatus(session.session_id)
        .then(res => {
          if (res.links) setLinkStatus(res.links);
        }).catch(console.error);
    }, 5000);

    return () => {
      clearInterval(statusInterval);
    }
  }, [session, isBooting, passedTaskIds]);

  // Open WebSocket connections for every node once the lab is live
  useEffect(() => {
    if (!session || isBooting) return;

    nodes.forEach(node => {
      if (wsRefs.current[node]) return; // already open
      bufRefs.current[node] = [];
      const ws = new WebSocket(api.getTerminalWsUrl(session.session_id, node));
      ws.binaryType = 'arraybuffer';
      ws.onopen = () => ws.send('\r\n'); // wake up console
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
  }, [session?.session_id, isBooting]);


  const handleStart = async () => {
    try {
      setIsBooting(true);
      setBootProgress(0);
      const sess = await api.startSession(slug);
      sess.slug = slug;
      sess.startedAt = Date.now();
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
      setSession(null);
      setGradeReport(null);
      setVisibleHints({});
      setVisibleAnswers({});
      setTaskProgress([]);
      setPassedTaskIds([]);
      setLabTimer(0);
      localStorage.removeItem('netlabx_session');
    } catch (e) {
      alert("Failed to stop lab: " + e.message);
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
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
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
      
      {/* Unified Header */}
      <div className="nx-header">
        <div className="nx-brand">
          <div className="nx-logo">NX</div>
          <div className="nx-breadcrumbs">
            <span className="nx-breadcrumb-link">Labs</span>
            <ChevronRight size={14} color="var(--border-muted)" />
            <span className="nx-breadcrumb-chip">{lab.topic}</span>
            <ChevronRight size={14} color="var(--border-muted)" />
            <span className="nx-breadcrumb-mono">{lab.title}</span>
          </div>
        </div>
        
        <div className="nx-toolbar">
          {session && !isBooting && (
            <div className="nx-status-pill active">
              <div className="nx-status-dot active"></div>
              <span>Running {formatTime(labTimer)}</span>
            </div>
          )}
          
          <div className="nx-btn-group">
            <button className="nx-btn-action nx-btn-start" onClick={handleStart} disabled={session || isBooting} title="Power On">
              <Play size={14} fill={!session && !isBooting ? "currentColor" : "none"} />
            </button>
            <button className="nx-btn-action nx-btn-stop" onClick={handleStop} disabled={!session || isBooting} title="Power Off">
              <Square size={14} fill={session && !isBooting ? "currentColor" : "none"} />
            </button>
            <div className="nx-btn-separator"></div>
            <button className="nx-btn-action" onClick={() => setShowResetModal(true)} disabled={!session || isBooting} title="Reset">
              <RotateCcw size={14} />
            </button>
            <button className="nx-btn-action nx-btn-grade" onClick={handleGrade} disabled={!session || isBooting || isGrading} title="Grade">
              <CheckCircle size={14} /> Grade
            </button>
          </div>

          <div className="nx-avatar" title="User Profile">JD</div>
        </div>
      </div>

      {/* Left Sidebar: Labs Tree */}
      <div className="nx-sidebar" style={{ gridArea: 'left' }}>
        <div className="nx-sidebar-header left-border">
          <div style={{ width: '16px', height: '16px', background: 'var(--accent-blue)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>N</div>
          <span>Labs</span>
        </div>
        <div className="nx-search-container">
          <Search size={14} className="nx-search-icon" />
          <input type="text" className="nx-input" placeholder="Search Labs..." />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {Object.entries(topics).map(([topic, topicLabs]) => (
            <div key={topic} className="nx-sidebar-group">
              <div className="nx-sidebar-group-title">
                {topic}
              </div>
              {topicLabs.map(l => (
                <div key={l.slug} className={`nx-lab-item ${l.slug === slug ? 'active' : ''}`} onClick={() => router.push(`/labs/${l.slug}`)}>
                  <FileText size={14} style={{ opacity: 0.8 }} />
                  <span>{l.title}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Center Column */}
      <div className="nx-workspace" style={{ padding: '6px', gap: '6px' }}>
        
        {/* Top pane: Document / Topology */}
        <div className="nx-panel" style={{ flex: 5, borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div className="nx-tab-bar">
            <button className={`nx-tab ${activeCenterTab === 'instructions' ? 'active' : ''}`} onClick={() => setActiveCenterTab('instructions')}>
              Instructions
            </button>
            <button className={`nx-tab ${activeCenterTab === 'topology' ? 'active' : ''}`} onClick={() => setActiveCenterTab('topology')}>
              Topology Map
            </button>
          </div>
          
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            {activeCenterTab === 'instructions' && (
              <div className="nx-document">
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                  <h1 style={{ fontSize: '1.75rem', marginBottom: '16px', paddingLeft: '16px', borderLeft: '3px solid var(--accent-blue)' }}>{lab.title}</h1>
                  <p style={{ fontSize: '1rem', marginBottom: '32px' }}>{lab.description}</p>

                  {/* Prerequisites */}
                  {lab.prerequisites && lab.prerequisites.length > 0 && (
                    <div style={{ marginBottom: '32px' }}>
                      <div className="nx-section-header">Prerequisites</div>
                      <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {lab.prerequisites.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="nx-section-header">Implementation Tasks</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {mergedTasks.map((task, index) => (
                      <div key={task.task_id} className={`nx-task-card ${task.passed ? 'passed' : ''}`}>
                        <div className="nx-task-header">
                          <div className="nx-task-badge">
                            {task.passed ? <CheckCircle size={14} style={{margin: '0 2px'}} /> : index + 1}
                          </div>
                          
                          <div style={{ flex: 1 }}>
                            <h4 className="nx-task-title" style={{ color: task.passed ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                              {task.description}
                            </h4>
                            
                            {!task.passed && (
                              <>
                                {task.instructions && (
                                  <p style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{task.instructions}</p>
                                )}
                                
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                                  {task.hint && (
                                    <button 
                                      onClick={() => toggleHint(task.task_id)}
                                      className="nx-hint-link"
                                    >
                                      {visibleHints[task.task_id] ? 'Hide Hint' : 'Show Hint'}
                                    </button>
                                  )}
                                  {task.answer_commands && (
                                    <button 
                                      onClick={() => toggleAnswer(task.task_id)}
                                      className="nx-hint-link"
                                    >
                                      {visibleAnswers[task.task_id] ? 'Hide Answer' : 'Show Answer'}
                                    </button>
                                  )}
                                </div>
                                
                                {visibleHints[task.task_id] && task.hint && (
                                  <div style={{ background: 'rgba(255, 176, 0, 0.1)', border: '1px solid rgba(255, 176, 0, 0.2)', padding: '12px', borderRadius: '6px', marginBottom: '16px', color: '#e5a000', fontSize: '0.9rem' }}>
                                    <strong>Hint:</strong> {task.hint}
                                  </div>
                                )}
                                
                                {visibleAnswers[task.task_id] && task.answer_commands && (
                                  <div style={{ background: '#000', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
                                    {task.answer_commands.join('\n')}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            )}
            
            {activeCenterTab === 'topology' && (
               <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
                 <iframe 
                   src={`http://localhost:8000/api/labs/${slug}/topology.pdf#toolbar=0&navpanes=0&scrollbar=0`}
                   style={{ width: '100%', height: '100%', border: 'none' }}
                   title="Lab Topology PDF"
                 />
               </div>
            )}
          </div>
        </div>

        {/* Bottom pane: Terminal */}
        <div className="nx-panel" style={{ flex: 5, borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div className="nx-tab-bar">
            {nodes.map(node => (
              <button 
                key={node}
                className={`nx-tab-terminal ${activeTerminal === node ? 'active' : ''}`}
                onClick={() => setActiveTerminal(node)}
                disabled={!session || isBooting}
              >
                <TerminalSquare size={14} />
                {node}
              </button>
            ))}
          </div>
          
          <div className="nx-terminal-container">
            {!session || isBooting ? (
              <div className="nx-offline-state">
                <div className="nx-offline-icon">
                  <TerminalSquare size={32} />
                </div>
                <div style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 500, marginTop: '8px' }}>
                  {isBooting ? 'Booting Environment...' : 'Lab is Offline'}
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  {isBooting ? 'Please wait while devices power on.' : 'Click Start to power on the environment.'}
                </div>
              </div>
            ) : (
              <Terminal 
                ws={wsRefs.current[activeTerminal]}
                buffer={bufRefs.current[activeTerminal] || []}
                nodeName={activeTerminal}
                key={activeTerminal}
              />
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar: Devices Pane */}
      <div className="nx-sidebar right" style={{ gridArea: 'right' }}>
        <div className="nx-sidebar-header">
          Devices
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          
          <div style={{ flex: 1, overflowY: 'auto', borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="nx-sidebar-group-title" style={{ marginTop: '12px' }}>
              TOPOLOGY
            </div>
            <div className="nx-lab-item" style={{ paddingLeft: '20px' }}>
              <Network size={14} /> Router
            </div>
            <div className="nx-lab-item" style={{ paddingLeft: '20px', color: 'var(--border-muted)', cursor: 'default' }}>
              <Server size={14} /> Switch
            </div>
          </div>
          
          <div style={{ flex: 1, background: 'var(--bg-base)' }}>
            <div className="nx-tab-bar">
              <button className="nx-tab active" style={{ padding: '12px 16px' }}>Active Nodes</button>
            </div>
            <div style={{ padding: '8px 0' }}>
              {nodes.map(node => (
                <div key={node} className={`nx-node-card ${activeTerminal === node ? 'active' : ''}`} onClick={() => setActiveTerminal(node)}>
                  <div className="nx-node-info">
                    <div className="nx-node-icon">
                      <Server size={16} />
                    </div>
                    <span className="nx-node-name">{node}</span>
                  </div>
                  <div style={{ 
                    width: '8px', height: '8px', borderRadius: '50%', 
                    background: (session && !isBooting) ? 'var(--green-bright)' : 'var(--text-muted)',
                    boxShadow: (session && !isBooting) ? '0 0 8px var(--green-bright)' : 'none'
                  }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showResetModal && (
        <div className="nx-modal-overlay">
          <div className="nx-modal-box">
            <h3 style={{ marginBottom: '8px' }}>Reset Lab Environment</h3>
            <p style={{ marginBottom: '24px' }}>Are you sure you want to wipe all configurations? You will lose all unsaved progress.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="nx-btn" onClick={() => setShowResetModal(false)}>Cancel</button>
              <button className="nx-btn nx-btn-primary" onClick={handleReset}>Yes, Reset</button>
            </div>
          </div>
        </div>
      )}

      {showCompletionModal && gradeReport && (
        <div className="nx-modal-overlay">
          <div className="nx-modal-box" style={{ textAlign: 'center', width: '400px' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(63, 185, 80, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle size={32} color="var(--green-bright)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Lab Complete!</h3>
            <p style={{ marginBottom: '24px' }}>Great job. You've successfully configured all requirements.</p>
            
            <div style={{ display: 'flex', gap: '16px', background: 'var(--bg-base)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Score</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{gradeReport.percentage}%</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border-muted)' }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Time</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatTime(labTimer)}</div>
              </div>
            </div>
            
            <button className="nx-btn nx-btn-primary" style={{ width: '100%' }} onClick={() => { setShowCompletionModal(false); router.push('/'); }}>Return to Dashboard</button>
          </div>
        </div>
      )}

    </div>
  );
}
