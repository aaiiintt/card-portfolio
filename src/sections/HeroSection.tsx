import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DitherImage } from '../components/dither/DitherImage';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-8 px-4">
      <div ref={cardRef} className="max-w-2xl mx-auto">
        <div className="pixel-box">
          <div className="pixel-box-inner p-4 md:p-6">
            {/* Section Header */}
            <div className="section-header mb-4 -mx-4 -mt-4 md:-mx-6 md:-mt-6">
              ITEM: GLITCH_PORTRAIT_01
            </div>

            {/* Dashed Line */}
            <div className="dashed-line mb-4" />

            {/* Hero Image with Dither Effect */}
            <div className="mb-4">
              <DitherImage 
                src="/hero-portrait.jpg"
                alt="Glitch Portrait"
                threshold={0.5}
                contrast={1.3}
                grain={0.06}
                ditherSize={8}
                height="400px"
                className="w-full border-4 border-[#4d5338]"
              />
            </div>

            {/* Image Caption */}
            <div className="text-center mb-4">
              <p className="font-pixel text-xl" style={{ color: '#3d3d3d' }}>
                [fig. 1.1] DIGITAL FRAGMENTATION
              </p>
              <p className="font-mono-receipt text-sm mt-1" style={{ color: '#6b6b6b' }}>
                BAYER MATRIX DITHERING
              </p>
            </div>

            {/* Solid Line */}
            <div className="solid-line mb-4" />

            {/* Data Rows */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center py-2 border-b-2 border-dashed border-[#8b956d]">
                <span className="data-label">SKU</span>
                <span className="data-value">GLT-2024-001</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b-2 border-dashed border-[#8b956d]">
                <span className="data-label">QTY</span>
                <span className="data-value">001</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b-2 border-dashed border-[#8b956d]">
                <span className="data-label">RESOLUTION</span>
                <span className="data-value">768×1024</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="data-label">PRICE</span>
                <span className="data-value text-2xl" style={{ color: '#6b8c42' }}>¥3,580</span>
              </div>
            </div>

            {/* Solid Line */}
            <div className="solid-line mb-4" />

            {/* Description */}
            <div className="font-pixel text-lg space-y-2" style={{ color: '#3d3d3d' }}>
              <p>&gt; SUBJECT: HUMAN//DIGITAL</p>
              <p>&gt; METHOD: 8×8 BAYER DITHER</p>
              <p>&gt; OUTPUT: LCD-READY MONOCHROME</p>
              <p>&gt; STATUS: <span className="text-[#6b8c42]">[READY]</span></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
