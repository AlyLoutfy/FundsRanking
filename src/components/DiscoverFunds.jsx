import React from 'react';
import { Compass, Info } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '../context/LanguageContext';
import { trackEvent } from '../lib/analytics';

const DiscoverFunds = ({ funds, onFundClick }) => {
  const { t } = useLanguage();
  
  const handleFundClick = (fund) => {
    trackEvent('fund_click', 'fund', fund.id, { fund_name: fund.name, source: 'featured' });
    onFundClick(fund);
  };

  // Find promoted fund from DB
  const promotedFund = funds.find(f => f.is_promoted);
  
  const displaySponsored = promotedFund ? [{ ...promotedFund, isSponsored: true }] : [];
  
  // Always show 5 funds total
  const newFundsCount = 5 - displaySponsored.length;
  
  const displayNew = [...funds]
    .filter(f => !f.is_promoted) // Exclude promoted fund from new list
    .slice(-newFundsCount)
    .reverse()
    .map(f => ({ ...f, isNew: true }));

  const allFunds = [...displaySponsored, ...displayNew];

  const getCleanName = (fund) => {
    if (fund.name.startsWith(fund.manager)) {
      return fund.name.replace(fund.manager, '').trim();
    }
    return fund.name;
  };

  const getLetterAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=64`;
  };

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

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Compass className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-white font-display">{t('featuredFunds')}</h2>
          <span className="md:hidden text-[10px] font-medium text-primary/80 animate-pulse ml-auto rtl:mr-auto rtl:ml-0 flex items-center gap-1">
            {t('swipe')} <span className="inline-block rtl:rotate-180">&rarr;</span>
          </span>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 pt-1 gap-4 snap-x snap-mandatory md:grid md:grid-cols-5 md:overflow-visible md:pb-0 md:pt-0 scrollbar-styled md:mx-0 md:px-0">
        {allFunds.map((fund, index) => (
          <div key={fund.id} className="relative group pt-4 min-w-[280px] md:min-w-0 snap-center first:pl-2 last:pr-2 md:first:pl-0 md:last:pr-0 rtl:first:pr-2 rtl:last:pl-2 rtl:md:first:pr-0 rtl:md:last:pl-0"> {/* Added more top padding for external badges */}
            
            {/* Tab Style Label for All Cards */}
            {(fund.isSponsored || fund.isNew) && (
              <div className="absolute -top-[1.5px] right-4 z-20 rtl:right-auto rtl:left-4">
                <div className={clsx(
                  "px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-t-lg border-t border-x shadow-lg",
                  fund.isSponsored 
                    ? "bg-[#111] text-yellow-400 border-yellow-500/30 shadow-yellow-500/5" 
                    : "bg-[#111] text-blue-400 border-blue-500/50 shadow-blue-500/5"
                )}>
                  {fund.isSponsored ? t('promoted') : t('new')}
                </div>
              </div>
            )}

            <div 
              onClick={() => handleFundClick(fund)}
              className={clsx(
                "relative rounded-xl transition-all duration-300 hover:shadow-lg flex flex-col min-h-[120px] h-full hover:z-10 cursor-pointer overflow-hidden",
                fund.isSponsored ? "p-[1px]" : "bg-[#111] border border-[#222] hover:border-primary/50 hover:shadow-primary/5 hover:bg-[#1a1a1a]"
              )}
            >
              {/* Animated Border for Sponsored */}
              {fund.isSponsored && (
                <div className="absolute inset-[-100%] animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#EAB308_0%,#000000_50%,#EAB308_100%)] opacity-100" />
              )}
  
              {/* Card Content Container */}
              <div className={clsx(
                "relative h-full flex flex-col rounded-xl p-4",
                fund.isSponsored ? "bg-[#111]" : ""
              )}>
  
                {/* Content Row: Logo & Name */}
                <div className="flex items-start gap-3 mb-2 flex-1">
                {fund.logo ? (
                  <img 
                    src={fund.logo} 
                    alt={fund.manager} 
                    className={clsx(
                      "w-9 h-9 rounded-lg object-contain shadow-sm shrink-0 transition-opacity",
                      fund.isSponsored ? "bg-white p-0.5 opacity-100" : "bg-white p-0.5 opacity-90 group-hover:opacity-100"
                    )}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={clsx(
                    "w-9 h-9 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-[#333] flex items-center justify-center shadow-sm shrink-0 transition-opacity",
                    fund.isSponsored ? "opacity-100" : "opacity-90 group-hover:opacity-100"
                  )}
                  style={{ display: fund.logo ? 'none' : 'flex' }}
                >
                  <span className="text-xs font-bold text-white/80">
                    {fund.manager.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 pt-0.5">
                  <h3 
                    className={clsx(
                      "text-sm font-bold transition-colors line-clamp-2 leading-tight mb-0.5",
                      fund.isSponsored ? "text-white group-hover:text-yellow-500" : "text-white group-hover:text-primary"
                    )} 
                    title={getCleanName(fund)}
                  >
                    {getCleanName(fund)}
                  </h3>
                  <p className="text-[10px] text-text-muted truncate">{fund.manager}</p>
                </div>
              </div>

              {/* Footer Row: Stats */}
              <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/5">
                 <div className="flex flex-col">
                    <span className="text-[8px] text-text-muted uppercase tracking-wider">{t('return')}</span>
                    <span className={clsx("text-xs font-bold", fund.annualReturn >= 0 ? "text-green-400" : "text-red-400")}>
                      {fund.annualReturn > 0 ? "+" : ""}{fund.annualReturn}%
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] text-text-muted uppercase tracking-wider">{t('type')}</span>
                    <span className="text-[10px] font-medium text-white/80">{t(getCategoryKey(fund.category))}</span>
                  </div>
              </div>
            </div>
            </div>
          </div>

        ))}
      </div>
    </div>
  );
};

export default DiscoverFunds;
