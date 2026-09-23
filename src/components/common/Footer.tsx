import React from 'react';
import { HARDWARE_CATEGORIES } from '../../data/hardwareData';
import { Mountain, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onGoToOverview: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onGoToOverview }) => {
  return (
    <footer className="w-full bg-[#08090C] border-t border-[#1A1D27] text-[#8E95A5] pt-14 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Col 1: Brand & SIH Context */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF5A36] to-[#FF7A45] flex items-center justify-center text-white">
                <Mountain className="w-4 h-4" />
              </div>
              <span className="font-sans font-black text-white text-lg tracking-tight">
                SilentResQ
              </span>
            </div>
            <p className="text-xs text-[#9DA4B4] leading-relaxed max-w-sm">
              Autonomous Hybrid Fixed-Wing VTOL / Quadplane for Post-Disaster Search & Rescue. Engineered for zero-runway operations, dual-spectrum human detection, edge AI processing, and offline decentralized LoRa communication.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#10B981]">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>SIH TECHNICAL APPROACH ARCHITECTURE</span>
            </div>
          </div>

          {/* Col 2: Subsystem Domains */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              HARDWARE DOMAINS
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {HARDWARE_CATEGORIES.filter(c => c.id !== 'ALL').map(cat => (
                <button
                  key={cat.id}
                  onClick={onGoToOverview}
                  className="text-left text-[#8E95A5] hover:text-[#FF5A36] transition-colors cursor-pointer"
                >
                  · {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Col 3: Technical Specifications Baseline */}
          <div className="md:col-span-3 space-y-3 font-mono text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider">
              AIRCRAFT METRICS
            </h4>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between border-b border-[#1A1D27] pb-1">
                <span>WINGSPAN:</span>
                <span className="text-white">2,100 mm (2.1 m)</span>
              </div>
              <div className="flex justify-between border-b border-[#1A1D27] pb-1">
                <span>MTOW:</span>
                <span className="text-white">6.5 – 7.2 kg</span>
              </div>
              <div className="flex justify-between border-b border-[#1A1D27] pb-1">
                <span>ENDURANCE:</span>
                <span className="text-[#FF5A36] font-bold">60 – 85 min</span>
              </div>
              <div className="flex justify-between border-b border-[#1A1D27] pb-1">
                <span>AI COMPUTER:</span>
                <span className="text-white">Jetson Orin Nano (40 TOPS)</span>
              </div>
              <div className="flex justify-between">
                <span>RESCUE LINK:</span>
                <span className="text-[#10B981] font-bold">SX1262 LoRa (Offline)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-[#161822] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#6A7285]">
          <div>
            © {new Date().getFullYear()} SilentResQ Project. Smart India Hackathon Autonomous Search & Rescue.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#10B981]">● SYSTEM READY</span>
            <span>25 HARDWARE MODULES INTEGRATED</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
