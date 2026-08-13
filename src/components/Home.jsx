import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, QrCode, Award, Utensils, ArrowRight } from 'lucide-react';
import { lp } from '../events';
import ThreeDText from './ThreeDText';
import AdageLogo from './AdageLogo';
import NavWireframeLogo from './NavWireframeLogo';
import ArchitectsFooter from './ArchitectsFooter';

// ─── Countdown Timer Component ──────────────────────────────────────────
export function CountdownTimer({ targetDate, outlineOnly = false, hideText = false }) {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setT({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const Unit = ({ value, label }) => (
    <div className="text-center font-mono">
      <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-[70px] md:h-[70px] flex items-center justify-center border bg-transparent ${outlineOnly ? 'border-[#C8922A]/30' : 'border-white/[0.06] bg-white/[0.02]'}`}>
        <p className={`font-cinzel font-black text-2xl sm:text-3xl md:text-4xl tabular-nums leading-none ${hideText ? 'opacity-0' : (outlineOnly ? 'text-outline-gold' : 'text-[#EDEBE6]')}`}>
          {String(value).padStart(2, '0')}
        </p>
      </div>
      <p className={`text-[7px] sm:text-[8px] md:text-[9px] uppercase tracking-[0.25em] mt-2 font-bold ${hideText ? 'opacity-0' : (outlineOnly ? 'text-outline-gold opacity-50' : 'text-[#C8922A]')}`}>{label}</p>
    </div>
  );

  return (
    <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
      <Unit value={t.days}    label="Days" />
      <span className={`font-cinzel text-lg sm:text-xl text-gray-600 mt-3 sm:mt-4 ${hideText ? 'opacity-0' : ''}`}>:</span>
      <Unit value={t.hours}   label="Hours" />
      <span className={`font-cinzel text-lg sm:text-xl text-gray-600 mt-3 sm:mt-4 ${hideText ? 'opacity-0' : ''}`}>:</span>
      <Unit value={t.minutes} label="Mins" />
      <span className={`font-cinzel text-lg sm:text-xl text-gray-600 mt-3 sm:mt-4 ${hideText ? 'opacity-0' : ''}`}>:</span>
      <Unit value={t.seconds} label="Secs" />
    </div>
  );
}

// ─── Hero Blueprint Drawing ─────────────────────────────────────────────
function HeroBlueprint() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20 sm:opacity-30">
      <svg className="w-full h-full text-[#C8922A]" viewBox="0 0 1000 600" fill="none" stroke="currentColor">
        <g strokeWidth="0.75" strokeDasharray="4,4" opacity="0.45">
          <line x1="100" y1="0" x2="100" y2="600" />
          <line x1="200" y1="0" x2="200" y2="600" />
          <line x1="300" y1="0" x2="300" y2="600" />
          <line x1="400" y1="0" x2="400" y2="600" />
          <line x1="500" y1="0" x2="500" y2="600" />
          <line x1="600" y1="0" x2="600" y2="600" />
          <line x1="700" y1="0" x2="700" y2="600" />
          <line x1="800" y1="0" x2="800" y2="600" />
          <line x1="900" y1="0" x2="900" y2="600" />
          
          <line x1="0" y1="100" x2="1000" y2="100" />
          <line x1="0" y1="200" x2="1000" y2="200" />
          <line x1="0" y1="300" x2="1000" y2="300" />
          <line x1="0" y1="400" x2="1000" y2="400" />
          <line x1="0" y1="500" x2="1000" y2="500" />
        </g>
        
        {/* Bridge drawing path with animate-draw-path */}
        <path
          className="animate-draw-path"
          strokeWidth="1.25"
          d="M 50 420 Q 250 320 450 420 L 450 440 L 50 440 Z"
        />
        <path
          className="animate-draw-path"
          strokeWidth="0.75"
          strokeDasharray="4,4"
          d="M 50 420 L 100 370 L 150 420 L 200 370 L 250 420 L 300 370 L 350 420 L 400 370 L 450 420"
        />
        <line className="animate-draw-path" x1="50" y1="420" x2="450" y2="420" strokeWidth="2" />
        <line className="animate-draw-path" x1="100" y1="370" x2="100" y2="440" strokeWidth="0.5" />
        <line className="animate-draw-path" x1="200" y1="370" x2="200" y2="440" strokeWidth="0.5" />
        <line className="animate-draw-path" x1="300" y1="370" x2="300" y2="440" strokeWidth="0.5" />
        <line className="animate-draw-path" x1="400" y1="370" x2="400" y2="440" strokeWidth="0.5" />
        
        {/* Floor plan outline drawing */}
        <rect className="animate-draw-path" x="580" y="80" width="340" height="190" strokeWidth="1.25" />
        <rect className="animate-draw-path" x="610" y="110" width="110" height="130" strokeWidth="0.75" />
        <rect className="animate-draw-path" x="750" y="110" width="140" height="130" strokeWidth="0.75" strokeDasharray="3,3" />
        
        {/* AutoCAD style Dimensions */}
        <g strokeWidth="0.75" fontSize="8" fontFamily="monospace" fill="currentColor" opacity="0.7">
          <line x1="580" y1="65" x2="920" y2="65" />
          <line x1="580" y1="60" x2="580" y2="70" />
          <line x1="920" y1="60" x2="920" y2="70" />
          <text x="750" y="58" textAnchor="middle" stroke="none">3400mm</text>
          
          <line x1="580" y1="80" x2="565" y2="80" />
          <line x1="580" y1="270" x2="565" y2="270" />
          <line x1="568" y1="80" x2="568" y2="270" />
          <text x="558" y="175" textAnchor="middle" transform="rotate(-90 558 175)" stroke="none">1900mm</text>

          {/* Bridge dimension */}
          <line x1="50" y1="465" x2="450" y2="465" />
          <line x1="50" y1="460" x2="50" y2="470" />
          <line x1="450" y1="460" x2="450" y2="470" />
          <text x="250" y="480" textAnchor="middle" stroke="none">DIM: 4000mm</text>
        </g>
        
        {/* AutoCAD Coordinate style grid notation */}
        <circle cx="50" cy="420" r="3" fill="currentColor" />
        <text x="60" y="415" fontSize="9" stroke="none" fontFamily="monospace">ORIGIN (0,0)</text>
        
        {/* Structural beam drawing block */}
        <g transform="translate(80, 60)">
          <rect className="animate-draw-path" x="0" y="0" width="300" height="20" strokeWidth="1.25" />
          <line className="animate-draw-path" x1="60" y1="0" x2="60" y2="20" strokeWidth="0.75" />
          <line className="animate-draw-path" x1="150" y1="0" x2="150" y2="20" strokeWidth="0.75" />
          <line className="animate-draw-path" x1="240" y1="0" x2="240" y2="20" strokeWidth="0.75" />
          <path className="animate-draw-path" d="M 0 10 L 300 10" strokeWidth="0.75" strokeDasharray="8,4" />
          <text x="150" y="32" fontSize="9" stroke="none" textAnchor="middle" fontFamily="monospace">BEAM SECTION 1-1 (SCALE 1:50)</text>
        </g>
      </svg>
    </div>
  );
}

// ─── Crane Title Lift Animation ─────────────────────────────────────────
function AnimatedCraneTitle() {
  return (
    <div className="relative">
      {/* SVG Tower Crane Structure overlay */}
      <div className="hidden sm:block absolute -top-[150px] left-[210px] sm:left-[330px] md:left-[360px] lg:left-[460px] w-[200px] h-[170px] pointer-events-none opacity-20 z-0 select-none">
        <svg className="w-full h-full text-[#C8922A]" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          {/* Vertical mast */}
          <line x1="20" y1="100" x2="20" y2="10" strokeWidth="1.25" />
          <line x1="12" y1="100" x2="12" y2="10" strokeWidth="1" />
          {/* Lattices */}
          <line x1="12" y1="90" x2="20" y2="75" strokeWidth="0.5" />
          <line x1="12" y1="75" x2="20" y2="60" strokeWidth="0.5" />
          <line x1="12" y1="60" x2="20" y2="45" strokeWidth="0.5" />
          <line x1="12" y1="45" x2="20" y2="30" strokeWidth="0.5" />
          <line x1="12" y1="30" x2="20" y2="15" strokeWidth="0.5" />
          {/* Horizontals */}
          <line x1="12" y1="85" x2="20" y2="85" strokeWidth="0.5" />
          <line x1="12" y1="70" x2="20" y2="70" strokeWidth="0.5" />
          <line x1="12" y1="55" x2="20" y2="55" strokeWidth="0.5" />
          <line x1="12" y1="40" x2="20" y2="40" strokeWidth="0.5" />
          <line x1="12" y1="25" x2="20" y2="25" strokeWidth="0.5" />
          <line x1="12" y1="10" x2="20" y2="10" strokeWidth="1.25" />

          {/* Jib */}
          <line x1="0" y1="10" x2="90" y2="10" strokeWidth="1.5" />
          {/* Jib trusses */}
          <line x1="20" y1="10" x2="30" y2="1" strokeWidth="0.5" />
          <line x1="30" y1="1" x2="40" y2="10" strokeWidth="0.5" />
          <line x1="40" y1="10" x2="50" y2="1" strokeWidth="0.5" />
          <line x1="50" y1="1" x2="60" y2="10" strokeWidth="0.5" />
          <line x1="60" y1="10" x2="70" y2="1" strokeWidth="0.5" />
          <line x1="70" y1="1" x2="80" y2="10" strokeWidth="0.5" />
          <line x1="20" y1="1" x2="80" y2="1" strokeWidth="0.75" />

          {/* Counter jib */}
          <line x1="0" y1="10" x2="20" y2="1" strokeWidth="1" />
          <rect x="3" y="10" width="7" height="5" fill="#C8922A" opacity="0.7" />

          {/* Cable trolley */}
          <rect x="66" y="10" width="5" height="2" fill="currentColor" />
          {/* Static cable line */}
          <line
            x1="68"
            y1="12"
            x2="68"
            y2={45}
            strokeWidth="0.75"
          />
          {/* Hook assembly */}
          <g transform="translate(65, 43)">
            <circle cx="3" cy="3" r="1.2" fill="currentColor" />
            <path d="M3,4 L3,8 A2,2 0 0,1 1,10" strokeWidth="0.75" />
          </g>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-full sm:max-w-[540px] md:max-w-[640px] h-auto my-3">
        <NavWireframeLogo className="w-full h-auto" animated={true} />
      </div>
    </div>
  );
}

// ─── 3D Wireframe Skyscraper Hero Illustration ──────────────────────────
function WireframeBuildingHero() {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-8 sm:opacity-12">
      <svg className="w-full h-full text-[#C8922A]" viewBox="0 0 300 300" fill="none" stroke="currentColor">
        <g strokeWidth="0.75">
          {/* Vertical Columns */}
          <line x1="60" y1="280" x2="60" y2="80" />
          <line x1="110" y1="250" x2="110" y2="50" />
          <line x1="160" y1="280" x2="160" y2="80" />
          
          {/* Diagonal truss structural lines */}
          <line x1="60" y1="80" x2="110" y2="50" />
          <line x1="110" y1="50" x2="160" y2="80" />
          
          {/* Floor grid segments */}
          {Array.from({ length: 10 }).map((_, i) => {
            const yOffset = i * 20;
            return (
              <g key={i}>
                <line x1="60" y1={100 + yOffset} x2="110" y2={70 + yOffset} />
                <line x1="110" y1={70 + yOffset} x2="160" y2={100 + yOffset} />
                <line x1="60" y1={100 + yOffset} x2="110" y2={100 + yOffset} strokeWidth="0.2" opacity="0.6" />
                <line x1="110" y1={70 + yOffset} x2="160" y2={70 + yOffset} strokeWidth="0.2" opacity="0.6" />
              </g>
            );
          })}
          
          {/* Structural braces (X-crossings) */}
          <line x1="60" y1="280" x2="110" y2="270" strokeWidth="0.3" opacity="0.5" />
          <line x1="110" y1="270" x2="160" y2="280" strokeWidth="0.3" opacity="0.5" />
          <line x1="60" y1="120" x2="110" y2="130" strokeWidth="0.3" opacity="0.5" />
          <line x1="110" y1="130" x2="160" y2="120" strokeWidth="0.3" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}

// ─── CAD Coordinate Overlays ────────────────────────────────────────────
function CADCoordinates() {
  return (
    <div className="absolute inset-x-0 inset-y-0 pointer-events-none z-10 font-mono text-[7px] text-gray-500 uppercase tracking-widest p-4 select-none">
      <div className="absolute top-4 left-4 leading-normal">
        GRID REF: A-4 // SECTION-C<br />
        ELEVATION: +12.50m (DATUM)<br />
        DRG TYPE: CAD_BLUEPRINT
      </div>
      <div className="absolute top-4 right-4 text-right leading-normal">
        SYSTEM: VITE_AUTOCAD_v3<br />
        SCALE: 1:100 @ A3 SHEET<br />
        PROJECT ID: AD-26-CV
      </div>
      <div className="absolute bottom-4 left-4 leading-normal">
        COORDS (REF_ORIGIN):<br />
        X: 120.45m // Y: 340.22m
      </div>
      <div className="absolute bottom-4 right-4 text-right leading-normal">
        LAYER: BASE_STRUCT_BEAMS<br />
        DRG STATUS: CERTIFIED
      </div>
    </div>
  );
}

// ─── Bolted Beam Joint Divider ──────────────────────────────────────────
export function BeamJointDivider({ type = 'joint' }) {
  if (type === 'beams') {
    return (
      <div className="flex items-center justify-center py-8 select-none pointer-events-none w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-[#C8922A]/40" />
        <div className="mx-4 flex items-center gap-1 font-mono text-[9px] text-[#C8922A] tracking-[0.25em] uppercase">
          <span>━━━━━━</span>
          <div className="w-4 h-4 border border-[#C8922A] flex items-center justify-center rotate-45">
            <div className="w-1.5 h-1.5 bg-[#C8922A]" />
          </div>
          <span>━━━━━━</span>
        </div>
        <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-white/10 to-[#C8922A]/40" />
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center py-8 select-none pointer-events-none w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="h-px flex-1 bg-[#C8922A]/20" />
      <div className="mx-3 flex items-center gap-2">
        <div className="w-1.5 h-3 bg-[#C8922A] rounded-sm opacity-60" />
        <div className="w-6 h-4 border border-[#C8922A]/80 flex items-center justify-center text-[7px] text-[#C8922A] font-bold font-mono">
          FL-B
        </div>
        <div className="w-1.5 h-3 bg-[#C8922A] rounded-sm opacity-60" />
      </div>
      <div className="h-px flex-1 bg-[#C8922A]/20" />
    </div>
  );
}

// ─── Animated Counters ──────────────────────────────────────────────────
function AnimatedCounter({ value, duration = 1600 }) {
  const [count, setCount] = useState('0');
  
  useEffect(() => {
    const match = value.match(/\d+/);
    if (!match) {
      setCount(value);
      return;
    }
    
    const targetNumber = parseInt(match[0], 10);
    const textPrefix = value.substring(0, value.indexOf(match[0]));
    const textSuffix = value.substring(value.indexOf(match[0]) + match[0].length);
    
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentVal = Math.floor(progress * targetNumber);
      setCount(`${textPrefix}${currentVal}${textSuffix}`);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);
  
  return <span>{count}</span>;
}

// ─── Construction Progress Timeline Component ───────────────────────────
function ConstructionTimeline() {
  const phases = [
    { title: "Excavation & Clearing", phase: "PHASE 01", event: "Registration", desc: "Teams check in at the reception, claim event passes, and receive technical layout instructions.", time: "08:30 AM", status: "Completed" },
    { title: "Foundation Laying", phase: "PHASE 02", event: "Inauguration", desc: "Welcoming remarks from the HOD, lighting of the lamp, and keynote speech on Smart Infrastructure.", time: "09:30 AM", status: "Ongoing" },
    { title: "Superstructure Framing", phase: "PHASE 03", event: "Paper Presentation & Technical Challenges", desc: "Technical Convergence: CAD Craft, Spruce Span load testing, Survey Elite field leveling, and Concrete Master design.", time: "10:30 AM", status: "Pending" },
    { title: "Finishing Works", phase: "PHASE 04", event: "Non-Technical Events & Workshops", desc: "Urbanscapes city layouts pitch, Shutter Span photo review, and Mystery Block tower Jenga.", time: "01:30 PM", status: "Pending" },
    { title: "Handover & Occupancy", phase: "PHASE 05", event: "Prize Distribution & Valedictory", desc: "Awarding cash pools, trophies, and certificates to winners of all structural competitions.", time: "04:00 PM", status: "Pending" }
  ];
  
  return (
    <section className="py-14 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 sm:gap-4 mb-10 sm:mb-16">
        <span className="section-label">03</span>
        <div className="h-px flex-1 bg-white/[0.04]" />
        <span className="section-label">Construction Progress Timeline</span>
      </div>

      <div className="relative border-l border-[#C8922A]/20 ml-4 md:ml-32 space-y-12">
        {phases.map((item, idx) => (
          <div key={idx} className="relative pl-6 md:pl-10 group">
            {/* Timeline node */}
            <div className="absolute -left-[9px] top-1.5 w-[18px] h-[18px] bg-[#0C0C0C] border-2 border-[#C8922A] flex items-center justify-center rotate-45 group-hover:scale-125 transition-transform duration-200">
              <div className={`w-1.5 h-1.5 ${item.status === 'Completed' ? 'bg-[#C8922A]' : item.status === 'Ongoing' ? 'bg-[#C8922A] animate-pulse' : 'bg-transparent'}`} />
            </div>
            
            {/* Left timeline offset containing timing metadata */}
            <div className="hidden md:block absolute -left-[140px] top-0.5 text-right w-28">
              <span className="text-[10px] font-mono text-[#C8922A] font-bold">{item.time}</span>
              <p className="text-[8px] text-gray-500 font-mono tracking-widest mt-0.5">{item.phase}</p>
            </div>
            
            <div className="bg-[#111]/40 border border-white/5 hover:border-[#C8922A]/30 p-5 sm:p-6 transition-all duration-300 relative overflow-hidden">
              {/* Engineering border tick */}
              <div className="absolute top-0 right-0 w-12 h-px bg-gradient-to-r from-transparent to-[#C8922A]" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <div>
                  <span className="text-[8px] font-mono text-[#C8922A]/80 uppercase tracking-widest">{item.title}</span>
                  <h3 className="text-white text-sm sm:text-base font-cinzel font-bold mt-0.5 uppercase tracking-wide">{item.event}</h3>
                </div>
                <span className={`text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 border ${
                  item.status === 'Completed' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-950/10' :
                  item.status === 'Ongoing' ? 'border-[#C8922A]/20 text-[#C8922A] bg-[#C8922A]/5' :
                  'border-white/5 text-gray-500'
                }`}>
                  {item.status}
                </span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              <div className="md:hidden mt-3 flex justify-between text-[9px] font-mono text-gray-500">
                <span>{item.phase}</span>
                <span>{item.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Main Exported Home Component ───────────────────────────────────────
export default function Home() {
  const essentials = [
    { icon: <ShieldCheck size={16} />, title: 'College ID Mandatory',    desc: 'Valid college ID card required at venue for all participants.' },
    { icon: <QrCode       size={16} />, title: 'Digital Pass Required',  desc: 'Show your registration QR code at reception for entry.' },
    { icon: <Award        size={16} />, title: 'Certificates Provided',  desc: 'Hard-copy participation certificates for all attendees.' },
    { icon: <Utensils     size={16} />, title: 'Lunch Included',         desc: 'Complimentary lunch provided for every registered participant.' },
  ];

  const highlights = [
    { num: '150+', label: 'Participants', desc: 'Students from engineering colleges across South India.' },
    { num: '8',   label: 'Events',       desc: 'Technical & non-technical civil engineering challenges.' },
    { num: '15+',   label: 'Colleges',     desc: 'Participating top-tier institutes and universities.' },
    { num: '₹20K', label: 'Prize Pool',   desc: 'Cash awards and trophies across all categories.' },
  ];

  return (
    <div className="min-h-screen relative">
      
      {/* Studio ambient lighting spotlight */}
      <div className="studio-spotlight" />

      {/* CAD blueprints vector background */}
      <HeroBlueprint />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="min-h-[calc(100vh-4rem)] flex items-center px-4 sm:px-6 lg:px-16 max-w-7xl mx-auto py-16 sm:py-12 relative z-10 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center w-full">
          
          {/* Left Column: Brand & Actions */}
          <div className="space-y-5 sm:space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="w-6 sm:w-8 h-px bg-[#C8922A]" />
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.5em] text-[#C8922A] font-bold">
                National Symposium · Civil Engineering
              </p>
            </div>
            
            {/* Crane lifting title */}
            <AnimatedCraneTitle />
            
            <div className="flex items-center gap-3 sm:gap-4 py-1">
              <div className="h-px w-8 sm:w-10 bg-[#C8922A]/40" />
              <p className="font-cinzel text-[10px] sm:text-xs text-gray-300 uppercase tracking-[0.3em] sm:tracking-[0.4em] font-semibold">
                Build · Compete · Evolve
              </p>
            </div>

            <p className="text-gray-400 text-xs sm:text-sm max-w-md leading-relaxed">
              Explore your engineering capabilities, draft designs, test structures, and challenge your analytical thinking at the GCE Erode Civil Engineering Department's annual convergence.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Link to="/register" className="btn-outline-gold group justify-center sm:justify-start">
                Register Now
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/events" className="btn-outline-ghost justify-center sm:justify-start">
                View Events
              </Link>
            </div>
          </div>

          {/* Right Column: Year Indicator with Skyscraper wireframe, Countdown, & Venue */}
          <div className="flex flex-col items-center md:items-end justify-center space-y-6 sm:space-y-8 md:text-right border-t md:border-t-0 md:border-r border-white/5 pt-8 md:pt-0 md:pr-12 animate-fade-in-up anim-delay-200">
            {/* Skyscraper wireframe */}
            <div className="hidden md:flex relative w-full h-48 items-center justify-end">
              <WireframeBuildingHero />
            </div>

            {/* Countdown */}
            <div className="space-y-3 sm:space-y-4 w-full flex flex-col items-center md:items-end">
              <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-gray-400 font-bold">Event Commencing In</p>
              <div className="flex justify-center md:justify-end">
                <CountdownTimer targetDate={lp} />
              </div>
            </div>

            {/* Venue details */}
            <div className="space-y-1 text-center md:text-right">
              <p className="text-xs font-bold text-[#EDEBE6] uppercase tracking-wider">
                3 September 2026
              </p>
              <a
                href="https://maps.app.goo.gl/dpZ1Amf1r3dFJqK29"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] sm:text-[10px] text-gray-400 hover:text-[#C8922A] transition-colors uppercase tracking-[0.2em] font-medium inline-block"
              >
                GCE Erode Campus ↗ · 9:00 AM
              </a>
            </div>
          </div>
          
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────── */}
      <BeamJointDivider type="beams" />

      {/* ── Essentials ───────────────────────────────────── */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
          <span className="section-label">01</span>
          <div className="h-px flex-1 bg-white/[0.04]" />
          <span className="section-label">Participant Essentials</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04]">
          {essentials.map((item, i) => (
            <div key={i} className="bg-[#0C0C0C]/80 backdrop-blur-sm p-6 sm:p-8 hover:bg-[#111] transition-colors group border border-white/5 hover:border-[#C8922A]/20 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-[#C8922A] mb-4 sm:mb-5">{item.icon}</div>
              <h3 className="text-[#EDEBE6] font-semibold text-sm mb-2">{item.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Civil Quote Section ──────────────────────────── */}
      <section className="py-16 sm:py-24 border-y border-white/[0.06] bg-[#111]/15 relative text-center overflow-hidden z-10">
        <div className="blueprint-draft-lines" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 select-none">
          <span className="text-[8px] font-mono text-[#C8922A] tracking-[0.4em] uppercase block mb-4">CIVIL QUOTE</span>
          <p className="font-cinzel text-lg sm:text-xl md:text-2xl text-gray-300 italic font-bold leading-relaxed">
            "Engineering begins where imagination meets precision. We don't just build structures — we build the future."
          </p>
          <div className="w-16 h-[1.5px] bg-[#C8922A] mx-auto mt-6" />
        </div>
      </section>

      <BeamJointDivider />

      {/* ── Highlights (Statistical Counters) ────────────── */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
          <span className="section-label">02</span>
          <div className="h-px flex-1 bg-white/[0.04]" />
          <span className="section-label">Symposium Numbers</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.04]">
          {highlights.map((item, i) => (
            <div key={i} className="bg-[#0C0C0C]/80 backdrop-blur-sm p-6 sm:p-8 hover:bg-[#111] transition-colors border border-white/5 hover:border-[#C8922A]/20 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <p className="font-cinzel font-black text-3xl sm:text-4xl md:text-5xl text-[#C8922A] mb-3 sm:mb-4">
                <AnimatedCounter value={item.num} />
              </p>
              <p className="text-[#EDEBE6] font-semibold text-xs sm:text-sm uppercase tracking-wider mb-2 sm:mb-3">{item.label}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <BeamJointDivider />

      {/* ── Timeline Section ─────────────────────────────── */}
      <ConstructionTimeline />

      <BeamJointDivider type="beams" />

      {/* ── Architects of the Digital Stage & Footer ─────── */}
      <ArchitectsFooter />
    </div>
  );
}
