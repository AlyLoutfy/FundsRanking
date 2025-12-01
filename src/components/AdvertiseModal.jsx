import React, { useState, useRef } from 'react';
import { X, Megaphone, Send } from 'lucide-react';
import clsx from 'clsx';
import { useMobileOverscroll } from '../hooks/useMobileOverscroll';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLanguage } from '../context/LanguageContext';

const AdvertiseModal = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const scrollRef = useRef(null);
  const { handlers: overscrollHandlers, style: overscrollStyle } = useMobileOverscroll(scrollRef, isOpen);
  const { handlers: swipeHandlers, style: swipeStyle, isDragging: isSwiping } = useSwipeToClose(onClose, 100, isOpen);
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    message: ''
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
      }, 200);
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
    // Parent controls state, so we just call onClose
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send an email or API request
    console.log("Advertise Request:", formData);
    alert(t('inquirySent'));
    onClose();
    setFormData({ companyName: '', email: '', message: '' });
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
          <h3 className="text-base md:text-lg font-bold text-white font-display">{t('advertiseTitle')}</h3>
          <button 
            onClick={onClose}
            className="p-1.5 md:p-2 hover:bg-[#333] rounded-full transition-colors text-text-muted hover:text-white"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        <div ref={scrollRef} className="overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-text-muted leading-relaxed">
              {t('advertiseDesc')}
            </p>
          </div>

          {/* Availability Badge */}
          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm font-medium text-white">{t('availableSlots')}</span>
            </div>
            <span className="text-lg font-bold text-primary">{t('slotsLeft')}</span>
          </div>

          {/* Pricing Card */}
          <div className="bg-[#161616] border border-[#333] rounded-xl p-5">
            <h4 className="text-white font-bold text-sm mb-2">{t('pricing')}</h4>
            <p className="text-text-muted text-xs mb-4">
              {t('pricingDesc1')} <span className="text-white font-medium">{t('pricingDesc2')}</span>
              {t('pricingDesc3')}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">{t('price')}</span>
              <span className="text-text-muted text-xs">{t('perMonth')}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">{t('companyName')}</label>
              <input
                type="text"
                required
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary outline-none transition-colors placeholder:text-[#404040] rtl:text-right"
                placeholder={t('phCompany')}
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">{t('emailAddress')}</label>
              <input
                type="email"
                required
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary outline-none transition-colors placeholder:text-[#404040] rtl:text-right"
                placeholder={t('phEmail')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <Send className="w-4 h-4" />
              {t('sendInquiry')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdvertiseModal;
