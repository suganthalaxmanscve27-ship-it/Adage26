import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#050505] border-t border-white/10 relative overflow-hidden text-[#EDEBE6] z-10 py-8 text-center">
      {/* Background blueprint draft grid overlay */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 space-y-2 relative z-10">
        <p className="font-cinzel text-xs sm:text-sm tracking-widest text-[#C8922A] uppercase font-bold">
          ADAGE '26 · DEPARTMENT OF CIVIL ENGINEERING
        </p>
        <p className="font-cad text-xs sm:text-sm tracking-wider text-gray-300">
          Created by <span className="text-[#C8922A] font-bold">Sugantha Laxman S</span>
        </p>
        <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
          Government College of Engineering, Erode
        </p>
      </div>
    </footer>
  );
}
