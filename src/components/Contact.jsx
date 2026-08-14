import React from 'react';
import { Mail, Phone, Globe, MapPin, ExternalLink } from 'lucide-react';

export default function Contact() {
  const infoCards = [
    {
      icon: <Mail size={22} className="text-[#C8922A]" />,
      label: 'DIRECT EMAIL',
      val: 'civiladagegce@gmail.com',
      link: 'mailto:civiladagegce@gmail.com',
      actionText: 'Send Email ↗'
    },
    {
      icon: <Phone size={22} className="text-[#C8922A]" />,
      label: 'PHONE CONTACT',
      val: '+91 81225 78554',
      link: 'tel:+918122578554',
      actionText: 'Call Us ↗'
    },
    {
      icon: <Globe size={22} className="text-[#C8922A]" />,
      label: 'INSTAGRAM / SOCIAL',
      val: '@adage_gceerode',
      link: 'https://instagram.com/adage_gceerode',
      actionText: 'Follow ↗'
    },
    {
      icon: <MapPin size={22} className="text-[#C8922A]" />,
      label: 'VENUE LOCATION',
      val: 'Civil Block, GCE Erode, Suriyampalayam — 638 316',
      link: 'https://maps.app.goo.gl/dpZ1Amf1r3dFJqK29',
      actionText: 'Open Map ↗'
    }
  ];

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mb-10 sm:mb-12 animate-fade-in-up">
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            <span className="w-6 sm:w-8 h-px bg-[#C8922A]" />
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-[#C8922A] font-bold">
              GET IN TOUCH
            </span>
          </div>
          <h2 className="font-cinzel font-black text-2xl sm:text-4xl text-[#EDEBE6] uppercase tracking-wide">
            Official Contact & Support
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm font-cad mt-2">
            For inquiries, event questions, or symposium assistance, reach out directly via email or telephone.
          </p>
        </div>

        {/* 4 Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 animate-fade-in-up">
          {infoCards.map((card, idx) => (
            <a
              key={idx}
              href={card.link}
              target={card.link.startsWith('http') ? '_blank' : '_self'}
              rel="noreferrer"
              className="bg-[#0C0C0C]/90 border border-white/10 hover:border-[#C8922A]/50 p-6 rounded-2xl transition-all duration-300 group flex flex-col justify-between hover:bg-[#111] shadow-lg relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="p-3 bg-[#C8922A]/10 border border-[#C8922A]/20 rounded-xl inline-block group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <span className="text-[9px] font-mono text-[#C8922A] font-bold tracking-widest uppercase block">
                  {card.label}
                </span>
                <p className="text-white font-cad font-bold text-xs sm:text-sm break-all leading-snug">
                  {card.val}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-cad text-gray-400 group-hover:text-[#C8922A] font-bold transition-colors">
                <span>{card.actionText}</span>
                <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </a>
          ))}
        </div>

        {/* Google Maps Location Banner */}
        <div className="bg-[#0C0C0C] border border-white/10 rounded-2xl overflow-hidden relative group h-56 sm:h-64 shadow-xl">
          <iframe
            title="GCE Erode Location Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3910.3702587508753!2d77.67876877508535!3d11.45524318873722!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba9680a653bb7e5%3A0xbefbe4fd0a790589!2sGovernment%20College%20of%20Engineering%2C%20Erode!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            className="border-0 opacity-40 hover:opacity-75 transition-opacity duration-300 grayscale hover:grayscale-0"
            allowFullScreen
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-white font-cinzel font-bold text-xs sm:text-sm uppercase tracking-wider">
                Government College of Engineering, Erode
              </p>
              <p className="text-gray-400 text-[10px] font-cad">
                Department of Civil Engineering · Suriyampalayam, Erode — 638 316
              </p>
            </div>
            <a
              href="https://maps.app.goo.gl/dpZ1Amf1r3dFJqK29"
              target="_blank"
              rel="noreferrer"
              className="btn-outline-gold py-2 px-4 text-[10px] tracking-widest uppercase flex-shrink-0"
            >
              Open in Google Maps ↗
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
