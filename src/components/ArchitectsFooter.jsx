import React from 'react';

export default function ArchitectsFooter() {
  const developers = [
    {
      name: "SUGANTH LAXMAN",
      dept: "DEPARTMENT OF CIVIL ENGINEERING"
    },
    {
      name: "JEO JUSTIN J K",
      dept: "DEPARTMENT OF COMPUTER SCIENCE AND ENGINNERING"
    }
  ];

  return (
    <footer className="w-full bg-[#050505] border-t border-white/10 relative overflow-hidden text-[#EDEBE6] z-10 py-12 sm:py-16">
      {/* Background blueprint draft grid overlay */}
      <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Decorative top amber beam */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C8922A] to-transparent opacity-70 absolute top-0 left-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── ARCHITECTS OF THE DIGITAL STAGE SECTION ──────────────────────── */}
        <div className="flex flex-col items-center text-center space-y-8 sm:space-y-10">
          
          {/* Header with Code symbol </ > */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-[#C8922A] font-mono font-bold text-lg sm:text-xl tracking-tighter bg-[#C8922A]/10 px-2.5 py-1 rounded border border-[#C8922A]/30">
              &lt;/&gt;
            </span>
            <h2 className="font-cinzel font-bold text-xs sm:text-sm md:text-base text-[#C8922A] uppercase tracking-[0.3em] sm:tracking-[0.5em] glow-text-gold">
              ARCHITECTS OF THE DIGITAL STAGE
            </h2>
          </div>

          {/* Developer Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full max-w-2xl">
            {developers.map((dev, i) => (
              <div 
                key={i}
                className="group relative bg-[#090909]/90 border border-white/[0.08] hover:border-[#C8922A]/50 p-6 sm:p-7 rounded-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(200,146,42,0.12)] flex flex-col items-center text-center"
              >
                {/* Blueprint corner accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#C8922A]/40 group-hover:border-[#C8922A] transition-colors" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#C8922A]/40 group-hover:border-[#C8922A] transition-colors" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#C8922A]/40 group-hover:border-[#C8922A] transition-colors" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#C8922A]/40 group-hover:border-[#C8922A] transition-colors" />

                <div className="font-cinzel font-black text-lg sm:text-xl text-[#EDEBE6] tracking-wider mb-2 group-hover:text-[#C8922A] transition-colors">
                  {dev.name}
                </div>
                <div className="font-cad text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">
                  {dev.dept}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </footer>
  );
}
