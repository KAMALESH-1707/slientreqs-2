import React, { useState } from 'react';
import { HARDWARE_COMPONENTS } from '../../data/hardwareData';
import { HardwareComponent } from '../../types/hardware';
import { Crosshair, ArrowUpRight, Zap, Cpu, Radio, Shield, Plane } from 'lucide-react';

interface AircraftArchitectureProps {
  onSelectComponent: (component: HardwareComponent) => void;
}

export const AircraftArchitecture: React.FC<AircraftArchitectureProps> = ({
  onSelectComponent
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [hoveredComponent, setHoveredComponent] = useState<HardwareComponent | null>(null);

  const zones = [
    { id: 'ALL', label: 'All Aircraft Stations' },
    { id: 'Nose Turret', label: 'Nose Sensor Turret (RGB + Thermal)' },
    { id: 'Avionics Bay', label: 'Avionics Bay (Pixhawk + Jetson AI)' },
    { id: 'Wings & Booms', label: 'Wings & Carbon Booms (4x VTOL + Pitot)' },
    { id: 'Central Fuselage', label: 'Fuselage & Tail (6S Battery, PDB & Cruise)' },
    { id: 'Ground Station', label: 'Tactical Ground Station (LoRa Gateway)' }
  ];

  const filteredComponents =
    selectedZone === 'ALL'
      ? HARDWARE_COMPONENTS
      : HARDWARE_COMPONENTS.filter(c => c.aircraftLocation === selectedZone);

  return (
    <div className="w-full bg-[#0E1017] border border-[#222634] rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2230] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Plane className="w-4 h-4 text-[#FF6B35]" />
            <span className="text-xs font-mono tracking-widest text-[#FF6B35] uppercase font-bold">
              SYSTEM ARCHITECTURE & PHYSICAL INTEGRATION
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            SilentResQ Hybrid VTOL / Quadplane Architecture
          </h3>
          <p className="text-sm text-[#8E95A5] mt-1 max-w-2xl">
            Inspect the physical placement and structural partitioning of all 25 avionics, sensing, propulsion, and AI components across the 2.1m composite airframe.
          </p>
        </div>

        {/* Flight Physics Kicker */}
        <div className="flex flex-col items-start md:items-end font-mono text-xs text-[#D8C7BD] bg-[#141722] p-3 rounded-lg border border-[#242938]">
          <span className="text-[#FF6B35] font-bold">FLIGHT PRINCIPLE:</span>
          <span>VTOL TAKEOFF → FIXED-WING CRUISE → VTOL SEARCH</span>
          <span className="text-[#10B981] mt-0.5">68% ENERGY CONSERVATION OVER MULTIROTOR</span>
        </div>
      </div>

      {/* Zone Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {zones.map(z => (
          <button
            key={z.id}
            onClick={() => setSelectedZone(z.id)}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors border ${
              selectedZone === z.id
                ? 'bg-[#FF6B35] text-white border-[#FF6B35] font-bold shadow-md shadow-[#FF6B35]/20'
                : 'bg-[#151824] text-[#8E95A5] border-[#252A3B] hover:text-white hover:border-[#3E455D]'
            }`}
          >
            {z.label}
          </button>
        ))}
      </div>

      {/* Interactive Airframe Blueprint Canvas */}
      <div className="relative w-full h-[380px] sm:h-[420px] bg-[#0A0C11] rounded-xl border border-[#1F2433] overflow-hidden flex items-center justify-center p-4">
        {/* Subtle CAD Blueprint Grid */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #38BDF8 1px, transparent 1px), linear-gradient(to bottom, #38BDF8 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        />

        {/* Top-Down Schematic SVG of SilentResQ Hybrid Quadplane */}
        <svg viewBox="0 0 800 500" className="w-full h-full max-h-[380px]" fill="none">
          {/* Center Guide Lines */}
          <line x1="400" y1="20" x2="400" y2="480" stroke="#1F2536" strokeDasharray="6 6" />
          <line x1="40" y1="250" x2="760" y2="250" stroke="#1F2536" strokeDasharray="6 6" />

          {/* Swept Main Fixed Wing (2.1m) */}
          <path
            d="M60 270 L400 210 L740 270 L720 295 L400 245 L80 295 Z"
            fill="#181B24"
            stroke="#474E63"
            strokeWidth="2"
          />
          {/* Carbon Spar lines */}
          <line x1="90" y1="285" x2="710" y2="285" stroke="#FF6B35" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />

          {/* Dual Parallel VTOL Carbon Booms */}
          <rect x="250" y="100" width="16" height="290" rx="4" fill="#202430" stroke="#3D4457" strokeWidth="1.5" />
          <rect x="534" y="100" width="16" height="290" rx="4" fill="#202430" stroke="#3D4457" strokeWidth="1.5" />

          {/* Central Fuselage Shell */}
          <path
            d="M375 90 Q400 60 425 90 L430 380 Q400 415 370 380 Z"
            fill="#141720"
            stroke="#59627C"
            strokeWidth="2"
          />

          {/* Inverted V-Tail */}
          <path d="M330 440 L400 390 L470 440" stroke="#474E63" strokeWidth="3" fill="none" />

          {/* 4 VTOL Propeller Discs */}
          <circle cx="258" cy="100" r="42" stroke="#FF6B35" strokeWidth="1" strokeDasharray="4 4" fill="#FF6B35" fillOpacity="0.08" />
          <circle cx="258" cy="390" r="42" stroke="#FF6B35" strokeWidth="1" strokeDasharray="4 4" fill="#FF6B35" fillOpacity="0.08" />
          <circle cx="542" cy="100" r="42" stroke="#FF6B35" strokeWidth="1" strokeDasharray="4 4" fill="#FF6B35" fillOpacity="0.08" />
          <circle cx="542" cy="390" r="42" stroke="#FF6B35" strokeWidth="1" strokeDasharray="4 4" fill="#FF6B35" fillOpacity="0.08" />

          {/* Forward Cruise Pusher Propeller at Rear */}
          <ellipse cx="400" cy="405" rx="35" ry="10" stroke="#38BDF8" strokeWidth="1.5" fill="#38BDF8" fillOpacity="0.1" />

          {/* Nose Dual-Spectrum Turret */}
          <circle cx="400" cy="80" r="18" fill="#222634" stroke="#FF6B35" strokeWidth="2" />
          <circle cx="395" cy="78" r="5" fill="#00E5FF" />
          <circle cx="405" cy="82" r="4.5" fill="#FFB703" />

          {/* Hotspot Indicators */}
          {/* 1. Nose Turret */}
          <g
            className="cursor-pointer group"
            onClick={() => {
              const comp = HARDWARE_COMPONENTS.find(c => c.id === 'thermal-camera');
              if (comp) onSelectComponent(comp);
            }}
          >
            <circle cx="400" cy="80" r="24" stroke="#FF6B35" strokeWidth="1.5" strokeDasharray="3 3" fill="transparent" className="animate-spin" />
            <circle cx="400" cy="80" r="8" fill="#FF6B35" />
            <text x="400" y="50" textAnchor="middle" fill="#FF8C42" fontSize="11" fontFamily="monospace" fontWeight="bold">
              [NOSE SENSORS: RGB + THERMAL]
            </text>
          </g>

          {/* 2. Avionics Bay (Pixhawk + Jetson) */}
          <g
            className="cursor-pointer group"
            onClick={() => {
              const comp = HARDWARE_COMPONENTS.find(c => c.id === 'jetson');
              if (comp) onSelectComponent(comp);
            }}
          >
            <rect x="380" y="160" width="40" height="60" rx="4" fill="#10B981" fillOpacity="0.3" stroke="#10B981" strokeWidth="1.5" />
            <circle cx="400" cy="190" r="7" fill="#10B981" />
            <text x="400" y="150" textAnchor="middle" fill="#34D399" fontSize="10" fontFamily="monospace">
              [AVIONICS: JETSON + PIXHAWK]
            </text>
          </g>

          {/* 3. Central 6S Battery & PDB */}
          <g
            className="cursor-pointer group"
            onClick={() => {
              const comp = HARDWARE_COMPONENTS.find(c => c.id === 'battery-6s');
              if (comp) onSelectComponent(comp);
            }}
          >
            <rect x="382" y="240" width="36" height="70" rx="4" fill="#F59E0B" fillOpacity="0.3" stroke="#F59E0B" strokeWidth="1.5" />
            <circle cx="400" cy="275" r="7" fill="#F59E0B" />
            <text x="400" y="330" textAnchor="middle" fill="#FBBF24" fontSize="10" fontFamily="monospace">
              [ENERGY: 6S 16Ah + PDB]
            </text>
          </g>

          {/* 4. Wing Pitot Tube */}
          <g
            className="cursor-pointer group"
            onClick={() => {
              const comp = HARDWARE_COMPONENTS.find(c => c.id === 'airspeed-pitot');
              if (comp) onSelectComponent(comp);
            }}
          >
            <line x1="160" y1="280" x2="160" y2="230" stroke="#00E5FF" strokeWidth="3" />
            <circle cx="160" cy="230" r="5" fill="#00E5FF" />
            <text x="160" y="215" textAnchor="middle" fill="#00E5FF" fontSize="9" fontFamily="monospace">
              [PITOT TUBE]
            </text>
          </g>

          {/* 5. GPS Antenna Mast */}
          <g
            className="cursor-pointer group"
            onClick={() => {
              const comp = HARDWARE_COMPONENTS.find(c => c.id === 'gps-compass');
              if (comp) onSelectComponent(comp);
            }}
          >
            <circle cx="542" cy="210" r="12" fill="#818CF8" fillOpacity="0.4" stroke="#818CF8" strokeWidth="1.5" />
            <circle cx="542" cy="210" r="5" fill="#818CF8" />
            <text x="542" y="190" textAnchor="middle" fill="#A5B4FC" fontSize="9" fontFamily="monospace">
              [ELEVATED GPS/GNSS]
            </text>
          </g>

          {/* 6. Cruise Propulsion Tail */}
          <g
            className="cursor-pointer group"
            onClick={() => {
              const comp = HARDWARE_COMPONENTS.find(c => c.id === 'cruise-motor');
              if (comp) onSelectComponent(comp);
            }}
          >
            <circle cx="400" cy="405" r="7" fill="#38BDF8" />
            <text x="400" y="435" textAnchor="middle" fill="#38BDF8" fontSize="10" fontFamily="monospace">
              [CRUISE PUSHER MOTOR]
            </text>
          </g>
        </svg>

        {/* Hover / Callout Card in Corner */}
        <div className="absolute bottom-3 left-3 bg-[#131622]/90 backdrop-blur-md p-2.5 rounded-lg border border-[#24293A] text-xs font-mono text-[#8E95A5] hidden sm:block">
          <span className="text-white font-bold block mb-0.5">CLICK ANY HIGHLIGHTED STATION</span>
          <span>Instant jump to full engineering detail view</span>
        </div>
      </div>

      {/* Component Stations Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredComponents.map(comp => (
          <div
            key={comp.id}
            onClick={() => onSelectComponent(comp)}
            className="p-3.5 rounded-xl bg-[#131622] border border-[#222738] hover:border-[#FF6B35] hover:bg-[#181C2B] transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#8E95A5]">#{comp.number.toString().padStart(2, '0')}</span>
                <span className="text-[10px] font-mono text-[#FF6B35] uppercase">{comp.category}</span>
              </div>
              <h4 className="text-white text-xs font-bold font-mono group-hover:text-[#FF8C42] transition-colors">
                {comp.name}
              </h4>
              <p className="text-[11px] text-[#8E95A5] line-clamp-1">{comp.role}</p>
            </div>
            <div className="flex items-center gap-1 text-[#8E95A5] group-hover:text-[#FF6B35] pl-2">
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
