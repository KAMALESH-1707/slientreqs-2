import React from 'react';
import { HARDWARE_COMPONENTS } from '../../data/hardwareData';
import { HardwareComponent } from '../../types/hardware';
import { Mountain, Box, ArrowLeft } from 'lucide-react';

interface NavbarProps {
  selectedComponent: HardwareComponent | null;
  onBackToOverview: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedComponent,
  onBackToOverview
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0C0E14]/95 backdrop-blur-md border-b border-[#1E2230]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          onClick={onBackToOverview}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF5A36] to-[#FF7A45] flex items-center justify-center text-white shadow-md shadow-[#FF5A36]/20 group-hover:scale-105 transition-transform">
            <Mountain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 leading-none">
              <span className="font-sans font-bold text-lg tracking-tight text-white group-hover:text-[#FF5A36] transition-colors">
                SilentResQ
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#181B26] border border-[#2B3042] text-[#FF5A36] font-bold">
                SIH 2024
              </span>
            </div>
            <span className="text-[10px] text-[#8E95A5] block font-sans tracking-tight">
              Autonomous Mountain Search & Rescue Aircraft
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {selectedComponent ? (
            <button
              onClick={onBackToOverview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5A36] text-white text-xs font-mono font-bold hover:bg-[#E04826] transition-colors cursor-pointer shadow-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ALL 25 COMPONENTS</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141622] border border-[#232738] text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[#8E95A5] hidden sm:inline">SYSTEM STATUS:</span>
              <span className="text-white font-bold">25 MODULES INTEGRATED</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
