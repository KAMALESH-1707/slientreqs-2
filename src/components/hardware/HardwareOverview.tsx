import React, { useState } from 'react';
import { HARDWARE_COMPONENTS, HARDWARE_CATEGORIES } from '../../data/hardwareData';
import { HardwareComponent, HardwareCategory } from '../../types/hardware';
import { HardwareCard } from './HardwareCard';
import { Search, Sparkles, Box, ShieldCheck, Zap } from 'lucide-react';

interface HardwareOverviewProps {
  onSelectComponent: (component: HardwareComponent) => void;
}

export const HardwareOverview: React.FC<HardwareOverviewProps> = ({
  onSelectComponent
}) => {
  const [selectedCategory, setSelectedCategory] = useState<HardwareCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter components by category and search
  const filteredComponents = HARDWARE_COMPONENTS.filter(comp => {
    const matchesCategory =
      selectedCategory === 'ALL' || comp.category === selectedCategory;
    const matchesSearch =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.whatIsIt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full bg-[#0A0B0E] text-[#E2E8F0] px-4 sm:px-6 lg:px-8 py-6 font-sans selection:bg-[#FF5A36] selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Compact Aerospace Header: Title & Badges in One Clean Strip */}
        <div className="bg-[#12131A] border border-[#202330] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest text-[#FF5A36] uppercase font-bold">
                SILENTRESQ AIRCRAFT SYSTEM · 25 HARDWARE MODULES
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-sans tracking-tight uppercase">
              Autonomous Search & Rescue Hardware
            </h1>
            <p className="text-xs sm:text-sm text-[#9DA4B4] max-w-2xl">
              All 25 mission-critical components in one page. Click <span className="text-[#FF5A36] font-bold font-mono">INFO</span> on any component to inspect its realistic 3D CAD model and read the technical engineering rationale.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 self-start md:self-auto bg-[#090A0E] px-4 py-2.5 rounded-xl border border-[#232738]">
            <Box className="w-4 h-4 text-[#FF5A36]" />
            <div className="text-right font-mono">
              <span className="text-[10px] text-[#8E95A5] block uppercase font-semibold">LOADED MODULES</span>
              <span className="text-sm font-bold text-white">25 / 25 READY</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0E1017] p-2.5 rounded-xl border border-[#1E212E]">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {HARDWARE_CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.id;
              const count =
                cat.id === 'ALL'
                  ? HARDWARE_COMPONENTS.length
                  : HARDWARE_COMPONENTS.filter(c => c.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#FF5A36] text-white font-bold border-[#FF5A36] shadow-sm shadow-[#FF5A36]/30'
                      : 'bg-[#141622] text-[#8E95A5] hover:text-white hover:bg-[#1D202F] border-[#222738]'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Fast Search Box */}
          <div className="relative min-w-[220px] sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A8296]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter 25 components..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#141622] border border-[#222738] focus:border-[#FF5A36] focus:outline-none text-xs font-mono text-white placeholder-[#687082] transition-colors"
            />
          </div>
        </div>

        {/* 25 Components Grid (Responsive 5-Column Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredComponents.map(component => (
            <HardwareCard
              key={component.id}
              component={component}
              onExplore={onSelectComponent}
            />
          ))}
        </div>

        {/* Empty State if Search Matches Nothing */}
        {filteredComponents.length === 0 && (
          <div className="p-12 text-center bg-[#12131A] rounded-2xl border border-[#222634] space-y-3">
            <p className="text-sm font-mono text-[#8E95A5]">No hardware components match "{searchQuery}"</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="px-4 py-2 rounded-lg bg-[#FF5A36] text-white text-xs font-mono font-bold hover:bg-[#E04826] cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
