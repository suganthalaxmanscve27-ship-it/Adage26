import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../supabase';
import { ut, Sr, Pt, calculatePricing } from '../events';
import {
  Users, CheckCircle, Clock, AlertTriangle, Search, LogOut,
  ClipboardList, Settings, Download, Plus, X, Phone,
  Mail, Calendar, ArrowRight, ShieldCheck, Loader, RefreshCw, Edit, Save, Trash2,
  ExternalLink, FileText, Image, Eye
} from 'lucide-react';

const extractGoogleDriveFileId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match =
    url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    url.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

const getDriveImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:image')) return url;
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    // High-resolution Google Drive thumbnail endpoint (universally embeddable without 403 blocks)
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
  }
  return url;
};

// Robust Payment Screenshot Preview Component supporting Google Drive, Supabase & Data URLs
function PaymentScreenshotViewer({ url, participantName }) {
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'loaded' | 'error'
  const [useIframe, setUseIframe] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(() => getDriveImageUrl(url));
  const fileId = extractGoogleDriveFileId(url);

  useEffect(() => {
    setLoadState('loading');
    setUseIframe(false);
    setCurrentSrc(getDriveImageUrl(url));
  }, [url]);

  const handleImageError = () => {
    if (fileId && !currentSrc.includes('thumbnail')) {
      setCurrentSrc(`https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`);
    } else if (fileId && !useIframe) {
      setUseIframe(true);
      setLoadState('loaded');
    } else {
      setLoadState('error');
    }
  };

  if (!url) {
    return (
      <div className="flex-1 w-full min-h-[300px] bg-black/40 rounded-xl border border-white/10 flex items-center justify-center text-center p-6">
        <p className="text-xs text-gray-500 font-cad italic">
          No payment screenshot uploaded for this registration.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full min-h-[360px] sm:min-h-[420px] bg-black rounded-xl border-2 border-[#C8922A]/30 flex items-center justify-center relative overflow-hidden shadow-2xl p-2">
      {loadState === 'loading' && !useIframe && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 gap-2">
          <Loader size={24} className="animate-spin text-[#C8922A]" />
          <span className="text-xs text-gray-400 font-mono">Loading receipt...</span>
        </div>
      )}

      {useIframe && fileId ? (
        <iframe
          src={`https://drive.google.com/file/d/${fileId}/preview`}
          title={`Payment Receipt - ${participantName || 'Participant'}`}
          className="w-full h-full min-h-[380px] rounded border-0"
          allow="autoplay"
        />
      ) : loadState === 'error' ? (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
          <AlertTriangle size={32} className="text-amber-400" />
          <p className="text-xs text-gray-300 font-cad">
            Direct image preview blocked by Google Drive permissions.
          </p>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-[#C8922A] text-black font-bold text-xs rounded-xl uppercase hover:bg-[#B07A20] transition-colors flex items-center gap-1.5 font-cad shadow-lg"
          >
            <ExternalLink size={14} /> Open in Google Drive
          </a>
        </div>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="w-full h-full flex items-center justify-center cursor-zoom-in"
          title="Click to view full size image in new tab"
        >
          <img
            src={currentSrc}
            alt={`Payment Receipt - ${participantName || 'Participant'}`}
            className="max-h-[460px] max-w-full object-contain rounded"
            onLoad={() => setLoadState('loaded')}
            onError={handleImageError}
          />
        </a>
      )}
    </div>
  );
}

// Manual Entry Modal
function ManualEntryModal({ eventsList = [], onClose, onSave }) {
  const [isSaving, setIsSaving] = useState(false);

  // Available events (use dbEvents list or Sr fallback), sorted Tech first
  const availableEvents = useMemo(() => {
    const list = Array.isArray(eventsList) && eventsList.length > 0 ? eventsList : (Sr || []);
    return [...list].sort((a, b) => {
      const aIsTech = a?.category === Pt.TECHNICAL || a?.category === 'Technical';
      const bIsTech = b?.category === Pt.TECHNICAL || b?.category === 'Technical';
      if (aIsTech && !bIsTech) return -1;
      if (!aIsTech && bIsTech) return 1;
      return 0;
    });
  }, [eventsList]);

  const [form, setForm] = useState(() => ({
    name: "",
    college: "",
    department: "",
    email: "",
    phone: "",
    selectedEvents: [],
    teamMembers: [],
    totalFee: 0,
    isManualFeeOverride: false,
    transactionId: `ONSPOT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    status: ut.CONFIRMED
  }));

  // Calculate pricing based on selected events
  const selectedObjects = availableEvents.filter(e => e && (form.selectedEvents.includes(e.title) || form.selectedEvents.includes(e.id)));
  const techCount = selectedObjects.filter(e => e?.category === Pt.TECHNICAL || e?.category === 'Technical').length;
  const nonTechCount = selectedObjects.filter(e => e?.category === Pt.NON_TECHNICAL || e?.category === 'Non-Technical').length;
  const totalParticipants = 1 + form.teamMembers.filter(m => m && m.trim() !== "").length;

  const autoPricing = calculatePricing(techCount, nonTechCount, totalParticipants);

  // Keep totalFee synced with autoPricing unless admin manually overrides
  useEffect(() => {
    if (!form.isManualFeeOverride) {
      setForm(prev => ({ ...prev, totalFee: autoPricing.totalPayableFee }));
    }
  }, [techCount, nonTechCount, totalParticipants, form.isManualFeeOverride, autoPricing.totalPayableFee]);

  const toggleEvent = (title) => {
    setForm(prev => ({
      ...prev,
      selectedEvents: prev.selectedEvents.includes(title)
        ? prev.selectedEvents.filter(e => e !== title)
        : [...prev.selectedEvents, title]
    }));
  };

  const handleAddMember = () => {
    setForm(prev => ({ ...prev, teamMembers: [...prev.teamMembers, ""] }));
  };

  const handleMemberChange = (idx, value) => {
    setForm(prev => {
      const updated = [...prev.teamMembers];
      updated[idx] = value;
      return { ...prev, teamMembers: updated };
    });
  };

  const handleRemoveMember = (idx) => {
    setForm(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.selectedEvents.length === 0) {
      alert("Please select at least one event.");
      return;
    }
    setIsSaving(true);
    try {
      const generatedId = `MAN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      let finalTxId = form.transactionId ? form.transactionId.trim() : "";
      const genericKeywords = ["ON-SPOT", "ONSPOT", "CASH", "SPOT", "DESK", "ADMIN", "MANUAL", "OFFLINE"];
      if (!finalTxId || genericKeywords.includes(finalTxId.toUpperCase())) {
        const prefix = (finalTxId.toUpperCase().replace(/[^A-Z]/g, "") || "ONSPOT");
        finalTxId = `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      }

      const payload = {
        id: generatedId,
        name: form.name,
        college: form.college,
        department: form.department,
        email: form.email.toLowerCase(),
        phone: form.phone,
        teamMembers: form.teamMembers.filter(m => m.trim() !== ""),
        events: form.selectedEvents,
        totalFee: Number(form.totalFee),
        transactionId: finalTxId,
        status: form.status || ut.CONFIRMED,
        timestamp: new Date().toISOString()
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error("Manual entry save error:", err);
      if (err?.message?.includes("registrations_transactionid_unique") || err?.code === "23505" || String(err).includes("unique constraint")) {
        alert(`Error adding participant: Transaction Reference "${form.transactionId}" already exists. Please provide a unique ID or leave empty for auto-generated ON-SPOT ID.`);
      } else {
        alert("Error adding participant: " + (err.message || err));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#111111] w-full max-w-2xl rounded-xl border border-[#C8922A]/30 p-6 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
          <X size={22} />
        </button>

        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <div className="p-2.5 bg-[#C8922A]/10 border border-[#C8922A]/30 rounded-lg text-[#C8922A]">
            <ClipboardList size={20} />
          </div>
          <div>
            <h3 className="text-xl font-cinzel font-black uppercase tracking-widest text-[#C8922A]">
              Manual Registration Entry
            </h3>
            <p className="text-[10px] text-gray-400 font-mono">ON-SPOT & ADMIN ENTRY PORTAL</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Participant Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Users size={14} className="text-[#C8922A]" /> 01. Participant Profile
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Kumar"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#C8922A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">College Institution *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GCE Erode"
                  value={form.college}
                  onChange={e => setForm({ ...form, college: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#C8922A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Department *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Civil Engineering"
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#C8922A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#C8922A]"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="participant@domain.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#C8922A]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Team Members (Optional) */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Users size={14} className="text-[#C8922A]" /> 02. Team Roster (Optional)
              </h4>
              <button
                type="button"
                onClick={handleAddMember}
                className="text-[#C8922A] hover:text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 bg-[#C8922A]/10 px-2.5 py-1 rounded border border-[#C8922A]/30"
              >
                <Plus size={12} /> Add Member
              </button>
            </div>
            {form.teamMembers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {form.teamMembers.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Team Member ${idx + 2} Name`}
                      value={m}
                      onChange={e => handleMemberChange(idx, e.target.value)}
                      className="flex-grow bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#C8922A]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="text-red-400 hover:text-red-300 p-1.5 bg-red-500/10 rounded border border-red-500/20"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Event Selection */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                03. Select Competitions ({form.selectedEvents.length} Selected) *
              </h4>
              <span className="text-[9px] font-mono text-gray-400 uppercase">
                Tech: {techCount} | Non-Tech: {nonTechCount}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {availableEvents.map(event => {
                const isSelected = form.selectedEvents.includes(event.title) || form.selectedEvents.includes(event.id);
                const isTech = event.category === Pt.TECHNICAL || event.category === 'Technical';

                return (
                  <div
                    key={event.id || event.title}
                    onClick={() => toggleEvent(event.title)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-[#C8922A]/15 border-[#C8922A] text-white shadow-sm"
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold uppercase truncate">{event.title}</p>
                      <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border inline-block mt-1 ${
                        isTech ? "border-amber-500/30 text-amber-400 bg-amber-500/10" : "border-cyan-500/30 text-cyan-400 bg-cyan-500/10"
                      }`}>
                        {event.category}
                      </span>
                    </div>

                    <div className={`w-5 h-5 rounded flex items-center justify-center border text-xs flex-shrink-0 ${
                      isSelected ? "bg-[#C8922A] border-[#C8922A] text-black" : "border-white/20"
                    }`}>
                      {isSelected && <CheckCircle size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Payment Details & Total Fee */}
          <div className="space-y-4 pt-2 border-t border-white/5 bg-black/40 p-4 rounded-xl border border-white/10">
            <h4 className="text-xs font-bold text-[#C8922A] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={14} /> 04. Payment & Amount Received
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Payment Status
                </label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#C8922A]"
                >
                  <option value={ut.CONFIRMED}>Confirmed (Paid)</option>
                  <option value={ut.PRESENT}>Checked In (On-Spot)</option>
                  <option value={ut.PENDING}>Payment Pending Verification</option>
                  <option value={ut.REVIEW}>Under Review</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Transaction / Ref ID / Mode
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ON-SPOT, CASH, or UTR"
                  value={form.transactionId}
                  onChange={e => setForm({ ...form, transactionId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#C8922A] font-mono uppercase"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    Total Amount Received (₹) *
                  </label>
                  {autoPricing.discount > 0 && (
                    <span className="text-[9px] text-emerald-400 font-bold">
                      Bundle Discount: -₹{autoPricing.discount * autoPricing.totalParticipants} Applied
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.totalFee}
                    onChange={e => setForm({ ...form, totalFee: Number(e.target.value), isManualFeeOverride: true })}
                    className="flex-grow bg-white/5 border border-white/10 rounded-lg p-3 text-sm font-bold text-[#C8922A] focus:outline-none focus:border-[#C8922A]"
                  />
                  {form.isManualFeeOverride && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, totalFee: autoPricing.totalPayableFee, isManualFeeOverride: false })}
                      className="text-[10px] text-gray-400 hover:text-white underline whitespace-nowrap"
                    >
                      Reset to Auto Rate (₹{autoPricing.totalPayableFee})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-[#C8922A] text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#B07A20] transition-all glow-gold flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader className="animate-spin" /> : <Plus size={18} />}
            Submit Registration
          </button>
        </form>
      </div>
    </div>
  );
}

// Edit / Add Event Modal
function EditEventModal({ event, isNew = false, onClose, onSave }) {
  const [form, setForm] = useState({
    id: event?.id || "",
    title: event?.title || "",
    description: event?.description || "",
    slogan: event?.slogan || "",
    category: event?.category || "Technical",
    maxMembers: event?.maxMembers || event?.max_members || 1,
    fee: event?.fee ?? event?.price ?? 0,
    prize: event?.prize || "Certificate + Cash Prize",
    timing: event?.timing || "",
    image: event?.image || "",
    whatsappLink: event?.whatsappLink || event?.whatsapp_link || "",
    rules: Array.isArray(event?.rules) ? [...event.rules] : [],
    coordinators: Array.isArray(event?.coordinators) ? [...event.coordinators] : []
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isNew && !form.id) {
      alert("Please specify a unique URL/ID for the event.");
      return;
    }
    setIsSaving(true);
    try {
      await onSave(form, isNew);
      onClose();
    } catch (err) {
      alert("Error saving event: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRule = () => {
    setForm(prev => ({ ...prev, rules: [...prev.rules, ""] }));
  };

  const handleRuleChange = (index, value) => {
    setForm(prev => {
      const rules = [...prev.rules];
      rules[index] = value;
      return { ...prev, rules };
    });
  };

  const handleRemoveRule = (index) => {
    setForm(prev => ({ ...prev, rules: prev.rules.filter((_, i) => i !== index) }));
  };

  const handleAddCoordinator = () => {
    setForm(prev => ({ ...prev, coordinators: [...prev.coordinators, { name: "", phone: "", email: "" }] }));
  };

  const handleCoordinatorChange = (index, field, value) => {
    setForm(prev => {
      const coordinators = [...prev.coordinators];
      coordinators[index] = { ...coordinators[index], [field]: value };
      return { ...prev, coordinators };
    });
  };

  const handleRemoveCoordinator = (index) => {
    setForm(prev => ({ ...prev, coordinators: prev.coordinators.filter((_, i) => i !== index) }));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#111] w-full max-w-2xl rounded-lg border border-gold/20 p-8 md:p-10 relative overflow-hidden shadow-md max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white">
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
          <div className="p-2 bg-gold/10 rounded-lg text-gold">
            <Settings size={20} />
          </div>
          <div>
            <h3 className="text-xl font-cinzel font-black uppercase tracking-widest text-gold">
              {isNew ? "Create New Event" : `Edit Event: ${event?.title}`}
            </h3>
            <p className="text-[10px] text-gray-400 font-mono">SUPABASE DYNAMIC EVENT CONFIG</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isNew && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Event Slug / ID *</label>
                  <input
                    type="text"
                    required
                    value={form.id}
                    onChange={e => setForm({ ...form, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="e.g. paper-presentation"
                    className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-[#C8922A] font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Paper Presentation"
                    className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-[#C8922A]"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-[#C8922A]"
              >
                <option value="Technical">Technical</option>
                <option value="Non-Technical">Non-Technical</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Catchy Slogan</label>
              <input
                type="text"
                value={form.slogan}
                onChange={e => setForm({ ...form, slogan: e.target.value })}
                placeholder="e.g. Innovate & Present"
                className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-[#C8922A]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Event Fee (₹) / Head</label>
              <input
                type="number"
                value={form.fee}
                onChange={e => setForm({ ...form, fee: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-[#C8922A]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Max Team Members</label>
              <input
                type="number"
                min="1"
                max="10"
                value={form.maxMembers}
                onChange={e => setForm({ ...form, maxMembers: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-[#C8922A]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Prize Pool / Label</label>
              <input
                type="text"
                value={form.prize}
                onChange={e => setForm({ ...form, prize: e.target.value })}
                placeholder="e.g. ₹5,000 + Certificate"
                className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-[#C8922A]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Event Timing</label>
              <input
                type="text"
                value={form.timing}
                onChange={e => setForm({ ...form, timing: e.target.value })}
                placeholder="e.g. 10:00 AM - 01:00 PM"
                className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-[#C8922A]"
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">WhatsApp Group Link</label>
              <input
                type="url"
                value={form.whatsappLink}
                onChange={e => setForm({ ...form, whatsappLink: e.target.value })}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-[#C8922A]"
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Image Banner URL (Google Drive Link or Image URL)</label>
              <input
                type="text"
                value={form.image}
                onChange={e => setForm({ ...form, image: e.target.value })}
                placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-[#C8922A]"
              />
              {form.image && (
                <div className="mt-2 h-24 rounded border border-white/10 overflow-hidden relative bg-black/40 flex items-center justify-center">
                  <img
                    src={getDriveImageUrl(form.image)}
                    alt="Banner Preview"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      const fileIdMatch = form.image?.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || form.image?.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                      if (fileIdMatch && fileIdMatch[1] && !e.target.dataset.triedThumbnail) {
                        e.target.dataset.triedThumbnail = "true";
                        e.target.src = `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w800`;
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-[#C8922A] resize-none"
              />
            </div>
          </div>

          {/* Rules Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Rules & Guidelines</h4>
              <button type="button" onClick={handleAddRule} className="text-gold text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Plus size={12} /> Add Rule
              </button>
            </div>
            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
              {form.rules.map((rule, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-[10px] text-gray-400">{idx+1}.</span>
                  <input
                    type="text"
                    value={rule}
                    onChange={e => handleRuleChange(idx, e.target.value)}
                    className="flex-grow bg-white/5 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-[#C8922A]"
                  />
                  <button type="button" onClick={() => handleRemoveRule(idx)} className="text-red-500 hover:text-red-400 p-1">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Coordinators Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Event Coordinators</h4>
              <button type="button" onClick={handleAddCoordinator} className="text-gold text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Plus size={12} /> Add Coordinator
              </button>
            </div>
            <div className="space-y-2">
              {form.coordinators.map((c, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-center bg-white/[0.02] p-2 rounded border border-white/5">
                  <input
                    type="text"
                    placeholder="Name"
                    value={c.name || ""}
                    onChange={e => handleCoordinatorChange(idx, "name", e.target.value)}
                    className="sm:col-span-2 bg-white/5 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-[#C8922A]"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={c.phone || ""}
                    onChange={e => handleCoordinatorChange(idx, "phone", e.target.value)}
                    className="sm:col-span-2 bg-white/5 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-[#C8922A]"
                  />
                  <input
                    type="email"
                    placeholder="Email (Optional)"
                    value={c.email || ""}
                    onChange={e => handleCoordinatorChange(idx, "email", e.target.value)}
                    className="sm:col-span-2 bg-white/5 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-[#C8922A]"
                  />
                  <button type="button" onClick={() => handleRemoveCoordinator(idx)} className="text-red-500 hover:text-red-400 p-1 justify-self-center sm:col-span-1">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-gold text-black py-4 rounded font-black uppercase tracking-widest hover:bg-[#B07A20] glow-gold flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader className="animate-spin" /> : <Save size={16} />}
            {isNew ? "Create Event" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}



// MAIN ADMIN HUB
export default function AdminHub({ registrations, onUpdateStatus, onRefresh, fetchError, isLoading, onLogout }) {
  const [tab, setTab] = useState("registrations");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedId, setSelectedId] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Dynamic DB events state for Editing
  const [dbEvents, setDbEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchDbEvents = async () => {
    try {
      setIsLoadingEvents(true);
      const { data, error } = await supabase.from('events').select('*').order('title');
      if (error) throw error;
      setDbEvents(data || []);
    } catch (err) {
      console.error("Failed to load events in AdminHub:", err);
      setDbEvents(Sr);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchDbEvents();
  }, []);

  const selectedParticipant = useMemo(() => {
    return registrations.find(r => r.id === selectedId) || null;
  }, [selectedId, registrations]);



  // Statistics calculation
  const stats = useMemo(() => {
    const total = registrations.length;
    const confirmed = registrations.filter(r => r.status === ut.CONFIRMED || r.status === ut.PRESENT).length;
    const pending = registrations.filter(r => r.status === ut.PENDING).length;
    const checkedIn = registrations.filter(r => r.status === ut.PRESENT).length;
    return { total, confirmed, pending, checkedIn };
  }, [registrations]);

  const filteredRegistrations = registrations.filter(item => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = item.name.toLowerCase().includes(query) || item.id.toLowerCase().includes(query);
    const matchesFilter = filterStatus === "ALL" || item.status === filterStatus;
    return matchesQuery && matchesFilter;
  });

  const handleManualSave = async (payload) => {
    const { error } = await supabase.from('registrations').insert([payload]);
    if (error) throw error;
    if (onRefresh) onRefresh();
  };

  const handleSaveEvent = async (updatedEvent, isNew = false) => {
    try {
      const payload = {
        description: updatedEvent.description,
        slogan: updatedEvent.slogan,
        category: updatedEvent.category,
        maxMembers: updatedEvent.maxMembers,
        fee: updatedEvent.fee,
        prize: updatedEvent.prize,
        timing: updatedEvent.timing,
        image: updatedEvent.image,
        whatsappLink: updatedEvent.whatsappLink,
        rules: updatedEvent.rules,
        coordinators: updatedEvent.coordinators
      };

      if (isNew) {
        payload.id = updatedEvent.id;
        payload.title = updatedEvent.title;
        const { error } = await supabase
          .from('events')
          .insert([payload]);
        if (error) throw error;
        alert("Event created successfully!");
      } else {
        const { error } = await supabase
          .from('events')
          .update(payload)
          .eq('id', updatedEvent.id);
        if (error) throw error;
        alert("Event updated successfully!");
      }
      fetchDbEvents();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Error saving event: " + err.message);
      throw err;
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete event "${title}"?`)) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      alert("Event deleted successfully!");
      fetchDbEvents();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Error deleting event: " + err.message);
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const headers = ["ID", "Name", "College", "Department", "Email", "Phone", "Events", "Total Fee", "Transaction ID", "Screenshot Drive Link", "Status", "Timestamp"].join(",");
      const rows = registrations.map(r => [
        r.id,
        `"${r.name}"`,
        `"${r.college}"`,
        `"${r.department}"`,
        r.email,
        r.phone,
        `"${r.events.join(", ")}"`,
        r.totalFee,
        r.transactionId || "N/A",
        `"${r.screenshotUrl || "N/A"}"`,
        r.status,
        r.timestamp
      ].join(","));

      const csvContent = [headers, ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `adage_registrations_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="py-24 bg-[#0C0C0C] min-h-screen text-white font-inter">
      {isManualModalOpen && (
        <ManualEntryModal eventsList={dbEvents} onClose={() => setIsManualModalOpen(false)} onSave={handleManualSave} />
      )}

      {editingEvent && (
        <EditEventModal event={editingEvent} onClose={() => setEditingEvent(null)} onSave={handleSaveEvent} />
      )}

      {isCreateModalOpen && (
        <EditEventModal isNew={true} onClose={() => setIsCreateModalOpen(false)} onSave={handleSaveEvent} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-in fade-in slide-in-from-top-4">
          {[
            { label: "Registrations", val: stats.total, icon: <Users size={20} />, color: "text-white" },
            { label: "Confirmed", val: stats.confirmed, icon: <CheckCircle size={20} />, color: "text-green-500" },
            { label: "Pending", val: stats.pending, icon: <Clock size={20} />, color: "text-gold" },
            { label: "Checked In", val: stats.checkedIn, icon: <CheckCircle size={20} />, color: "text-blue-400" }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#111111] p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center shadow-lg">
              <div className={`${item.color} bg-white/5 p-3 rounded-2xl mb-3`}>
                {item.icon}
              </div>
              <p className="text-3xl font-cinzel font-black tracking-widest">{item.val}</p>
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Action Controls & Navigation tabs */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 mb-8">
          {/* Header Title & Status */}
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 sm:p-4 bg-[#C8922A]/10 rounded-2xl text-[#C8922A] border border-[#C8922A]/30 shadow-lg">
                <ClipboardList size={28} />
              </div>
              <div>
                <h2 className="text-2xl sm:text-4xl font-cinzel font-black tracking-widest uppercase text-[#EDEBE6]">
                  Admin Hub
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-gray-400 text-[10px] font-cad uppercase tracking-wider font-mono">
                    {isLoading ? "Syncing..." : "Live Connected"}
                  </p>
                  <div className={`w-2 h-2 rounded-full ${isLoading ? "bg-amber-500 animate-pulse" : "bg-emerald-500 glow-gold"}`} />
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsManualModalOpen(true)}
              className="lg:hidden px-4 py-2.5 rounded-xl text-[10px] font-cad font-bold uppercase tracking-wider bg-[#C8922A] text-black hover:bg-[#B07A20] transition-all flex items-center gap-1.5 shadow-md flex-shrink-0"
            >
              <Plus size={14} /> New Entry
            </button>
          </div>

          {/* Desktop & Mobile Tab Strip */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="hidden lg:flex px-5 py-3 rounded-xl text-[10px] font-cad font-bold uppercase tracking-wider bg-[#C8922A]/20 text-[#C8922A] border border-[#C8922A]/40 hover:bg-[#C8922A] hover:text-black transition-all items-center gap-2 flex-shrink-0"
            >
              <Plus size={16} /> New Entry
            </button>

            {/* Horizontal Scrollable Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 bg-[#090909] rounded-2xl border border-white/10 w-full overflow-x-auto custom-scrollbar">
              {[
                { id: "registrations", label: "Registrations", icon: <ClipboardList size={16} /> },
                { id: "events", label: "Events", icon: <Edit size={16} /> },
                { id: "settings", label: "Settings", icon: <Settings size={16} /> }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-[10px] font-cad font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap flex-1 justify-center ${
                    tab === t.id
                      ? "bg-[#C8922A] text-black shadow-lg shadow-[#C8922A]/20 font-black"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="bg-[#111111] rounded-lg border border-white/10 shadow-lg overflow-hidden min-h-[600px]">
          
          {/* TAB 1: REGISTRATIONS LIST */}
          {tab === "registrations" && (
            <div className="p-8 md:p-12 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row gap-4 mb-10 items-center">
                <div className="relative flex-grow w-full">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name or ID..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-sm focus:border-gold/50 text-white focus:outline-none"
                  />
                </div>
                
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto py-1">
                  {["ALL", ut.PENDING, ut.REVIEW, ut.CONFIRMED, ut.PRESENT, ut.REJECTED].map(statusVal => (
                    <button
                      key={statusVal}
                      onClick={() => setFilterStatus(statusVal)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                        filterStatus === statusVal ? "bg-gold/20 border-gold text-gold" : "border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      {statusVal === ut.PENDING ? "PENDING" : statusVal === ut.REVIEW ? "UNDER REVIEW" : statusVal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase text-gray-400 font-black tracking-widest">
                      <th className="px-10 py-8">Participant Info</th>
                      <th className="px-10 py-8">Status</th>
                      <th className="px-10 py-8 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredRegistrations.map(participant => (
                      <tr key={participant.id} className="hover:bg-white/5 transition-all group">
                        <td className="px-10 py-8">
                          <p className="text-xl font-cinzel font-bold text-white group-hover:text-gold transition-colors">{participant.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">{participant.id}</p>
                            <div className="w-1 h-1 bg-white/20 rounded-full" />
                            <p className="text-[9px] text-gray-400 font-bold uppercase truncate max-w-[150px]">{participant.college}</p>
                            {participant.screenshotUrl && (
                              <>
                                <div className="w-1 h-1 bg-white/20 rounded-full" />
                                <span className="text-[9px] text-emerald-400 font-bold uppercase flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                  <Image size={10} /> Screenshot
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase border transition-all flex items-center gap-2 w-fit ${
                            participant.status === ut.PRESENT
                              ? "text-blue-400 border-blue-400/30 bg-blue-400/5"
                              : participant.status === ut.CONFIRMED
                              ? "text-green-500 border-green-500/30 bg-green-500/5"
                              : participant.status === ut.REVIEW
                              ? "text-amber-400 border-amber-400/30 bg-amber-400/5"
                              : participant.status === ut.REJECTED
                              ? "text-red-400 border-red-400/30 bg-red-400/5"
                              : "text-gold border-gold/30 bg-gold/5 animate-pulse"
                          }`}>
                            {participant.status === ut.PRESENT ? "Checked In" : participant.status === ut.CONFIRMED ? "Confirmed" : participant.status === ut.REVIEW ? "Under Review" : participant.status === ut.REJECTED ? "Rejected" : "Pending"}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex justify-end">
                            <button
                              onClick={() => setSelectedId(participant.id)}
                              className="px-5 py-2.5 bg-white/5 text-gray-300 hover:text-gold hover:bg-gold/10 hover:border-gold/30 rounded-lg transition-all border border-white/10 text-[10px] font-black uppercase tracking-wider flex items-center gap-2"
                            >
                              <ClipboardList size={14} /> View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="block md:hidden space-y-4">
                {filteredRegistrations.map(participant => (
                  <div key={participant.id} className="bg-[#080808] border border-white/10 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h4 className="font-cinzel font-bold text-lg text-white uppercase">{participant.name}</h4>
                        <span className="text-[10px] font-mono text-[#C8922A] block mt-0.5">{participant.id}</span>
                        <p className="text-[11px] text-gray-400 mt-1 uppercase">{participant.college}</p>
                      </div>

                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase border flex-shrink-0 ${
                        participant.status === ut.PRESENT
                          ? "text-blue-400 border-blue-400/30 bg-blue-400/5"
                          : participant.status === ut.CONFIRMED
                          ? "text-green-500 border-green-500/30 bg-green-500/5"
                          : participant.status === ut.REVIEW
                          ? "text-amber-400 border-amber-400/30 bg-amber-400/5"
                          : participant.status === ut.REJECTED
                          ? "text-red-400 border-red-400/30 bg-red-400/5"
                          : "text-gold border-gold/30 bg-gold/5"
                      }`}>
                        {participant.status === ut.PRESENT ? "Checked In" : participant.status === ut.CONFIRMED ? "Confirmed" : participant.status === ut.REVIEW ? "Under Review" : participant.status === ut.REJECTED ? "Rejected" : "Pending"}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedId(participant.id)}
                      className="w-full py-3 bg-white/5 border border-white/10 text-gray-300 hover:text-gold rounded-xl font-cad text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <ClipboardList size={14} /> VIEW DETAILS & UPDATE
                    </button>
                  </div>
                ))}
              </div>

              {filteredRegistrations.length === 0 && (
                <div className="text-center py-20">
                  <ClipboardList className="text-white/5 mx-auto mb-4" size={64} />
                  <p className="text-gray-400 uppercase font-black text-xs tracking-widest">No matching records found.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EVENTS LIST MANAGEMENT */}
          {tab === "events" && (
            <div className="p-8 md:p-12 animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                <h3 className="text-2xl font-cinzel font-black text-gold uppercase tracking-wider">
                  Event Content Manager
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-2.5 bg-gold text-black rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-[#B07A20] transition-all shadow-md"
                >
                  <Plus size={14} /> Add Event
                </button>
              </div>

              {isLoadingEvents ? (
                <div className="text-center py-20">
                  <Loader className="animate-spin text-gold mx-auto mb-4" size={32} />
                  <p className="text-gray-400 text-xs tracking-wider">Syncing database events list...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dbEvents.map(event => (
                    <div key={event.id} className="border border-white/10 p-6 flex flex-col justify-between bg-black/20 hover:border-gold/30 transition-all rounded-lg relative group">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[9px] font-bold text-gold uppercase tracking-widest">{event.category}</span>
                          <div className="text-right">
                            <span className="text-[10px] text-gray-300 font-bold block">₹{event.fee || 0} / head</span>
                            {event.prize && <span className="text-[9px] text-[#C8922A] font-mono block">{event.prize}</span>}
                          </div>
                        </div>
                        <h4 className="text-lg font-cinzel font-bold text-white uppercase tracking-wider mb-2">{event.title}</h4>
                        {event.slogan && <p className="text-xs text-gold/60 italic mb-4">"{event.slogan}"</p>}
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 mb-6">{event.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-auto">
                        <button
                          onClick={() => setEditingEvent(event)}
                          className="bg-white/5 border border-white/10 hover:border-gold/30 hover:text-gold text-white text-[10px] py-3 rounded uppercase font-black tracking-widest flex items-center justify-center gap-2 transition-all"
                        >
                          <Edit size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                          className="bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 text-[10px] py-3 rounded uppercase font-black tracking-widest flex items-center justify-center gap-2 transition-all"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}



          {/* TAB 4: ADMIN SETTINGS */}
          {tab === "settings" && (
            <div className="p-12 md:p-20 space-y-12 animate-in fade-in duration-500">
              <div>
                <h3 className="text-4xl font-cinzel font-black tracking-widest uppercase mb-4 text-gold">
                  Administrative Options
                </h3>
                <p className="text-gray-400 max-w-xl">
                  Configure system behavior and export symposium data for offline processing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Export Card */}
                <div className="bg-black/40 p-10 rounded-lg border border-white/5 hover:border-gold/20 transition-all flex flex-col justify-between">
                  <div>
                    <Download className="text-gold mb-6" size={40} />
                    <h4 className="text-2xl font-cinzel font-bold text-white mb-2">Export Registrations</h4>
                    <p className="text-gray-400 text-sm leading-relaxed mb-8">
                      Download all participant records in CSV format for institutional documentation and team allocation.
                    </p>
                  </div>
                  <button
                    onClick={handleExportCSV}
                    disabled={isExporting || registrations.length === 0}
                    className="w-full bg-gold text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#B07A20] transition-all shadow-lg glow-gold disabled:opacity-30"
                  >
                    {isExporting ? <Loader className="animate-spin" size={18} /> : <Download size={18} />}
                    {isExporting ? "Exporting..." : "Download Full Dataset (CSV)"}
                  </button>
                </div>

                {/* Logout Card */}
                <div className="bg-black/40 p-10 rounded-lg border border-white/5 hover:border-red-500/20 transition-all flex flex-col justify-between">
                  <div>
                    <LogOut className="text-red-500 mb-6" size={40} />
                    <h4 className="text-2xl font-cinzel font-bold text-white mb-2">Security Logout</h4>
                    <p className="text-gray-400 text-sm leading-relaxed mb-8">
                      Terminate the current administrative session. You will need the access key to log back into the hub.
                    </p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full border border-red-500/20 text-red-500 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <LogOut size={18} /> Terminate Admin Session
                  </button>
                </div>
              </div>

              <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-gold/40" size={24} />
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">System Engine</p>
                    <p className="text-white font-bold text-xs">ADAGE-Cloud v2.0</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  Department of Civil Engineering • GCE Erode
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* DETAILED PARTICIPANT DRAWER MODAL */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-200">
          <div className="bg-[#0C0C0C] w-full max-w-3xl rounded-2xl border border-[#C8922A]/40 p-6 sm:p-10 relative overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
            
            {/* CAD Corner Accents */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#C8922A]" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#C8922A]" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#C8922A]" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#C8922A]" />

            <button onClick={() => setSelectedId(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 z-20 transition-colors">
              <X size={28} />
            </button>

            <div className="relative z-10 space-y-8">
              
              {/* Header Info & Current Status Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-[#C8922A]/10 text-[#C8922A] rounded-2xl border border-[#C8922A]/30 flex items-center justify-center flex-shrink-0">
                    <Users size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-cinzel font-black uppercase tracking-wider text-[#EDEBE6]">
                      {selectedParticipant.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-500 font-cad uppercase">REG ID:</span>
                      <span className="text-[#C8922A] text-xs font-cad font-bold tracking-widest">{selectedParticipant.id}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="sm:text-right flex-shrink-0">
                  <span className="text-[9px] text-gray-500 font-cad uppercase tracking-widest block mb-1">CURRENT STATUS</span>
                  <span className={`px-4 py-2 rounded-xl text-xs font-cad font-bold uppercase tracking-wider inline-flex items-center gap-2 border ${
                    selectedParticipant.status === ut.PRESENT
                      ? "text-blue-400 border-blue-400/40 bg-blue-500/10"
                      : selectedParticipant.status === ut.CONFIRMED
                      ? "text-emerald-400 border-emerald-400/40 bg-emerald-500/10"
                      : selectedParticipant.status === ut.REVIEW
                      ? "text-amber-400 border-amber-400/40 bg-amber-500/10"
                      : selectedParticipant.status === ut.REJECTED
                      ? "text-red-400 border-red-400/40 bg-red-500/10"
                      : "text-amber-300 border-amber-400/40 bg-amber-500/10 animate-pulse"
                  }`}>
                    {selectedParticipant.status}
                  </span>
                </div>
              </div>

              {/* Status Update Actions Control Center (Bigger & Prominent) */}
              <div className="bg-[#080808] p-6 rounded-2xl border border-[#C8922A]/30 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-cad font-bold text-[#C8922A] uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldCheck size={16} /> CHANGE / UPDATE PARTICIPANT STATUS
                  </span>
                  <span className="text-[10px] text-gray-500 font-cad">SELECT STATUS BELOW</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => onUpdateStatus(selectedParticipant.id, ut.CONFIRMED)}
                    className={`py-4 px-4 rounded-xl text-xs font-cad font-bold uppercase tracking-wider border transition-all flex flex-col items-center justify-center gap-2 shadow-lg ${
                      selectedParticipant.status === ut.CONFIRMED
                        ? "bg-emerald-500 text-black border-emerald-400 font-black glow-gold"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-black"
                    }`}
                  >
                    <CheckCircle size={20} />
                    <span>CONFIRM PAYMENT</span>
                  </button>

                  <button
                    onClick={() => onUpdateStatus(selectedParticipant.id, ut.REVIEW)}
                    className={`py-4 px-4 rounded-xl text-xs font-cad font-bold uppercase tracking-wider border transition-all flex flex-col items-center justify-center gap-2 shadow-lg ${
                      selectedParticipant.status === ut.REVIEW
                        ? "bg-amber-500 text-black border-amber-400 font-black glow-gold"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500 hover:text-black"
                    }`}
                  >
                    <Clock size={20} />
                    <span>UNDER REVIEW</span>
                  </button>

                  <button
                    onClick={() => onUpdateStatus(selectedParticipant.id, ut.REJECTED)}
                    className={`py-4 px-4 rounded-xl text-xs font-cad font-bold uppercase tracking-wider border transition-all flex flex-col items-center justify-center gap-2 shadow-lg ${
                      selectedParticipant.status === ut.REJECTED
                        ? "bg-red-500 text-white border-red-400 font-black"
                        : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500 hover:text-white"
                    }`}
                  >
                    <X size={20} />
                    <span>REJECT</span>
                  </button>

                  <button
                    onClick={() => onUpdateStatus(selectedParticipant.id, ut.PRESENT)}
                    className={`py-4 px-4 rounded-xl text-xs font-cad font-bold uppercase tracking-wider border transition-all flex flex-col items-center justify-center gap-2 shadow-lg ${
                      selectedParticipant.status === ut.PRESENT
                        ? "bg-blue-500 text-white border-blue-400 font-black"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500 hover:text-white"
                    }`}
                  >
                    <ShieldCheck size={20} />
                    <span>CHECK-IN</span>
                  </button>
                </div>
              </div>

              {/* Top Compact Summary Bar: Institution, Contact & Competitions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#080808] p-5 rounded-2xl border border-white/[0.08]">
                <div>
                  <span className="text-[10px] text-gray-500 font-cad uppercase tracking-[0.2em] block mb-1">ACADEMIC INSTITUTION</span>
                  <p className="text-white font-bold text-sm">{selectedParticipant.college}</p>
                  <p className="text-[#C8922A] text-xs font-cad uppercase">{selectedParticipant.department}</p>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 font-cad uppercase tracking-[0.2em] block mb-1">CONTACT DETAILS</span>
                  <p className="text-gray-300 text-xs font-cad flex items-center gap-1.5 mb-1">
                    <Mail size={12} className="text-[#C8922A]" /> {selectedParticipant.email}
                  </p>
                  <p className="text-gray-300 text-xs font-cad flex items-center gap-1.5">
                    <Phone size={12} className="text-[#C8922A]" /> {selectedParticipant.phone}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 font-cad uppercase tracking-[0.2em] block mb-1">COMPETITIONS & TEAM</span>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedParticipant.events.map((eTitle, idx) => (
                      <span key={idx} className="bg-[#C8922A]/10 text-[#C8922A] text-[10px] font-cad font-bold uppercase px-2 py-0.5 rounded border border-[#C8922A]/30">
                        {eTitle}
                      </span>
                    ))}
                  </div>
                  {selectedParticipant.teamMembers && selectedParticipant.teamMembers.length > 0 && (
                    <p className="text-[10px] text-gray-400 font-cad">
                      Team: <span className="text-gray-200">{selectedParticipant.teamMembers.filter(Boolean).join(", ")}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Prominent Payment & Screenshot Verification Review Box */}
              <div className="bg-[#080808] p-6 rounded-2xl border border-[#C8922A]/40 space-y-4">
                <div className="border-b border-white/[0.08] pb-3">
                  <span className="text-xs font-cad font-bold text-[#C8922A] uppercase tracking-[0.2em]">
                    PAYMENT RECEIPT & UTR VERIFICATION
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
                  {/* Left Column: Transaction Details (2 cols on lg) */}
                  <div className="lg:col-span-2 bg-black/60 p-5 rounded-xl border border-white/[0.08] flex flex-col justify-between space-y-4">
                    <div className="space-y-3 font-cad">
                      <span className="text-[10px] text-[#C8922A] font-bold uppercase tracking-[0.2em] block mb-2">
                        TRANSACTION DATA
                      </span>

                      {/* UTR Metric Card */}
                      <div className="bg-[#0A0D14] p-4 rounded-xl border border-[#C8922A]/40 space-y-1 shadow-md">
                        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block">
                          12-Digit UTR / Transaction ID
                        </span>
                        <p className="text-[#C8922A] font-mono font-black text-lg sm:text-xl tracking-wider select-all break-all">
                          {selectedParticipant.transactionId}
                        </p>
                      </div>

                      {/* Fee Metric Card */}
                      <div className="bg-[#0A0D14] p-4 rounded-xl border border-white/10 space-y-1 shadow-md">
                        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block">
                          Total Fee Amount
                        </span>
                        <p className="text-emerald-400 font-cinzel font-black text-2xl tracking-wide">
                          ₹{selectedParticipant.totalFee || 0}
                        </p>
                      </div>

                      {/* Timestamp Metric Card */}
                      <div className="bg-[#0A0D14] p-4 rounded-xl border border-white/10 space-y-1 shadow-md">
                        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block flex items-center gap-1.5">
                          <Clock size={11} className="text-[#C8922A]" /> Submission Date & Time
                        </span>
                        <p className="text-gray-200 text-xs font-mono">
                          {new Date(selectedParticipant.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {selectedParticipant.screenshotUrl && (
                      <a
                        href={selectedParticipant.screenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3.5 px-4 bg-[#C8922A] text-black hover:bg-[#B07A20] font-cad font-black text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl mt-3"
                      >
                        <ExternalLink size={15} /> Open in Google Drive
                      </a>
                    )}
                  </div>

                  {/* Right Column: BIG Payment Receipt Image Viewer (3 cols on lg) */}
                  <div className="lg:col-span-3 space-y-2 flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-cad">
                      Uploaded Screenshot Preview
                    </span>
                    <PaymentScreenshotViewer
                      url={selectedParticipant.screenshotUrl}
                      participantName={selectedParticipant.name}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
