import React, { useState, useEffect } from 'react';
import { Plus, Megaphone, Globe } from 'lucide-react';
import clsx from 'clsx';
import AdSpace from './AdSpace';
import AdvertiseModal from './AdvertiseModal';
import cibLogo from '../assets/cib.png';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

const Layout = ({ children, onOpenSubmitModal }) => {
  const [isAdvertiseModalOpen, setIsAdvertiseModalOpen] = useState(false);
  const [startMarquee, setStartMarquee] = useState(false);
  const [ads, setAds] = useState([]);
  const { t, language, toggleLanguage, isTransitioning } = useLanguage();

  const CIB_AD_TEXT = "Delivering value to our clients, our community and our shareholders";

  // Fetch active ads
  useEffect(() => {
    const fetchAds = async () => {
      const { data } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (data) {
        setAds(data);
      }
    };
    fetchAds();
  }, []);

  // Combine hardcoded CIB ad with dynamic ads
  const displayAds = [
    { id: 'cib', company_name: 'CIB', text_en: CIB_AD_TEXT, image_url: cibLogo, link: 'https://cibeg.com' },
    ...ads
  ];

  // Start marquee after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartMarquee(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsAdvertiseModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const [imageErrors, setImageErrors] = useState({});

  const getAdText = (ad) => {
    const text = language === 'ar' && ad.text_ar ? ad.text_ar : ad.text_en;
    return text || ad.company_name;
  };

  return (
    <div className="min-h-screen bg-background text-text font-sans selection:bg-primary/30 relative">
      <AdvertiseModal 
        isOpen={isAdvertiseModalOpen} 
        onClose={() => setIsAdvertiseModalOpen(false)} 
      />
      
      {/* Mobile Ad Carousel (Visible on small screens) */}
      <div className="lg:hidden w-full bg-surface border-b border-border h-14 flex items-center overflow-hidden relative">
        <div className={clsx(
          "flex items-center gap-3 whitespace-nowrap absolute left-0 w-max hover:pause pl-4",
          startMarquee ? "animate-marquee-left" : ""
        )}>
          {/* Set 1 */}
          {displayAds.map((ad, i) => (
            <div key={`mobile-ad-1-${ad.id || i}`} className="inline-flex items-center gap-2 px-4 h-10 bg-background border border-border rounded-lg text-xs text-gray-300 font-medium shrink-0">
              {ad.image_url && !imageErrors[`1-${ad.id || i}`] ? (
                <img 
                  src={ad.image_url} 
                  alt={ad.company_name} 
                  className="h-6 w-auto object-contain" 
                  onError={() => setImageErrors(prev => ({ ...prev, [`1-${ad.id || i}`]: true }))}
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold uppercase">
                  {ad.company_name?.[0] || '?'}
                </div>
              )}
              <span className="max-w-[200px] truncate">{getAdText(ad)}</span>
            </div>
          ))}
          
          {/* Fill with placeholders if not enough ads */}
          {displayAds.length < 5 && [...Array(5 - displayAds.length)].map((_, i) => (
             <div key={`mobile-placeholder-1-${i}`} className="inline-flex items-center gap-2 px-4 h-10 bg-background border border-border rounded-lg text-xs text-text-muted font-medium shrink-0 opacity-50">
               <div className="w-2 h-2 rounded-full bg-primary/50"></div>
               Advertise Here
             </div>
          ))}

          {/* Set 2 (Duplicate for infinite scroll) */}
          {displayAds.map((ad, i) => (
            <div key={`mobile-ad-2-${ad.id || i}`} className="inline-flex items-center gap-2 px-4 h-10 bg-background border border-border rounded-lg text-xs text-gray-300 font-medium shrink-0">
              {ad.image_url && !imageErrors[`2-${ad.id || i}`] ? (
                <img 
                  src={ad.image_url} 
                  alt={ad.company_name} 
                  className="h-6 w-auto object-contain" 
                  onError={() => setImageErrors(prev => ({ ...prev, [`2-${ad.id || i}`]: true }))}
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold uppercase">
                  {ad.company_name?.[0] || '?'}
                </div>
              )}
              <span className="max-w-[200px] truncate">{getAdText(ad)}</span>
            </div>
          ))}
           {displayAds.length < 5 && [...Array(5 - displayAds.length)].map((_, i) => (
             <div key={`mobile-placeholder-2-${i}`} className="inline-flex items-center gap-2 px-4 h-10 bg-background border border-border rounded-lg text-xs text-text-muted font-medium shrink-0 opacity-50">
               <div className="w-2 h-2 rounded-full bg-primary/50"></div>
               Advertise Here
             </div>
          ))}
        </div>
      </div>

      <div className={clsx(
        "max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 transition-opacity duration-300",
        isTransitioning ? "opacity-0" : "opacity-100"
      )}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Header + Leaderboard */}
          <div className="lg:col-span-10 flex flex-col">
            {/* Header Section */}
            <div className="flex flex-col items-start pt-1 pb-12 md:pt-4 md:pb-8">
              {/* Top Row: Logo/Title + Add Fund Button */}
              <div className="flex flex-row items-center justify-between w-full mb-4">
                {/* Logo & Title */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg shadow-primary/20">
                    F
                  </div>
                  <h1 className="text-xl md:text-4xl font-bold font-display text-white tracking-tight">
                    {t('appTitle')}
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  {/* Language Toggle - Mobile Only */}
                  <button
                    onClick={toggleLanguage}
                    className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-[#333] text-white rounded-lg text-xs font-medium hover:bg-[#222] transition-colors"
                  >
                    <Globe className="w-3 h-3" />
                    <span>{language === 'en' ? 'AR' : 'EN'}</span>
                  </button>

                  {/* Add Fund Button */}
                  <button 
                    onClick={onOpenSubmitModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 md:px-6 md:py-2.5 bg-white text-black rounded-lg text-xs md:text-sm font-semibold hover:bg-gray-200 transition-colors shadow-sm whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{t('addFund')}</span>
                  </button>
                </div>
              </div>
              
              {/* Description - Full Width */}
              <p className="text-text-muted text-sm md:text-xl max-w-xl font-light text-left md:whitespace-nowrap">
                {t('tagline')} <span style={{ color: 'red' }}>{t('dummyData')}</span>
              </p>
            </div>

            {/* Main Content */}
            <main>
              {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-border mt-8 py-6 text-text-muted text-sm">
              <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-start justify-between gap-8">
                
                {/* Left Side: Copyright & Disclaimers */}
                <div className="flex flex-col items-start gap-4 w-full md:flex-1 text-left rtl:text-right order-2 md:order-1">
                  <p className="font-medium text-white/80">{t('copyright')}</p>
                  <div className="text-xs leading-relaxed opacity-50 space-y-2">
                    <p>{t('footerDisclaimer1')}</p>
                    <p>{t('footerDisclaimer2')}</p>
                    <p>{t('footerDisclaimer3')}</p>
                  </div>
                  <div className="text-[10px] font-mono opacity-30 pt-2">
                    v 3.1.0
                  </div>
                </div>

                {/* Right Side: Controls */}
                <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto order-1 md:order-2">
                  <button
                    onClick={toggleLanguage}
                    className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-full hover:bg-[#222] transition-colors group"
                  >
                    <Globe className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                    <span className="text-xs font-medium text-text-muted group-hover:text-white transition-colors">
                      {language === 'en' ? 'العربية' : 'English'}
                    </span>
                  </button>

                  <button 
                    onClick={() => setIsAdvertiseModalOpen(true)}
                    className="lg:hidden w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors shadow-sm"
                  >
                    <Megaphone className="w-4 h-4" />
                    <span>{t('advertiseHere')}</span>
                  </button>
                </div>
              </div>
            </footer>
          </div>

          {/* Right Sidebar (Ads) - Sticky & Full Height (No Scroll) - Hidden on Mobile */}
          <div className="hidden lg:flex lg:col-span-2 sticky top-4 h-[calc(100vh-2rem)] flex-col pb-0">
            <div className="flex-1 flex flex-col gap-3 min-h-0">
              {/* Render up to 5 ads */}
              {[...Array(5)].map((_, i) => {
                const ad = displayAds[i];
                return (
                  <AdSpace 
                    key={ad?.id || `placeholder-${i}`} 
                    className="flex-1 min-h-0" 
                    image={ad?.image_url} 
                    text={language === 'ar' && ad?.text_ar ? ad.text_ar : ad?.text_en}
                    link={ad?.link}
                    id={ad?.id}
                  />
                );
              })}
            </div>
            
            <button 
              onClick={() => setIsAdvertiseModalOpen(true)}
              className="w-full py-2 mt-2 text-xs text-text-muted hover:text-white transition-colors flex items-center justify-center gap-2 shrink-0 opacity-70 hover:opacity-100"
            >
              <Megaphone className="w-3 h-3" />
              {t('advertiseHere')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Layout;
