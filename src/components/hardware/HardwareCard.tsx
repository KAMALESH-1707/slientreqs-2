import React from 'react';
import { HardwareComponent } from '../../types/hardware';
import { ComponentArtwork } from './ComponentArtwork';
import { Info, Box } from 'lucide-react';

interface HardwareCardProps {
  component: HardwareComponent;
  onExplore: (component: HardwareComponent) => void;
}

export const HardwareCard: React.FC<HardwareCardProps> = ({ component, onExplore }) => {
  return (
    <div
      onClick={() => onExplore(component)}
      className="group relative bg-[#11131A] border border-[#222634] hover:border-[#FF5A36] rounded-xl overflow-hidden transition-all duration-300 flex flex-col justify-between hover:shadow-[0_14px_30px_rgba(0,0,0,0.7)] hover:-translate-y-1 cursor-pointer"
    >
      {/* Visual Stage with Real Photographic Image */}
      <div className="relative w-full h-40 bg-[#090A0E] p-3 flex items-center justify-center overflow-hidden border-b border-[#1C1F2B]">
        <ComponentArtwork
          id={component.id}
          mode="thumb"
          alt={component.name}
          className="w-full h-full max-h-36 object-contain"
        />

        {/* Number badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-0.5 rounded bg-[#161822]/90 backdrop-blur-xs border border-[#2B3042] text-[10px] font-mono text-[#A1A7B5] uppercase font-bold">
            #{component.number.toString().padStart(2, '0')}
          </span>
        </div>

        {/* 3D indicator icon on top right */}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-[#161822]/90 border border-[#2B3042] text-[#FF5A36] text-[10px] font-mono font-bold flex items-center gap-1">
          <Box className="w-3 h-3" />
          <span>3D</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Component Name */}
          <h3 className="text-sm font-bold text-white font-sans tracking-tight group-hover:text-[#FF5A36] transition-colors line-clamp-1">
            {component.name}
          </h3>

          {/* Category Pill */}
          <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-[#181B26] text-[#FF5A36] font-medium border border-[#262C3E]">
              {component.category}
            </span>
            <span className="text-[#8E93A3]">
              Qty: {component.quantity}
            </span>
          </div>

          {/* Short Functional Description */}
          <p className="text-xs text-[#9AA0AF] leading-relaxed mt-2 line-clamp-2">
            {component.role}
          </p>
        </div>

        {/* Bottom CTA: Explicit prominent INFO button */}
        <div className="pt-2.5 border-t border-[#1C1F2B] flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono font-semibold text-[#D4CDBC]">
            {component.approxPrice}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onExplore(component);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5A36] hover:bg-[#E04826] text-white text-xs font-mono font-bold transition-all shadow-md shadow-[#FF5A36]/20 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>INFO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
