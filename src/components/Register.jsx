import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas-pro';
import { Check, Info, Users, Smartphone, ShieldCheck, Download, Award, ArrowLeft, ArrowRight, Loader, Cpu, Sparkles, Layers, CreditCard, ChevronRight, QrCode, Upload, Image, FileCheck, ExternalLink, X } from 'lucide-react';
import { supabase } from '../supabase';
import { Sr, Pt, ut } from '../events';
import { uploadScreenshotToGoogleDrive } from '../utils/googleDrive';

export default function Register() {
  const [dbEvents, setDbEvents] = React.useState([]);
  const [loadingDb, setLoadingDb] = React.useState(true);

  React.useEffect(() => {
    async function loadEvents() {
      try {
        const { data, error } = await supabase.from('events').select('*');
        if (error) throw error;
        setDbEvents(data || []);
      } catch (err) {
        console.error("Failed to fetch events from DB, using fallback", err);
        setDbEvents(Sr);
      } finally {
        setLoadingDb(false);
      }
    }
    loadEvents();
  }, []);

  const activeEvents = dbEvents.length > 0 ? dbEvents : Sr;
  const navigate = useNavigate();
  const location = useLocation();
  const passRef = useRef(null);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [createdRecord, setCreatedRecord] = useState(null);
  const [qrBlobUrl, setQrBlobUrl] = useState("");

  useEffect(() => {
    let activeUrl = "";
    if (createdRecord) {
      const data = JSON.stringify({ id: createdRecord.id, type: "ADAGE_ENTRY" });
      const api = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&bgcolor=000&color=C8922A&data=${encodeURIComponent(data)}`;
      
      fetch(api)
        .then(r => r.blob())
        .then(b => {
          activeUrl = URL.createObjectURL(b);
          setQrBlobUrl(activeUrl);
        })
        .catch(err => console.error("Error generating QR blob:", err));
    }
    
    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [createdRecord]);

  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    college: "",
    department: "",
    email: "",
    phone: "",
    transactionId: "",
    selectedEvents: [],
    teamMembers: []
  });

  const [validationErrors, setValidationErrors] = useState({
    email: "",
    phone: "",
    transactionId: ""
  });

  const handleFileSelect = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image file size must be less than 10MB.");
      return;
    }
    setUploadError("");
    setScreenshotFile(file);

    const objectUrl = URL.createObjectURL(file);
    setScreenshotPreview(objectUrl);

    setIsUploadingScreenshot(true);
    try {
      const gDriveUrl = await uploadScreenshotToGoogleDrive(file, form.transactionId || form.phone || "REG");
      setScreenshotUrl(gDriveUrl);
    } catch (err) {
      console.error("Failed to upload screenshot to Drive:", err);
      setUploadError(err.message || "Failed to upload screenshot to Google Drive.");
    } finally {
      setIsUploadingScreenshot(false);
    }
  };

  const upiId = "midhun73272@oksbi";
  const techBaseFee = 250;
  const nonTechBaseFee = 150;

  // Selected events config
  const selectedEventsList = activeEvents.filter(event => form.selectedEvents.includes(event.id));
  const techSelectedList = selectedEventsList.filter(event => event.category === Pt.TECHNICAL);
  const nonTechSelectedList = selectedEventsList.filter(event => event.category === Pt.NON_TECHNICAL);

  const techCount = techSelectedList.length;
  const nonTechCount = nonTechSelectedList.length;
  const hasTechSelected = techCount > 0;

  // Maximum team size calculation
  const maxTeamCapacity = hasTechSelected
    ? Math.max(...techSelectedList.map(e => e.maxMembers))
    : nonTechSelectedList.length > 0
    ? Math.max(...nonTechSelectedList.map(e => e.maxMembers))
    : 1;

  const validTeamCount = form.teamMembers.filter(name => name.trim() !== "").length;
  const totalParticipants = 1 + validTeamCount;
  
  // Fee Calculation:
  // - Max 2 Technical events allowed
  // - For each Technical event, 1 Non-Technical event is FREE
  const freeNonTechCount = Math.min(nonTechCount, techCount);
  const paidNonTechCount = Math.max(0, nonTechCount - freeNonTechCount);

  const baseRate = hasTechSelected
    ? (techCount * techBaseFee) + (paidNonTechCount * nonTechBaseFee)
    : (nonTechCount > 0 ? nonTechCount * nonTechBaseFee : 0);

  const totalPayableFee = totalParticipants * baseRate;

  // Set selected event from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const eventId = params.get('eventId');
    if (eventId) {
      setForm(prev => {
        let events = [...prev.selectedEvents];
        if (activeEvents.some(e => e.id === eventId) && !events.includes(eventId)) {
          events = [eventId];
        }
        
        const filteredList = activeEvents.filter(e => events.includes(e.id));
        const maxCap = filteredList.some(e => e.category === Pt.TECHNICAL)
          ? Math.max(...filteredList.filter(e => e.category === Pt.TECHNICAL).map(e => e.maxMembers))
          : filteredList.length > 0
          ? Math.max(...filteredList.map(e => e.maxMembers))
          : 1;

        const members = [...prev.teamMembers].slice(0, maxCap - 1);
        while (members.length < maxCap - 1) {
          members.push("");
        }

        return { ...prev, selectedEvents: events, teamMembers: members };
      });
    }
  }, [location.search]);

  // Validators
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[0-9]{10}$/.test(phone.replace(/\s/g, ""));

  useEffect(() => {
    let emailErr = "";
    let phoneErr = "";
    let txErr = "";

    if (form.email && !validateEmail(form.email)) {
      emailErr = "Invalid email address format";
    }
    if (form.phone && !validatePhone(form.phone)) {
      phoneErr = "Phone number must be 10 digits";
    }
    if (form.transactionId && form.transactionId.length > 0 && form.transactionId.length < 12) {
      txErr = "Transaction ID must be 12 digits";
    }

    setValidationErrors({
      email: emailErr,
      phone: phoneErr,
      transactionId: txErr
    });
  }, [form.email, form.phone, form.transactionId]);

  // Toggle selected event
  const toggleEventSelection = (id) => {
    const targetEvent = activeEvents.find(e => e.id === id);
    if (!targetEvent) return;

    setForm(prev => {
      const isSelected = prev.selectedEvents.includes(id);
      let events = [...prev.selectedEvents];

      if (isSelected) {
        events = events.filter(e => e !== id);
      } else {
        const currentSelectedList = activeEvents.filter(e => events.includes(e.id));
        const currentTechCount = currentSelectedList.filter(e => e.category === Pt.TECHNICAL).length;

        // Rule 1: Max 2 technical events allowed
        if (targetEvent.category === Pt.TECHNICAL && currentTechCount >= 2) {
          return prev;
        }

        events.push(id);
      }

      const updatedSelectedList = activeEvents.filter(e => events.includes(e.id));
      const newMaxCap = updatedSelectedList.some(e => e.category === Pt.TECHNICAL)
        ? Math.max(...updatedSelectedList.filter(e => e.category === Pt.TECHNICAL).map(e => e.maxMembers))
        : updatedSelectedList.length > 0
        ? Math.max(...updatedSelectedList.map(e => e.maxMembers))
        : 1;

      const members = prev.teamMembers.slice(0, newMaxCap - 1);
      while (members.length < newMaxCap - 1) {
        members.push("");
      }

      return { ...prev, selectedEvents: events, teamMembers: members };
    });
  };

  const handleNextStep = () => {
    if (step === 1 && form.selectedEvents.length === 0) return;
    if (step === 2 && (
      !form.name || !form.college || !form.department || !form.email || !form.phone ||
      validationErrors.email || validationErrors.phone
    )) return;
    if (step === 3 && (!form.transactionId || form.transactionId.length !== 12 || (!screenshotFile && !screenshotUrl))) return;
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setError(null);
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit to Database
  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    if (!form.transactionId || form.transactionId.length !== 12 || (!screenshotFile && !screenshotUrl)) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Check for duplicate transaction ID (UTR)
      const { data: existingTx } = await supabase
        .from('registrations')
        .select('id')
        .eq('transactionId', form.transactionId)
        .maybeSingle();

      if (existingTx) {
        throw new Error("This 12-digit Transaction ID (UTR) has already been submitted for a registration!");
      }

      const generatedId = "ADG" + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      let finalScreenshotUrl = screenshotUrl;
      if (screenshotFile && !finalScreenshotUrl) {
        try {
          finalScreenshotUrl = await uploadScreenshotToGoogleDrive(screenshotFile, generatedId);
          setScreenshotUrl(finalScreenshotUrl);
        } catch (upErr) {
          console.warn("Drive upload prior to submit warning:", upErr);
        }
      }

      const payload = {
        id: generatedId,
        name: form.name,
        college: form.college,
        department: form.department,
        email: form.email.toLowerCase(),
        phone: form.phone,
        teamMembers: form.teamMembers.filter(m => m.trim() !== ""),
        events: form.selectedEvents.map(id => {
          const matched = activeEvents.find(e => e.id === id);
          return matched ? matched.title : "";
        }),
        totalFee: totalPayableFee,
        transactionId: form.transactionId,
        screenshotUrl: finalScreenshotUrl || null,
        status: ut.PENDING,
        timestamp: new Date().toISOString()
      };

      const { error: dbError } = await supabase.from('registrations').insert([payload]);
      if (dbError) throw dbError;

      setCreatedRecord(payload);
      localStorage.setItem('adage_user_email', payload.email);
      setStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Submission failed:", err);
      setError({
        message: err.message || "Failed to complete registration. Please verify database connection."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download pass PNG image
  const handleDownloadPass = async () => {
    if (passRef.current) {
      setIsDownloading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const canvas = await html2canvas(passRef.current, {
          backgroundColor: "#000000",
          scale: 2,
          useCORS: true,
          logging: false
        });

        const link = document.createElement("a");
        link.download = `ADAGE_ENTRY_PASS_${createdRecord?.id}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (err) {
        console.error("Download failed:", err);
        window.print();
      } finally {
        setIsDownloading(false);
      }
    }
  };

  // passQrCodeUrl is replaced by qrBlobUrl state

  const isUtrValid = form.transactionId.length === 12;

  const stepLabels = [
    { num: 1, tag: "STEP 01", title: "SELECT EVENTS" },
    { num: 2, tag: "STEP 02", title: "TEAM PROFILE" },
    { num: 3, tag: "STEP 03", title: "PAYMENT INFO" },
    { num: 4, tag: "STEP 04", title: "FINAL REVIEW" }
  ];

  return (
    <div className="py-12 sm:py-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8">
        
        {/* Page Title & Blueprint Tag */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-8 h-px bg-[#C8922A]" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8922A] font-cad font-bold">
              CAD REGISTRATION PORTAL
            </span>
            <span className="w-8 h-px bg-[#C8922A]" />
          </div>
          <h1 className="font-cinzel font-black text-3xl sm:text-4xl md:text-5xl text-[#EDEBE6] uppercase tracking-wide mb-3">
            PORTAL ACCESS & REGISTRATION
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-cad max-w-xl mx-auto">
            Select technical challenges, configure your structural team roster, and secure entry passes for ADAGE'26.
          </p>
        </div>

        {/* Stepper Navigation Strip */}
        {step < 5 && (
          <div className="mb-10 sm:mb-14 bg-[#0A0A0A] border border-white/[0.08] p-4 sm:p-6 relative">
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t border-l border-[#C8922A]" />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t border-r border-[#C8922A]" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b border-l border-[#C8922A]" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b border-r border-[#C8922A]" />

            <div className="grid grid-cols-4 gap-2 sm:gap-4 items-center">
              {stepLabels.map((s) => {
                const isActive = step === s.num;
                const isDone = step > s.num;
                return (
                  <div key={s.num} className="flex flex-col items-center text-center relative group">
                    <div className={`w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center font-cad font-bold text-xs sm:text-sm transition-all duration-300 border mb-2 ${
                      isDone
                        ? "bg-[#C8922A] border-[#C8922A] text-black"
                        : isActive
                        ? "bg-[#C8922A]/10 border-[#C8922A] text-[#C8922A] glow-gold"
                        : "bg-black/50 border-white/10 text-gray-500"
                    }`}>
                      {isDone ? <Check size={18} strokeWidth={3} /> : `0${s.num}`}
                    </div>
                    <span className={`text-[8px] sm:text-[9px] font-cad uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold ${
                      isActive || isDone ? "text-[#C8922A]" : "text-gray-500"
                    }`}>
                      {s.tag}
                    </span>
                    <span className={`text-[8px] sm:text-[11px] font-cinzel font-bold uppercase tracking-wider hidden sm:block ${
                      isActive || isDone ? "text-[#EDEBE6]" : "text-gray-600"
                    }`}>
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Form Container with Architectural CAD Corner Accents */}
        <div className="bg-[#0C0C0C] border border-white/[0.08] relative overflow-hidden shadow-2xl">
          <div className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-[#C8922A]" />
          <div className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-[#C8922A]" />
          <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-[#C8922A]" />
          <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-[#C8922A]" />
          
          {/* STEP 1: EVENT SELECTION */}
          {step === 1 && (
            <div className="p-4 sm:p-8 md:p-12 space-y-6 sm:space-y-8 animate-fade-in">
              <div className="border-b border-white/[0.08] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-[#C8922A] font-cad font-bold tracking-[0.3em] uppercase">MODULE 01</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8922A]" />
                    <span className="text-[10px] text-gray-400 font-cad uppercase">EVENT SPECIFICATIONS</span>
                  </div>
                  <h2 className="font-cinzel font-black text-xl sm:text-2xl text-[#EDEBE6] uppercase">
                    Select Your Competitions
                  </h2>
                </div>

                <div className="flex items-center gap-3 bg-black/60 border border-white/[0.08] px-4 py-2 text-xs font-cad">
                  <span className="text-gray-400">Tech: <strong className="text-[#C8922A]">₹{techBaseFee}</strong></span>
                  <span className="text-white/20">|</span>
                  <span className="text-gray-400">Non-Tech: <strong className="text-[#C8922A]">₹{nonTechBaseFee}</strong></span>
                </div>
              </div>

              {/* Bundle Callout Banner */}
              {hasTechSelected && (
                <div className="bg-[#C8922A]/10 border border-[#C8922A]/30 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-[#C8922A] flex-shrink-0" size={20} />
                    <div>
                      <p className="text-xs font-bold text-[#C8922A] font-cad uppercase tracking-wider">
                        BUNDLE OFFER: {techCount} FREE NON-TECHNICAL EVENT{techCount > 1 ? 'S' : ''}
                      </p>
                      <p className="text-[10px] text-gray-400 font-cad">
                        You selected {techCount} Technical Event{techCount > 1 ? 's' : ''} (Max 2). For each Technical event, 1 Non-Technical event is complimentary!
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-[#C8922A] text-black text-[9px] font-black uppercase font-cad tracking-widest flex-shrink-0">
                    APPLIED
                  </span>
                </div>
              )}

              {/* Event Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeEvents.map(event => {
                  const isSelected = form.selectedEvents.includes(event.id);
                  const isTech = event.category === Pt.TECHNICAL;
                  const isNonTech = event.category === Pt.NON_TECHNICAL;

                  const isLockedTech = isTech && !isSelected && techCount >= 2;

                  let isFreeNonTech = false;
                  if (isNonTech) {
                    if (isSelected) {
                      const selectedNonTechIndex = nonTechSelectedList.findIndex(e => e.id === event.id);
                      if (selectedNonTechIndex >= 0 && selectedNonTechIndex < techCount) {
                        isFreeNonTech = true;
                      }
                    } else {
                      if (hasTechSelected && nonTechCount < techCount) {
                        isFreeNonTech = true;
                      }
                    }
                  }

                  return (
                    <div
                      key={event.id}
                      onClick={() => !isLockedTech && toggleEventSelection(event.id)}
                      className={`p-5 border transition-all duration-300 relative group ${
                        isLockedTech
                          ? "opacity-40 grayscale cursor-not-allowed bg-black/40 border-white/5"
                          : "cursor-pointer"
                      } ${
                        isSelected
                          ? "bg-[#C8922A]/10 border-[#C8922A] shadow-[0_0_20px_rgba(200,146,42,0.15)]"
                          : "bg-[#090909] border-white/[0.08] hover:border-[#C8922A]/50 hover:bg-[#111111]"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-cad uppercase tracking-[0.2em] px-2 py-0.5 border ${
                              isTech ? "border-amber-500/30 text-amber-400 bg-amber-500/5" : "border-cyan-500/30 text-cyan-400 bg-cyan-500/5"
                            }`}>
                              {event.category}
                            </span>
                            {isLockedTech && (
                              <span className="text-[8px] font-cad text-rose-400 font-bold tracking-widest uppercase">
                                [MAX 2 TECH]
                              </span>
                            )}
                          </div>
                          <h4 className="font-cinzel font-bold text-sm sm:text-base text-[#EDEBE6] uppercase tracking-wide mt-2">
                            {event.title}
                          </h4>
                        </div>

                        <div className={`w-6 h-6 flex items-center justify-center border transition-colors ${
                          isSelected ? "bg-[#C8922A] border-[#C8922A] text-black" : "border-white/20 text-transparent"
                        }`}>
                          <Check size={14} strokeWidth={3} />
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-400 font-cad line-clamp-2 mb-4 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="flex justify-between items-center text-[10px] font-cad uppercase tracking-wider pt-3 border-t border-white/[0.06]">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Users size={12} /> Max: {event.maxMembers} Member{event.maxMembers > 1 ? 's' : ''}
                        </span>
                        <span className="font-bold text-[#C8922A] text-xs">
                          {isFreeNonTech ? (
                            <span className="text-emerald-400 font-black">FREE (BUNDLE)</span>
                          ) : (
                            `₹${event.fee || (isTech ? techBaseFee : nonTechBaseFee)}`
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Fee Box */}
              <div className="p-5 bg-[#080808] border border-white/[0.08] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[10px] text-gray-500 font-cad uppercase tracking-widest">CALCULATED RATE</span>
                  <p className="text-xs text-[#EDEBE6] font-cad">
                    Selected Events: <strong className="text-[#C8922A]">{form.selectedEvents.length}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-gray-400 font-cad uppercase">HEAD RATE</span>
                  <p className="font-cinzel font-black text-2xl text-[#C8922A]">
                    ₹{baseRate} <span className="text-xs text-gray-400 font-cad">/ Participant</span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleNextStep}
                disabled={form.selectedEvents.length === 0}
                className="w-full btn-primary justify-center py-4 text-xs tracking-[0.2em] disabled:opacity-40"
              >
                PROCEED TO TEAM PROFILES <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 2: TEAM PROFILES */}
          {step === 2 && (
            <div className="p-4 sm:p-8 md:p-12 space-y-6 sm:space-y-8 animate-fade-in">
              <div className="border-b border-white/[0.08] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-[#C8922A] font-cad font-bold tracking-[0.3em] uppercase">MODULE 02</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8922A]" />
                    <span className="text-[10px] text-gray-400 font-cad uppercase">PARTICIPANT ROSTER</span>
                  </div>
                  <h2 className="font-cinzel font-black text-xl sm:text-2xl text-[#EDEBE6] uppercase">
                    Team Roster & Profile Details
                  </h2>
                </div>

                <div className="flex items-center gap-2 bg-[#C8922A]/10 border border-[#C8922A]/30 px-3 py-1.5">
                  <Users size={14} className="text-[#C8922A]" />
                  <span className="text-[10px] font-cad font-bold text-[#C8922A] uppercase tracking-wider">
                    Total Members: {totalParticipants} / {maxTeamCapacity}
                  </span>
                </div>
              </div>

              {/* Primary Participant Form */}
              <div className="bg-[#080808] border border-white/[0.08] p-4 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
                  <div className="w-7 h-7 bg-[#C8922A]/20 border border-[#C8922A] flex items-center justify-center text-[#C8922A]">
                    <Smartphone size={14} />
                  </div>
                  <h3 className="font-cinzel font-bold text-sm text-[#EDEBE6] uppercase tracking-wider">
                    01 // Primary Participant (Leader)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-cad font-bold text-gray-400 uppercase tracking-wider">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="civil-input text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-cad font-bold text-gray-400 uppercase tracking-wider">College Institution *</label>
                    <input
                      type="text"
                      required
                      value={form.college}
                      onChange={e => setForm({ ...form, college: e.target.value })}
                      placeholder="e.g. GCE Erode"
                      className="civil-input text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-cad font-bold text-gray-400 uppercase tracking-wider">Department *</label>
                    <input
                      type="text"
                      required
                      value={form.department}
                      onChange={e => setForm({ ...form, department: e.target.value })}
                      placeholder="e.g. Civil Engineering"
                      className="civil-input text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-cad font-bold text-gray-400 uppercase tracking-wider">Phone Number *</label>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                      placeholder="10-digit mobile number"
                      className={`civil-input text-xs ${validationErrors.phone ? "border-red-500" : ""}`}
                    />
                    {validationErrors.phone && <p className="text-[9px] text-red-400 font-cad">{validationErrors.phone}</p>}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] font-cad font-bold text-gray-400 uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="participant@domain.com"
                      className={`civil-input text-xs ${validationErrors.email ? "border-red-500" : ""}`}
                    />
                    {validationErrors.email && <p className="text-[9px] text-red-400 font-cad">{validationErrors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Secondary Team Members */}
              {maxTeamCapacity > 1 && (
                <div className="bg-[#080808] border border-white/[0.08] p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-[#C8922A]/20 border border-[#C8922A] flex items-center justify-center text-[#C8922A]">
                        <Users size={14} />
                      </div>
                      <h3 className="font-cinzel font-bold text-sm text-[#EDEBE6] uppercase tracking-wider">
                        02 // Additional Team Members
                      </h3>
                    </div>
                    <span className="text-[9px] font-cad text-[#C8922A]">
                      +₹{baseRate} / Additional Member
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {form.teamMembers.map((member, index) => (
                      <div key={index} className="space-y-2">
                        <label className="text-[10px] font-cad text-gray-400 uppercase">
                          Member {index + 2} Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={member}
                          onChange={e => {
                            const newMembers = [...form.teamMembers];
                            newMembers[index] = e.target.value;
                            setForm({ ...form, teamMembers: newMembers });
                          }}
                          placeholder={`Team Member ${index + 2}`}
                          className="civil-input text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary Fee Banner */}
              <div className="p-5 bg-[#C8922A]/10 border border-[#C8922A]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[9px] text-[#C8922A] font-cad font-bold uppercase tracking-widest">PAYABLE TOTAL FILLS</span>
                  <p className="text-xs text-[#EDEBE6] font-cad">
                    {totalParticipants} Participant{totalParticipants > 1 ? 's' : ''} × ₹{baseRate} Base Fee
                  </p>
                </div>
                <div className="font-cinzel font-black text-2xl text-[#C8922A]">
                  ₹{totalPayableFee}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handlePrevStep}
                  className="sm:flex-1 btn-ghost justify-center py-4 text-xs tracking-widest"
                >
                  <ArrowLeft size={16} /> BACK
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={
                    !form.name || !form.college || !form.department || !form.email || !form.phone ||
                    !!validationErrors.email || !!validationErrors.phone
                  }
                  className="sm:flex-[2] btn-primary justify-center py-4 text-xs tracking-[0.2em] disabled:opacity-40"
                >
                  PROCEED TO PAYMENT <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SECURE PAYMENT & UTR INPUT */}
          {step === 3 && (
            <div className="p-4 sm:p-8 md:p-12 space-y-6 sm:space-y-8 animate-fade-in">
              <div className="border-b border-white/[0.08] pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-[#C8922A] font-cad font-bold tracking-[0.3em] uppercase">MODULE 03</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8922A]" />
                  <span className="text-[10px] text-gray-400 font-cad uppercase">TRANSACTION VERIFICATION</span>
                </div>
                <h2 className="font-cinzel font-black text-xl sm:text-2xl text-[#EDEBE6] uppercase">
                  UPI Payment & Transaction ID
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* QR Code Placeholder Container */}
                <div className="bg-[#080808] border border-white/[0.08] p-6 text-center relative group">
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-[#C8922A]" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-[#C8922A]" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-[#C8922A]" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-[#C8922A]" />

                  <span className="text-[9px] text-[#C8922A] font-cad font-bold uppercase tracking-widest block mb-4">
                    UPI PAYMENT DETAILS
                  </span>

                  {/* QR Code Placeholder Box */}
                  <div className="bg-black/60 p-8 border-2 border-dashed border-[#C8922A]/40 flex flex-col items-center justify-center min-h-[200px] mb-4">
                    <QrCode size={48} className="text-[#C8922A] mb-3 opacity-60" />
                    <p className="text-xs font-cad font-bold text-[#EDEBE6] uppercase tracking-wider">
                      [ QR CODE PLACEHOLDER ]
                    </p>
                    <p className="text-[9px] text-gray-500 font-cad mt-1">
                      Scan via GPay / PhonePe / Paytm
                    </p>
                  </div>

                  <div className="bg-black/80 border border-white/[0.08] p-3 text-center space-y-1">
                    <p className="text-[9px] text-gray-500 font-cad uppercase">UPI ID / VPA</p>
                    <p className="text-xs font-cad font-bold text-[#C8922A] select-all">[ UPI ID PLACEHOLDER ]</p>
                    <p className="text-[9px] text-gray-400 font-cad uppercase pt-1 border-t border-white/[0.06] mt-2">
                      Payee: [ NAME PLACEHOLDER ]
                    </p>
                  </div>
                </div>

                {/* Verification & UTR Input */}
                <div className="space-y-6">
                  <div className="bg-[#080808] border border-white/[0.08] p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[#C8922A] text-xs font-cad font-bold uppercase">
                      <Info size={14} /> Verification Guidelines
                    </div>
                    <ul className="text-[11px] text-gray-400 font-cad space-y-2 list-disc pl-4 leading-relaxed">
                      <li>Pay exact total: <strong className="text-[#C8922A]">₹{totalPayableFee}</strong> using GPay, PhonePe, or Paytm.</li>
                      <li>Copy the <strong className="text-white">12-Digit Transaction Ref / UTR ID</strong> from your UPI app receipt.</li>
                      <li>Paste the UTR number below to proceed to final review.</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-cad font-bold text-gray-400 uppercase tracking-widest block">
                      12-Digit Transaction ID (UTR) *
                    </label>
                    <div className="relative">
                      <ShieldCheck className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                        isUtrValid ? "text-[#C8922A]" : "text-gray-500"
                      }`} size={18} />
                      <input
                        type="text"
                        required
                        maxLength={12}
                        value={form.transactionId}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, "");
                          setForm({ ...form, transactionId: val });
                        }}
                        placeholder="e.g. 423456789012"
                        className={`civil-input pl-12 pr-4 py-4 text-center font-cad font-bold tracking-[0.3em] text-lg ${
                          validationErrors.transactionId ? "border-amber-500" : ""
                        }`}
                      />
                    </div>
                    {isUtrValid && (
                      <p className="text-[10px] text-emerald-400 font-cad font-bold text-center flex items-center justify-center gap-1">
                        <Check size={12} /> 12-Digit Format Valid
                      </p>
                    )}
                  </div>

                  {/* UPI Screenshot Upload Box */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-cad font-bold text-[#C8922A] uppercase tracking-widest block">
                        UPI Payment Screenshot (Required) *
                      </label>
                      {screenshotUrl ? (
                        <span className="text-[9px] font-cad text-emerald-400 flex items-center gap-1 font-bold">
                          <Check size={12} /> Receipt Uploaded
                        </span>
                      ) : (
                        <span className="text-[9px] font-cad text-amber-400 font-bold uppercase">
                          Upload Required
                        </span>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                    />

                    {!screenshotPreview ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleFileSelect(e.dataTransfer.files[0]);
                          }
                        }}
                        className="border-2 border-dashed border-amber-500/40 hover:border-[#C8922A] bg-black/40 hover:bg-black/60 p-6 rounded-xl text-center cursor-pointer transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 bg-[#C8922A]/10 border border-[#C8922A]/30 rounded-xl flex items-center justify-center mx-auto mb-3 text-[#C8922A] group-hover:scale-110 transition-transform">
                          <Upload size={22} />
                        </div>
                        <p className="text-xs font-cad font-bold text-[#EDEBE6] uppercase tracking-wider mb-1">
                          Upload Payment Receipt / Screenshot *
                        </p>
                        <p className="text-[10px] font-cad text-gray-400">
                          Drag & drop image here or click to browse (PNG, JPG, WEBP)
                        </p>
                      </div>
                    ) : (
                      <div className="bg-black/60 border border-[#C8922A]/40 p-4 rounded-xl space-y-3 relative group">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-black">
                            <img src={screenshotPreview} alt="UPI Payment Screenshot" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 font-cad">
                            <p className="text-xs font-bold text-white truncate">{screenshotFile?.name || "Payment_Screenshot.png"}</p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              {(screenshotFile?.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            
                            {isUploadingScreenshot ? (
                              <div className="flex items-center gap-1.5 text-[10px] text-[#C8922A] mt-1 font-bold">
                                <Loader size={12} className="animate-spin" /> Processing screenshot...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30 rounded flex items-center gap-1">
                                  <FileCheck size={10} /> Payment Receipt Uploaded
                                </span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              setScreenshotFile(null);
                              setScreenshotPreview(null);
                              setScreenshotUrl("");
                              setUploadError("");
                            }}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove file"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-[10px] text-amber-400 font-cad font-bold">{uploadError}</p>
                    )}
                    {!screenshotPreview && (
                      <p className="text-[10px] text-amber-400 font-cad font-bold flex items-center justify-center gap-1 pt-1">
                        * You must upload your UPI payment receipt screenshot to proceed
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/[0.08]">
                <button
                  onClick={handlePrevStep}
                  className="sm:flex-1 btn-ghost justify-center py-4 text-xs tracking-widest"
                >
                  <ArrowLeft size={16} /> BACK
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!isUtrValid || (!screenshotFile && !screenshotUrl) || isUploadingScreenshot}
                  className="sm:flex-[2] btn-primary justify-center py-4 text-xs tracking-[0.2em] disabled:opacity-40"
                >
                  REVIEW & VERIFY DETAILS <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & FINAL VERIFICATION */}
          {step === 4 && (
            <div className="p-4 sm:p-8 md:p-12 space-y-6 sm:space-y-8 animate-fade-in">
              <div className="border-b border-white/[0.08] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-[#C8922A] font-cad font-bold tracking-[0.3em] uppercase">MODULE 04</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8922A]" />
                    <span className="text-[10px] text-gray-400 font-cad uppercase">FINAL VERIFICATION & REVIEW</span>
                  </div>
                  <h2 className="font-cinzel font-black text-xl sm:text-2xl text-[#EDEBE6] uppercase">
                    Review Your Registration Details
                  </h2>
                </div>

                <div className="flex items-center gap-2 bg-[#C8922A]/10 border border-[#C8922A]/30 px-3 py-1.5">
                  <ShieldCheck size={14} className="text-[#C8922A]" />
                  <span className="text-[10px] font-cad font-bold text-[#C8922A] uppercase tracking-wider">
                    Ready For Submission
                  </span>
                </div>
              </div>

              {/* Review Card Summary Container */}
              <div className="bg-[#080808] border border-white/[0.08] p-4 sm:p-8 space-y-6 relative">
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-[#C8922A]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-[#C8922A]" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-[#C8922A]" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-[#C8922A]" />

                {/* Primary Participant Summary */}
                <div className="border-b border-white/[0.06] pb-6 space-y-3">
                  <span className="text-[10px] text-[#C8922A] font-cad font-bold uppercase tracking-widest block">
                    01 // PRIMARY PARTICIPANT
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-cad text-xs">
                    <div>
                      <span className="text-gray-500 text-[10px] block uppercase">FULL NAME</span>
                      <span className="text-[#EDEBE6] font-bold">{form.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] block uppercase">COLLEGE</span>
                      <span className="text-[#EDEBE6] font-bold">{form.college}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] block uppercase">DEPARTMENT</span>
                      <span className="text-[#EDEBE6] font-bold">{form.department}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] block uppercase">PHONE</span>
                      <span className="text-[#EDEBE6] font-bold">{form.phone}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-500 text-[10px] block uppercase">EMAIL ADDRESS</span>
                      <span className="text-[#EDEBE6] font-bold">{form.email}</span>
                    </div>
                  </div>
                </div>

                {/* Team Members Summary */}
                {form.teamMembers.filter(m => m.trim() !== "").length > 0 && (
                  <div className="border-b border-white/[0.06] pb-6 space-y-3">
                    <span className="text-[10px] text-[#C8922A] font-cad font-bold uppercase tracking-widest block">
                      02 // TEAM MEMBERS
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-cad text-xs">
                      {form.teamMembers.filter(m => m.trim() !== "").map((m, idx) => (
                        <div key={idx} className="bg-black/60 border border-white/[0.06] p-2.5 flex items-center gap-2">
                          <span className="text-[#C8922A] font-bold text-[10px]">#{idx + 2}</span>
                          <span className="text-gray-300 font-bold">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Events Summary */}
                <div className="border-b border-white/[0.06] pb-6 space-y-3">
                  <span className="text-[10px] text-[#C8922A] font-cad font-bold uppercase tracking-widest block">
                    03 // REGISTERED EVENTS
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedEventsList.map(ev => (
                      <div key={ev.id} className="bg-[#C8922A]/10 border border-[#C8922A]/30 px-3 py-1.5 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C8922A]" />
                        <span className="text-xs font-cad font-bold text-[#EDEBE6]">{ev.title}</span>
                        <span className="text-[9px] font-cad text-[#C8922A]">({ev.category})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Summary & Entered UTR */}
                <div className="space-y-3">
                  <span className="text-[10px] text-[#C8922A] font-cad font-bold uppercase tracking-widest block">
                    04 // PAYMENT & TRANSACTION VERIFICATION
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-cad text-xs bg-black/60 border border-white/[0.06] p-4">
                    <div>
                      <span className="text-gray-500 text-[10px] block uppercase">12-DIGIT TRANSACTION ID (UTR)</span>
                      <strong className="text-[#C8922A] text-sm tracking-[0.2em] font-bold">{form.transactionId}</strong>
                    </div>
                    <div className="sm:text-right">
                      <span className="text-gray-500 text-[10px] block uppercase">TOTAL AMOUNT PAYABLE</span>
                      <strong className="text-[#EDEBE6] text-sm font-bold">₹{totalPayableFee}</strong>
                    </div>
                    {screenshotPreview && (
                      <div className="sm:col-span-2 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={screenshotPreview} alt="Payment Receipt" className="w-10 h-10 object-cover rounded border border-white/20" />
                          <div>
                            <span className="text-gray-400 text-[10px] block uppercase">UPI RECEIPT SCREENSHOT</span>
                            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                              <Check size={12} /> Payment Receipt Attached
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-cad text-center">
                  {error.message}
                </div>
              )}

              {/* Final Action Buttons with Back Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/[0.08]">
                <button
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                  className="sm:flex-1 btn-ghost justify-center py-4 text-xs tracking-widest"
                >
                  <ArrowLeft size={16} /> BACK TO EDIT
                </button>
                <button
                  onClick={handleRegistrationSubmit}
                  disabled={isSubmitting}
                  className="sm:flex-[2] btn-primary justify-center py-4 text-xs tracking-[0.2em] disabled:opacity-40"
                >
                  {isSubmitting ? (
                    <Loader className="animate-spin" size={18} />
                  ) : (
                    <ShieldCheck size={18} />
                  )}
                  {isSubmitting ? "CONFIRMING & SUBMITTING..." : "CONFIRM & SUBMIT REGISTRATION"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: REGISTRATION SUCCESS & ENTRY PASS */}
          {step === 5 && createdRecord && (
            <div className="p-6 sm:p-10 md:p-12 text-center animate-fade-in space-y-8">
              <div className="w-16 h-16 bg-[#C8922A]/20 border border-[#C8922A] text-[#C8922A] flex items-center justify-center mx-auto glow-gold">
                <Check size={32} strokeWidth={3} />
              </div>

              <div>
                <span className="text-[10px] text-[#C8922A] font-cad font-bold uppercase tracking-[0.3em]">
                  REGISTRATION COMPLETED
                </span>
                <h2 className="font-cinzel font-black text-2xl sm:text-4xl text-[#EDEBE6] uppercase tracking-wide mt-1 mb-2">
                  OFFICIAL ENTRY PASS GENERATED
                </h2>
                <p className="text-xs text-gray-400 font-cad max-w-md mx-auto">
                  Transaction logged under Ref: <span className="text-[#C8922A] font-bold">{createdRecord.transactionId}</span>. Status: <strong className="text-amber-400">Verification Pending</strong>.
                </p>
              </div>

              {/* WhatsApp Community Groups */}
              {form.selectedEvents.some(id => activeEvents.find(e => e.id === id)?.whatsappLink) && (
                <div className="max-w-md mx-auto bg-[#080808] border border-white/[0.08] p-5 text-left space-y-3">
                  <span className="text-[10px] text-[#C8922A] font-cad font-bold uppercase tracking-wider block">
                    JOIN OFFICIAL EVENT WHATSAPP GROUPS
                  </span>
                  <div className="space-y-2">
                    {form.selectedEvents.map(id => {
                      const matched = activeEvents.find(e => e.id === id);
                      if (matched && matched.whatsappLink) {
                        return (
                          <a
                            key={id}
                            href={matched.whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between bg-black border border-white/10 p-3 hover:border-[#25D366] transition-colors group"
                          >
                            <span className="text-xs font-cad font-bold text-[#EDEBE6]">{matched.title}</span>
                            <span className="text-[10px] font-cad font-bold text-[#25D366] group-hover:underline flex items-center gap-1">
                              Join Group <ChevronRight size={12} />
                            </span>
                          </a>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* Digital Entry Pass Preview Card */}
              <div className="relative max-w-sm mx-auto">
                <div ref={passRef} className="bg-black border-2 border-[#C8922A] p-6 text-left relative overflow-hidden shadow-2xl">
                  {/* Background CAD Grid Overlay */}
                  <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" />

                  {/* Pass Header */}
                  <div className="flex justify-between items-start border-b border-[#C8922A]/40 pb-4 mb-5 relative z-10">
                    <div>
                      <span className="text-[9px] text-[#C8922A] font-cad font-bold tracking-[0.3em] uppercase block">
                        DEPT OF CIVIL ENGG
                      </span>
                      <h3 className="font-cinzel font-black text-xl text-[#EDEBE6] tracking-widest uppercase">
                        ADAGE'26 PASS
                      </h3>
                    </div>
                    <Award size={24} className="text-[#C8922A]" />
                  </div>

                  {/* QR Code */}
                  <div className="bg-white p-3 inline-block border border-[#C8922A] mb-5 relative z-10 w-full text-center">
                    {qrBlobUrl ? (
                      <img src={qrBlobUrl} alt="Pass QR Code" className="w-40 h-40 mx-auto" />
                    ) : (
                      <div className="w-40 h-40 flex items-center justify-center mx-auto">
                        <Loader className="animate-spin text-[#C8922A]" size={24} />
                      </div>
                    )}
                    <span className="text-[9px] font-cad font-bold text-black block mt-1 tracking-widest">
                      ID: {createdRecord.id}
                    </span>
                  </div>

                  {/* Participant Info */}
                  <div className="space-y-3 font-cad text-xs relative z-10 border-t border-white/[0.08] pt-4">
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase tracking-wider block">NAME</span>
                      <strong className="text-[#EDEBE6] uppercase">{createdRecord.name}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase tracking-wider block">COLLEGE</span>
                      <span className="text-gray-300">{createdRecord.college}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/[0.06] pt-2">
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase tracking-wider block">TOTAL FEE</span>
                        <strong className="text-[#C8922A]">₹{createdRecord.totalFee}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-gray-500 uppercase tracking-wider block">VERIFICATION</span>
                        <span className="text-amber-400 font-bold">PENDING</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <button
                  onClick={() => navigate("/verify")}
                  className="btn-primary justify-center py-4 text-xs tracking-widest sm:flex-1"
                >
                  CHECK STATUS <ArrowRight size={16} />
                </button>
                <button
                  onClick={handleDownloadPass}
                  disabled={isDownloading}
                  className="btn-ghost justify-center py-4 text-xs tracking-widest sm:flex-1 disabled:opacity-50"
                >
                  {isDownloading ? <Loader className="animate-spin" size={16} /> : <Download size={16} />}
                  DOWNLOAD PASS
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
