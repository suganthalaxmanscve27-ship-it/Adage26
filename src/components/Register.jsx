import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Info, Users, Smartphone, ShieldCheck, Award, ArrowLeft, ArrowRight, Loader, Cpu, Sparkles, Layers, CreditCard, ChevronRight, QrCode, Upload, Image, FileCheck, ExternalLink, X, Mail, Clock, HelpCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../supabase';
import { Sr, Pt, ut, calculatePricing } from '../events';
import { uploadScreenshotToGoogleDrive } from '../utils/googleDrive';
import { sendRegistrationSuccessEmail } from '../utils/brevo';

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

  const rawActiveEvents = dbEvents.length > 0 ? dbEvents : Sr;
  const activeEvents = [...rawActiveEvents].sort((a, b) => {
    const aIsTech = a.category === Pt.TECHNICAL || a.category === 'Technical';
    const bIsTech = b.category === Pt.TECHNICAL || b.category === 'Technical';
    if (aIsTech && !bIsTech) return -1;
    if (!aIsTech && bIsTech) return 1;
    return 0;
  });
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdRecord, setCreatedRecord] = useState(null);
  const [emailDeliveryStatus, setEmailDeliveryStatus] = useState("idle"); // 'idle' | 'sending' | 'sent' | 'failed'

  const [showBundleModal, setShowBundleModal] = useState(false);
  const [hasShownFirstClickModal, setHasShownFirstClickModal] = useState(false);

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

  const upiId = "sukanthalax@oksbi";
  const payeeName = "Suganth S";
  const techBaseFee = 200;
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
  
  // Reusable Fee Calculation:
  const pricingDetails = calculatePricing(techCount, nonTechCount, totalParticipants);
  const { normalTotal, discount: discountPerHead, baseRate, totalPayableFee, bundleEventsCount, extraTechCount, extraNonTechCount, isBundleApplied } = pricingDetails;

  // Selected event details for dynamic UPI QR generation
  const selectedEvent = selectedEventsList[0];

  // Dynamic safe numeric fee calculation based on selected event(s) and participants
  const rawFee = typeof totalPayableFee === 'number' && !isNaN(totalPayableFee) ? totalPayableFee : 0;

  // Ensure amount is strictly a valid finite positive number (no NaN, undefined, null, or string formatting)
  const numericAmount = (typeof rawFee === 'number' && !isNaN(rawFee) && isFinite(rawFee) && rawFee >= 0) ? rawFee : 0;

  // Dynamic UPI payment URI: upi://pay?pa=sukanthalax@oksbi&pn=Suganth%20S&am=<amount>&cu=INR
  const upiPaymentUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${numericAmount}&cu=INR`;


  const initialParamHandledRef = useRef(false);

  // Pre-select event from query params on initial load (without locking user from unselecting)
  useEffect(() => {
    if (initialParamHandledRef.current) return;
    const params = new URLSearchParams(location.search);
    const eventId = params.get('eventId');
    if (eventId && activeEvents.length > 0) {
      const targetEvent = activeEvents.find(e => e.id === eventId);
      if (targetEvent) {
        initialParamHandledRef.current = true;
        setForm(prev => {
          if (prev.selectedEvents.length > 0) return prev;
          const events = [eventId];
          
          const filteredList = activeEvents.filter(e => events.includes(e.id));
          const maxCap = filteredList.some(e => e.category === Pt.TECHNICAL || e.category === 'Technical')
            ? Math.max(...filteredList.filter(e => e.category === Pt.TECHNICAL || e.category === 'Technical').map(e => e.maxMembers || 1))
            : filteredList.length > 0
            ? Math.max(...filteredList.map(e => e.maxMembers || 1))
            : 1;

          const members = [...prev.teamMembers].slice(0, maxCap - 1);
          while (members.length < maxCap - 1) {
            members.push("");
          }

          return { ...prev, selectedEvents: events, teamMembers: members };
        });
      }
    }
  }, [location.search, activeEvents]);

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
        events.push(id);
        // Show explanation modal when user clicks their first event
        if (prev.selectedEvents.length === 0 && !hasShownFirstClickModal) {
          setShowBundleModal(true);
          setHasShownFirstClickModal(true);
        }
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
        totalFee: numericAmount,
        transactionId: form.transactionId,
        screenshotUrl: finalScreenshotUrl || null,
        status: ut.PENDING,
        timestamp: new Date().toISOString()
      };

      const { error: dbError } = await supabase.from('registrations').insert([payload]);
      if (dbError) {
        if (dbError.message?.includes("registrations_transactionid_unique") || dbError.code === "23505") {
          throw new Error("This 12-digit Transaction ID (UTR) has already been registered in our system. Please check your transaction details.");
        }
        throw dbError;
      }

      setCreatedRecord(payload);
      localStorage.setItem('adage_user_email', payload.email);
      setStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Automatically send confirmation email with details via Brevo
      setEmailDeliveryStatus("sending");
      sendRegistrationSuccessEmail(payload)
        .then((res) => {
          if (res.success) {
            setEmailDeliveryStatus("sent");
          } else {
            console.warn("Brevo email send returned notice:", res.error);
            setEmailDeliveryStatus("failed");
          }
        })
        .catch((err) => {
          console.error("Brevo email dispatch failed:", err);
          setEmailDeliveryStatus("failed");
        });
    } catch (err) {
      console.error("Submission failed:", err);
      setError({
        message: err.message || "Failed to complete registration. Please verify database connection."
      });
    } finally {
      setIsSubmitting(false);
    }
  };



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
              REGISTRATION PORTAL
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
              {/* Explanation Modal */}
              {showBundleModal && (
                <div
                  className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
                  onClick={() => setShowBundleModal(false)}
                >
                  <div
                    className="bg-[#0E0E0E] border-2 border-[#C8922A] w-full max-w-md relative p-5 sm:p-6 shadow-[0_0_50px_rgba(200,146,42,0.35)] text-center animate-scale-up"
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Architectural corner accents */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#C8922A]" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#C8922A]" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#C8922A]" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#C8922A]" />

                    <button
                      onClick={() => setShowBundleModal(false)}
                      className="absolute top-3.5 right-3.5 text-gray-400 hover:text-white transition-colors p-1"
                    >
                      <X size={18} />
                    </button>

                    {/* Top Callout */}
                    <div className="mb-2">
                      <span className="text-[9px] sm:text-[10px] font-cad font-black text-[#C8922A] tracking-[0.2em] uppercase bg-[#C8922A]/10 border border-[#C8922A]/30 px-3 py-1 inline-block">
                        NO EXTRA CHARGE FOR YOUR 2ND + 3RD + 4TH EVENT
                      </span>
                    </div>

                    {/* Header */}
                    <div className="mb-2">
                      <span className="text-[9px] font-cad font-bold text-gray-400 tracking-[0.3em] uppercase block">
                        ADAGE ’26 BASE PASS
                      </span>
                      <h3 className="font-cinzel font-black text-2xl sm:text-3xl text-[#EDEBE6] tracking-wider mt-0.5">
                        ₹350 <span className="text-xs font-cad text-gray-400 font-normal">/ PARTICIPANT</span>
                      </h3>
                    </div>

                    {/* Hero Tagline */}
                    <div className="bg-[#C8922A]/15 border border-[#C8922A]/40 py-1.5 px-3 mb-3.5 inline-block">
                      <p className="text-xs sm:text-sm font-cad font-bold text-[#C8922A] uppercase tracking-wider">
                        🎟️ ₹350 BASE PASS — UP TO 4 EVENTS
                      </p>
                    </div>

                    {/* Choose up to limits */}
                    <div className="text-left bg-black/60 border border-white/[0.08] p-3 mb-3 space-y-2">
                      <div className="flex items-center justify-between p-2 bg-amber-500/5 border border-amber-500/20 text-xs font-cad">
                        <span className="flex items-center gap-1.5 text-gray-200">
                          ⚡ <strong>Up to 2 Technical</strong>
                        </span>
                        <span className="font-mono text-[11px] text-amber-400 font-bold">
                          TECHNICAL {techCount} / 2
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-cyan-500/5 border border-cyan-500/20 text-xs font-cad">
                        <span className="flex items-center gap-1.5 text-gray-200">
                          🎨 <strong>Up to 2 Non-Technical</strong>
                        </span>
                        <span className="font-mono text-[11px] text-cyan-400 font-bold">
                          NON-TECHNICAL {nonTechCount} / 2
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => setShowBundleModal(false)}
                      className="w-full btn-primary justify-center py-3 text-xs font-bold font-cad tracking-[0.2em]"
                    >
                      GOT IT — SELECT EVENTS
                    </button>
                  </div>
                </div>
              )}

              {/* Title & Badge Header */}
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
                  <span className="text-gray-400">Base Pass: <strong className="text-[#C8922A]">₹350</strong></span>
                  <span className="text-white/20">|</span>
                  <span className="text-gray-400">Includes: <strong className="text-[#C8922A]">Up to 4 Events</strong></span>
                </div>
              </div>

              {/* Prominent Badge Bar with Live Limit Trackers */}
              <div className="bg-[#111111] border border-[#C8922A]/40 p-4 sm:p-5 relative overflow-hidden shadow-lg space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#C8922A]/20 border border-[#C8922A] flex items-center justify-center text-[#C8922A] flex-shrink-0 text-lg">
                      🎟️
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-cinzel font-black text-sm sm:text-base text-[#EDEBE6] tracking-wide">
                          ₹350 = UP TO 4 EVENTS
                        </span>
                        <span className="text-[9px] font-cad font-bold text-[#C8922A] bg-[#C8922A]/10 border border-[#C8922A]/30 px-2 py-0.5 uppercase tracking-wider">
                          2 Technical + 2 Non-Technical
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-cad mt-0.5">
                        Your base ₹350 pass includes up to 2 Tech + 2 Non-Tech competitions.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowBundleModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-cad font-bold text-[#C8922A] hover:text-[#EDEBE6] underline underline-offset-4 self-start md:self-auto transition-colors"
                  >
                    <HelpCircle size={14} />
                    <span>How does the ₹350 pass work?</span>
                  </button>
                </div>

                {/* Live Category Trackers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/[0.08]">
                  {/* Technical Live Tracker */}
                  <div className={`p-3 border transition-colors ${techCount >= 2 ? 'bg-amber-500/10 border-amber-500/40' : 'bg-black/40 border-white/[0.06]'}`}>
                    <div className="flex justify-between items-center text-xs font-cad font-bold mb-1">
                      <span className="flex items-center gap-1.5 text-amber-400">
                        ⚡ TECHNICAL EVENTS
                      </span>
                      <span className={`font-mono text-xs px-2 py-0.5 rounded ${techCount >= 2 ? 'bg-amber-500 text-black font-black' : 'text-gray-300 bg-white/10'}`}>
                        TECHNICAL {techCount} / 2
                      </span>
                    </div>
                    <p className="text-[10px] font-cad">
                      {techCount >= 2 ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Check size={12} /> Technical limit reached — 2/2 {techCount > 2 ? `(+${techCount - 2} Extra @ ₹200)` : '(Included)'}
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          {2 - techCount} more Technical event{2 - techCount > 1 ? 's' : ''} included free in pass
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Non-Technical Live Tracker */}
                  <div className={`p-3 border transition-colors ${nonTechCount >= 2 ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-black/40 border-white/[0.06]'}`}>
                    <div className="flex justify-between items-center text-xs font-cad font-bold mb-1">
                      <span className="flex items-center gap-1.5 text-cyan-400">
                        🎨 NON-TECHNICAL EVENTS
                      </span>
                      <span className={`font-mono text-xs px-2 py-0.5 rounded ${nonTechCount >= 2 ? 'bg-cyan-500 text-black font-black' : 'text-gray-300 bg-white/10'}`}>
                        NON-TECHNICAL {nonTechCount} / 2
                      </span>
                    </div>
                    <p className="text-[10px] font-cad">
                      {nonTechCount >= 2 ? (
                        <span className="text-cyan-400 font-bold flex items-center gap-1">
                          <Check size={12} /> Non-Technical limit reached — 2/2 {nonTechCount > 2 ? `(+${nonTechCount - 2} Extra @ ₹150)` : '(Included)'}
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          {2 - nonTechCount} more Non-Technical event{2 - nonTechCount > 1 ? 's' : ''} included free in pass
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeEvents.map(event => {
                  const isSelected = form.selectedEvents.includes(event.id);
                  const isTech = event.category === Pt.TECHNICAL || event.category === 'Technical';
                  const isNonTech = event.category === Pt.NON_TECHNICAL || event.category === 'Non-Technical';

                  let isCoveredInBundle = false;
                  if (isSelected && isBundleApplied) {
                    const techIndex = techSelectedList.findIndex(e => e.id === event.id);
                    const nonTechIndex = nonTechSelectedList.findIndex(e => e.id === event.id);
                    if (isTech && techIndex >= 0 && techIndex < 2) {
                      isCoveredInBundle = true;
                    } else if (isNonTech && nonTechIndex >= 0 && nonTechIndex < 2) {
                      isCoveredInBundle = true;
                    }
                  }

                  const canBeCoveredInBundle = isTech ? techCount < 2 : nonTechCount < 2;

                  return (
                    <div
                      key={event.id}
                      onClick={() => toggleEventSelection(event.id)}
                      className={`p-5 border transition-all duration-300 relative group cursor-pointer ${
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
                        <span className="font-bold text-xs">
                          {isSelected ? (
                            isCoveredInBundle ? (
                              <span className="text-emerald-400 font-black flex items-center gap-1">
                                <Check size={12} /> INCLUDED IN ₹350 PASS
                              </span>
                            ) : (
                              <span className="text-[#C8922A] font-black">
                                +₹{isTech ? techBaseFee : nonTechBaseFee} (EXTRA)
                              </span>
                            )
                          ) : canBeCoveredInBundle ? (
                            <span className="text-emerald-400/90 font-medium">
                              Included in ₹350 Pass
                            </span>
                          ) : (
                            <span className="text-gray-400">
                              +₹{isTech ? techBaseFee : nonTechBaseFee} (Extra Event)
                            </span>
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
                    {discountPerHead > 0 && (
                      <span className="text-emerald-400 font-bold ml-2">(Bundle Savings: -₹{discountPerHead}/head)</span>
                    )}
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
                    Team Profile 
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
                {/* QR Code Dynamic Container */}
                <div className="bg-[#080808] border border-white/[0.08] p-6 text-center relative group">
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-[#C8922A]" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-[#C8922A]" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-[#C8922A]" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-[#C8922A]" />

                  <span className="text-[9px] text-[#C8922A] font-cad font-bold uppercase tracking-widest block mb-4">
                    UPI PAYMENT DETAILS
                  </span>

                  {/* QR Code Container */}
                  <div className="bg-white p-4 border border-[#C8922A]/40 inline-flex flex-col items-center justify-center mb-4 shadow-xl rounded-lg overflow-hidden max-w-full">
                    <div className="p-2 bg-white rounded-md">
                      <QRCodeSVG
                        value={upiPaymentUri}
                        size={220}
                        level="M"
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                        includeMargin={false}
                        style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
                        className="w-48 h-48 sm:w-56 sm:h-56 mx-auto"
                      />
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-gray-200 w-full text-center">
                      <p className="text-xs sm:text-sm font-bold font-sans text-gray-900 tracking-wide">
                        Scan to pay <span className="text-[#C8922A] font-black">₹{numericAmount}</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/80 border border-white/[0.08] p-3 text-center space-y-1">
                    <p className="text-[9px] text-gray-400 font-cad uppercase">Payee: <strong className="text-white">{payeeName}</strong></p>
                    <p className="text-xs sm:text-sm font-mono font-bold text-[#C8922A] select-all tracking-wider">
                      {upiId}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-cad font-bold pt-0.5">
                      Payable: ₹{numericAmount}
                    </p>
                  </div>

                  <div className="mt-3">
                    <a
                      href={upiPaymentUri}
                      className="inline-flex items-center gap-1.5 text-[11px] font-cad font-bold text-[#C8922A] hover:text-[#EDEBE6] underline underline-offset-4 transition-colors"
                    >
                      <span>Pay via UPI App</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {/* Verification & UTR Input */}
                <div className="space-y-6">
                  <div className="bg-[#080808] border border-white/[0.08] p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[#C8922A] text-xs font-cad font-bold uppercase">
                      <Info size={14} /> Verification Guidelines
                    </div>
                    <ul className="text-[11px] text-gray-400 font-cad space-y-2 list-disc pl-4 leading-relaxed">
                      <li>Pay exact total: <strong className="text-[#C8922A]">₹{numericAmount}</strong> using GPay, PhonePe, or Paytm.</li>
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
                      <strong className="text-[#EDEBE6] text-sm font-bold">₹{numericAmount}</strong>
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
            <div className="p-6 sm:p-10 md:p-12 text-center animate-fade-in space-y-6 sm:space-y-8">
              <div className="w-16 h-16 bg-[#C8922A]/20 border border-[#C8922A] text-[#C8922A] flex items-center justify-center mx-auto glow-gold">
                <Check size={32} strokeWidth={3} />
              </div>

              <div>
                <span className="text-[10px] text-[#C8922A] font-cad font-bold uppercase tracking-[0.3em]">
                  REGISTRATION COMPLETED
                </span>
                <h2 className="font-cinzel font-black text-2xl sm:text-4xl text-[#EDEBE6] uppercase tracking-wide mt-1 mb-2">
                  REGISTRATION SUCCESSFUL
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 font-cad max-w-lg mx-auto">
                  Registration Ref: <span className="text-[#C8922A] font-bold font-mono tracking-wider">{createdRecord.id}</span> • UTR: <span className="text-[#C8922A] font-bold font-mono">{createdRecord.transactionId}</span>
                </p>
              </div>

              {/* Payment Review Notice Card */}
              <div className="max-w-lg mx-auto bg-[#0A0A0A] border border-[#C8922A]/30 p-5 text-left relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#C8922A]" />
                <div className="flex items-start gap-3">
                  <Clock className="text-[#C8922A] flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-xs font-cad font-bold text-[#EDEBE6] uppercase tracking-wider mb-1">
                      PAYMENT UNDER REVIEW
                    </h4>
                    <p className="text-xs text-gray-300 font-cad leading-relaxed">
                      Your payment of <strong className="text-[#C8922A]">₹{createdRecord.totalFee}</strong> has been logged. Our organizing team is reviewing your transaction details and will contact you soon.
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Delivery Feedback Pill */}
              <div className="max-w-lg mx-auto">
                {emailDeliveryStatus === "sending" && (
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3 rounded text-xs font-cad flex items-center justify-center gap-2">
                    <Loader className="animate-spin" size={14} />
                    <span>Sending confirmation email to <strong>{createdRecord.email}</strong> via Brevo...</span>
                  </div>
                )}
                {emailDeliveryStatus === "sent" && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded text-xs font-cad flex items-center justify-center gap-2">
                    <Mail size={14} className="text-emerald-400" />
                    <span>Confirmation email successfully sent to <strong>{createdRecord.email}</strong>!</span>
                  </div>
                )}
                {emailDeliveryStatus === "failed" && (
                  <div className="bg-white/5 border border-white/10 text-gray-400 p-3 rounded text-xs font-cad flex items-center justify-center gap-2">
                    <Mail size={14} className="text-[#C8922A]" />
                    <span>Registration recorded! Check <strong>{createdRecord.email}</strong> inbox or spam for confirmation.</span>
                  </div>
                )}
              </div>

              {/* Registered Events Summary Card */}
              <div className="max-w-lg mx-auto bg-[#080808] border border-white/[0.08] p-5 text-left space-y-3">
                <span className="text-[10px] text-[#C8922A] font-cad font-bold uppercase tracking-wider block">
                  REGISTERED COMPETITIONS
                </span>
                <div className="flex flex-wrap gap-2">
                  {createdRecord.events.map((evTitle, idx) => (
                    <div key={idx} className="bg-[#C8922A]/10 border border-[#C8922A]/30 px-3 py-1.5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C8922A]" />
                      <span className="text-xs font-cad font-bold text-[#EDEBE6]">{evTitle}</span>
                    </div>
                  ))}
                </div>
                {createdRecord.teamMembers && createdRecord.teamMembers.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.06] text-xs font-cad text-gray-400">
                    <span className="text-[10px] uppercase text-gray-500 block mb-1">Team Roster:</span>
                    <span className="text-white font-medium">{form.name} (Lead)</span>
                    {createdRecord.teamMembers.map((m, i) => (
                      <span key={i} className="text-gray-300">, {m}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* WhatsApp Community Groups */}
              {form.selectedEvents.some(id => activeEvents.find(e => e.id === id)?.whatsappLink) && (
                <div className="max-w-lg mx-auto bg-[#080808] border border-white/[0.08] p-5 text-left space-y-3">
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

              {/* Action Button */}
              <div className="flex justify-center max-w-lg mx-auto">
                <button
                  onClick={() => navigate("/verify")}
                  className="btn-primary justify-center py-4 text-xs tracking-widest w-full"
                >
                  CHECK LIVE VERIFICATION STATUS <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
