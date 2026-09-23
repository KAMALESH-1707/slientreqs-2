import React, { useState, useEffect } from 'react';
import { HardwareComponent } from '../../types/hardware';
import { Component3DViewer } from './Component3DViewer';
import { Product360Viewer } from './Product360Viewer';
import { SpecificationPanel } from './SpecificationPanel';
import { ComponentArtwork } from './ComponentArtwork';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Box,
  Eye,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  Sparkles,
  X
} from 'lucide-react';

interface HardwareDetailProps {
  component: HardwareComponent;
  onBack: () => void;
  onSelectComponent: (component: HardwareComponent) => void;
  allComponents: HardwareComponent[];
}

export const HardwareDetail: React.FC<HardwareDetailProps> = ({
  component,
  onBack,
  onSelectComponent,
  allComponents
}) => {
  const [activeViewMode, setActiveViewMode] = useState<'3D' | '360' | '2D'>('3D');

  // Scroll to top when component changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [component.id]);

  // Navigation: Next / Prev component
  const currentIndex = allComponents.findIndex(c => c.id === component.id);
  const prevComponent =
    currentIndex > 0
      ? allComponents[currentIndex - 1]
      : allComponents[allComponents.length - 1];
  const nextComponent =
    currentIndex < allComponents.length - 1
      ? allComponents[currentIndex + 1]
      : allComponents[0];

  // Online 3D model lookup query URL
  const online3DModelUrl = `https://www.google.com/search?q=${encodeURIComponent(
    (component.manufacturerTarget || component.name) + ' 3d cad model step grabcad'
  )}`;

  return (
    <div className="w-full min-h-screen bg-[#0A0B0E] text-[#E2E8F0] pb-20 font-sans antialiased selection:bg-[#FF5A36] selection:text-white">
      {/* Top Sticky Header Bar */}
      <div className="sticky top-0 z-40 bg-[#0E1017]/95 backdrop-blur-md border-b border-[#1E2230] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-lg">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#141722] hover:bg-[#FF5A36] text-white text-xs font-mono font-bold transition-all border border-[#262B3A] hover:border-[#FF5A36] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← BACK TO 25 COMPONENTS</span>
        </button>

        {/* Component Selector Prev / Next + Close */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectComponent(prevComponent)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#141722] hover:bg-[#1E2230] text-[#8E95A5] hover:text-white text-xs font-mono font-bold transition-all border border-[#262B3A] cursor-pointer"
            title={`Previous: ${prevComponent.name}`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">PREV</span>
          </button>

          <span className="text-xs font-mono font-bold text-white px-2">
            #{component.number.toString().padStart(2, '0')} / {allComponents.length}
          </span>

          <button
            onClick={() => onSelectComponent(nextComponent)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#141722] hover:bg-[#1E2230] text-[#8E95A5] hover:text-white text-xs font-mono font-bold transition-all border border-[#262B3A] cursor-pointer"
            title={`Next: ${nextComponent.name}`}
          >
            <span className="hidden sm:inline">NEXT</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onBack}
            className="p-1.5 ml-2 rounded-lg bg-[#141722] hover:bg-[#FF5A36] text-[#8E95A5] hover:text-white transition-colors cursor-pointer border border-[#262B3A]"
            title="Close Detail View (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Big Page Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* Component Header Bar */}
        <div className="bg-[#11131A] border border-[#222634] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-0.5 rounded bg-[#FF5A36]/15 text-[#FF5A36] font-bold border border-[#FF5A36]/30">
                #{component.number.toString().padStart(2, '0')} · {component.category}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#181B26] text-[#8E95A5] border border-[#282D3E]">
                {component.aircraftLocation}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-sans uppercase tracking-tight text-white">
              {component.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#9DA4B4] max-w-3xl leading-relaxed">
              {component.summary}
            </p>
          </div>

          <div className="bg-[#090A0E] px-5 py-3 rounded-xl border border-[#202434] self-start md:self-auto flex flex-col gap-1 text-right font-mono">
            <span className="text-[10px] text-[#8E95A5] uppercase font-semibold">UNIT ALLOCATION</span>
            <span className="text-sm font-bold text-white">QTY: {component.quantity}</span>
            <span className="text-xs text-[#FF8A65] font-bold">{component.approxPrice}</span>
          </div>
        </div>

        {/* Two-Column Core Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Big Interactive 3D Stage */}
          <div className="lg:col-span-7 space-y-4">
            {/* View Mode Switcher + Online 3D CAD Link */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#12141D] border border-[#232738] p-1.5 rounded-xl">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveViewMode('3D')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                    activeViewMode === '3D'
                      ? 'bg-[#FF5A36] text-white shadow-md'
                      : 'text-[#8E95A5] hover:text-white hover:bg-[#1A1D2A]'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D CAD MODEL</span>
                </button>

                <button
                  onClick={() => setActiveViewMode('360')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                    activeViewMode === '360'
                      ? 'bg-[#FF5A36] text-white shadow-md'
                      : 'text-[#8E95A5] hover:text-white hover:bg-[#1A1D2A]'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>360° ROTATION</span>
                </button>

                <button
                  onClick={() => setActiveViewMode('2D')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                    activeViewMode === '2D'
                      ? 'bg-[#FF5A36] text-white shadow-md'
                      : 'text-[#8E95A5] hover:text-white hover:bg-[#1A1D2A]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>STUDIO PHOTO</span>
                </button>
              </div>

              {/* Get Real 3D from Online Link */}
              <a
                href={online3DModelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181B26] hover:bg-[#222736] text-[#FF5A36] hover:text-white text-xs font-mono font-bold border border-[#2A3042] transition-colors"
                title="Search and download real 3D STEP / CAD models online"
              >
                <span>GET REAL 3D ONLINE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* 3D / 360° / Visual Display Container */}
            <div className="bg-[#12141D] border border-[#232738] rounded-2xl p-4 shadow-xl overflow-hidden">
              {activeViewMode === '3D' && (
                <Component3DViewer
                  componentId={component.id}
                  name={component.name}
                  category={component.category}
                />
              )}

              {activeViewMode === '360' && (
                <Product360Viewer
                  componentId={component.id}
                  name={component.name}
                  category={component.category}
                />
              )}

              {activeViewMode === '2D' && (
                <div
                  className="relative w-full h-[460px] lg:h-[520px] rounded-2xl flex items-center justify-center p-8 border border-[#222838] shadow-2xl overflow-hidden"
                  style={{
                    background: 'radial-gradient(ellipse at 50% 40%, #181d2a 0%, #0e111a 60%, #08090d 100%)'
                  }}
                >
                  <ComponentArtwork
                    id={component.id}
                    mode="detail"
                    alt={component.name}
                    className="w-full h-full max-h-[420px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#141622]/90 rounded border border-[#282E40] text-[10px] font-mono text-white font-bold">
                    HIGH-RESOLUTION STUDIO PHOTOGRAPH
                  </div>
                </div>
              )}
            </div>

            {/* SIH Approach & Reference Part Badge */}
            <div className="p-4 bg-[#12141D] border border-[#232738] rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#10B981] block">
                  SIH PROBLEM STATEMENT ARCHITECTURE COMPLIANCE
                </span>
                <p className="text-xs text-[#9DA4B4] leading-relaxed">
                  {component.sihApproachReference}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Prominent "Why We Are Using This" & Specifications */}
          <div className="lg:col-span-5 space-y-6">
            {/* PRIMARY HIGHLIGHT: WHY WE ARE USING THIS IN OUR PROJECT */}
            <div className="bg-[#15131C] border-2 border-[#FF5A36] rounded-2xl p-6 sm:p-7 space-y-4 shadow-2xl shadow-[#FF5A36]/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5A36]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A36] animate-pulse" />
                <span className="text-xs font-mono tracking-widest text-[#FF5A36] uppercase font-black">
                  CRITICAL RESCUE RATIONALE
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black font-sans text-white uppercase tracking-tight">
                Why We Are Using That in Our Project
              </h2>

              <p className="text-sm text-[#E2E8F0] leading-relaxed font-sans font-medium">
                {component.whyUsed}
              </p>

              {/* Bulleted Operational Advantage */}
              <div className="pt-2 border-t border-[#2F2734] space-y-2">
                <div className="flex items-start gap-2 text-xs text-[#C8CFDF]">
                  <Zap className="w-4 h-4 text-[#FF5A36] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Mountain Search Mission: </strong>
                    Zero-runway vertical takeoff and high-altitude operation without relying on cellular infrastructure.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-[#C8CFDF]">
                  <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Zero-Grid Resilience: </strong>
                    Decoupled flight control ensures autonomous return even in severe weather or avionics disruptions.
                  </span>
                </div>
              </div>
            </div>

            {/* HOW SILENTRESQ USES IT */}
            <div className="bg-[#12141D] border border-[#232738] rounded-2xl p-6 sm:p-7 space-y-3 shadow-xl">
              <span className="text-xs font-mono tracking-wider text-[#FF5A36] uppercase font-bold block">
                FLIGHT & SENSING PIPELINE
              </span>
              <h3 className="text-lg font-bold font-sans text-white">
                How SilentResQ Uses It
              </h3>
              <p className="text-sm text-[#9DA4B4] leading-relaxed">
                {component.howIntegrated}
              </p>
            </div>

            {/* Engineering Specifications Panel */}
            <SpecificationPanel component={component} />
          </div>
        </div>
      </div>
    </div>
  );
};
