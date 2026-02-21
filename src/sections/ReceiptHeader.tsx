import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function ReceiptHeader() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const elements = contentRef.current.querySelectorAll('.reveal-item');
      gsap.fromTo(elements,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.3
        }
      );
    }
  }, []);

  return (
    <header className="w-full py-8 px-4">
      <div ref={contentRef} className="max-w-2xl mx-auto">
        {/* Main Title Block */}
        <div className="reveal-item mb-12">
          <div className="pixel-box">
            <div className="pixel-box-inner p-6 text-center">
              <h1 className="font-display text-3xl md:text-5xl" style={{ color: '#4d5338' }}>
                JOSIE // TAIT
              </h1>
            </div>
          </div>
        </div>



        {/* Navigation */}
        <nav className="reveal-item flex flex-wrap justify-center gap-4">
          {['[ABOUT]', '[VIDEOS]', '[ART]', '[EXPERIMENTS]', '[IDEAS]'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().slice(1, -1)}`}
              className="chunky-btn px-4 py-2 md:px-6 md:py-3 font-display text-[10px] md:text-xs"
              style={{ color: '#4d5338' }}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default ReceiptHeader;
