'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselItem {
  title: string;
  description?: string; // Make description optional
  imageUrl: string;
}

interface HorizontalCarouselProps {
  title: string;
  content: CarouselItem[];
}

const HorizontalCarousel: React.FC<HorizontalCarouselProps> = ({ title, content }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const cycleDuration = 3000; // 3 seconds

  const startCycling = () => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % content.length);
    }, cycleDuration);
  };

  const startProgress = () => {
    setProgress(0);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          return 0;
        }
        return prevProgress + (100 / (cycleDuration / 50)); // Update every 50ms
      });
    }, 50);
  };

  const resetAutoCycle = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    startCycling();
    startProgress();
  };

  useEffect(() => {
    startCycling();
    startProgress();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [content.length]);

  useEffect(() => {
    resetAutoCycle();
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + content.length) % content.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % content.length);
  };

  // Scroll to the current item when currentIndex changes
  useEffect(() => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.children[0]?.clientWidth || 0;
      carouselRef.current.scrollTo({
        left: currentIndex * itemWidth,
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);


  return (
    <section className="mb-16">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">{title}</h2>
      <div className="relative flex flex-col items-center">
        <div className="flex justify-center items-center mt-4 space-x-2">
            {/* Navigation Arrows */}
            <button
              className="bg-white rounded-full p-2 shadow-md cursor-pointer"
              onClick={handlePrev}
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>

            {/* Progress Indicator */}
            <div className="flex justify-center space-x-2">
              {content.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 bg-blue-500'
                      : 'w-2 bg-gray-300'
                  }`}
                  style={{
                    width: index === currentIndex ? `${0.5 + (progress / 100) * 1.5}rem` : '0.5rem', // Animate width from 0.5rem to 2rem
                    backgroundColor: index === currentIndex ? 'var(--tw-bg-blue-500)' : 'var(--tw-bg-gray-300)',
                    transformOrigin: 'left',
                    transform: index === currentIndex ? `scaleX(1)` : 'scaleX(1)', // Remove scaleX transform
                  }}
                >
                     {index === currentIndex && (
                      <div className="h-full bg-blue-700 rounded-full" style={{ width: `${progress}%` }}></div>
                    )}
                </div>
              ))}
            </div>

            <button
              className="bg-white rounded-full p-2 shadow-md cursor-pointer"
              onClick={handleNext}
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6 text-gray-700" />
            </button>
        </div>
        <div
          ref={carouselRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:scrollbar-hide w-full"
          style={{
            scrollBehavior: 'smooth',
            msOverflowStyle: 'none',  /* Internet Explorer 10+ */
            scrollbarWidth: 'none',  /* Firefox */
          }}
        >
          {content.map((item, index) => (
            <div key={index} className="flex-none w-full snap-center">
              <div className="flex flex-col items-center p-6 space-y-4">
                <div>
                  <p className="text-xl font-medium text-gray-600">{item.title}</p>
                </div>
                <div>
                  <img src={item.imageUrl} alt={item.title} className="w-full h-auto rounded-md object-cover" />
                </div>
              </div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
};

export default HorizontalCarousel;