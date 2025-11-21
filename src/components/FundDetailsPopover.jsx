
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, TrendingUp, Shield, Target, Wallet, Percent, Calculator } from 'lucide-react';
import clsx from 'clsx';
import TimeMachine from './TimeMachine';

const FundDetailsPopover = ({ fund, badge }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState('top'); // 'top' or 'bottom'
  const [align, setAlign] = useState('right'); // 'right' (default) or 'left'
  const [showTimeMachine, setShowTimeMachine] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      // Constants for popover dimensions
      const POPOVER_HEIGHT = showTimeMachine ? 520 : 320; 
      const POPOVER_WIDTH = showTimeMachine ? 320 : 288; // w-80 vs w-72
      const GAP = 10;

      // Vertical Check
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      
      // Prefer top if it fits, otherwise bottom. If neither, pick side with more space.
      let newPlacement = 'top';
      if (spaceAbove >= POPOVER_HEIGHT + GAP) {
        newPlacement = 'top';
      } else if (spaceBelow >= POPOVER_HEIGHT + GAP) {
        newPlacement = 'bottom';
      } else {
        newPlacement = spaceAbove > spaceBelow ? 'top' : 'bottom';
      }
      setPlacement(newPlacement);

      // Horizontal Check
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
    if (isClosing) {
      setIsClosing(false); // Cancel closing if re-entering
    }
    updatePosition();
    setIsVisible(true);
  };

  const closePopover = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      setShowTimeMachine(false);
      setIsClicked(false);
    }, 200); // Match animation duration
  };

  const handleMouseLeave = () => {
    if (isClicked) return; // Don't close if locked by click

    timeoutRef.current = setTimeout(() => {
      closePopover();
    }, 150); // Small delay to allow moving to popover
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (isClicked) {
      closePopover();
    } else {
      setIsClicked(true);
      setIsVisible(true);
      setIsClosing(false);
      updatePosition();
    }
  };

  const handleBackdropClick = () => {
    closePopover();
  };

  // Update position on scroll/resize if visible
  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible, showTimeMachine]);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      ref={triggerRef}
    >
      <Info className="w-4 h-4 text-white/40 hover:text-white transition-colors cursor-pointer" />
      
      {isVisible && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className={clsx(
              "fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[9998]",
              isClosing ? "animate-fadeOut" : "animate-fadeIn",
              isClicked ? "pointer-events-auto" : "pointer-events-none"
            )}
            aria-hidden="true"
            onClick={handleBackdropClick}
          />
          
          <div 
            className={clsx(
              "absolute z-[9999] pointer-events-none transition-all duration-200",
              showTimeMachine ? "w-80" : "w-72",
              isClosing ? "animate-fadeOut" : "animate-fadeIn"
            )}
          style={{ 
            top: `${position.top}px`, 
            left: `${position.left}px`,
            // If align is right, we translate -100% to shift it left. If align is left, we don't shift X.
            // If placement is top, we translate -100% Y. If bottom, we don't shift Y.
            transform: `translate(${align === 'right' ? '-100%' : '0'}, ${placement === 'top' ? '-100%' : '0'})`
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside popover from closing it
        >
          <div className="relative bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl p-4 text-left pointer-events-auto">
            
            {/* Arrow */}
            <div 
              className={clsx(
                "absolute w-3 h-3 bg-[#1a1a1a] border-r border-b border-[#333] rotate-45",
                // Vertical positioning
                placement === 'top' ? "-bottom-1.5 border-t-0 border-l-0" : "-top-1.5 border-b-0 border-r-0 rotate-[225deg]",
                // Horizontal positioning
                align === 'right' ? "right-1" : "left-1"
              )}
            />

            {showTimeMachine ? (
              <TimeMachine 
                annualReturn={fund.annualReturn} 
                onClose={() => setShowTimeMachine(false)} 
              />
            ) : (
              <>
                {/* Badge - Absolute Top Right */}
                {badge && (
                  <div className="absolute top-3 right-4">
                    {badge === 'promoted' && (
                      <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded border border-yellow-500/30 uppercase tracking-wider">
                        Promoted
                      </span>
                    )}
                    {badge === 'new' && (
                      <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded border border-blue-500/30 uppercase tracking-wider">
                        New
                      </span>
                    )}
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-3 pr-24">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white text-sm">{fund.name}</h4>
                    </div>
                    <p className="text-xs text-text-muted line-clamp-2">{fund.description}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[#111] p-2 rounded-lg border border-[#222]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Target className="w-3 h-3 text-primary" />
                      <span className="text-[10px] text-text-muted uppercase">Strategy</span>
                    </div>
                    <p className="text-xs font-medium text-white truncate" title={fund.strategy}>{fund.strategy}</p>
                  </div>
                  
                  <div className="bg-[#111] p-2 rounded-lg border border-[#222]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Wallet className="w-3 h-3 text-green-400" />
                      <span className="text-[10px] text-text-muted uppercase">Min Invest</span>
                    </div>
                    <p className="text-xs font-medium text-white">{fund.minInvestment}</p>
                  </div>

                  <div className="bg-[#111] p-2 rounded-lg border border-[#222]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Percent className="w-3 h-3 text-orange-400" />
                      <span className="text-[10px] text-text-muted uppercase">Fees</span>
                    </div>
                    <p className="text-xs font-medium text-white">{fund.fees}</p>
                  </div>

                  <div className="bg-[#111] p-2 rounded-lg border border-[#222]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Shield className="w-3 h-3 text-purple-400" />
                      <span className="text-[10px] text-text-muted uppercase">Risk</span>
                    </div>
                    <p className={clsx(
                      "text-xs font-medium",
                      fund.risk === 'High' ? "text-red-400" : 
                      fund.risk === 'Medium' ? "text-yellow-400" : "text-green-400"
                    )}>{fund.risk}</p>
                  </div>
                </div>

                {/* Time Machine Button */}
                <button 
                  onClick={() => setShowTimeMachine(true)}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 group"
                >
                  <Calculator className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                  Launch Time Machine
                </button>
              </>
            )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default FundDetailsPopover;

