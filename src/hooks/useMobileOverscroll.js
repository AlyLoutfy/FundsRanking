import { useState, useRef, useEffect } from 'react';

/**
 * Hook to add rubber-band overscroll effect on mobile.
 * @param {React.RefObject} scrollRef - Ref to the scrollable container element.
 * @param {boolean} enabled - Whether the effect is enabled (default: true).
 * @returns {Object} - { handlers, style, isDragging }
 */
export const useMobileOverscroll = (scrollRef, enabled = true) => {
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  
  // Only enable on touch devices (simple check)
  const isTouch = typeof window !== 'undefined' && 'ontouchstart' in window;

  const handleTouchStart = (e) => {
    if (!enabled || !isTouch) return;
    
    // Only activate if we are at the top of the scroll container
    if (scrollRef.current && scrollRef.current.scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
    currentY.current = startY.current;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const touchY = e.touches[0].clientY;
    const deltaY = touchY - startY.current;

    // If scrolling down (deltaY > 0) and we were at the top
    if (deltaY > 0) {
      // Apply resistance: square root or log function for rubber band feel
      // Simple resistance: delta * 0.4
      // Better resistance: dampening as it gets further
      const dampened = deltaY * 0.4; // Simple linear damping for now
      
      // Prevent default to stop native scroll chaining if we are handling it
      // Note: preventing default on touchmove can be tricky with passive listeners
      // We'll rely on the visual effect.
      
      setOffsetY(dampened);
    } else {
      // If moving up, we let native scroll handle it, so reset offset
      setOffsetY(0);
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    setOffsetY(0); // Animate back to 0
  };

  // Reset if disabled
  useEffect(() => {
    if (!enabled) {
      setOffsetY(0);
      setIsDragging(false);
    }
  }, [enabled]);

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    },
    style: {
      transform: `translateY(${offsetY}px)`,
      transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
    },
    isDragging
  };
};
