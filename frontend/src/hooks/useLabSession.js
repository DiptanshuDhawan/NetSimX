import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

export function useLabSession(slug) {
  const [lab, setLab] = useState(null);
  const [allLabs, setAllLabs] = useState([]);
  const [session, setSession] = useState(null);
  
  const [activeTerminal, setActiveTerminal] = useState('R1');
  const [isGrading, setIsGrading] = useState(false);
  const [gradeReport, setGradeReport] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [visibleHints, setVisibleHints] = useState({});
  const [visibleAnswers, setVisibleAnswers] = useState({});
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [labTimer, setLabTimer] = useState(0);
  const [isBooting, setIsBooting] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [linkStatus, setLinkStatus] = useState([]);
  const [termFontSize, setTermFontSize] = useState(16);
  const [taskProgress, setTaskProgress] = useState([]);
  const [passedTaskIds, setPassedTaskIds] = useState([]);
  const [showResetModal, setShowResetModal] = useState(false);

  const wsRefs = useRef({});
  const bufRefs = useRef({});

  // Load labs
  useEffect(() => {
    Promise.all([
      api.getLab(slug),
      api.getLabs()
    ])
    .then(([currentLab, allLabsData]) => {
      setLab(currentLab);
      setAllLabs(allLabsData);
      if (currentLab?.nodes?.length > 0) {
        setActiveTerminal(currentLab.nodes[0].name);
      }
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
        setIsBooting(true);
        setBootProgress(90);
        setSession(parsed);
        const tasks = JSON.parse(localStorage.getItem(`netlabx_tasks_${parsed.session_id}`) || '[]');
        setTaskProgress(tasks);
        setPassedTaskIds(tasks.map(t => t.task_id));
        if (parsed.startedAt) {
          setLabTimer(Math.floor((Date.now() - parsed.startedAt) / 1000));
        }
      }
    }
  }, [slug]);

  // Timer
  useEffect(() => {
    if (!session || isBooting) return;
    const interval = setInterval(() => setLabTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [session, isBooting]);

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

  // Polling
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
    }, 60000);
    return () => clearInterval(statusInterval);
  }, [session, isBooting, passedTaskIds]);

  // WebSockets
  useEffect(() => {
    if (!session || !lab || !lab.nodes) return;
    let opened = 0;
    const currentNodes = lab.nodes.map(n => n.name);

    currentNodes.forEach(node => {
      if (wsRefs.current[node]) return;
      bufRefs.current[node] = [];
      const ws = new WebSocket(api.getTerminalWsUrl(session.session_id, node));
      ws.binaryType = 'arraybuffer';
      ws.onopen = () => {
        ws.send('\r\n');
        opened++;
        setBootProgress(Math.floor(90 + (opened / currentNodes.length) * 10));
        if (opened === currentNodes.length) {
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
        const MAX = 500;
        while (bufRefs.current[node].length > MAX) bufRefs.current[node].shift();
      };
      wsRefs.current[node] = ws;
    });

    return () => {
      Object.values(wsRefs.current).forEach(ws => ws.close());
      wsRefs.current = {};
      bufRefs.current = {};
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.session_id, lab?.id]);

  const handleStart = async () => {
    try {
      setIsBooting(true);
      setBootProgress(0);
      setLabTimer(0);
      
      const apiInterval = setInterval(() => {
        setBootProgress(p => p < 85 ? p + 5 : p);
      }, 1000);
      
      const sess = await api.startSession(slug);
      
      clearInterval(apiInterval);
      setBootProgress(90);
      
      sess.slug = slug;
      setSession(sess);
      if (lab?.nodes?.length > 0) setActiveTerminal(lab.nodes[0].name);
      localStorage.setItem('netlabx_session', JSON.stringify(sess));
      localStorage.setItem(`netlabx_tasks_${sess.session_id}`, JSON.stringify([]));
    } catch (e) {
      setErrorMsg("Failed to start lab: " + e.message);
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
      
      if (report.passed) {
        setShowCompletionModal(true);
        localStorage.setItem(`netlabx_grade_${slug}`, '100');
      } else {
        setShowFailModal(true);
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

  return {
    lab, allLabs, session, loading, errorMsg,
    activeTerminal, setActiveTerminal,
    isGrading, gradeReport,
    visibleHints, setVisibleHints,
    visibleAnswers, setVisibleAnswers,
    showCompletionModal, setShowCompletionModal,
    showFailModal, setShowFailModal,
    showResetModal, setShowResetModal,
    labTimer, isBooting, bootProgress, linkStatus,
    termFontSize, setTermFontSize,
    taskProgress, passedTaskIds,
    wsRefs, bufRefs,
    handleStart, handleStop, handleGrade, handleReset
  };
}
