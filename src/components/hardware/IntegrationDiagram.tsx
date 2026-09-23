import React from 'react';
import { ArrowRight, Zap, Cpu, Radio, ShieldCheck, Activity } from 'lucide-react';

interface IntegrationDiagramProps {
  nodes: string[];
  description: string;
  flowType: 'propulsion' | 'ai_sensing' | 'navigation' | 'communication' | 'power_avionics' | 'control_safety';
  highlightNode?: string;
}

export const IntegrationDiagram: React.FC<IntegrationDiagramProps> = ({
  nodes,
  description,
  flowType,
  highlightNode
}) => {
  const getFlowMeta = () => {
    switch (flowType) {
      case 'propulsion':
        return {
          icon: Zap,
          title: 'PROPULSION & MOTOR POWER PATH',
          badgeBg: 'bg-[#FF5A36]/10 text-[#FF5A36] border-[#FF5A36]/30',
          accent: '#FF5A36'
        };
      case 'ai_sensing':
        return {
          icon: Cpu,
          title: 'AI INFERENCE & DUAL-SPECTRUM FUSION CHAIN',
          badgeBg: 'bg-[#FF5A36]/10 text-[#FF5A36] border-[#FF5A36]/30',
          accent: '#FF5A36'
        };
      case 'communication':
        return {
          icon: Radio,
          title: 'OFFLINE RESCUE COMMUNICATION PIPELINE',
          badgeBg: 'bg-[#818CF8]/10 text-[#818CF8] border-[#818CF8]/30',
          accent: '#818CF8'
        };
      case 'navigation':
        return {
          icon: Activity,
          title: 'NAVIGATION SENSOR FUSION & FLIGHT LOOP',
          badgeBg: 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30',
          accent: '#38BDF8'
        };
      default:
        return {
          icon: ShieldCheck,
          title: 'SYSTEM SAFETY & POWER INTEGRATION',
          badgeBg: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30',
          accent: '#10B981'
        };
    }
  };

  const meta = getFlowMeta();
  const Icon = meta.icon;

  return (
    <div className="bg-[#12141D] border border-[#232738] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
      {/* Title Bar */}
      <div className="flex items-center justify-between border-b border-[#1E2230] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#181B26] border border-[#282D3D] flex items-center justify-center text-[#FF5A36]">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#FF5A36] uppercase font-bold block">
              SYSTEM ARCHITECTURE BUS
            </span>
            <h4 className="text-white font-sans font-bold text-sm">
              {meta.title}
            </h4>
          </div>
        </div>
      </div>

      {/* Sequential Flow Nodes */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {nodes.map((node, index) => {
            const isTarget = highlightNode && node.toLowerCase().includes(highlightNode.toLowerCase());
            return (
              <React.Fragment key={index}>
                <div
                  className={`px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                    isTarget
                      ? 'bg-[#FF5A36] text-white font-bold shadow-lg shadow-[#FF5A36]/30 border border-[#FF5A36]'
                      : 'bg-[#0A0B0E] text-[#D8DDE8] border border-[#1E2230]'
                  }`}
                >
                  <span className="text-[9px] opacity-70">#{index + 1}</span>
                  <span>{node}</span>
                </div>

                {index < nodes.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-[#555C70] shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Narrative Explanation */}
      <p className="text-xs text-[#8E95A5] leading-relaxed pt-1 font-sans">
        {description}
      </p>
    </div>
  );
};
