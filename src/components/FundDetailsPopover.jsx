import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import clsx from 'clsx';

const FundDetailsPopover = ({ fund, badge }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState('top');
  const [align, setAlign] = useState('right'); // 'right' means anchored to right (extends left), 'left' means anchored to left (extends right)
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      const POPOVER_HEIGHT = 320;
      const POPOVER_WIDTH = 288; // w-72
      const GAP = 10;

      // Vertical Check
      const spaceAbove = rect.top;
      const newPlacement = spaceAbove > POPOVER_HEIGHT + GAP ? 'top' : 'bottom';
      setPlacement(newPlacement);

      // Horizontal Check
      // Default is 'right' (extends left from icon). Check if enough space on left.
      // Actually, 'right' alignment means the popover's right edge aligns with icon's right edge.
      // So we check if rect.right - POPOVER_WIDTH > 0 (approx).
      // But the user issue is clipping on the LEFT side when the card is on the LEFT.
      // So if rect.right < POPOVER_WIDTH, we should align 'left' (extend right).
      
      const spaceLeft = rect.right;
      const newAlign = spaceLeft < POPOVER_WIDTH ? 'left' : 'right';
      setAlign(newAlign);

      let top = 0;
      let left = 0;

      if (newPlacement === 'top') {
         top = rect.top + scrollY - GAP;
      } else {
         top = rect.bottom + scrollY + GAP;
      }

      if (newAlign === 'right') {
          left = rect.right + scrollX;
      } else {
          left = rect.left + scrollX;
      }

      setPosition({ top, left });
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    updatePosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Update position on scroll/resize if visible
  useEffect(() => {
    if (isVisible) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible]);

  return (
    <>
      <div 
        ref={triggerRef}
        className="relative inline-flex items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button 
          className="text-text-muted hover:text-primary transition-colors p-1 rounded-full hover:bg-white/5 focus:outline-none relative"
          aria-label="Fund Details"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Portal for Popover */}
      {isVisible && createPortal(
        <div 
          className="absolute z-[9999] animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            top: `${position.top}px`, 
            left: `${position.left}px`,
            transform: `translate(${align === 'right' ? '-100%' : '0'}, ${placement === 'top' ? '-100%' : '0'})`
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative w-72 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl">
            {/* Arrow */}
            <div className={clsx(
              "absolute w-3 h-3 bg-[#1a1a1a] border-[#333] rotate-45",
              placement === 'top' ? "-bottom-1.5 border-r border-b" : "-top-1.5 border-l border-t",
              align === 'right' ? "right-1" : "left-1"
            )}></div>
            
            <div className="relative p-4">
              {/* Badge Label (Visible on Hover) */}
              {badge && (
                <div className="absolute top-3 right-3">
                  <span className={clsx(
                    "px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm border",
                    badge === 'promoted' 
                      ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/20" 
                      : "bg-primary/20 text-primary border-primary/20"
                  )}>
                    {badge === 'promoted' ? 'Promoted' : 'New'}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className={clsx("flex items-center gap-3 mb-3 pb-3 border-b border-[#222]", badge && "pr-16")}>
                <img 
                  src={fund.logo} 
                  alt={fund.manager} 
                  className="w-8 h-8 rounded-lg object-cover bg-white p-0.5"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fund.manager)}&background=random&color=fff&size=64`;
                  }}
                />
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{fund.name}</h4>
                  <span className="text-xs text-text-muted">{fund.manager}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-text-muted mb-4 leading-relaxed">
                {fund.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#111] p-2 rounded-lg border border-[#222]">
                  <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Strategy</span>
                  <span className="block text-xs font-medium text-white truncate" title={fund.strategy}>{fund.strategy}</span>
                </div>
                <div className="bg-[#111] p-2 rounded-lg border border-[#222]">
                  <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Min Investment</span>
                  <span className="block text-xs font-medium text-white">{fund.minInvestment}</span>
                </div>
                <div className="bg-[#111] p-2 rounded-lg border border-[#222]">
                  <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Fees</span>
                  <span className="block text-xs font-medium text-white">{fund.fees}</span>
                </div>
                <div className="bg-[#111] p-2 rounded-lg border border-[#222]">
                  <span className="block text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Risk Level</span>
                  <span className={`block text-xs font-medium ${
                    fund.risk === "High" ? "text-red-400" : 
                    fund.risk === "Medium" ? "text-yellow-400" : "text-green-400"
                  }`}>{fund.risk}</span>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default FundDetailsPopover;
