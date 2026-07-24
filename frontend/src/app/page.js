"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Clock, ChevronRight, Search, Play, BookOpen, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TopologyRenderer from '@/components/topologies/TopologyRenderer';

export default function Dashboard() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [heroLab, setHeroLab] = useState(null);
  const router = useRouter();

  useEffect(() => {
    api.getLabs()
      .then(fetchedLabs => {
        setLabs(fetchedLabs);
        
        // Find the most recently active lab from the active session in localStorage
        const activeSession = localStorage.getItem('netlabx_session');
        if (activeSession) {
          try {
            const parsed = JSON.parse(activeSession);
            if (parsed.slug) {
              const found = fetchedLabs.find(l => l.slug === parsed.slug);
              if (found) {
                setHeroLab(found);
                return;
              }
            }
          } catch (e) { /* ignore parse errors */ }
        }
        // Fallback: check last visited lab slug
        const lastLabSlug = localStorage.getItem('netlabx_last_lab');
        if (lastLabSlug) {
          const found = fetchedLabs.find(l => l.slug === lastLabSlug);
          if (found) {
            setHeroLab(found);
            return;
          }
        }
        // No session or last lab found — don't show the hero section at all
        setHeroLab(null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allTopics = [...new Set(labs.map(lab => lab.topic))];
  const allDifficulties = ['Beginner', 'Intermediate', 'Advanced'];
  
  const toggleFilter = (filter) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const filteredLabs = labs.filter(lab => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      lab.title.toLowerCase().includes(searchLower) || 
      lab.description.toLowerCase().includes(searchLower) ||
      lab.topic.toLowerCase().includes(searchLower);
    
    if (!matchesSearch) return false;
    
    if (activeFilters.length === 0) return true;
    
    const activeTopics = activeFilters.filter(f => allTopics.includes(f));
    const activeDiffs = activeFilters.filter(f => allDifficulties.includes(f));
    
    let topicMatch = true;
    if (activeTopics.length > 0) {
      topicMatch = activeTopics.includes(lab.topic);
    }
    
    let diffMatch = true;
    if (activeDiffs.length > 0) {
      const d = lab.difficulty || 'Beginner';
      diffMatch = activeDiffs.some(ad => ad.toLowerCase() === d.toLowerCase());
    }
    
    return topicMatch && diffMatch;
  });

  const getDifficultyBadge = (diff) => {
    const d = (diff || 'BEGINNER').toUpperCase();
    let bg = 'rgba(34, 197, 94, 0.15)';
    let text = 'var(--green)';
    if (d === 'INTERMEDIATE') { bg = 'rgba(245, 158, 11, 0.15)'; text = '#f59e0b'; }
    if (d === 'ADVANCED') { bg = 'rgba(239, 68, 68, 0.15)'; text = 'var(--red)'; }
    
    return (
      <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', background: bg, padding: '4px 10px', borderRadius: '999px', color: text, display: 'inline-flex' }}>
        {diff || 'BEGINNER'}
      </div>
    );
  };

  return (
    <div className="nx-dashboard-layout">
      {/* 1. Floating Pill Header */}
      <div style={{ padding: '16px 16px 0 16px', flexShrink: 0 }}>
        <div className="nx-header" style={{ position: 'relative' }}>
          <div style={{ flex: 1 }}></div>
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer' }} onClick={() => router.push('/')}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.25em', color: '#FFFFFF', lineHeight: 1, paddingLeft: '0.25em' }}>INSTANT</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <div style={{ height: '2px', flex: 1, backgroundColor: '#0284c7', borderRadius: '2px' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5em', color: '#0284c7', lineHeight: 1, paddingLeft: '0.5em' }}>NODES</span>
              <div style={{ height: '2px', flex: 1, backgroundColor: '#0284c7', borderRadius: '2px' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="nx-dashboard-content">
        <div style={{ marginBottom: '24px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Home</span>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Catalogue</span>
        </div>
          
        {/* Hero Section */}
        {heroLab && (
          <>
            <h2 className="nx-section-title">Continue Learning</h2>
            <div className="nx-catalogue-hero">
              <div className="nx-catalogue-hero-left">
                <div style={{ marginBottom: '8px' }}>
                  {getDifficultyBadge(heroLab.difficulty)}
                </div>
                <h1 className="nx-hero-title">{heroLab.title}</h1>
                
                <div className="nx-hero-meta">
                  <div className="nx-hero-meta-item">
                    <Clock size={16} />
                    <span>{heroLab.estimated_time_minutes} minutes</span>
                  </div>
                </div>



                <button 
                  className="nx-btn nx-btn-primary" 
                  onClick={() => router.push(`/labs/${heroLab.slug}`)} 
                  style={{ width: '100%', maxWidth: '400px', padding: '14px', fontSize: '1.05rem', fontWeight: 600, marginTop: '8px' }}
                >
                  Resume Lab
                </button>
              </div>
              
              <div className="nx-catalogue-hero-right">
                <div className="nx-catalogue-hero-topo">
                  <TopologyRenderer slug={heroLab.slug} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* All Labs Section */}
        <h2 className="nx-section-title">All Labs</h2>
        
        <div className="nx-catalogue-filters">
          <div className="nx-search-wrapper">
            <Search size={18} />
            <input 
              type="text" 
              className="nx-search-input" 
              placeholder="Search labs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginLeft: '12px' }}>
            {allDifficulties.map(diff => (
              <div 
                key={diff}
                className={`nx-filter-pill ${activeFilters.includes(diff) ? 'active' : ''}`}
                onClick={() => toggleFilter(diff)}
              >
                {diff}
              </div>
            ))}
            
            <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }}></div>
            
            {allTopics.map(topic => (
              <div 
                key={topic}
                className={`nx-filter-pill ${activeFilters.includes(topic) ? 'active' : ''}`}
                onClick={() => toggleFilter(topic)}
              >
                {topic}
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Activity size={32} color="var(--primary)" style={{ animation: 'pulse 1.5s infinite' }} />
          </div>
        ) : (
          <div className="nx-lab-card-grid">
            {filteredLabs.map((lab) => (
              <div 
                key={lab.id}
                className="nx-lab-card-v2"
                onClick={() => router.push(`/labs/${lab.slug}`)}
              >
                <div className="nx-lab-card-v2-topo">
                  <div className="nx-lab-card-v2-topo-inner">
                    <TopologyRenderer slug={lab.slug} />
                  </div>
                </div>
                
                <div className="nx-lab-card-v2-body">
                  <div style={{ marginBottom: '8px' }}>
                    {getDifficultyBadge(lab.difficulty)}
                  </div>
                  <h3 className="nx-lab-card-v2-title">{lab.title}</h3>
                  <p className="nx-lab-card-v2-desc">{lab.description}</p>
                  
                  <div className="nx-lab-card-v2-footer">
                    <div className="nx-lab-card-v2-stats">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> {lab.estimated_time_minutes} min
                      </div>
                    </div>
                    <div className="nx-lab-card-v2-btn">Start Lab</div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredLabs.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <Search size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>No Labs Found</h3>
                <p>Try adjusting your filters.</p>
              </div>
            )}
          </div>
        )}
        
        <footer style={{ marginTop: '48px', paddingTop: '24px', paddingBottom: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: 'var(--text-muted)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--bg-base)', fontWeight: 700 }}>I</div>
            <span>InstantNodes v1.0.0</span>
          </div>
          <div>Real Network Emulation Platform</div>
        </footer>

      </div>
    </div>
  );
}
