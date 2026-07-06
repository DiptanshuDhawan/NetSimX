"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { BookOpen, Clock, Activity, ChevronRight, Server, Search, CheckCircle, Lock, LayoutList, Star, Award, Play, TrendingUp, Network } from 'lucide-react';
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

  // Dashboard is simplified for initial launch phase

  return (
    <div className="nx-dashboard-layout">
      {/* 1. Floating Pill Header */}
      <div style={{ padding: '16px 16px 0 16px', flexShrink: 0 }}>
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
      </div>

      {/* Main Content */}
      <div className="nx-dashboard-content">
          
        {/* 1. Simple Header */}
        <section style={{ marginBottom: '24px' }}>
          <div>
            <h1 className="nx-analytics-title" style={{ fontSize: '1.75rem' }}>Lab Catalog</h1>
            <p className="nx-analytics-subtitle">Select a lab below to start your networking journey.</p>
          </div>
        </section>

        {/* 3. Search and Filters Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'var(--bg-card)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {topics.map(topic => (
              <button 
                key={topic}
                onClick={() => setActiveTopic(topic)}
                style={{
                  background: activeTopic === topic ? 'var(--primary)' : 'transparent',
                  color: activeTopic === topic ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease-out, color 0.2s ease-out'
                }}
              >
                {topic}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-terminal)', border: '1px solid var(--border)', borderRadius: '999px', padding: '6px 16px', minWidth: '240px' }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', width: '100%' }}
            />
          </div>
        </div>



        {/* 5. Available Labs */}
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
          Available Labs
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Activity size={32} color="var(--primary)" style={{ animation: 'pulse 1.5s infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {filteredLabs.map((lab) => {
              let difficultyColor = 'var(--green)';
              let difficultyEmoji = '🟢';
              if (lab.difficulty?.toLowerCase() === 'intermediate') { difficultyColor = 'var(--tertiary)'; difficultyEmoji = '🟡'; }
              if (lab.difficulty?.toLowerCase() === 'advanced') { difficultyColor = 'var(--red)'; difficultyEmoji = '🔴'; }

              return (
              <div 
                key={lab.id} 
                className="nx-lab-list-item"
                onClick={() => router.push(`/labs/${lab.slug}`)}
                style={{ borderLeft: '1px solid var(--border)' }}
              >
                <div className="nx-lab-list-item-left">
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', color: difficultyColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {difficultyEmoji} {lab.difficulty}
                      </span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginLeft: '4px' }}>{lab.title}</h3>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{lab.description}</p>
                  </div>
                </div>

                <div className="nx-lab-list-item-right" style={{ flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {lab.estimated_time_minutes} min</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Award size={14} /> 150 XP</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><LayoutList size={14} /> 5 Tasks</div>
                  </div>
                  <button className="nx-btn nx-btn-primary">
                    Start Lab
                  </button>
                </div>
              </div>
            )})}


            
            {filteredLabs.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <Search size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>No Labs Available</h3>
                <p>Try selecting another topic.</p>
              </div>
            )}

          </div>
        )}
        
        <footer style={{ marginTop: 'auto', paddingTop: '48px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <div>NetLabX v1.0.0</div>
          <div>Real Network Emulation Platform</div>
        </footer>

      </div>
    </div>
  );
}
