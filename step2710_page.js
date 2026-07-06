"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { BookOpen, Clock, Activity, ChevronRight, Server, Search, CheckCircle, Lock, LayoutList } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState('All Topics');
  const [completedCount, setCompletedCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    api.getLabs()
      .then(fetchedLabs => {
        setLabs(fetchedLabs);
        
        let count = 0;
        fetchedLabs.forEach(lab => {
          if (localStorage.getItem(`netlabx_grade_${lab.slug}`)) {
            count++;
          }
        });
        setCompletedCount(count);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalTime = labs.reduce((acc, lab) => acc + lab.estimated_time_minutes, 0);
  const topics = ['All Topics', ...new Set(labs.map(lab => lab.topic))];

  const filteredLabs = labs.filter(lab => {
    const matchesTopic = activeTopic === 'All Topics' || lab.topic === activeTopic;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      lab.title.toLowerCase().includes(searchLower) || 
      lab.description.toLowerCase().includes(searchLower) ||
      lab.topic.toLowerCase().includes(searchLower);
    
    return matchesTopic && matchesSearch;
  });

  return (
    <div className="nx-layout">
      {/* 1. Header (Same as lab page) */}
      <div className="nx-header">
        <div className="nx-brand">
          <div className="nx-logo">N</div>
          <span style={{ fontWeight: 600, letterSpacing: '0.5px' }}>NetLabX</span>
        </div>
        
        <div className="nx-toolbar">
          <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '16px' }}>
            <span style={{ color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500 }}>Dashboard</span>
            <span style={{ cursor: 'pointer' }} className="nx-breadcrumb-link">My Progress</span>
            <span style={{ cursor: 'pointer' }} className="nx-breadcrumb-link">Settings</span>
          </div>
          <div className="nx-btn-separator"></div>
          <div className="nx-avatar" title="User Profile">JD</div>
        </div>
      </div>

      {/* Main Content (Spans all columns) */}
      <div style={{ gridArea: 'left / left / right / right', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-base)', overflowY: 'auto' }}>
        
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '48px 24px', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
          
          {/* Page Title & Search */}
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Labs</div>
              <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Available Labs</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                {filteredLabs.length} lab{filteredLabs.length !== 1 ? 's' : ''} found across {topics.length - 1} topics. {completedCount} completed.
              </p>
            </div>
            
            <div className="nx-search-container" style={{ width: '320px', padding: 0 }}>
              <Search size={14} className="nx-search-icon" style={{ left: '12px' }} />
              <input 
                type="text" 
                className="nx-input" 
                placeholder="Search labs by title or topic..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </header>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
            {topics.map(topic => (
              <button 
                key={topic}
                onClick={() => setActiveTopic(topic)}
                className={`nx-filter-btn ${activeTopic === topic ? 'active' : ''}`}
              >
                {topic}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <Activity size={32} color="var(--accent-blue)" style={{ animation: 'pulse 1.5s infinite' }} />
            </div>
          ) : (
            <div className="nx-lab-card-grid">
              
              {/* Lab Cards */}
              {filteredLabs.map(lab => (
                <div 
                  key={lab.id} 
                  className="nx-lab-card-home"
                  onClick={() => router.push(`/labs/${lab.slug}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        background: lab.difficulty === 'BEGINNER' ? 'var(--green-bright)' : lab.difficulty === 'INTERMEDIATE' ? 'var(--amber)' : 'var(--red)' 
                      }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {lab.difficulty.charAt(0) + lab.difficulty.slice(1).toLowerCase()}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <LayoutList size={14} /> {lab.tasks?.length || 0}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <Clock size={14} /> {lab.estimated_time_minutes}m
                      </span>
                    </div>
                  </div>
                  
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>{lab.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px', flex: 1 }}>{lab.description}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      {lab.topic}
                    </span>
                    <button className="nx-btn-action" style={{ border: 'none', color: 'var(--accent-blue)', padding: '4px 8px' }}>
                      Start <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Coming Soon Cards */}
              {filteredLabs.length > 0 && filteredLabs.length < 3 && (
                <>
                  <div className="nx-lab-card-home coming-soon">
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
                      <Lock size={24} style={{ marginBottom: '12px', opacity: 0.5 }} />
                      <h3 style={{ fontSize: '1.05rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>OSPF Advanced (Multi-Area)</h3>
                      <p style={{ fontSize: '0.85rem' }}>Coming Soon</p>
                    </div>
                  </div>
                  {filteredLabs.length < 2 && (
                     <div className="nx-lab-card-home coming-soon">
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
                        <Lock size={24} style={{ marginBottom: '12px', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '1.05rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>BGP Fundamentals</h3>
                        <p style={{ fontSize: '0.85rem' }}>Coming Soon</p>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {filteredLabs.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <Search size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>No labs found</h3>
                  <p>Try adjusting your search or filters.</p>
                </div>
              )}

            </div>
          )}
          
          <footer style={{ marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <div>NetLabX v1.0.0</div>
            <div>Real Network Emulation Platform</div>
          </footer>

        </div>
      </div>
    </div>
  );
}