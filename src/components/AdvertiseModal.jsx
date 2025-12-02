import React, { useState, useRef, useEffect } from 'react';
import { X, Megaphone, Send, Upload, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useMobileOverscroll } from '../hooks/useMobileOverscroll';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import AdSpace from './AdSpace';

const AdvertiseModal = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const scrollRef = useRef(null);
  const { handlers: overscrollHandlers, style: overscrollStyle } = useMobileOverscroll(scrollRef, isOpen);
  const { handlers: swipeHandlers, style: swipeStyle, isDragging: isSwiping } = useSwipeToClose(onClose, 100, isOpen);
  const { t } = useLanguage();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    message: '',
    logo: null,
    logoPreview: null
  });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
        // Reset form on close
        setFormData({
            companyName: '',
            email: '',
            phone: '',
            message: '',
            logo: null,
            logoPreview: null
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open (enhanced for mobile/iOS)
  useEffect(() => {
    if (isVisible) {
      const scrollY = window.scrollY;
      const body = document.body;

      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      body.style.overflow = 'hidden';

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showToast('File size must be less than 2MB', 'error');
        return;
      }
      
      const objectUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        logo: file,
        logoPreview: objectUrl
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let logoUrl = null;

      // Upload logo if selected
      if (formData.logo) {
        const fileExt = formData.logo.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, formData.logo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(filePath);
          
        logoUrl = publicUrl;
      }

      const { error } = await supabase
        .from('ads')
        .insert([{
          company_name: formData.companyName,
          email: formData.email,
          phone: formData.phone,
          text_en: formData.message,
          image_url: logoUrl,
          status: 'pending'
        }]);

      if (error) throw error;

      showToast(t('inquirySent') || 'Inquiry sent! We will contact you shortly.', 'success');
      onClose();
    } catch (error) {
      console.error('Error submitting ad:', error);
      showToast('Error sending inquiry. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible && !isOpen) return null;

  const handleClose = () => {
    onClose();
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
          "bg-surface md:border border-border rounded-t-2xl md:rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col",
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

        <div ref={scrollRef} className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Form */}
            <div className="space-y-6">


                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">{t('companyName')} <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        required
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary outline-none transition-colors placeholder:text-[#404040] rtl:text-right"
                        placeholder={t('phCompany')}
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-1.5">{t('emailAddress')} <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                required
                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary outline-none transition-colors placeholder:text-[#404040] rtl:text-right"
                                placeholder={t('phEmail')}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-1.5">{t('phoneNumber')}</label>
                            <input
                                type="tel"
                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary outline-none transition-colors placeholder:text-[#404040] rtl:text-right"
                                placeholder="+20..."
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-text-muted mb-1.5">Ad Text <span className="text-text-muted/50">(Short sentence)</span></label>
                        <textarea
                            rows="3"
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary outline-none transition-colors placeholder:text-[#404040] rtl:text-right resize-none"
                            placeholder="e.g. The best investment platform in Egypt..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            maxLength={100}
                        />
                        <div className="text-[10px] text-text-muted text-right mt-1">
                            {formData.message.length}/100
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-text-muted mb-1.5">Company Logo</label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-24 border-2 border-dashed border-[#333] hover:border-primary/50 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#0a0a0a]"
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            {formData.logoPreview ? (
                                <div className="flex items-center gap-3">
                                    <img src={formData.logoPreview} alt="Preview" className="h-16 w-16 object-contain" />
                                    <span className="text-xs text-primary">Change Logo</span>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-6 h-6 text-text-muted mb-2" />
                                    <span className="text-xs text-text-muted">Click to upload logo</span>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mt-2 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {t('sendInquiry')}
                    </button>
                </form>
            </div>

            {/* Right Column: Preview */}
            <div className="hidden md:flex flex-col">
                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-primary" />
                    Live Preview
                </h4>
                
                <div className="flex-1 bg-[#111] border border-[#222] rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:16px_16px]" />
                    
                    <div className="w-full max-w-[280px] space-y-4 relative z-10">
                        <div className="text-xs text-text-muted text-center mb-2">
                            This is how your ad will appear on the sidebar
                        </div>
                        
                        {/* Mock Sidebar Context */}
                        <div className="bg-background border border-border rounded-xl p-4 shadow-2xl">
                             <AdSpace 
                                image={formData.logoPreview} 
                                text={formData.message || "Your ad text will appear here..."} 
                                className="w-full aspect-square"
                             />
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertiseModal;
