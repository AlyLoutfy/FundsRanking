import React from 'react';
import clsx from 'clsx';
import { Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const FundRow = ({ rank, fund, onClick }) => {
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

  const getMedal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  return (
    <div 
      onClick={onClick}
      className="group relative hover:z-50 cursor-pointer transition-all duration-200
        /* Mobile: Card Style */
        flex flex-col p-3 md:p-4 border-b border-[#222] bg-[#111] hover:bg-[#161616]
        /* Desktop: Table Row Style */
        md:grid md:grid-cols-12 md:items-center md:px-6 md:py-3 md:border-b-0 md:bg-transparent"
    >
      {/* Mobile Top Row: Rank + Logo + Name + Info */}
      <div className="flex items-center gap-2 md:contents">
        
        {/* Rank */}
        <div className="md:col-span-1 flex items-center justify-center shrink-0">
          <div className="relative w-6 h-6 flex items-center justify-center">
            {rank <= 3 ? (
              <span className="text-lg filter drop-shadow-lg">{getMedal(rank)}</span>
            ) : (
              <span className="text-text-muted font-mono font-medium text-sm bg-[#222] md:bg-transparent rounded px-1.5 py-0.5 md:p-0">{rank}</span>
            )}
          </div>
        </div>

        {/* Fund Info (Logo + Name) */}
        <div className="flex-1 flex items-center gap-2 md:gap-3 md:col-span-5 md:pl-2 min-w-0">
          <div className="relative shrink-0">
            <img 
              src={fund.logo} 
              alt={fund.name} 
              className="w-9 h-9 md:w-8 md:h-8 rounded-lg object-cover border border-[#333] shadow-sm group-hover:border-[#444] transition-colors"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = `https://ui-avatars.com/api/?name=${fund.manager}&background=random&color=fff&size=64`;
              }}
            />
          </div>
          <div className="flex flex-col justify-center min-w-0 w-full">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-sm leading-tight group-hover:text-primary transition-colors truncate">
                {fund.name}
              </h3>

            </div>
            {/* Mobile: Manager Name under Fund Name */}
            <p className="text-text-muted text-xs md:hidden truncate">{fund.manager}</p>
            
            {/* Desktop: Category & Risk Tags */}
            <p className="hidden md:flex text-text-muted text-[10px] font-medium truncate max-w-[200px] items-center gap-1.5">
              <span>{t(getCategoryKey(fund.category))}</span>
              <span className="w-0.5 h-0.5 rounded-full bg-text-muted/50"></span>
              <span className={clsx(
                fund.risk === "High" ? "text-red-400" : 
                fund.risk === "Medium" ? "text-yellow-400" : "text-green-400"
              )}>{t(getRiskKey(fund.risk))} {t('risk')}</span>
            </p>
          </div>
        </div>

        {/* Mobile: Returns (Right Side) */}
        <div className="flex flex-col items-end gap-1 md:hidden shrink-0">
          <span className="text-white font-bold font-mono text-sm tracking-tight">
            {fund.annualReturn}%
          </span>
          <span className={clsx("font-mono font-medium text-[10px]", fund.ytdReturn >= 0 ? "text-green-400" : "text-red-400")}>
            {fund.ytdReturn > 0 ? "+" : ""}{fund.ytdReturn}% {t('ytd')}
          </span>
        </div>
      </div>

      {/* Mobile Bottom Row: Badges (Category, Risk) */}
      <div className="flex items-center gap-2 mt-3 ml-9 md:hidden rtl:ml-0 rtl:mr-9">
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#222] text-text-muted border border-[#333]">
          {t(getCategoryKey(fund.category))}
        </span>
        <span className={clsx(
          "px-2 py-0.5 rounded text-[10px] font-medium border",
          fund.risk === 'High' ? "bg-red-500/10 text-red-400 border-red-500/20" : 
          fund.risk === 'Medium' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : 
          "bg-green-500/10 text-green-400 border-green-500/20"
        )}>
          {t(getRiskKey(fund.risk))}
        </span>
      </div>

      {/* Desktop: Manager Column */}
      <div className="hidden md:flex col-span-3 items-center">
        <span className="text-text-muted text-xs font-medium truncate">
          {fund.manager}
        </span>
      </div>

      {/* Desktop: Returns Column */}
      <div className="hidden md:flex col-span-3 flex-col items-end pr-4 rtl:pl-4 rtl:pr-0">
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-[10px] uppercase tracking-wider hidden sm:inline">{t('annual')}</span>
          <span className="text-white font-bold font-mono text-sm tracking-tight">
            {fund.annualReturn}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-[10px] uppercase tracking-wider hidden sm:inline">{t('ytd')}</span>
          <span className={clsx("font-mono font-medium text-xs", fund.ytdReturn >= 0 ? "text-green-400" : "text-red-400")}>
            {fund.ytdReturn > 0 ? "+" : ""}{fund.ytdReturn}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default FundRow;
