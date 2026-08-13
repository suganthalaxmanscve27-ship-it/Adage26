import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Phone, ArrowRight, Loader, Zap, FileText, Download } from 'lucide-react';
import { Sr, Pt } from '../events';
import { supabase } from '../supabase';

function EventModal({ event, onClose }) {
  if (!event) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#111] w-full sm:max-w-2xl border border-white/[0.08] relative flex flex-col max-h-[92vh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-[#EDEBE6] z-10 transition-colors p-1">
          <X size={22} />
        </button>

        {/* Drag handle for mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Modal header */}
        <div className="relative h-32 sm:h-40 flex-shrink-0 overflow-hidden bg-[#0A0D14]">
          <img
            src={event.image}
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/60 to-transparent" />
          <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-6 right-12">
            <span className="text-[#C8922A] text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.4em]">{event.category}</span>
            <h3 className="font-cinzel font-black text-lg sm:text-xl md:text-2xl text-[#EDEBE6] uppercase tracking-widest mt-1">{event.title}</h3>
            {event.slogan && <p className="text-gray-400 text-[9px] sm:text-[10px] italic mt-1">"{event.slogan}"</p>}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-grow overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6 sm:space-y-8 custom-scrollbar">
          {/* Quick info */}
          <div className="grid grid-cols-3 gap-px bg-white/[0.04]">
            {[
              { label: 'Fee',     val: `₹${event.fee} / head` },
              { label: 'Team',    val: `Max ${event.maxMembers}` },
              { label: 'Prize',   val: event.prize },
            ].map((item, i) => (
              <div key={i} className="bg-[#111] px-3 sm:px-4 py-3 sm:py-4">
                <p className="section-label mb-1 text-[8px] sm:text-[10px]">{item.label}</p>
                <p className="text-[#EDEBE6] text-[10px] sm:text-xs font-semibold">{item.val}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-[#C8922A] text-[9px] font-bold uppercase tracking-[0.3em] mb-3 accent-bar">Description</h4>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{event.description}</p>
          </div>

          {/* Rounds */}
          {event.rounds?.length > 0 && (
            <div>
              <h4 className="text-[#C8922A] text-[9px] font-bold uppercase tracking-[0.3em] mb-3 sm:mb-4 accent-bar">Event Rounds</h4>
              <div className="space-y-3">
                {event.rounds.map((r, i) => (
                  <div key={i} className="border border-white/[0.06] p-4 sm:p-5 hover:border-[#C8922A]/20 transition-colors">
                    <p className="text-[#C8922A] text-[9px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Zap size={11} />{r.name}
                    </p>
                    <p className="text-gray-300 text-xs leading-relaxed">{r.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules */}
          <div>
            <h4 className="text-[#C8922A] text-[9px] font-bold uppercase tracking-[0.3em] mb-3 sm:mb-4 accent-bar">
              {event.category === Pt.NON_TECHNICAL ? 'Rules for Play' : 'Instructions & Guidelines'}
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {event.rules.map((rule, i) => (
                <li key={i} className="flex gap-3 sm:gap-4 text-xs text-gray-300 leading-relaxed">
                  <span className="text-[#C8922A] font-cinzel mt-0.5 flex-shrink-0 font-bold text-[10px]">{String(i+1).padStart(2,'0')}.</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* Coordinators */}
          {event.coordinators && (
            <div>
              <h4 className="text-[#C8922A] text-[9px] font-bold uppercase tracking-[0.3em] mb-3 sm:mb-4 accent-bar">Coordinators</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {event.coordinators.map((c, i) => (
                  <div key={i} className="border border-white/[0.06] px-3 sm:px-4 py-3 flex items-center justify-between hover:border-[#C8922A]/20 transition-colors">
                    <div>
                      <p className="text-[#EDEBE6] text-xs font-semibold">{c.name}</p>
                      <p className="text-gray-400 text-[10px] font-mono mt-0.5">{c.phone}</p>
                    </div>
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="text-[#C8922A] hover:text-[#EDEBE6] transition-colors ml-3 p-2">
                        <Phone size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="p-4 sm:p-5 border-t border-white/[0.06] flex-shrink-0">
          <Link
            to={`/register?eventId=${event.id}`}
            className="btn-primary w-full justify-center py-4"
          >
            Register for this Event <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  const [events, setEvents]           = useState([]);
  const [filter, setFilter]           = useState('All');
  const [isLoading, setIsLoading]     = useState(true);
  const [selectedEvent, setSelected]  = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('events').select('*');
        setEvents(data?.length ? data : Sr);
      } catch { setEvents(Sr); }
      finally { setIsLoading(false); }
    })();
  }, []);

  const categories = ['All', ...Object.values(Pt)];
  const filtered = filter === 'All' ? events : events.filter(e => e.category === filter);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader className="animate-spin text-[#C8922A]" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen py-16 sm:py-20">
      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelected(null)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Title & Rule Book Header */}
        <div className="mb-10 sm:mb-16 animate-fade-in-up flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <span className="w-6 sm:w-8 h-px bg-[#C8922A]" />
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.5em] text-[#C8922A] font-bold">Symposium Events</span>
            </div>
            <h1 className="font-cinzel font-black text-3xl sm:text-4xl md:text-5xl text-[#EDEBE6] uppercase tracking-wide">
              ADAGE'26 Events
            </h1>
          </div>

          {/* Rule Book PDF Link */}
          <a
            href="./ADAGE 26 Rule Book .pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#090909] border border-[#C8922A]/60 hover:border-[#C8922A] text-[#C8922A] hover:text-[#EDEBE6] font-cad text-xs tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(200,146,42,0.25)] rounded-sm group self-start sm:self-auto"
          >
            <FileText size={15} className="group-hover:scale-110 transition-transform" />
            <span>Rule Book (PDF)</span>
            <Download size={13} className="opacity-70 group-hover:opacity-100" />
          </a>
        </div>

        {/* Filter tabs — horizontal scroll on mobile */}
        <div className="flex gap-0 border-b border-white/[0.06] mb-8 sm:mb-12 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 sm:px-5 py-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all border-b-2 -mb-px whitespace-nowrap flex-shrink-0 ${
                filter === cat
                  ? 'border-[#C8922A] text-[#C8922A]'
                  : 'border-transparent text-gray-400 hover:text-[#EDEBE6]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events grid */}
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-20 sm:py-24 font-cinzel uppercase tracking-widest text-sm">No events found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event, i) => (
              <div
                key={event.id}
                onClick={() => setSelected(event)}
                className="bg-[#0A0D14] hover:bg-[#0E121A] transition-all duration-300 group flex flex-col border-2 border-white/5 hover:border-[#C8922A]/30 animate-fade-in-up relative p-1 cursor-pointer"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Engineering corner blueprint tick marks */}
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#C8922A]/40" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#C8922A]/40" />
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#C8922A]/40" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#C8922A]/40" />

                {/* Inner layout frame */}
                <div className="border border-white/[0.04] p-4 flex flex-col h-full bg-black/40 relative">
                  {/* Faint blueprint draft dots background */}
                  <div className="blueprint-draft-lines opacity-10 pointer-events-none" />

                  {/* Blueprint visual box */}
                  <div className="relative h-36 sm:h-40 overflow-hidden mb-4 border border-white/[0.05] bg-[#0A0D14]">
                    <img
                      src={event.image}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover opacity-45 group-hover:opacity-60 transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-transparent to-transparent" />
                    <span className="absolute top-2 right-2 bg-[#C8922A] text-[#0C0C0C] text-[8px] font-mono font-black tracking-widest px-2 py-0.5 border border-[#C8922A] select-none whitespace-nowrap">
                      ₹{event.fee} / ENTRY
                    </span>
                  </div>

                  {/* Title Block Header */}
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 justify-between items-start mb-3 pb-2 border-b border-[#C8922A]/10 font-mono text-[7px] text-gray-500 select-none">
                    <div className="whitespace-nowrap">
                      <p>DRG TYPE: {event.category.toUpperCase()}</p>
                      <p>SCALE: 1:100</p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p>STATUS: [OPEN]</p>
                      <p>DRG NO: AD-26-E{String(i+1).padStart(2,'0')}</p>
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="flex-grow flex flex-col">
                    <h3 className="font-cinzel font-black text-base text-[#EDEBE6] uppercase tracking-widest mb-1.5 group-hover:text-[#C8922A] transition-colors leading-tight">
                      {event.title}
                    </h3>
                    <p className="text-gray-400 text-[10px] leading-relaxed mb-4 line-clamp-3 font-mono">
                      {event.description}
                    </p>

                    {/* AutoCAD details tag block */}
                    <div className="border border-white/[0.04] bg-white/[0.02] p-2 flex justify-between items-center text-[8px] font-mono mb-4 text-gray-400 select-none">
                      <span>TEAM MAX: {event.maxMembers}</span>
                      <span>TIME: {event.timing || '10:00 AM'}</span>
                      <span className="text-[#C8922A] font-bold">APPROVED</span>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button
                        onClick={() => setSelected(event)}
                        className="btn-ghost px-2 py-2 text-[8px] tracking-widest justify-center text-gray-300 font-mono border-white/[0.08]"
                      >
                        SPEC SHEET
                      </button>
                      <Link
                        to={`/register?eventId=${event.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="btn-primary px-2 py-2 text-[8px] tracking-widest justify-center font-mono font-bold"
                      >
                        REGISTER
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
