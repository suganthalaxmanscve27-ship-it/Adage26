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
        </div>

        {/* 3 Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 animate-fade-in-up">
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
      </div>
    </div>
  );
}
