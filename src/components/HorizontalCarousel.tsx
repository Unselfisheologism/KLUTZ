'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselItem {
  title: string;
  description: string;
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
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">{title}</h2>
      <div className="relative">
        <div
          ref={carouselRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          {content.map((item, index) => (
            <div key={index} className="flex-none w-full snap-center">
              <div className="flex flex-col items-center rounded-lg shadow-md p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                <div>
                  <img src={item.imageUrl} alt={item.title} className="w-full h-auto rounded-md object-cover" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md cursor-pointer"
          onClick={handlePrev}
          aria-label="Previous"
        >
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>
        <button
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md cursor-pointer"
          onClick={handleNext}
          aria-label="Next"
        >
          <ChevronRight className="h-6 w-6 text-gray-700" />
        </button>

        {/* Progress Indicator */}
        <div className="flex justify-center mt-4 space-x-2">
          {content.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-blue-500'
                  : 'w-2 bg-gray-300'
              }`}
              style={{
                width: index === currentIndex ? `${2 + (progress / 100) * 6}rem` : '0.5rem', // Animate width from 0.5rem to 2rem
                backgroundColor: index === currentIndex ? 'var(--tw-bg-blue-500)' : 'var(--tw-bg-gray-300)',
                transformOrigin: 'left',
                transform: index === currentIndex ? `scaleX(${progress / 100})` : 'scaleX(1)',
              }}
            >
                 {index === currentIndex && (
                  <div className="h-full bg-blue-700 rounded-full" style={{ width: `${progress}%` }}></div>
                )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HorizontalCarousel;