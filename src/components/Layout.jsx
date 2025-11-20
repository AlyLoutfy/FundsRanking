import React, { useState } from 'react';
import { Search, Plus, Megaphone } from 'lucide-react';
import AdSpace from './AdSpace';
import AdvertiseModal from './AdvertiseModal';
import cibLogo from '../assets/cib.png';

const Layout = ({ children, searchTerm, onSearchChange, onOpenSubmitModal }) => {
  const [isAdvertiseModalOpen, setIsAdvertiseModalOpen] = useState(false);

  const CIB_AD_TEXT = "Delivering value to our clients, our community and our shareholders";

  // Handle Escape key
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsAdvertiseModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="min-h-screen bg-background text-text font-sans selection:bg-primary/30">
      <AdvertiseModal 
        isOpen={isAdvertiseModalOpen} 
        onClose={() => setIsAdvertiseModalOpen(false)} 
      />
      
      {/* Mobile Ad Carousel (Visible on small screens) */}
      <div className="lg:hidden w-full bg-surface border-b border-border h-14 flex items-center overflow-hidden relative">
        {/* Track - width must be large enough to hold all items. 
            We use w-max to let it expand based on content. 
            We have 2 sets of items. Animation moves from -50% (start of 2nd set) to 0% (start of 1st set).
        */}
        <div className="flex items-center gap-3 animate-marquee-left whitespace-nowrap absolute left-0 w-max hover:pause">
          {/* Set 1 */}
          <div className="inline-flex items-center gap-2 px-4 h-10 bg-background border border-border rounded-lg text-xs text-text-muted font-medium shrink-0">
            <img src={cibLogo} alt="CIB" className="h-6 w-auto object-contain" />
            <span className="max-w-[200px] truncate">{CIB_AD_TEXT}</span>
          </div>
          {[...Array(14)].map((_, i) => (
            <div key={`set1-${i}`} className="inline-flex items-center gap-2 px-4 h-10 bg-background border border-border rounded-lg text-xs text-text-muted font-medium shrink-0">
              <div className="w-2 h-2 rounded-full bg-primary/50"></div>
              Ad Content {i + 1}
            </div>
          ))}
          {/* Set 2 (Duplicate) */}
          <div className="inline-flex items-center gap-2 px-4 h-10 bg-background border border-border rounded-lg text-xs text-text-muted font-medium shrink-0">
            <img src={cibLogo} alt="CIB" className="h-6 w-auto object-contain" />
            <span className="max-w-[200px] truncate">{CIB_AD_TEXT}</span>
          </div>
          {[...Array(14)].map((_, i) => (
            <div key={`set2-${i}`} className="inline-flex items-center gap-2 px-4 h-10 bg-background border border-border rounded-lg text-xs text-text-muted font-medium shrink-0">
              <div className="w-2 h-2 rounded-full bg-primary/50"></div>
              Ad Content {i + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Header + Leaderboard */}
          <div className="lg:col-span-10 flex flex-col">
            {/* Header Section */}
            <div className="flex flex-col items-center justify-center pt-8 pb-8 px-4 text-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                  F
                </div>
                <h1 className="text-2xl md:text-4xl font-bold font-display text-white tracking-tight">
                  FundsRank
                </h1>
              </div>
              
              <p className="text-text-muted text-sm md:text-xl max-w-xl mb-8 font-light">
                The database of verified mutual fund returns in Egypt.
              </p>

              <div className="flex items-center gap-2 w-full max-w-lg">
                <div className="flex-1 flex items-center px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-muted focus-within:border-primary/50 focus-within:text-text transition-all shadow-sm hover:border-border/80">
                  <Search className="w-4 h-4 mr-2 text-text-muted" />
                  <input 
                    type="text" 
                    placeholder="Search funds..." 
                    className="bg-transparent border-none outline-none w-full placeholder:text-text-muted/50"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                  />
                </div>
                <button 
                  onClick={onOpenSubmitModal}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors shadow-sm whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Fund</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>

            {/* Main Content */}
            <main>
              {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-border mt-12 py-8 text-center text-text-muted text-sm">
              <p>&copy; 2025 FundsRank Egypt. All rights reserved.</p>
            </footer>
          </div>

          {/* Right Sidebar (Ads) - Sticky & Full Height (No Scroll) - Hidden on Mobile */}
          <div className="hidden lg:flex lg:col-span-2 sticky top-4 h-[calc(100vh-2rem)] flex-col pb-0">
            <div className="flex-1 flex flex-col gap-3 min-h-0">
              <AdSpace className="flex-1 min-h-0" image={cibLogo} text={CIB_AD_TEXT} />
              <AdSpace className="flex-1 min-h-0" />
              <AdSpace className="flex-1 min-h-0" />
              <AdSpace className="flex-1 min-h-0" />
              <AdSpace className="flex-1 min-h-0" />
            </div>
            
            <button 
              onClick={() => setIsAdvertiseModalOpen(true)}
              className="w-full py-2 mt-2 text-xs text-text-muted hover:text-white transition-colors flex items-center justify-center gap-2 shrink-0 opacity-70 hover:opacity-100"
            >
              <Megaphone className="w-3 h-3" />
              Advertise Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Layout;
