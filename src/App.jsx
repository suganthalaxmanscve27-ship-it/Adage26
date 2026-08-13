import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';

import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Events from './components/Events';
import Contact from './components/Contact';
import Verify from './components/Verify';
import Register from './components/Register';
import Login from './components/Login';
import AdminHub from './components/AdminHub';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';

function ProtectedRoute({ children, isAuthenticated }) {
  const isLogged = isAuthenticated || localStorage.getItem('adage_admin_logged') === 'true';
  if (!isLogged) return <Navigate to="/login" replace />;
  return children;
}

function FloatingSymbols() {
  const symbolDrawings = [
    // Triangle Ruler
    <svg key="tri" className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3v18h18L3 3zm4 6v8h8L7 9z" />
    </svg>,
    // Straight Ruler
    <svg key="str" className="w-10 h-5 md:w-16 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="7" width="20" height="10" rx="1" strokeWidth="1" />
      <line x1="6" y1="7" x2="6" y2="12" strokeWidth="1" />
      <line x1="10" y1="7" x2="10" y2="12" strokeWidth="1" />
      <line x1="14" y1="7" x2="14" y2="12" strokeWidth="1" />
      <line x1="18" y1="7" x2="18" y2="12" strokeWidth="1" />
    </svg>,
    // Gear
    <svg key="gear" className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" strokeWidth="1" />
      <path strokeWidth="1" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>,
    // Structural Truss Block
    <svg key="truss" className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" strokeWidth="1" />
      <line x1="3" y1="3" x2="21" y2="21" strokeWidth="1" />
      <line x1="21" y1="3" x2="3" y2="21" strokeWidth="1" />
      <line x1="3" y1="12" x2="21" y2="12" strokeWidth="1" />
      <line x1="12" y1="3" x2="12" y2="21" strokeWidth="1" />
    </svg>,
    // Crane / Hook
    <svg key="crane" className="w-10 h-10 md:w-14 md:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeWidth="1" d="M4 22V8h16M2 8h22M6 8l2-6h8l2 6" />
      <path strokeWidth="1" d="M4 15l4-3M12 8l4 7M8 15h8" />
    </svg>
  ];

  const symbols = [
    { icon: symbolDrawings[0], x: '5%', y: '15%', speed: 'animate-float-1' },
    { icon: symbolDrawings[1], x: '85%', y: '25%', speed: 'animate-float-2' },
    { icon: symbolDrawings[2], x: '6%', y: '60%', speed: 'animate-float-3' },
    { icon: symbolDrawings[3], x: '80%', y: '75%', speed: 'animate-float-1' },
    { icon: symbolDrawings[4], x: '90%', y: '10%', speed: 'animate-float-2' },
    { icon: symbolDrawings[0], x: '20%', y: '85%', speed: 'animate-float-3' },
    { icon: symbolDrawings[2], x: '75%', y: '45%', speed: 'animate-float-1' },
    { icon: symbolDrawings[1], x: '45%', y: '90%', speed: 'animate-float-2' }
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {symbols.map((sym, idx) => (
        <div
          key={idx}
          className={`absolute text-[#C8922A]/8 select-none ${sym.speed}`}
          style={{ left: sym.x, top: sym.y }}
        >
          {sym.icon}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [registrations, setRegistrations] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Custom cursor
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHoveringLink, setIsHoveringLink] = useState(false);
  const [showCursor, setShowCursor] = useState(false);

  // Background phases based on scroll
  const [scrollPhase, setScrollPhase] = useState('sketch');



  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('timestamp', { ascending: false });
      if (error) throw error;
      setRegistrations(data || []);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
    const adminSession = localStorage.getItem('adage_admin_logged');
    if (adminSession === 'true') setIsAuthenticated(true);

    const channel = supabase
      .channel('adage-admin-registrations-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, (payload) => {
        if (payload.eventType === 'INSERT') setRegistrations(p => [payload.new, ...p]);
        else if (payload.eventType === 'UPDATE') setRegistrations(p => p.map(i => i.id === payload.new.id ? payload.new : i));
        else if (payload.eventType === 'DELETE') setRegistrations(p => p.filter(i => i.id !== payload.old.id));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);



  // Custom Cursor Mouse Listener
  useEffect(() => {
    document.body.classList.add('custom-cursor-enabled');

    const onMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      if (!showCursor) setShowCursor(true);
    };

    const onMouseOver = (e) => {
      const target = e.target;
      if (!target || !(target instanceof Element)) return;
      const isClickable = target.closest('a, button, [role="button"], input, select, textarea, label, .cursor-pointer, .interactive-floor, .interactive-building-node');
      setIsHoveringLink(!!isClickable);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, [showCursor]);

  // Scroll phase effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollPos / (height || 1);

      if (ratio < 0.25) {
        setScrollPhase('sketch');
      } else if (ratio < 0.52) {
        setScrollPhase('wireframe');
      } else if (ratio < 0.78) {
        setScrollPhase('concrete');
      } else {
        setScrollPhase('finished');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('registrations').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setRegistrations(p => p.map(i => i.id === id ? { ...i, status: newStatus } : i));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleAdminLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('adage_admin_logged', 'true');
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adage_admin_logged');
  };

  return (
    <Router>
      {/* 4-Phase Dynamic Scrolling Background */}
      <div className={`blueprint-transition ${scrollPhase === 'sketch' ? 'site-bg-sketch' :
          scrollPhase === 'wireframe' ? 'site-bg-wireframe' :
            scrollPhase === 'concrete' ? 'site-bg-concrete' :
              'site-bg-finished'
        }`} />

      {/* Very faint concrete texture overlay (2% opacity) */}
      <div className="concrete-overlay" />

      {/* Floating Outline Engineering Symbols */}
      <FloatingSymbols />



      {/* Custom Crosshair Cursor */}
      {showCursor && (
        <div
          className="hidden md:block pointer-events-none fixed z-[9999] transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: cursorPos.x, top: cursorPos.y }}
        >
          <div className={`relative transition-all duration-300 ${isHoveringLink ? 'scale-125' : ''}`}>
            {/* Crosshair lines */}
            <div className="absolute top-1/2 left-1/2 w-8 h-px bg-[#C8922A]/80 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 h-8 w-px bg-[#C8922A]/80 -translate-x-1/2 -translate-y-1/2" />
            {/* Center ring */}
            <div className={`absolute top-1/2 left-1/2 w-3.5 h-3.5 border border-[#C8922A] rounded-full -translate-x-1/2 -translate-y-1/2 bg-black/40 transition-transform ${isHoveringLink ? 'scale-75 border-dashed border-red-400' : ''}`} />
            {/* Floating stats box */}
            <div className="absolute top-4 left-4 font-mono text-[7px] text-[#C8922A] bg-[#0C0C0C]/90 px-1.5 py-0.5 whitespace-nowrap select-none border border-[#C8922A]/20 shadow-md">
              X:{Math.round(cursorPos.x)} Y:{Math.round(cursorPos.y)}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-screen text-[#EDEBE6] custom-cursor-enabled">
        <Navbar />

        <main className="flex-grow pt-14">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/register" element={<Register onSubmit={async (p) => setRegistrations(prev => [p, ...prev])} />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login onLogin={handleAdminLogin} />} />
            <Route path="/admin" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AdminHub
                  registrations={registrations}
                  onUpdateStatus={handleUpdateStatus}
                  onRefresh={fetchRegistrations}
                  fetchError={fetchError}
                  isLoading={isLoading}
                  onLogout={handleAdminLogout}
                />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
