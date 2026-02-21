import React from 'react';
import { DitherImage } from './dither/DitherImage';

interface PortfolioCardProps {
  id?: string;
  title: string;
  subtitle?: string;
  mediaPath?: string;
  mediaType?: 'image' | 'video';
  children: React.ReactNode;
}

export function PortfolioCard({
  id,
  title,
  subtitle,
  mediaPath,
  mediaType = 'image',
  children
}: PortfolioCardProps) {
  return (
    <div className="w-[85vw] md:w-[450px] min-h-[480px] h-[75vh] max-h-[600px] flex-shrink-0 snap-center md:snap-start mr-4 md:mr-8 last:mr-0 flex flex-col">
      <div className="pixel-box h-full flex-grow flex flex-col">
        <div className="pixel-box-inner p-4 md:p-6 h-full flex flex-col">
          {/* Section Header */}
          <div className="section-header mb-4 -mx-4 -mt-4 md:-mx-6 md:-mt-6 flex-shrink-0">
            {id ? `${id}: ${title}` : title}
          </div>

          {/* Dashed Line */}
          <div className="dashed-line mb-4 flex-shrink-0" />

          {/* Media Area */}
          {mediaPath && (
            <div className="mb-4 flex-shrink-0">
              {mediaType === 'image' ? (
                <DitherImage
                  src={mediaPath}
                  alt={title}
                  threshold={0.5}
                  contrast={1.3}
                  grain={0.06}
                  ditherSize={8}
                  height="240px"
                  className="w-full border-4 border-[#4d5338] object-cover"
                />
              ) : (
                <div className="w-full h-[240px] border-4 border-[#4d5338] bg-[#c4cfa1] relative overflow-hidden">
                  <video
                    src={mediaPath}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover mix-blend-luminosity opacity-80"
                  />
                </div>
              )}
            </div>
          )}

          {/* Subtitle / Caption */}
          {subtitle && (
            <div className="text-center mb-4 flex-shrink-0">
              <p className="font-pixel text-xl" style={{ color: '#3d3d3d' }}>
                {subtitle}
              </p>
            </div>
          )}

          {/* Solid line */}
          <div className="solid-line mb-4 flex-shrink-0" />

          {/* Scrolling Content Area */}
          <div className="overflow-y-auto flex-grow font-pixel text-lg space-y-2 text-[#3d3d3d] custom-scrollbar pr-2 whitespace-pre-wrap">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
}
