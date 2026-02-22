import React, { useRef } from 'react';

interface HorizontalScrollSectionProps {
    id: string;
    backgroundSrc: string;
    accentColor: string;
    accentColorDeep: string;
    children: React.ReactNode;
}

export function HorizontalScrollSection({
    id,
    backgroundSrc,
    accentColor,
    accentColorDeep,
    children,
}: HorizontalScrollSectionProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const amount = window.innerWidth < 768 ? window.innerWidth * 0.85 : 480;
        scrollRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
    };

    const hasMultipleChildren = React.Children.count(children) > 1;

    return (
        <section
            id={id}
            className="section-wrapper"
            style={{ backgroundImage: `url(${backgroundSrc})` }}
        >
            {/* Spacer so illustration title is visible — roughly 38% of 16:9 height */}
            <div className="w-full" style={{ paddingTop: 'min(38%, 340px)' }} />

            {/* Cards area — sits below the illustrated title */}
            <div className="flex-1 flex flex-col justify-end pb-8">
                {/* Arrow buttons — top-right of card row */}
                {hasMultipleChildren && (
                    <div className="flex justify-end gap-2 px-6 mb-3">
                        <button
                            onClick={() => scroll('left')}
                            className="scroll-btn"
                            style={{ borderColor: accentColorDeep, boxShadow: `3px 3px 0 ${accentColorDeep}` }}
                            aria-label="Scroll left"
                        >
                            ‹
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="scroll-btn"
                            style={{ borderColor: accentColorDeep, boxShadow: `3px 3px 0 ${accentColorDeep}` }}
                            aria-label="Scroll right"
                        >
                            ›
                        </button>
                    </div>
                )}

                {/* Horizontal scroll container */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto hide-scroll py-4 snap-x snap-mandatory px-6 scroll-px-6 gap-4"
                >
                    {React.Children.map(children, (child) => (
                        <div className="flex-shrink-0 snap-start" style={{ width: 'min(85vw, 440px)' }}>
                            {React.isValidElement(child)
                                ? React.cloneElement(child as React.ReactElement<{ accentColor?: string; accentColorDeep?: string }>, { accentColor, accentColorDeep })
                                : child}
                        </div>
                    ))}
                    {/* trailing spacer */}
                    <div className="flex-shrink-0 w-2" />
                </div>
            </div>
        </section>
    );
}
