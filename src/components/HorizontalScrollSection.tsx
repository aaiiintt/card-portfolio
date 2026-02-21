import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HorizontalScrollSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export function HorizontalScrollSection({ title, description, children }: HorizontalScrollSectionProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (titleRef.current) {
            gsap.fromTo(titleRef.current,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: titleRef.current,
                        start: 'top 90%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        }
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.85 : 474;
            scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section id={title.toLowerCase()} ref={sectionRef} className="w-full py-12 relative overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4 relative">
                {/* Section Title & Arrows */}
                <div ref={titleRef} className="mb-8 pl-4 flex justify-between items-end max-w-6xl mx-auto md:ml-0 md:mr-auto">
                    <div>
                        <div className="section-header inline-block">
                            {title}
                        </div>
                        {description && (
                            <p className="font-mono-receipt text-sm text-[#6b6b6b] mt-4 max-w-2xl">
                                {description}
                            </p>
                        )}
                    </div>
                    {/* Navigation Arrows */}
                    <div className="flex gap-2">
                        <button onClick={() => scroll('left')} className="chunky-btn w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-[#4d5338] font-pixel text-xl md:text-2xl" aria-label="Scroll left">
                            &lt;
                        </button>
                        <button onClick={() => scroll('right')} className="chunky-btn w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-[#4d5338] font-pixel text-xl md:text-2xl" aria-label="Scroll right">
                            &gt;
                        </button>
                    </div>
                </div>

                {/* Scrollable Container */}
                <div className="relative group w-[100vw] -ml-4 pl-4 md:w-auto md:ml-0 md:pl-0">
                    <div ref={scrollContainerRef} className="flex overflow-x-auto snap-x snap-mandatory pb-8 pt-4 px-4 cs-hide-scroll">
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
}
