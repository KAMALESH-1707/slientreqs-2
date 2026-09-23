import React from 'react';
import { HardwareComponent } from '../../types/hardware';
import { Info } from 'lucide-react';

interface SpecificationPanelProps {
  component: HardwareComponent;
}

export const SpecificationPanel: React.FC<SpecificationPanelProps> = ({ component }) => {
  return (
    <div className="bg-[#12141D] border border-[#232738] rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E2230] pb-4">
        <div>
          <span className="text-xs font-mono tracking-wider text-[#FF5A36] uppercase font-bold block">
            TECHNICAL CHARACTERISTICS
          </span>
          <h4 className="text-white font-sans font-bold text-lg mt-0.5">
            Engineering Specifications
          </h4>
        </div>
        <div className="px-3 py-1 rounded bg-[#1A1D2A] border border-[#2E3344] text-[11px] font-mono font-bold text-[#8E95A5]">
          {component.status}
        </div>
      </div>

      {/* Target Model Citation */}
      {component.manufacturerTarget && (
        <div className="p-3.5 bg-[#0A0B0E] border border-[#1E2230] rounded-lg text-xs font-mono">
          <span className="text-[#8E95A5] block text-[10px] uppercase font-bold mb-0.5 tracking-wider">
            REFERENCE TARGET CLASS:
          </span>
          <span className="text-white font-semibold">{component.manufacturerTarget}</span>
        </div>
      )}

      {/* Two-Column Specifications Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {component.specifications.map((spec, i) => (
          <div
            key={i}
            className={`p-3.5 rounded-lg border flex flex-col justify-between transition-colors ${
              spec.highlight
                ? 'bg-[#1C1619] border-[#FF5A36]/50'
                : 'bg-[#0A0B0E] border-[#1C1F2B]'
            }`}
          >
            <span className="text-[10px] font-mono uppercase text-[#8E95A5] tracking-wider font-semibold">
              {spec.label}
            </span>
            <span
              className={`text-xs font-mono font-bold mt-1 ${
                spec.highlight ? 'text-[#FF5A36]' : 'text-white'
              }`}
            >
              {spec.value}
            </span>
          </div>
        ))}
      </div>

      {/* Engineering Clarification / Honesty Note */}
      <div className="p-3.5 rounded-lg bg-[#0A0B0E] border border-[#1E2230] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#FF5A36] shrink-0 mt-0.5" />
        <p className="text-xs text-[#8E95A5] leading-relaxed">
          SilentResQ specifications are balanced for high-altitude mountain search operations. Values are evaluated for SIH autonomous flight deployment.
        </p>
      </div>
    </div>
  );
};
