
'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        // Direct position update for responsiveness
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    const onMouseEnterElement = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, [role="button"], input[type="checkbox"], input[type="radio"], select, textarea, [data-interactive-cursor="true"]')) {
        if (cursorRef.current) {
          cursorRef.current.classList.add('cursor-pointer-interactive');
        }
      }
    };

    const onMouseLeaveElement = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
       if (target.closest('button, a, [role="button"], input[type="checkbox"], input[type="radio"], select, textarea, [data-interactive-cursor="true"]')) {
        if (cursorRef.current) {
          cursorRef.current.classList.remove('cursor-pointer-interactive');
        }
      }
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseEnterElement);
    document.addEventListener('mouseout', onMouseLeaveElement);


    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseEnterElement);
      document.removeEventListener('mouseout', onMouseLeaveElement);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[1000]"
      // Hotspot adjustment: translate X by ~-4px, Y by ~-2px for a typical pointer tip
      style={{ transform: 'translate(-4px, -2px)' }} 
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg" 
        className="fill-primary transition-all duration-150 ease-out" // SVG itself transitions
      >
        {/* A standard pointer SVG path, you can replace this with a more custom one if desired */}
        <path d="M6.01001 3.22001L6.21001 2.71001C6.37001 2.30001 6.86001 2.16001 7.18001 2.47001L7.27001 2.56001L19.99 14.74L14.26 15.26L12.03 10.95L6.01001 3.22001Z"/>
      </svg>
    </div>
  );
}

