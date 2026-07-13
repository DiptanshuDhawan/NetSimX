"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { BookOpen, Clock, Activity, ChevronRight, Server, Search, CheckCircle, Lock, LayoutList, Star, Award, Play, TrendingUp, Network, MoreHorizontal, LayoutDashboard, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState('All Topics');
  const [completedCount, setCompletedCount] = useState(0);
  const [heroBookmarked, setHeroBookmarked] = useState(false);
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

  const featuredLab = filteredLabs.length > 0 ? filteredLabs[0] : null;
  const remainingLabs = filteredLabs;

  const getDifficultyColor = (diff) => {
    const d = (diff || 'BEGINNER').toUpperCase();
    if (d === 'INTERMEDIATE') return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
    if (d === 'ADVANCED') return { bg: 'rgba(239, 68, 68, 0.15)', text: 'var(--red)' };
    return { bg: 'rgba(34, 197, 94, 0.15)', text: 'var(--green)' };
  };

  return (
    <div className="nx-dashboard-layout">
      {/* 1. Floating Pill Header */}
      <div style={{ padding: '16px 16px 0 16px', flexShrink: 0 }}>
        <div className="nx-header" style={{ position: 'relative' }}>
          {/* Left: Empty space to balance right avatar */}
          <div style={{ flex: 1 }}></div>
          
          {/* Center: Reconstructed Text Logo */}
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer' }} onClick={() => router.push('/')}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.25em', color: '#FFFFFF', lineHeight: 1, paddingLeft: '0.25em' }}>REVELIO</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <div style={{ height: '2px', flex: 1, backgroundColor: '#0284c7', borderRadius: '2px' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5em', color: '#0284c7', lineHeight: 1, paddingLeft: '0.5em' }}>LABS</span>
              <div style={{ height: '2px', flex: 1, backgroundColor: '#0284c7', borderRadius: '2px' }}></div>
            </div>
          </div>

          {/* Right: Avatar */}
          <div className="nx-toolbar" style={{ flex: 1, justifyContent: 'flex-end' }}>
            <div className="nx-avatar" title="User Profile">JD</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="nx-dashboard-content">
        <div style={{ marginBottom: '24px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Home</span>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Dashboard</span>
        </div>
          
        {/* 1. Featured Lab Banner */}

        {featuredLab ? (
          <div className="nx-featured-lab">
            {/* Background Texture */}
            <div style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.03, pointerEvents: 'none' }}>
              <Network size={340} />
            </div>

            <div 
              className="nx-featured-lab-bookmark" 
              onClick={(e) => { e.stopPropagation(); setHeroBookmarked(!heroBookmarked); }}
              title="Save for later"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={heroBookmarked ? "var(--primary)" : "none"} stroke={heroBookmarked ? "var(--primary)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.15s ease-out' }}>
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            
            <div className="nx-featured-lab-icon">
              <BookOpen size={40} color="var(--primary)" />
            </div>

            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', background: getDifficultyColor(featuredLab.difficulty).bg, padding: '4px 10px', borderRadius: '999px', color: getDifficultyColor(featuredLab.difficulty).text, display: 'inline-flex', marginBottom: '12px' }}>
                {featuredLab.difficulty || 'BEGINNER'}
              </div>
              
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', margin: '0 0 8px 0' }}>{featuredLab.title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '0 0 24px 0', maxWidth: '600px' }}>{featuredLab.description}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '24px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> {featuredLab.estimated_time_minutes} min</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><LayoutList size={16} /> 5 Tasks</div>
                  </div>
                  <div className="nx-hero-progress-track" style={{ width: '200px', marginTop: '4px' }}>
                    <div className="nx-hero-progress-fill" style={{ width: '0%' }}></div>
                  </div>
                </div>
                <button className="nx-btn nx-btn-primary" onClick={() => router.push(`/labs/${featuredLab.slug}`)} style={{ padding: '8px 24px', fontWeight: 600 }}>
                  Start Lab &gt;
                </button>
              </div>
            </div>
          </div>
        ) : (
           <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '32px' }}>
              <Search size={32} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p>No featured lab found.</p>
           </div>
        )}

        {/* 2. Browse by Category */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, letterSpacing: '0.5px' }}>Browse by Category</h3>
          <span className="nx-link-view-all">View all</span>
        </div>

        <div className="nx-category-grid">
          {topics.map(topic => {
            const isActive = activeTopic === topic;
            const topicLabs = topic === 'All Topics' ? labs : labs.filter(l => l.topic === topic);
            
            let TopicIcon = Network;
            if (topic.toLowerCase().includes('switch')) TopicIcon = Server;
            if (topic.toLowerCase().includes('security')) TopicIcon = Lock;
            if (topic.toLowerCase().includes('auto')) TopicIcon = Activity;
            let topicColor = 'gray';
            if (topic.toLowerCase().includes('routing')) topicColor = 'blue';
            if (topic.toLowerCase().includes('switch')) topicColor = 'purple';
            if (topic.toLowerCase().includes('security')) topicColor = 'red';
            if (topic.toLowerCase().includes('auto')) topicColor = 'orange';
            if (topic.toLowerCase().includes('wireless')) topicColor = 'teal';

            return (
              <div 
                key={topic}
                className={`nx-category-card ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTopic(topic)}
                data-topic-color={topicColor}
              >
                <div className="nx-category-icon-badge">
                  <TopicIcon size={22} className="nx-category-card-icon" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span className="nx-category-card-title">{topic}</span>
                  <span className="nx-category-card-count">{topicLabs.length} {topicLabs.length === 1 ? 'Lab' : 'Labs'}</span>
                </div>
              </div>
            );
          })}
          

        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)', width: '100%', margin: '24px 0' }} />

        {/* 4. Recently Added */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, letterSpacing: '0.5px' }}>Recently Added</h3>
          <span className="nx-link-view-all">View all</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Activity size={32} color="var(--primary)" style={{ animation: 'pulse 1.5s infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            
            {remainingLabs.map((lab, idx) => {
              // Cycle colors for icons like in the screenshot
              const colorPalette = [
                { bg: 'rgba(34, 197, 94, 0.1)', color: 'var(--green)' },
                { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)' },
                { bg: 'rgba(47, 128, 237, 0.1)', color: 'var(--primary)' },
                { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }
              ];
              const iconStyle = colorPalette[idx % colorPalette.length];

              return (
              <div 
                key={lab.id} 
                className="nx-lab-list-item"
                onClick={() => router.push(`/labs/${lab.slug}`)}
                style={{ padding: '20px', gap: '16px' }}
              >
                <div className="nx-lab-list-item-bookmark" title="Save for later">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                </div>
                
                <div className="nx-lab-list-item-left" style={{ gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: iconStyle.bg, color: iconStyle.color }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{lab.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{lab.description}</p>
                  </div>
                </div>

                <div className="nx-lab-list-item-right" style={{ gap: '24px' }}>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {lab.estimated_time_minutes} min</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><LayoutList size={14} /> 4 Tasks</div>
                  </div>
                  <button className="nx-btn" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '6px 16px', fontSize: '0.85rem' }}>
                    Start Lab &gt;
                  </button>
                </div>
              </div>
            )})}
            
            {remainingLabs.length === 0 && (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <Search size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>No Labs Available</h3>
                <p>Try selecting another topic.</p>
              </div>
            )}

          </div>
        )}
        
        <footer style={{ marginTop: 'auto', paddingTop: '48px', paddingBottom: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: 'var(--text-muted)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--bg-base)', fontWeight: 700 }}>N</div>
            <span>NetLabX v1.0.0</span>
          </div>
          <div>Real Network Emulation Platform</div>
        </footer>

      </div>
    </div>
  );
}
