import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Search, CheckCircle, Clock, AlertCircle, XCircle, ArrowRight, RefreshCw, Loader } from 'lucide-react';
import { supabase } from '../supabase';
import { ut } from '../events';

export default function Verify() {
  const [emailInput, setEmailInput] = useState('');
  const [registration, setRegistration] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const navigate = useNavigate();

  const doSearch = async (email) => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();
      if (error) throw error;
      setRegistration(data);
    } catch { setRegistration(null); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput) return;
    setIsSearching(true);
    setAttempted(false);
    await doSearch(emailInput);
    setIsSearching(false);
    setAttempted(true);
  };

  useEffect(() => {
    if (!registration?.email) return;
    const email = registration.email.toLowerCase();
    const ch = supabase
      .channel(`adage-live-verify-${email}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations', filter: `email=eq.${email}` },
        (payload) => { setRegistration(payload.new); if (navigator.vibrate) navigator.vibrate(150); })
      .subscribe(s => setIsLive(s === 'SUBSCRIBED'));
    return () => { supabase.removeChannel(ch); setIsLive(false); };
  }, [registration?.email]);

  const statusConfig = {
    [ut.PRESENT]:   { icon: <CheckCircle size={28} className="text-blue-400" />,  label: 'Checked In',         color: 'text-blue-400',  msg: "Welcome to ADAGE'26! Your physical entry has been verified at the gate." },
    [ut.CONFIRMED]: { icon: <CheckCircle size={28} className="text-green-500" />, label: 'Payment Verified',   color: 'text-green-500', msg: 'Your payment has been verified. Your entry pass is now active in the dashboard.' },
    [ut.REJECTED]:  { icon: <XCircle size={28} className="text-red-500" />,       label: 'Issue Detected',     color: 'text-red-500',   msg: 'There was an issue with your transaction. Please contact the help desk.' },
    [ut.PENDING]:   { icon: <Clock size={28} className="text-[#C8922A]" />,       label: 'Awaiting Verification', color: 'text-[#C8922A]', msg: "We've received your registration. Our team is currently verifying your transaction." },
  };

  const cfg = registration ? (statusConfig[registration.status] || statusConfig[ut.PENDING]) : null;

  return (
    <div className="min-h-screen py-16 sm:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Title */}
        <div className="mb-8 sm:mb-12 animate-fade-in-up">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <span className="w-6 sm:w-8 h-px bg-[#C8922A]" />
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.5em] text-[#C8922A] font-bold">Verification</span>
          </div>
          <h1 className="font-cinzel font-black text-2xl sm:text-3xl md:text-4xl text-[#EDEBE6] uppercase tracking-wide mb-3 sm:mb-4">
            Check Your Status
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            Enter your registered email address to check payment verification status. The page updates <span className="text-[#EDEBE6]">live</span> once verified.
          </p>
        </div>

        {/* Search */}
        <div className="border border-white/[0.06] p-4 sm:p-8 mb-6 sm:mb-8 relative animate-fade-in-up anim-delay-100">
          {isLive && (
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-green-500 font-bold">Live</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-0">
            <div className="relative flex-grow">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="email"
                required
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="Registered email address"
                className="civil-input !pl-11 pr-4"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="btn-primary px-6 flex-shrink-0 disabled:opacity-40 justify-center sm:justify-start"
            >
              {isSearching ? <Loader className="animate-spin" size={16} /> : <><Search size={14} /> Verify</>}
            </button>
          </form>
        </div>

        {/* Result */}
        {attempted && (
          registration ? (
            <div className="border border-white/[0.06] overflow-hidden animate-fade-in-up">
              {/* Status bar */}
              <div className="bg-[#111] px-4 sm:px-6 py-4 sm:py-5 flex items-start sm:items-center gap-3 sm:gap-4 border-b border-white/[0.06]">
                <div className="flex-shrink-0 mt-0.5 sm:mt-0">{cfg.icon}</div>
                <div>
                  <p className={`font-cinzel font-bold text-base sm:text-lg ${cfg.color}`}>{cfg.label}</p>
                  <p className="text-gray-300 text-[11px] sm:text-xs mt-0.5 leading-relaxed">{cfg.msg}</p>
                </div>
              </div>

              {/* Data rows */}
              <div className="divide-y divide-white/[0.04]">
                {[
                  { label: 'Participant',  val: registration.name },
                  { label: 'Reference ID', val: registration.id, mono: true, accent: true },
                  { label: 'College',      val: registration.college },
                  { label: 'Total Fee',    val: `₹${registration.totalFee}` },
                ].map((row, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 sm:px-6 py-3 sm:py-4 gap-0.5 sm:gap-0">
                    <span className="section-label">{row.label}</span>
                    <span className={`text-xs font-semibold ${row.accent ? 'text-[#C8922A] font-mono' : 'text-[#EDEBE6]'}`}>
                      {row.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dashboard CTA */}
              {(registration.status === ut.CONFIRMED || registration.status === ut.PRESENT || registration.status === ut.PENDING) && (
                <div className="p-4 sm:p-5 border-t border-white/[0.06]">
                  <button
                    onClick={() => { localStorage.setItem('adage_user_email', registration.email); navigate('/dashboard'); }}
                    className="btn-primary justify-center py-4 text-xs tracking-widest w-full"
                  >
                    Go to Dashboard <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-red-500/10 p-8 sm:p-10 text-center animate-fade-in-up">
              <AlertCircle className="text-red-500/50 mx-auto mb-4" size={28} />
              <h3 className="font-cinzel font-bold text-[#EDEBE6] mb-2 uppercase tracking-wider text-sm sm:text-base">Not Found</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                No record found for this email. If you just registered, please wait a minute for sync.
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                <button onClick={() => window.location.reload()} className="btn-ghost px-5 py-2.5">
                  <RefreshCw size={13} /> Retry
                </button>
                <Link to="/register" className="btn-primary px-5 py-2.5">
                  Register Now <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )
        )}

        <p className="text-center text-gray-500 text-[9px] sm:text-[10px] uppercase tracking-widest mt-8 sm:mt-10">
          Manual verification · Contact adage26@gmail.com for delays &gt; 24 hours
        </p>
      </div>
    </div>
  );
}
