import React, { useState, useRef } from 'react';
import { ComponentArtwork } from './ComponentArtwork';
import { RotateCw, Move, ZoomIn, ZoomOut } from 'lucide-react';

interface Product360ViewerProps {
  componentId: string;
  name: string;
  category: string;
}

export const Product360Viewer: React.FC<Product360ViewerProps> = ({
  componentId,
  name,
  category
}) => {
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showHotspots, setShowHotspots] = useState(true);
  const startXRef = useRef(0);
  const startAngleRef = useRef(0);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startAngleRef.current = angle;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    let newAngle = (startAngleRef.current + Math.round(deltaX * 0.75)) % 360;
    if (newAngle < 0) newAngle += 360;
    setAngle(newAngle);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      startXRef.current = e.touches[0].clientX;
      startAngleRef.current = angle;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    let newAngle = (startAngleRef.current + Math.round(deltaX * 0.75)) % 360;
    if (newAngle < 0) newAngle += 360;
    setAngle(newAngle);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Pseudo-3D depth transformation calculations based on azimuth angle
  const rotateY = angle > 180 ? angle - 360 : angle;
  const perspectiveSkew = Math.sin((angle * Math.PI) / 180) * 12;

  return (
    <div
      className="relative w-full h-[460px] lg:h-[520px] bg-[#0A0B0E] rounded-xl overflow-hidden border border-[#202432] flex flex-col justify-between select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Technical Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest text-[#FF5A36] uppercase font-bold">
              360° PRECISION PRODUCT VIEWER
            </span>
          </div>
          <p className="text-white text-sm font-bold mt-0.5">{name}</p>
        </div>

        <div className="bg-[#12141D]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#232738] text-right pointer-events-auto shadow-lg">
          <span className="text-[10px] font-mono text-[#8E95A5] block font-semibold">CURRENT AZIMUTH</span>
          <span className="text-sm font-mono font-bold text-[#FF5A36]">{angle}°</span>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        className="w-full flex-1 flex items-center justify-center relative cursor-ew-resize select-none overflow-hidden"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Ground Pedestal Shadow */}
        <div
          className="absolute bottom-12 w-3/4 h-8 rounded-[100%] bg-[#FF5A36]/10 filter blur-xl pointer-events-none transition-all duration-100"
          style={{
            transform: `scaleX(${1 - Math.abs(Math.sin((angle * Math.PI) / 180)) * 0.2})`
          }}
        />

        {/* Dynamic Rotation Display Container */}
        <div
          className="relative transition-transform duration-75 ease-out max-w-[460px] w-4/5 flex items-center justify-center"
          style={{
            transform: `scale(${zoom}) perspective(1000px) rotateY(${rotateY * 0.25}deg) skewY(${perspectiveSkew * 0.05}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          <ComponentArtwork
            id={componentId}
            mode="detail"
            alt={name}
            className="w-full h-auto max-h-[340px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
          />

          {/* Hotspots */}
          {showHotspots && (
            <>
              <div
                className="absolute top-1/4 left-1/3 bg-[#FF5A36] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-md pointer-events-none flex items-center gap-1 border border-white/40 animate-bounce"
                style={{ animationDuration: '3s' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                AVIONICS BUS
              </div>

              <div
                className="absolute bottom-1/3 right-1/4 bg-[#151928] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-md pointer-events-none flex items-center gap-1 border border-[#3A435E]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                THERMAL INTERFACE
              </div>
            </>
          )}
        </div>

        {/* Drag Hint Overlay */}
        <div className="absolute bottom-16 flex items-center gap-2 px-3.5 py-1.5 bg-[#141622]/90 backdrop-blur-xs rounded-full border border-[#282E40] shadow-md pointer-events-none">
          <Move className="w-3.5 h-3.5 text-[#FF5A36]" />
          <span className="text-[11px] font-mono text-[#D8DDE8] font-semibold">
            DRAG ← → TO ROTATE 360°
          </span>
        </div>
      </div>

      {/* Bottom Angle Dial & Control Strip */}
      <div className="p-4 bg-[#0E1017] border-t border-[#202432] flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Preset Angles */}
        <div className="flex items-center gap-1.5">
          {[
            { label: '0° FRONT', val: 0 },
            { label: '90° RIGHT', val: 90 },
            { label: '180° REAR', val: 180 },
            { label: '270° LEFT', val: 270 },
            { label: '45° ISO', val: 45 }
          ].map(p => (
            <button
              key={p.val}
              onClick={() => setAngle(p.val)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors cursor-pointer border ${
                Math.abs(angle - p.val) <= 10
                  ? 'bg-[#FF5A36] text-white font-bold border-[#FF5A36]'
                  : 'bg-[#141722] text-[#8E95A5] hover:text-white hover:bg-[#1E2230] border-[#23283A]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Interactive Scrub Range Slider */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-[10px] font-mono text-[#8E95A5] font-semibold uppercase">SCRUB:</span>
          <input
            type="range"
            min="0"
            max="359"
            value={angle}
            onChange={(e) => setAngle(parseInt(e.target.value))}
            className="w-36 accent-[#FF5A36] cursor-pointer"
          />

          <div className="flex items-center gap-1 border-l border-[#202432] pl-3">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.15, 1.4))}
              className="p-1.5 text-[#8E95A5] hover:text-white hover:bg-[#1A1D2A] rounded transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.8))}
              className="p-1.5 text-[#8E95A5] hover:text-white hover:bg-[#1A1D2A] rounded transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
