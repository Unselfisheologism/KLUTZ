'use client';

import React, { useEffect, useRef } from 'react';

interface AutoScrollMarqueeProps {
  content: React.ReactNode[];
}

const AutoScrollMarquee: React.FC<AutoScrollMarqueeProps> = ({ content }) => {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    let animationFrameId: number;
    const scrollSpeed = 0.5; // Adjust speed as needed

    const scrollMarquee = () => {
      if (!marquee) return;

      marquee.scrollLeft += scrollSpeed;

      // Reset scroll position when it reaches the end
      if (marquee.scrollLeft >= marquee.scrollWidth / 2) {
        marquee.scrollLeft = 0;
      }

      animationFrameId = requestAnimationFrame(scrollMarquee);
    };

    // Duplicate the content to create a seamless loop
    const contentContainer = marquee.querySelector('div');
    if (contentContainer) {
      contentContainer.innerHTML += contentContainer.innerHTML;
    }

    scrollMarquee();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [content]);

  return (
    <div className="relative w-full overflow-hidden py-8">
      <div
        ref={marqueeRef}
        className="flex whitespace-nowrap"
        style={{
          overflowX: 'hidden',
          maskImage: 'linear-gradient(to right, transparent, white 10%, white 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, white 10%, white 90%, transparent)', // For Safari
        }}
      >
        <div className="flex space-x-12">
          {content.map((item, index) => (
            <div key={index} className="flex-shrink-0">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutoScrollMarquee;