import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas-pro';
import { CheckCircle, Clock, XCircle, QrCode, Download, Users, Award, MessageSquare, Loader, X } from 'lucide-react';
import { supabase } from '../supabase';
import { ut, Sr } from '../events';

function PassModal({ reg, onClose }) {
  const ref = useRef(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    const data = JSON.stringify({ id: reg.id, type: 'ADAGE_ENTRY' });
    const api  = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&bgcolor=111111&color=C8922A&data=${encodeURIComponent(data)}`;
    fetch(api).then(r => r.blob()).then(b => setQrUrl(URL.createObjectURL(b)));
    return () => { if (qrUrl) URL.revokeObjectURL(qrUrl); };
  }, [reg.id]);

  const download = async () => {
    if (!ref.current || !qrUrl) return;
    setCapturing(true);
    try {
      await new Promise(r => setTimeout(r, 200));
      const canvas = await html2canvas(ref.current, { backgroundColor: '#111111', scale: 2, useCORS: true, logging: false });
      const a = document.createElement('a');
      a.download = `ADAGE_PASS_${reg.id}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch { alert('Capture failed — please take a screenshot.'); }
    finally { setCapturing(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-xs w-full">
        <button onClick={onClose} className="absolute -top-9 right-0 text-[#3A3A3A] hover:text-[#EDEBE6] transition-colors">
          <X size={20} />
        </button>

        {/* Pass card */}
        <div ref={ref} className="bg-[#111] border border-[#C8922A]/30 p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-[#C8922A] mb-1">Entry Pass</p>
              <h3 className="font-cinzel font-black text-xl text-[#EDEBE6]">ADAGE'26</h3>
            </div>
            <Award size={20} className="text-[#C8922A]" />
          </div>

          {/* QR */}
          <div className="bg-[#111] border border-white/[0.06] p-4 mb-6 flex items-center justify-center h-44">
            {qrUrl ? (
              <img src={qrUrl} alt="Entry QR" className="w-full h-full object-contain" />
            ) : (
              <Loader className="animate-spin text-[#C8922A]" size={24} />
            )}
          </div>

          {/* Info rows */}
          <div className="divide-y divide-white/[0.06] mb-6">
            <div className="py-3">
              <p className="section-label mb-1">Participant</p>
              <p className="text-[#EDEBE6] font-cinzel font-bold text-sm uppercase">{reg.name}</p>
            </div>
            <div className="py-3 grid grid-cols-2 gap-4">
              <div>
                <p className="section-label mb-1">Entry ID</p>
                <p className="text-[#C8922A] font-mono text-xs">{reg.id}</p>
              </div>
              <div>
                <p className="section-label mb-1">Venue</p>
                <p className="text-[#EDEBE6] text-xs">GCE Erode</p>
              </div>
            </div>
            {reg.teamMembers?.length > 0 && (
              <div className="py-3">
                <p className="section-label mb-2">Team Members</p>
                <div className="flex flex-wrap gap-2">
                  {reg.teamMembers.map((m, i) => (
                    <span key={i} className="text-[9px] text-[#5A5A5A] border border-white/[0.06] px-2 py-0.5 uppercase">{m}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={download}
            disabled={capturing || !qrUrl}
            className="btn-primary w-full justify-center disabled:opacity-40"
          >
            {capturing ? <Loader className="animate-spin" size={14} /> : <Download size={13} />}
            {capturing ? 'Processing…' : 'Download Pass'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [regs, setRegs]     = useState([]);
  const [loading, setLoad]  = useState(true);
  const [pass, setPass]     = useState(null);
  const [live, setLive]     = useState(false);
  const navigate = useNavigate();

  const [dbEvents, setDbEvents] = useState([]);
  const email = localStorage.getItem('adage_user_email');

  useEffect(() => {
    supabase.from('events').select('*').then(({ data }) => setDbEvents(data || []));

    if (!email) { setLoad(false); return; }
    (async () => {
      const { data } = await supabase.from('registrations').select('*').eq('email', email.toLowerCase()).order('timestamp', { ascending: false });
      setRegs(data || []);
      setLoad(false);
    })();

    const ch = supabase.channel(`adage-dashboard-live-${email.toLowerCase()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations', filter: `email=eq.${email.toLowerCase()}` },
        ({ new: n }) => setRegs(p => p.some(i => i.id === n.id) ? p.map(i => i.id === n.id ? n : i) : [n, ...p]))
      .subscribe(s => setLive(s === 'SUBSCRIBED'));

    return () => supabase.removeChannel(ch);
  }, [email]);

  const statusMap = {
    [ut.PRESENT]:   { icon: <CheckCircle size={14} className="text-blue-400" />,  label: 'Checked In',         cls: 'text-blue-400' },
    [ut.CONFIRMED]: { icon: <CheckCircle size={14} className="text-green-500" />, label: 'Registration Active', cls: 'text-green-500' },
    [ut.PENDING]:   { icon: <Clock size={14} className="text-[#C8922A]" />,       label: 'Awaiting Verification', cls: 'text-[#C8922A]' },
    [ut.REJECTED]:  { icon: <XCircle size={14} className="text-red-500" />,       label: 'Payment Declined',   cls: 'text-red-500' },
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin text-[#C8922A]" size={28} /></div>;

  if (!email || regs.length === 0) return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <QrCode size={48} className="text-[#1E1E1E] mx-auto mb-6" />
        <h2 className="font-cinzel font-bold text-xl text-[#EDEBE6] uppercase mb-3">No Records Found</h2>
        <p className="text-[#3A3A3A] text-sm mb-6">Verify your email or register for an event first.</p>
        <button onClick={() => navigate('/register')} className="btn-primary">Register Now</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-20">
      {pass && <PassModal reg={pass} onClose={() => setPass(null)} />}

      <div className="max-w-4xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="w-8 h-px bg-[#C8922A]" />
              <span className="text-[10px] uppercase tracking-[0.5em] text-[#C8922A]">Dashboard</span>
            </div>
            <h1 className="font-cinzel font-black text-3xl text-[#EDEBE6] uppercase tracking-wide">
              My Registrations
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-green-500 animate-pulse' : 'bg-[#2A2A2A]'}`} />
            <span className="section-label">{live ? 'Live Sync Active' : 'Offline'}</span>
          </div>
        </div>

        <p className="text-[#3A3A3A] text-xs mb-10">Logged in as: <span className="text-[#EDEBE6]">{email}</span></p>

        {/* Registration cards */}
        <div className="space-y-8">
          {regs.map(reg => {
            const sm = statusMap[reg.status] || statusMap[ut.PENDING];
            const canViewPass = reg.status === ut.CONFIRMED || reg.status === ut.PRESENT;

            return (
              <div key={reg.id} className="border border-white/[0.06] hover:border-[#C8922A]/20 transition-colors">
                {/* Status bar */}
                <div className="border-b border-white/[0.06] px-6 py-3 flex items-center gap-2 bg-[#111]">
                  {sm.icon}
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${sm.cls}`}>{sm.label}</span>
                </div>

                <div className="p-6">
                  {/* Participant name */}
                  <div className="mb-6">
                    <h2 className="font-cinzel font-bold text-xl text-[#EDEBE6] uppercase tracking-wide">{reg.name}</h2>
                    <p className="text-[#5A5A5A] text-sm mt-1">{reg.college} · <span className="text-[#C8922A] text-xs font-bold uppercase">{reg.department}</span></p>
                  </div>

                  {/* Data grid */}
                  <div className="grid grid-cols-2 gap-px bg-white/[0.04] mb-6">
                    <div className="bg-[#0C0C0C] p-4">
                      <p className="section-label mb-1">Entry ID</p>
                      <p className="text-[#C8922A] font-mono text-xs">{reg.id}</p>
                    </div>
                    <div className="bg-[#0C0C0C] p-4">
                      <p className="section-label mb-1">Total Fee</p>
                      <p className="text-[#EDEBE6] text-sm font-bold">₹{reg.totalFee}</p>
                    </div>
                  </div>

                  {/* Events */}
                  <div className="mb-5">
                    <p className="section-label mb-3 flex items-center gap-2"><Award size={11} /> Events Registered</p>
                    <div className="flex flex-wrap gap-2">
                      {reg.events.map((ev, i) => (
                        <span key={i} className="text-[9px] font-bold uppercase tracking-wider text-[#C8922A] border border-[#C8922A]/20 px-2.5 py-1">{ev}</span>
                      ))}
                    </div>
                  </div>

                  {/* WhatsApp groups */}
                  {reg.events.some(et => (dbEvents.length > 0 ? dbEvents : Sr).find(e => e.title === et)?.whatsappLink) && (
                    <div className="mb-5">
                      <p className="section-label mb-3 flex items-center gap-2"><MessageSquare size={11} /> Join Event WhatsApp Groups</p>
                      <div className="space-y-1">
                        {reg.events.map(et => {
                          const ev = (dbEvents.length > 0 ? dbEvents : Sr).find(e => e.title === et);
                          return ev?.whatsappLink ? (
                            <a key={et} href={ev.whatsappLink} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-between py-2 border-b border-white/[0.04] group hover:border-[#C8922A]/20 transition-colors">
                              <span className="text-[10px] font-medium text-[#5A5A5A] group-hover:text-[#EDEBE6] transition-colors">{et}</span>
                              <span className="text-[9px] font-bold text-green-500 uppercase tracking-wider">Join →</span>
                            </a>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Team members */}
                  {reg.teamMembers?.length > 0 && (
                    <div className="mb-6">
                      <p className="section-label mb-3 flex items-center gap-2"><Users size={11} /> Team Members</p>
                      <div className="flex flex-wrap gap-2">
                        {reg.teamMembers.map((m, i) => (
                          <span key={i} className="text-[10px] text-[#5A5A5A] border border-white/[0.06] px-2 py-0.5 uppercase">{m}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pass CTA */}
                  <button
                    onClick={() => canViewPass && setPass(reg)}
                    disabled={!canViewPass}
                    className={canViewPass ? 'btn-primary w-full justify-center' : 'btn-ghost w-full justify-center opacity-30 cursor-not-allowed'}
                  >
                    <QrCode size={13} />
                    {canViewPass ? 'View Entry Pass' : 'Awaiting Verification'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
