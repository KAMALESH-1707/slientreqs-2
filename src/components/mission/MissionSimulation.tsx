import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Radio,
  Eye,
  Crosshair,
  MapPin,
  TrendingDown,
  Clock,
  Battery,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface MissionSimulationProps {
  onGoToHardware: () => void;
}

export const MissionSimulation: React.FC<MissionSimulationProps> = ({ onGoToHardware }) => {
  const [activeStage, setActiveStage] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [sensorView, setSensorView] = useState<'FUSION' | 'THERMAL' | 'RGB'>('FUSION');
  const [loraPacketSent, setLoraPacketSent] = useState<boolean>(false);

  // Auto progression of flight stages
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveStage(prev => (prev < 5 ? prev + 1 : 1));
    }, 6500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Stage details
  const flightStages = [
    {
      stage: 1,
      title: 'VTOL Takeoff',
      flightMode: 'QUAD VTOL',
      altitude: '45 m AGL',
      airspeed: '0 km/h (Vertical: +3.2 m/s)',
      powerDraw: '880 W',
      motorsActive: '4x VTOL Lift Motors Active (Cruise Off)',
      description:
        'Zero-runway vertical climb out of obstructed valley terrain. Lift motors generate 12.4 kg of static thrust to clear trees and rock debris.'
    },
    {
      stage: 2,
      title: 'Transition Corridor',
      flightMode: 'TRANSITIONING',
      altitude: '80 m AGL',
      airspeed: '48 km/h (Accelerating to 16 m/s)',
      powerDraw: '540 W',
      motorsActive: 'Cruise Motor Spooling Up + Lift Motors Assisting',
      description:
        'Airspeed Pitot tube monitors dynamic pressure until wings generate 100% aerodynamic lift. VTOL motors then brake into low-drag alignment.'
    },
    {
      stage: 3,
      title: 'Fixed-Wing Cruise Survey',
      flightMode: 'FIXED-WING CRUISE',
      altitude: '120 m AGL',
      airspeed: '68 km/h (Efficient Cruise)',
      powerDraw: '165 W',
      motorsActive: '1x Cruise Motor Active (4x VTOL Dormant)',
      description:
        'High-efficiency winged flight sweeps 40 km² disaster sector. Wings generate lift, slashing power draw by 68% compared to multirotors.'
    },
    {
      stage: 4,
      title: 'Survivor Detection & Hover Scan',
      flightMode: 'VTOL PRECISION HOVER',
      altitude: '35 m AGL',
      airspeed: '0 km/h (Stationary Lock)',
      powerDraw: '760 W',
      motorsActive: '4x VTOL Lift Motors Re-engaged',
      description:
        'AI detects thermal anomaly through debris fissures. Aircraft transitions back into stable hover for dual-spectrum validation.'
    },
    {
      stage: 5,
      title: 'LoRa Alert & Geo-Tag Dispatch',
      flightMode: 'HOLD & BEACON',
      altitude: '35 m AGL',
      airspeed: '0 km/h',
      powerDraw: '760 W',
      motorsActive: 'Stationary Hover & Sub-GHz Broadcast',
      description:
        'Coordinates (11.5271° N, 76.1348° E) and confidence metrics packaged into encrypted LoRa packet transmitted to ground rescue squads.'
    }
  ];

  const current = flightStages[activeStage - 1];

  return (
    <div className="w-full min-h-screen bg-[#0A0B0E] text-[#E2E8F0] pb-24">
      {/* Simulation Header */}
      <section className="border-b border-[#202432] bg-[#0E1017] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF6B35]">
            <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-ping" />
            <span>OPERATIONAL SCENARIO SIMULATION</span>
            <span>·</span>
            <span>LANDSLIDE EMERGENCY RESPONSE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white uppercase">
            AUTONOMOUS RESCUE MISSION IN ACTION
          </h1>
          <p className="text-sm sm:text-base text-[#D8C7BD] max-w-3xl leading-relaxed">
            Experience the complete SilentResQ end-to-end mission profile — from zero-runway VTOL takeoff to high-speed fixed-wing aerodynamic cruise, 256×192 LWIR thermal detection, and offline LoRa emergency dispatch.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* 1. HYBRID VTOL FLIGHT SIMULATION STAGES */}
        <div className="bg-[#12141C] border border-[#202432] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2330] pb-4">
            <div>
              <span className="text-[11px] font-mono text-[#FF6B35] uppercase font-bold tracking-widest block">
                FLIGHT PROFILE SIMULATOR
              </span>
              <h3 className="text-xl font-mono font-bold text-white mt-0.5">
                5-Stage Autonomous Mission Corridor
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E212E] hover:bg-[#FF6B35] text-white text-xs font-mono transition-colors border border-[#2B3042]"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'PAUSE FLIGHT' : 'RESUME FLIGHT'}</span>
              </button>
              <button
                onClick={() => setActiveStage(1)}
                className="p-1.5 text-[#8E95A5] hover:text-white rounded hover:bg-[#1E212E]"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stage Progress Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {flightStages.map(st => (
              <button
                key={st.stage}
                onClick={() => setActiveStage(st.stage)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  activeStage === st.stage
                    ? 'bg-[#FF6B35]/20 border-[#FF6B35] shadow-md'
                    : 'bg-[#151722] border-[#222736] hover:border-[#384055]'
                }`}
              >
                <span className="text-[10px] font-mono text-[#8E95A5] block">STAGE 0{st.stage}</span>
                <span
                  className={`text-xs font-mono font-bold block mt-0.5 ${
                    activeStage === st.stage ? 'text-[#FF8C42]' : 'text-white'
                  }`}
                >
                  {st.title}
                </span>
              </button>
            ))}
          </div>

          {/* Active Stage Avionics HUD */}
          <div className="p-6 rounded-xl bg-[#0C0E14] border border-[#1E2230] grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#8E95A5] uppercase">CURRENT FLIGHT MODE</span>
              <div className="text-base font-mono font-bold text-[#FF6B35]">{current.flightMode}</div>
              <span className="text-xs text-[#8E95A5] font-mono">{current.motorsActive}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#8E95A5] uppercase">AIRSPEED & ALTITUDE</span>
              <div className="text-base font-mono font-bold text-white">{current.airspeed}</div>
              <span className="text-xs text-[#38BDF8] font-mono">{current.altitude}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#8E95A5] uppercase">ELECTRICAL POWER CONSUMPTION</span>
              <div className="text-base font-mono font-bold text-[#10B981]">{current.powerDraw}</div>
              <span className="text-xs text-[#8E95A5] font-mono">6S 16Ah Battery Active</span>
            </div>

            <div className="p-3 bg-[#131622] rounded-lg border border-[#222736] text-xs text-[#D8C7BD] leading-relaxed">
              <span className="text-[#FF6B35] font-mono font-bold block mb-0.5">PHYSICS CONTEXT:</span>
              {current.description}
            </div>
          </div>
        </div>

        {/* 2. DUAL-SPECTRUM RGB & 256×192 LWIR THERMAL DETECTION */}
        <div className="bg-[#12141C] border border-[#202432] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2330] pb-4">
            <div>
              <span className="text-[11px] font-mono text-[#38BDF8] uppercase font-bold tracking-widest block">
                DUAL-SPECTRUM SENSING SUITE
              </span>
              <h3 className="text-xl font-mono font-bold text-white mt-0.5">
                Daylight Optical vs 256×192 LWIR Radiometric Heat Signature
              </h3>
            </div>

            {/* Sensor View Tabs */}
            <div className="flex items-center gap-1 bg-[#151722] p-1 rounded-lg border border-[#242938]">
              <button
                onClick={() => setSensorView('FUSION')}
                className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                  sensorView === 'FUSION' ? 'bg-[#FF6B35] text-white font-bold' : 'text-[#8E95A5] hover:text-white'
                }`}
              >
                AI MULTI-SPECTRAL FUSION
              </button>
              <button
                onClick={() => setSensorView('THERMAL')}
                className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                  sensorView === 'THERMAL' ? 'bg-[#38BDF8] text-[#0A0B0E] font-bold' : 'text-[#8E95A5] hover:text-white'
                }`}
              >
                256×192 LWIR THERMAL
              </button>
              <button
                onClick={() => setSensorView('RGB')}
                className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                  sensorView === 'RGB' ? 'bg-white text-black font-bold' : 'text-[#8E95A5] hover:text-white'
                }`}
              >
                4K RGB OPTICAL
              </button>
            </div>
          </div>

          {/* Sensor Screen Mockup */}
          <div className="relative w-full h-80 sm:h-96 rounded-xl border border-[#222736] overflow-hidden flex items-center justify-center">
            {/* Background Graphic representing landslide debris terrain */}
            <svg viewBox="0 0 800 400" className="w-full h-full object-cover">
              {/* Debris Ground Layer */}
              <rect width="800" height="400" fill={sensorView === 'THERMAL' ? '#090A14' : '#14161F'} />
              {/* Rocky contour mounds */}
              <path
                d="M0 260 Q200 180 400 240 T800 210 L800 400 L0 400 Z"
                fill={sensorView === 'THERMAL' ? '#171B33' : '#1A1E29'}
              />
              <path
                d="M100 320 Q300 240 500 290 T800 270 L800 400 L100 400 Z"
                fill={sensorView === 'THERMAL' ? '#1E2342' : '#222736'}
              />

              {/* Thermal Heat Signature (37.2°C Human Body in Rubble Crevice) */}
              {(sensorView === 'THERMAL' || sensorView === 'FUSION') && (
                <g>
                  {/* Heat Plume Halo */}
                  <circle cx="430" cy="270" r="48" fill="#FB5607" fillOpacity="0.25" />
                  <circle cx="430" cy="270" r="28" fill="#FF006E" fillOpacity="0.5" />
                  <circle cx="430" cy="270" r="14" fill="#FFBE0B" />
                  <circle cx="430" cy="270" r="6" fill="#FFFFFF" />
                  <text x="430" y="325" textAnchor="middle" fill="#FFBE0B" fontSize="12" fontFamily="monospace" fontWeight="bold">
                    +37.2°C [SURVIVOR HEAT SIGNATURE]
                  </text>
                </g>
              )}

              {/* AI Detection Bounding Box */}
              {sensorView === 'FUSION' && (
                <g>
                  <rect
                    x="375"
                    y="225"
                    width="110"
                    height="90"
                    fill="none"
                    stroke="#FF6B35"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                  />
                  <rect x="375" y="200" width="165" height="24" fill="#FF6B35" />
                  <text x="382" y="216" fill="#FFFFFF" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    SURVIVOR: 94.2% CONF
                  </text>
                  <circle cx="430" cy="270" r="4" fill="#FF6B35" />
                  <line x1="410" y1="270" x2="450" y2="270" stroke="#FF6B35" strokeWidth="1.5" />
                  <line x1="430" y1="250" x2="430" y2="290" stroke="#FF6B35" strokeWidth="1.5" />
                </g>
              )}

              {/* Optical only mode explanation */}
              {sensorView === 'RGB' && (
                <g>
                  <circle cx="430" cy="270" r="12" fill="#2E3344" />
                  <text x="430" y="260" textAnchor="middle" fill="#8E95A5" fontSize="11" fontFamily="monospace">
                    Obscured by mud & rock debris
                  </text>
                </g>
              )}
            </svg>

            {/* Live Crosshair & Telemetry HUD */}
            <div className="absolute top-4 left-4 font-mono text-[11px] text-white/90 bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-white/10 space-y-1">
              <div>TARGET COORD: 11.52712° N, 76.13484° E</div>
              <div>SPECTRAL BAND: {sensorView === 'THERMAL' ? '8–14μm LWIR RADIOMETRIC' : sensorView === 'RGB' ? 'VIS 400-700nm' : 'CO-REGISTERED FUSION'}</div>
              <div>JETSON ORIN NANO INFERENCE: 32 FPS (TensorRT)</div>
            </div>

            <div className="absolute bottom-4 right-4 font-mono text-xs text-[#FF6B35] bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#FF6B35]/40">
              THERMAL DELTA: +22.4°C ABOVE SURROUNDING ROCK
            </div>
          </div>
        </div>

        {/* 3. CONVENTIONAL QUADCOPTER VS SILENTRESQ HYBRID VTOL ENERGY COMPARISON */}
        <div className="bg-[#12141C] border border-[#202432] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-[#1E2330] pb-4">
            <span className="text-[11px] font-mono text-[#10B981] uppercase font-bold tracking-widest block">
              ENERGY & ENDURANCE PROOF
            </span>
            <h3 className="text-xl font-mono font-bold text-white mt-0.5">
              Conventional Multirotor vs. SilentResQ Hybrid Quadplane
            </h3>
            <p className="text-xs text-[#8E95A5] mt-1">
              Comparative analysis over an identical 6S 16,000 mAh energy payload.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Conventional Multirotor */}
            <div className="p-6 rounded-xl bg-[#141620] border border-[#262B3A] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-mono font-bold text-[#8E95A5]">CONVENTIONAL MULTIROTOR</h4>
                <span className="px-2 py-0.5 rounded bg-[#2D1B1B] text-[#EF4444] text-[10px] font-mono">ENERGY HUNGRY</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-[#222736] pb-2">
                  <span className="text-[#8E95A5]">FLIGHT TIME:</span>
                  <span className="text-white font-bold">22 – 26 Minutes</span>
                </div>
                <div className="flex justify-between border-b border-[#222736] pb-2">
                  <span className="text-[#8E95A5]">OPERATIONAL RADIUS:</span>
                  <span className="text-white font-bold">4.5 km Radius</span>
                </div>
                <div className="flex justify-between border-b border-[#222736] pb-2">
                  <span className="text-[#8E95A5]">AVERAGE POWER DRAW:</span>
                  <span className="text-[#EF4444] font-bold">780 W – 850 W (Pure Hover)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E95A5]">SEARCH AREA PER SORTIE:</span>
                  <span className="text-white font-bold">~6 km² Coverage</span>
                </div>
              </div>

              {/* Energy bar visual */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-[#8E95A5]">
                  <span>ENERGY EFFICIENCY</span>
                  <span>32%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#1C202C] overflow-hidden">
                  <div className="h-full bg-[#EF4444] w-[32%]" />
                </div>
              </div>
            </div>

            {/* SilentResQ Hybrid Quadplane */}
            <div className="p-6 rounded-xl bg-[#171B26] border border-[#FF6B35]/50 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-mono font-bold text-white">SILENTRESQ HYBRID QUADPLANE</h4>
                <span className="px-2 py-0.5 rounded bg-[#1C2E24] text-[#10B981] text-[10px] font-mono font-bold">
                  68% ENERGY SAVED
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-[#262E40] pb-2">
                  <span className="text-[#8E95A5]">FLIGHT TIME:</span>
                  <span className="text-[#FF8C42] font-bold">55 – 70 Minutes</span>
                </div>
                <div className="flex justify-between border-b border-[#262E40] pb-2">
                  <span className="text-[#8E95A5]">OPERATIONAL RADIUS:</span>
                  <span className="text-[#FF8C42] font-bold">32 km (Cross-Valley Reach)</span>
                </div>
                <div className="flex justify-between border-b border-[#262E40] pb-2">
                  <span className="text-[#8E95A5]">CRUISE POWER DRAW:</span>
                  <span className="text-[#10B981] font-bold">160 W – 190 W (Winged Lift)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E95A5]">SEARCH AREA PER SORTIE:</span>
                  <span className="text-[#10B981] font-bold">~42 km² Coverage</span>
                </div>
              </div>

              {/* Energy bar visual */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-[#8E95A5]">
                  <span>ENERGY EFFICIENCY</span>
                  <span className="text-[#10B981] font-bold">100% (Maximum Endurance)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#1C202C] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#FF6B35] to-[#10B981] w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. FINAL RESCUE LORA ALERT DISPATCH */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-[#171A26] to-[#11141F] border border-[#FF6B35]/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
              <span className="text-xs font-mono tracking-widest text-[#10B981] uppercase font-bold">
                INCIDENT COMMAND RELAY ACTIVE
              </span>
            </div>
            <h3 className="text-2xl font-bold font-mono text-white">
              Target Survivor Pinpoint Dispatched via LoRa
            </h3>
            <p className="text-xs sm:text-sm text-[#D8C7BD] max-w-xl font-sans">
              Autonomous coordinates delivered directly to first-responder ground gateways without cellular towers, satellite uplinks, or internet.
            </p>
          </div>

          <button
            onClick={onGoToHardware}
            className="px-6 py-3.5 rounded-xl bg-[#FF6B35] hover:bg-[#E85D04] text-white font-mono font-bold text-xs tracking-wider uppercase transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-[#FF6B35]/25 shrink-0"
          >
            <span>VIEW HARDWARE OVERVIEW</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
