const API_URL = typeof window !== 'undefined' ? `http://${window.location.hostname}:8000` : 'http://localhost:8000';
const WS_URL = typeof window !== 'undefined' ? `ws://${window.location.hostname}:8000` : 'ws://localhost:8000';

export const api = {
  // Fetch all labs
  async getLabs() {
    const res = await fetch(`${API_URL}/api/labs/`);
    if (!res.ok) throw new Error('Failed to fetch labs');
    return res.json();
  },

  // Fetch a single lab with instructions
  async getLab(slug) {
    const res = await fetch(`${API_URL}/api/labs/${slug}`);
    if (!res.ok) throw new Error('Failed to fetch lab');
    return res.json();
  },

  // Start a lab session
  async startSession(labSlug) {
    const res = await fetch(`${API_URL}/api/session/start/${labSlug}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to start session');
    return res.json();
  },

  // Stop a lab session
  async stopSession(sessionId) {
    const res = await fetch(`${API_URL}/api/session/stop/${sessionId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to stop session');
    return res.json();
  },

  // Grade a session
  async gradeSession(sessionId) {
    const res = await fetch(`${API_URL}/api/grade/${sessionId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to grade session');
    return res.json();
  },

  // Get session status (nodes and links)
  async getSessionStatus(sessionId) {
    const res = await fetch(`${API_URL}/api/session/status/${sessionId}`);
    if (res.status === 404) return { status: 'stopped' };
    if (!res.ok) throw new Error('Failed to fetch session status');
    return res.json();
  },

  // Reset session to startup config
  async resetSession(sessionId) {
    const res = await fetch(`${API_URL}/api/session/reset/${sessionId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset session');
    return res.json();
  },

  // Incremental grading
  async getIncrementalGrade(sessionId, alreadyPassedIds = []) {
    const queryParams = new URLSearchParams();
    alreadyPassedIds.forEach(id => queryParams.append('already_passed', id));
    
    const url = `${API_URL}/api/grade/incremental/${sessionId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch incremental grade');
    return res.json();
  },

  // Get the WebSocket URL for a terminal connection
  getTerminalWsUrl(sessionId, nodeName) {
    return `${WS_URL}/ws/terminal/${sessionId}/${nodeName}`;
  },
};
