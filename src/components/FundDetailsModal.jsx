import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, TrendingUp, Shield, Target, Wallet, Percent, Calculator, ArrowRightLeft, Search, Plus } from 'lucide-react';
import clsx from 'clsx';
import TimeMachine from './TimeMachine';

import { useMobileOverscroll } from '../hooks/useMobileOverscroll';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLanguage } from '../context/LanguageContext';

const FundHeader = ({ fund, onCloseAction, canClose }) => {
  const { t } = useLanguage();
  
  const getCategoryKey = (category) => {
    const map = {
      'Equity': 'equity',
      'Fixed Income': 'fixedIncome',
      'Balanced': 'balanced',
      'Islamic': 'islamic',
      'Growth': 'growth',
      'Money Market': 'moneyMarket',
      'Tech': 'tech',
      'Mixed': 'mixed'
    };
    return map[category] || category;
  };

  const getRiskKey = (risk) => {
    const map = {
      'Low': 'lowRisk',
      'Medium': 'mediumRisk',
      'High': 'highRisk'
    };
    return map[risk] || risk;
  };

  if (!fund) return null;
  
  return (
  <div className="relative flex items-start gap-4">
    {canClose && (
      <button 
        onClick={onCloseAction}
        className="absolute -top-2 -right-2 p-1.5 hover:bg-[#333] rounded-full text-text-muted hover:text-white transition-colors z-10 rtl:right-auto rtl:-left-2"
        title="Close fund"
      >
        <X className="w-4 h-4" />
      </button>
    )}
    <img 
      src={fund.logo} 
      alt={fund.name} 
      className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-contain bg-white p-1 shadow-lg shrink-0"
      onError={(e) => {
        e.target.onerror = null; 
        e.target.src = `https://ui-avatars.com/api/?name=${fund.manager}&background=random&color=fff&size=64`;
      }}
    />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-lg md:text-xl font-bold text-white leading-tight line-clamp-2">{fund.name}</h2>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <p className="text-primary font-medium text-sm">{fund.manager}</p>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#222] text-text-muted border border-[#333] uppercase tracking-wider">
          {t(getCategoryKey(fund.category))}
        </span>
        <span className={clsx(
          "px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider",
          fund.risk === 'High' ? "bg-red-500/10 text-red-400 border-red-500/20" : 
          fund.risk === 'Medium' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : 
          "bg-green-500/10 text-green-400 border-green-500/20"
        )}>
          {t(getRiskKey(fund.risk))} {t('risk')}
        </span>
      </div>
    </div>
  </div>
  );
};

const StatRow = ({ label, icon: Icon, value1, value2, highlightBetter = false, format = (v) => v, valueClassName = "", showRightColumn }) => {
  const isBetter = (v1, v2) => {
    if (typeof v1 === 'number' && typeof v2 === 'number') return v1 > v2;
    return false;
  };

  const v1Better = highlightBetter && value2 && isBetter(parseFloat(value1), parseFloat(value2));
  const v2Better = highlightBetter && value2 && isBetter(parseFloat(value2), parseFloat(value1));

  if (showRightColumn) {
    return (
      <div className="py-4 border-b border-white/5 last:border-0">
        {/* Mobile: Stack vertically with full labels, Desktop: Side by side */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-8">
          {/* First fund value */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 text-text-muted shrink-0 mt-0.5 w-40">
              {Icon && <Icon className="w-4 h-4 shrink-0" />}
              <span className="text-xs uppercase tracking-wider font-medium whitespace-nowrap">{label}</span>
            </div>
            <span className={clsx(
              "font-bold text-sm text-left leading-snug flex-1 break-words rtl:text-right",
              v1Better ? "text-green-400" : "text-white",
              valueClassName
            )}>
              {format(value1)}
            </span>
          </div>

          {/* Second fund value */}
          <div className="flex items-start justify-between gap-4">
            {/* Show label with icon on mobile, hide on desktop (desktop uses label from first column) */}
            <div className="flex items-center gap-2 text-text-muted shrink-0 mt-0.5 w-40 md:hidden">
              {Icon && <Icon className="w-4 h-4 shrink-0" />}
              <span className="text-xs uppercase tracking-wider font-medium whitespace-nowrap">{label}</span>
            </div>
            
            {value2 ? (
              <span className={clsx(
                "font-bold text-sm text-left leading-snug flex-1 break-words rtl:text-right",
                v2Better ? "text-green-400" : "text-white",
                valueClassName
              )}>
                {format(value2)}
              </span>
            ) : (
              <span className="text-sm text-text-muted/20 text-left flex-1 rtl:text-right">-</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-8 py-4 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 text-text-muted shrink-0 mt-0.5 w-40">
        {Icon && <Icon className="w-4 h-4" />}
        <span className="text-xs uppercase tracking-wider font-medium whitespace-nowrap">{label}</span>
      </div>
      <span className={clsx(
        "font-bold text-sm text-left leading-snug flex-1 break-words rtl:text-right",
        "text-white",
        valueClassName
      )}>
        {format(value1)}
      </span>
    </div>
  );
};

const FundDetailsModal = ({ isOpen, onClose, fund, allFunds = [] }) => {
  const [leftFund, setLeftFund] = useState(null);
  const [rightFund, setRightFund] = useState(null);
  
  const [isComparing, setIsComparing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTimeMachine, setShowTimeMachine] = useState(false);
  const [isClosingTimeMachine, setIsClosingTimeMachine] = useState(false);
  
  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const timeMachineRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Mobile overscroll hook
  const { handlers: overscrollHandlers, style: overscrollStyle, offsetY: overscrollOffset } = useMobileOverscroll(scrollContainerRef, isOpen);
  
  // Swipe to close hook
  const { handlers: swipeHandlers, style: swipeStyle, isDragging: isSwiping, offsetY: swipeOffset } = useSwipeToClose(onClose, 100, isOpen);

  const { t } = useLanguage();

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 200); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Sync prop 'fund' to 'leftFund' when modal opens
  useEffect(() => {
    if (isOpen && fund) {
      setLeftFund(fund);
      setRightFund(null);
      setIsComparing(false);
      setSearchQuery('');
      setShowTimeMachine(false);
      setIsClosingTimeMachine(false);
    }
  }, [isOpen, fund]);

  useEffect(() => {
    if (showTimeMachine && timeMachineRef.current && !isClosingTimeMachine) {
      setTimeout(() => {
        timeMachineRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showTimeMachine, isClosingTimeMachine]);

  // Prevent body scroll when modal is open (fixes mobile scroll issues)
  useEffect(() => {
    if (isVisible) {

      
      // Store original values
      const originalOverflow = document.body.style.overflow;

      
      // Lock body scroll and add padding to prevent shift
      document.body.style.overflow = 'hidden';

      
      return () => {
        // Restore original values when modal closes
        document.body.style.overflow = originalOverflow;

      };
    }
  }, [isVisible]);

  const handleCloseTimeMachine = () => {
    setIsClosingTimeMachine(true);
    setTimeout(() => {
      setShowTimeMachine(false);
      setIsClosingTimeMachine(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 300);
  };

  const filteredFunds = useMemo(() => {
    if (!leftFund) return [];
    
    let candidates = allFunds.filter(f => f.id !== leftFund.id);
    if (rightFund) {
      candidates = candidates.filter(f => f.id !== rightFund.id);
    }

    if (!searchQuery) return candidates.slice(0, 5);
    
    return candidates
      .filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        f.manager.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);
  }, [allFunds, leftFund, rightFund, searchQuery]);

  // Render condition based on animation state
  if (!isVisible && !isOpen) return null;
  // Safety check for leftFund, though it should be set if isOpen was true
  if (!leftFund && !isClosing) return null; 
  // If closing, we might still want to render the last known leftFund to animate out.
  // But if leftFund is null, we can't render much. 
  // Ideally we persist the fund during closing. 
  // For now, if leftFund is null, we just return null (no animation out if data is gone).
  if (!leftFund) return null;

  const handleCloseMain = () => {
    // Parent controls isOpen, so we just call onClose.
    // The useEffect will handle the isClosing state.
    onClose();
  };

  const handleCloseLeft = () => {
    if (rightFund) {
      setLeftFund(rightFund);
      setRightFund(null);
      setIsComparing(false);
    } else {
      handleCloseMain();
    }
  };

  const handleCloseRight = () => {
    setRightFund(null);
    setIsComparing(false);
  };

  const handleSelectComparison = (selected) => {
    setRightFund(selected);
    setIsComparing(false);
    setSearchQuery('');
  };

  const startComparison = () => {
    setIsComparing(true);
  };

  const showRightColumn = rightFund || isComparing;

  return (
    <div className={clsx(
      "fixed inset-0 z-[9999] flex items-end md:items-center justify-center md:p-4",
      // No padding on mobile for full-width drawer
    )}>
      <div 
        className={clsx(
          "absolute inset-0 bg-black/80 backdrop-blur-sm",
          isClosing ? "animate-fadeOut" : "animate-fadeIn"
        )}
        onClick={handleCloseMain}
        onTouchMove={(e) => e.preventDefault()}
      />

      <div 
        {...overscrollHandlers}
        style={{
          ...overscrollStyle,
          transform: isSwiping ? swipeStyle.transform : overscrollStyle.transform,
          transition: isSwiping ? swipeStyle.transition : overscrollStyle.transition,
        }}
        className={clsx(
          "relative bg-[#161616] md:border md:border-[#333] shadow-2xl w-full flex flex-col overflow-hidden transition-all duration-300",
          "max-h-[90vh] rounded-t-2xl md:rounded-2xl md:max-h-[90vh]",
          showRightColumn ? "md:max-w-5xl" : "md:max-w-xl",
          isClosing 
            ? "animate-drawerClose md:animate-sleekClose" 
            : "animate-drawerOpen md:animate-sleekOpen"
        )}>
        
        <div 
          {...swipeHandlers}
          className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-[#333] bg-[#1a1a1a] touch-none cursor-grab active:cursor-grabbing"
        >
          <h3 className="text-base md:text-lg font-bold text-white font-display">
            {rightFund ? t('fundComparison') : t('fundDetails')}
          </h3>
          <button 
            onClick={handleCloseMain}
            className="p-1.5 md:p-2 hover:bg-[#333] rounded-full transition-colors text-text-muted hover:text-white"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 custom-scrollbar" ref={scrollContainerRef}>
          
          <div className={clsx(
            "grid gap-4 md:gap-8 mb-4",
            showRightColumn ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          )}>
            {/* Left Column */}
            <div className="flex flex-col gap-4">
              <FundHeader 
                fund={leftFund} 
                onCloseAction={handleCloseLeft} 
                canClose={!!rightFund} 
              />
              <p className="text-sm text-text-muted leading-relaxed">
                {leftFund.description}
              </p>
            </div>

            {/* Right Column */}
            {showRightColumn && (
              <div className={clsx(
                "flex flex-col gap-4",
                "pt-4 md:pt-0 border-t md:border-t-0 md:pl-8 md:border-l border-[#333] rtl:md:pl-0 rtl:md:pr-8 rtl:md:border-l-0 rtl:md:border-r",
                !rightFund && "min-h-[120px]"
              )}>
                {rightFund ? (
                  <>
                    <FundHeader 
                      fund={rightFund} 
                      onCloseAction={handleCloseRight} 
                      canClose={true}
                    />
                    <p className="text-sm text-text-muted leading-relaxed">
                      {rightFund.description}
                    </p>
                  </>
                ) : (
                  <div className="h-full flex flex-col bg-[#1a1a1a] rounded-xl p-4 border border-[#333] shadow-inner">
                     <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-white">{t('selectFundToCompare')}</h4>
                        <button onClick={() => setIsComparing(false)} className="text-xs text-text-muted hover:text-white">{t('cancel')}</button>
                     </div>
                     <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted rtl:left-auto rtl:right-3" />
                        <input 
                          type="text" 
                          autoFocus
                          placeholder={t('searchPlaceholder')} 
                          className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg py-2 pl-9 pr-4 text-base md:text-sm text-white focus:border-primary outline-none transition-colors shadow-sm rtl:pl-4 rtl:pr-9"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                     </div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[200px] -mr-2 pr-2 rtl:mr-0 rtl:ml-2 rtl:pl-2">
                        {filteredFunds.map(f => (
                          <button 
                            key={f.id}
                            onClick={() => handleSelectComparison(f)}
                            className="w-full flex items-center gap-3 p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors text-left group mb-1 rtl:text-right"
                          >
                            <img 
                              src={f.logo} 
                              alt={f.name} 
                              className="w-8 h-8 rounded-lg object-cover border border-[#333] shadow-sm group-hover:border-[#444] transition-colors"
                              onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = `https://ui-avatars.com/api/?name=${f.manager}&background=random&color=fff&size=64`;
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white group-hover:text-primary truncate">{f.name}</div>
                              <div className="text-[10px] text-text-muted">{f.manager}</div>
                            </div>
                            <div className={clsx("text-xs font-mono font-bold", f.annualReturn >= 0 ? "text-green-400" : "text-red-400")}>
                              {f.annualReturn}%
                            </div>
                          </button>
                        ))}
                        {filteredFunds.length === 0 && (
                          <div className="text-center py-8 text-text-muted text-xs">
                            {t('noFundsFound')} "{searchQuery}"
                          </div>
                        )}
                     </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-[#111] rounded-xl border border-[#222] px-4 py-1 mb-4">
            <StatRow 
              label={t('annualReturn')} 
              icon={TrendingUp} 
              value1={leftFund.annualReturn} 
              value2={rightFund?.annualReturn}
              highlightBetter={true}
              format={(v) => `${v}%`}
              showRightColumn={showRightColumn}
            />
            <StatRow 
              label={t('ytdReturn')} 
              icon={TrendingUp} 
              value1={leftFund.ytdReturn} 
              value2={rightFund?.ytdReturn}
              highlightBetter={true}
              format={(v) => `${v > 0 ? '+' : ''}${v}%`}
              showRightColumn={showRightColumn}
            />
            <StatRow 
              label={t('fees')} 
              icon={Percent} 
              value1={leftFund.fees} 
              value2={rightFund?.fees}
              showRightColumn={showRightColumn}
            />
            <StatRow 
              label={t('minInvestment')} 
              icon={Wallet} 
              value1={leftFund.minInvestment} 
              value2={rightFund?.minInvestment}
              format={(v) => v ? Number(v).toLocaleString() : v}
              showRightColumn={showRightColumn}
            />
            <StatRow 
              label={t('strategy')} 
              icon={Target} 
              value1={leftFund.strategy} 
              value2={rightFund?.strategy}
              valueClassName="text-xs"
              showRightColumn={showRightColumn}
            />
          </div>

          <div className="flex flex-col gap-4">
            {!showRightColumn && (
              <button 
                onClick={startComparison}
                className="w-full py-3 bg-[#1a1a1a] border border-[#333] hover:border-primary/50 hover:bg-[#222] text-text-muted hover:text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 group"
              >
                <ArrowRightLeft className="w-4 h-4 group-hover:text-primary transition-colors" />
                {t('compareWithAnother')}
              </button>
            )}

            <div className="mt-2" ref={timeMachineRef}>
              {(showTimeMachine || isClosingTimeMachine) && (
                <div className={clsx(
                  "transition-all duration-300 overflow-hidden",
                  isClosingTimeMachine ? "opacity-0 -translate-y-4 max-h-0" : "opacity-100 translate-y-0 animate-fadeIn"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-primary" />
                      {t('timeMachine')} {rightFund && t('comparison')}
                    </h4>
                     <button onClick={handleCloseTimeMachine} className="text-xs text-text-muted hover:text-white">{t('closeTimeMachine')}</button>
                  </div>
                  
                  {rightFund ? (
                    <div className={clsx("grid gap-4", "grid-cols-1 md:grid-cols-2")}>
                      <div>
                        <h5 className="text-xs font-bold text-white mb-2 opacity-60">{leftFund.name}</h5>
                        <TimeMachine 
                          annualReturn={leftFund.annualReturn} 
                          onClose={handleCloseTimeMachine} 
                        />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white mb-2 opacity-60">{rightFund.name}</h5>
                        <TimeMachine 
                          annualReturn={rightFund.annualReturn} 
                          onClose={handleCloseTimeMachine} 
                        />
                      </div>
                    </div>
                  ) : (
                    <TimeMachine 
                      annualReturn={leftFund.annualReturn} 
                      onClose={handleCloseTimeMachine} 
                    />
                  )}
                </div>
              )}
              
              {!showTimeMachine && !isClosingTimeMachine && (
                <button 
                  onClick={() => setShowTimeMachine(true)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 group"
                >
                  <Calculator className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  {t('launchTimeMachine')}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FundDetailsModal;
