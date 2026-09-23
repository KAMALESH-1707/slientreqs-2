import React, { useState } from 'react';
import { getComponentImage } from '../../data/componentImages';

interface ComponentArtworkProps {
  id: string;
  className?: string;
  mode?: 'thumb' | 'detail' | 'preview';
  alt?: string;
}

export const ComponentArtwork: React.FC<ComponentArtworkProps> = ({
  id,
  className = 'w-full h-full',
  mode = 'thumb',
  alt = 'Hardware component'
}) => {
  const [loaded, setLoaded] = useState(false);
  const imageSrc = getComponentImage(id);
  const isDetail = mode === 'detail';

  return (
    <div className={`relative flex items-center justify-center overflow-hidden select-none ${className}`}>
      {/* Soft studio pedestal / backdrop glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#14151C]/40 to-[#0A0B0E]/80 pointer-events-none" />

      {/* Loading Skeleton */}
      {!loaded && (
        <div className="absolute inset-0 bg-[#12141C] animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#FF5A36]/30 border-t-[#FF5A36] animate-spin" />
        </div>
      )}

      {/* Real Product Image */}
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-contain transition-all duration-300 ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } ${isDetail ? 'max-h-[380px] drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]' : 'group-hover:scale-105 drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]'}`}
      />

      {/* Realistic Rim Light Accent Highlight */}
      <div className="absolute inset-0 pointer-events-none rounded-lg ring-1 ring-white/5" />
    </div>
  );
};
