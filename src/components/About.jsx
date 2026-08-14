import React from 'react';
import { MapPin, Phone, Mail, Clock, Target, Globe, Users, Cpu, ShieldCheck, Compass, Layers, Award, ArrowUpRight } from 'lucide-react';

export default function About() {
  const stats = [
    { num: '1984', label: 'ESTABLISHED YEAR', spec: 'FOUNDATION' },
    { num: '15+',  label: 'FACULTY EXPERTS', spec: 'PROFESSORS' },
    { num: '200+',label: 'ALUMNI NETWORK', spec: 'ENGINEERS' },
    { num: '8+',  label: 'ADVANCED LABS', spec: 'FACILITIES' },
  ];

  const values = [
    {
      icon: <Target size={22} />,
      tag: '01 // MISSION',
      title: 'Our Educational Mission',
      desc: 'Develop world-class civil engineers through rigorous academics, applied research, and hands-on structural engineering challenges.',
    },
    {
      icon: <Globe size={22} />,
      tag: '02 // VISION',
      title: 'Structural Vision',
      desc: 'A premier engineering institution shaping infrastructure leaders who build sustainable, resilient, and eco-friendly projects for India.',
    },
    {
      icon: <Users size={22} />,
      tag: '03 // ALUMNI LEGACY',
      title: 'Global Engineering Network',
      desc: 'A vibrant network of 5,000+ alumni leading landmark bridge spans, highways, smart cities, and metro projects globally.',
    },
  ];

  const laboratories = [
    //{ title: "Structural Engineering Lab", code: "LAB-01", desc: "Universal testing machines, hydraulic loading frames, and beam deflection rigs." },
    { title: "Strength of Materials", code: "LAB-01", desc: "Total Stations, Auto-levels, GPS mapping systems, and digital theodolites." },
    { title: "Surveying Lab", code: "LAB-02", desc: "Total Stations, Auto-levels, GPS mapping systems, and digital theodolites." },
    { title: "Water Supply & Wastewater Lab", code: "LAB-03", desc: "Compressive testing apparatus, slump cones, aggregate shakers, and curing tanks." },
    { title: "Soil Mechanics Lab", code: "LAB-04", desc: "Direct shear apparatus, triaxial test cells, and compaction permeability units." },
    { title: "Hydraulics Lab", code: "LAB-05", desc: "Venturimeter calibration rigs, flumes, hydraulic turbine models, and centrifugal pumps." },
    { title: "AutoCAD & CAD-Prompt Studio", code: "LAB-06", desc: "High-performance CAD workstations running AutoCAD, STAAD Pro, and structural AI tools." }
  ];

  const contactItems = [
    { icon: <MapPin size={16} />, label: 'CAMPUS ADDRESS', value: 'Suriyampalayam, Vasavi College PO, Erode, Tamil Nadu — 638 316' },
    { icon: <Mail size={16} />,  label: 'DEPARTMENT CONTACT', value: 'civiladagegce@gmail.com' },
    { icon: <Clock size={16} />,  label: 'SYMPOSIUM DATE', value: 'Thursday, 3 September 2026 · 9:00 AM Onwards' },
  ];

  return (
    <div className="py-12 sm:py-20 min-h-screen text-[#EDEBE6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">

        {/* ── 1. Hero Blueprint Specification Header ──────────────────────── */}
        <section className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2">
                <span className="w-8 h-px bg-[#C8922A]" />
                <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8922A] font-cad font-bold">
                  ABOUT DEPT
                </span>
              </div>

              <h1 className="font-cinzel font-black text-3xl sm:text-4xl md:text-5xl text-[#EDEBE6] uppercase tracking-wide leading-tight">
                BUILDING THE FUTURE, <br />
                <span className="text-[#C8922A]">ONE STRUCTURE</span> AT A TIME
              </h1>

              <div className="bg-[#080808] border-l-2 border-[#C8922A] p-5 space-y-3 font-cad text-xs text-gray-300">
                <p className="leading-relaxed">
                  The Department of Civil Engineering at Government College of Engineering, Erode (formerly IRTT) is one of the foundational and most respected engineering faculties in Tamil Nadu.
                </p>
                <p className="leading-relaxed text-gray-400">
                  Established with a commitment to engineering excellence, the department blends classic structural fundamentals with modern computational CAD drafting, BIM modeling, and sustainable materials research.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 bg-[#090909] border border-white/[0.08] px-4 py-2.5 rounded text-xs font-cad">
                  <ShieldCheck size={16} className="text-[#C8922A]" />
                  <span>AICTE Approved</span>
                </div>
                <div className="flex items-center gap-2 bg-[#090909] border border-white/[0.08] px-4 py-2.5 rounded text-xs font-cad">
                  <Award size={16} className="text-[#C8922A]" />
                  <span>Anna University Affiliated</span>
                </div>
              </div>
            </div>

            {/* Right Architectural Image Frame with Corner Accents */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-[#0A0A0A] border border-[#C8922A]/40 p-2 shadow-2xl overflow-hidden group">
                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[#C8922A] z-20" />
                <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-[#C8922A] z-20" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-[#C8922A] z-20" />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-[#C8922A] z-20" />

                {/* CAD Grid Overlay */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-10" />

                <img
                  src="hero_banner.png"
                  alt="Civil Engineering GCE Erode Campus"
                  className="w-full h-64 sm:h-80 object-cover filter contrast-110 brightness-90 group-hover:scale-105 transition-transform duration-700"
                />

                <div className="bg-[#080808] border-t border-[#C8922A]/30 p-4 flex items-center justify-between font-cad text-[10px]">
                  <span className="text-gray-400 uppercase">GCE ERODE CAMPUS STRUCTURAL WING</span>
                  <span className="text-[#C8922A] font-bold">11.4552° N, 77.6788° E</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── 2. Architectural Blueprint Stats Grid ───────────────────────── */}
        <section className="bg-[#080808] border border-white/[0.08] relative">
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-[#C8922A]" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-[#C8922A]" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-[#C8922A]" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-[#C8922A]" />

          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            {stats.map((s, i) => (
              <div key={i} className="p-6 sm:p-8 text-center space-y-2 hover:bg-[#0E0E0E] transition-colors group">
                <span className="text-[8px] font-cad uppercase tracking-[0.3em] text-[#C8922A] block">
                  [{s.spec}]
                </span>
                <p className="font-cinzel font-black text-3xl sm:text-4xl text-[#EDEBE6] group-hover:text-[#C8922A] transition-colors">
                  {s.num}
                </p>
                <p className="text-[10px] font-cad font-bold text-gray-400 uppercase tracking-widest">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. Mission, Vision & Community Values ───────────────────────── */}
        <section className="space-y-8">
          <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#C8922A] font-cad font-bold uppercase tracking-[0.3em] block">SECTION 02</span>
              <h2 className="font-cinzel font-black text-2xl sm:text-3xl text-[#EDEBE6] uppercase">
                DEPARTMENT PILLARS & VALUES
              </h2>
            </div>
            <Compass size={24} className="text-[#C8922A] hidden sm:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="bg-[#090909] border border-white/[0.08] p-6 sm:p-8 space-y-4 hover:border-[#C8922A]/40 transition-all duration-300 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-[#C8922A]/10 border border-[#C8922A]/30 text-[#C8922A] flex items-center justify-center">
                    {v.icon}
                  </div>
                  <span className="text-[9px] font-cad font-bold text-[#C8922A] uppercase tracking-widest">{v.tag}</span>
                </div>

                <h3 className="font-cinzel font-bold text-lg text-[#EDEBE6] uppercase tracking-wide">
                  {v.title}
                </h3>

                <p className="text-xs text-gray-400 font-cad leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. Laboratory Facilities & Research Infrastructure ───────────── */}
        <section className="space-y-8">
          <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#C8922A] font-cad font-bold uppercase tracking-[0.3em] block">SECTION 03</span>
              <h2 className="font-cinzel font-black text-2xl sm:text-3xl text-[#EDEBE6] uppercase">
                LABORATORY & TESTING FACILITIES
              </h2>
            </div>
            <Layers size={24} className="text-[#C8922A] hidden sm:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {laboratories.map((lab, i) => (
              <div key={i} className="bg-[#080808] border border-white/[0.08] p-5 space-y-3 hover:bg-[#0D0D0D] transition-colors relative">
                <div className="flex justify-between items-center text-[9px] font-cad">
                  <span className="text-[#C8922A] font-bold uppercase">{lab.code}</span>
                  <span className="text-gray-500">SPECIFIED</span>
                </div>
                <h4 className="font-cinzel font-bold text-sm text-[#EDEBE6] uppercase tracking-wider">
                  {lab.title}
                </h4>
                <p className="text-[11px] text-gray-400 font-cad leading-relaxed">
                  {lab.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. Venue Specifications & Interactive Location Map ──────────── */}
        <section className="space-y-8">
          <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#C8922A] font-cad font-bold uppercase tracking-[0.3em] block">SECTION 04</span>
              <h2 className="font-cinzel font-black text-2xl sm:text-3xl text-[#EDEBE6] uppercase">
                SYMPOSIUM VENUE & LOCATION
              </h2>
            </div>
            <MapPin size={24} className="text-[#C8922A] hidden sm:block" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Location Specs Box */}
            <div className="lg:col-span-5 bg-[#090909] border border-white/[0.08] p-6 sm:p-8 space-y-6 relative">
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-[#C8922A]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-[#C8922A]" />

              <h3 className="font-cinzel font-bold text-lg text-[#EDEBE6] uppercase tracking-wide">
                Government College of Engineering, Erode
              </h3>

              <div className="space-y-4 font-cad text-xs">
                {contactItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 border-b border-white/[0.06] pb-4 last:border-0 last:pb-0">
                    <div className="w-8 h-8 bg-[#C8922A]/10 border border-[#C8922A]/30 text-[#C8922A] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase tracking-widest block mb-0.5">{item.label}</span>
                      {item.label === 'CAMPUS ADDRESS' ? (
                        <a
                          href="https://maps.app.goo.gl/dpZ1Amf1r3dFJqK29"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-[#C8922A] transition-colors inline-flex items-center gap-1 font-bold"
                        >
                          {item.value} <ArrowUpRight size={14} />
                        </a>
                      ) : (
                        <p className="text-gray-300 font-bold">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="https://maps.app.goo.gl/dpZ1Amf1r3dFJqK29"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-primary justify-center py-4 text-xs tracking-widest block text-center"
              >
                OPEN GOOGLE MAPS DIRECTLY ↗
              </a>
            </div>

            {/* Embedded Google Maps Frame */}
            <div className="lg:col-span-7 bg-[#090909] border border-white/[0.08] p-2 relative h-72 sm:h-96">
              <iframe
                title="GCE Erode Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3910.3702587508753!2d77.67876877508535!3d11.45524318873722!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba9680a653bb7e5%3A0xbefbe4fd0a790589!2sGovernment%20College%20of%20Engineering%2C%20Erode!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                className="border-0 grayscale contrast-125 opacity-75 hover:opacity-100 transition-opacity"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
