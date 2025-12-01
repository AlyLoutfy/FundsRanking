import React, { useState, useRef } from 'react';
import { X, Check } from 'lucide-react';
import clsx from 'clsx';
import { useMobileOverscroll } from '../hooks/useMobileOverscroll';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLanguage } from '../context/LanguageContext';

const SubmitFundModal = ({ isOpen, onClose, onSubmit }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const scrollRef = useRef(null);
  const { handlers: overscrollHandlers, style: overscrollStyle } = useMobileOverscroll(scrollRef, isOpen);
  const { handlers: swipeHandlers, style: swipeStyle, isDragging: isSwiping } = useSwipeToClose(onClose, 100, isOpen);
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Equity',
    annualReturn: '',
    risk: 'Medium',
    description: '',
    strategy: '',
    minInvestment: '',
    fees: ''
  });

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 400); // Match sleek animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open (enhanced for mobile/iOS)
  React.useEffect(() => {
    if (isVisible) {
      const scrollY = window.scrollY;
      const body = document.body;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      body.style.overflow = 'hidden';
      body.style.paddingRight = `${scrollbarWidth}px`;
      
      return () => {
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';
        body.style.overflow = '';
        body.style.paddingRight = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isVisible]);

  if (!isVisible && !isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    // The parent controls 'isOpen', so we just call onClose.
    // The useEffect will handle the animation state when isOpen changes to false.
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    handleClose();
    setFormData({ 
      name: '', 
      category: 'Equity', 
      annualReturn: '', 
      risk: 'Medium',
      description: '',
      strategy: '',
      minInvestment: '',
      fees: ''
    });
  };

  return (
    <div 
      className={clsx(
        "fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm",
        isClosing ? "animate-fadeOut" : "animate-fadeIn"
      )}
      onClick={handleClose}
    >
      <div 
        {...overscrollHandlers}
        style={{
          ...overscrollStyle,
          transform: isSwiping ? swipeStyle.transform : overscrollStyle.transform,
          transition: isSwiping ? swipeStyle.transition : overscrollStyle.transition,
        }}
        className={clsx(
          "bg-surface md:border border-border rounded-t-2xl md:rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] flex flex-col",
          isClosing 
            ? "animate-drawerClose md:animate-sleekClose" 
            : "animate-drawerOpen md:animate-sleekOpen"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          {...swipeHandlers}
          className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-[#333] bg-[#1a1a1a] touch-none cursor-grab active:cursor-grabbing"
        >
          <h3 className="text-base md:text-lg font-bold text-white font-display">{t('submitFundTitle')}</h3>
          <button 
            onClick={onClose}
            className="p-1.5 md:p-2 hover:bg-[#333] rounded-full transition-colors text-text-muted hover:text-white"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        <div ref={scrollRef} className="overflow-y-auto p-4 space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-200">
              {t('submitNote')}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">{t('fundName')}</label>
            <input
              type="text"
              required
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-base focus:border-primary outline-none transition-colors rtl:text-right"
              placeholder={t('phName')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">{t('description')}</label>
            <textarea
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-base focus:border-primary outline-none transition-colors min-h-[60px] rtl:text-right"
              placeholder={t('phDesc')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">{t('category')}</label>
              <select
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-base focus:border-primary outline-none transition-colors appearance-none rtl:text-right"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Equity">{t('equity')}</option>
                <option value="Fixed Income">{t('fixedIncome')}</option>
                <option value="Mixed">{t('mixed')}</option>
                <option value="Islamic">{t('islamic')}</option>
                <option value="Tech">{t('tech')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">{t('riskLevel')}</label>
              <select
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-base focus:border-primary outline-none transition-colors appearance-none rtl:text-right"
                value={formData.risk}
                onChange={(e) => setFormData({ ...formData, risk: e.target.value })}
              >
                <option value="Low">{t('lowRisk')}</option>
                <option value="Medium">{t('mediumRisk')}</option>
                <option value="High">{t('highRisk')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">{t('strategy')}</label>
            <input
              type="text"
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-base focus:border-primary outline-none transition-colors rtl:text-right"
              placeholder={t('phStrategy')}
              value={formData.strategy}
              onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">{t('minInvestment')}</label>
              <input
                type="text"
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-base focus:border-primary outline-none transition-colors rtl:text-right"
                placeholder={t('phMinInv')}
                value={formData.minInvestment}
                onChange={(e) => setFormData({ ...formData, minInvestment: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">{t('fees')}</label>
              <input
                type="text"
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-base focus:border-primary outline-none transition-colors rtl:text-right"
                placeholder={t('phFees')}
                value={formData.fees}
                onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">{t('annualReturn')} (%)</label>
            <input
              type="number"
              step="0.1"
              required
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-base focus:border-primary outline-none transition-colors rtl:text-right"
              placeholder={t('phReturn')}
              value={formData.annualReturn}
              onChange={(e) => setFormData({ ...formData, annualReturn: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors mt-4 text-sm"
          >
            <Check className="w-4 h-4" />
            {t('submitFundBtn')}
          </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitFundModal;
