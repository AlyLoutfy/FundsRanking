import { useState, useRef, useEffect } from 'react';

/**
 * Hook to add swipe-to-close behavior on mobile headers.
 * @param {Function} onClose - Function to call when swipe threshold is reached.
 * @param {number} threshold - Distance in pixels to trigger close (default: 100).
 * @param {boolean} enabled - Whether the effect is enabled (default: true).
 * @returns {Object} - { handlers, style, isDragging, offsetY }
 */
export const useSwipeToClose = (onClose, threshold = 100, enabled = true) => {
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  
  // Only enable on touch devices
  const isTouch = typeof window !== 'undefined' && 'ontouchstart' in window;

  const handleTouchStart = (e) => {
    if (!enabled || !isTouch) return;
    
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const touchY = e.touches[0].clientY;
    const deltaY = touchY - startY.current;

    // Allow dragging in both directions
    if (deltaY > 0) {
      // Dragging down - 1:1 movement
      setOffsetY(deltaY);
    } else {
      // Dragging up - apply resistance
      setOffsetY(deltaY * 0.3);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);

    if (offsetY > threshold) {
      // Trigger close if dragged down past threshold
      onClose();
    } else {
      // Bounce back to 0 (for both up and down drags that didn't meet threshold)
      setOffsetY(0);
    }
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
    isDragging,
    offsetY
  };
};
