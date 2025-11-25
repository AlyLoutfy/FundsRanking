import React from 'react';
import clsx from 'clsx';
import { Info } from 'lucide-react';

const FundRow = ({ rank, fund, onClick }) => {
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
        flex flex-col p-4 border-b border-[#222] bg-[#111] hover:bg-[#161616]
        /* Desktop: Table Row Style */
        md:grid md:grid-cols-12 md:items-center md:px-6 md:py-3 md:border-b-0 md:bg-transparent"
    >
      {/* Mobile Top Row: Rank + Logo + Name + Info */}
      <div className="flex items-center gap-3 md:contents">
        
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
        <div className="flex-1 flex items-center gap-3 md:col-span-5 md:pl-2 min-w-0">
          <div className="relative shrink-0">
            <img 
              src={fund.logo} 
              alt={fund.name} 
              className="w-10 h-10 md:w-8 md:h-8 rounded-lg object-cover border border-[#333] shadow-sm group-hover:border-[#444] transition-colors"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = `https://ui-avatars.com/api/?name=${fund.manager}&background=random&color=fff&size=64`;
              }}
            />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-sm leading-tight group-hover:text-primary transition-colors truncate">
                {fund.name}
              </h3>

            </div>
            {/* Mobile: Manager Name under Fund Name */}
            <p className="text-text-muted text-xs md:hidden truncate">{fund.manager}</p>
            
            {/* Desktop: Category & Risk Tags */}
            <p className="hidden md:flex text-text-muted text-[10px] font-medium truncate max-w-[200px] items-center gap-1.5">
              <span>{fund.category}</span>
              <span className="w-0.5 h-0.5 rounded-full bg-text-muted/50"></span>
              <span className={clsx(
                fund.risk === "High" ? "text-red-400" : 
                fund.risk === "Medium" ? "text-yellow-400" : "text-green-400"
              )}>{fund.risk} Risk</span>
            </p>
          </div>
        </div>

        {/* Mobile: Returns (Right Side) */}
        <div className="flex flex-col items-end gap-1 md:hidden shrink-0">
          <span className="text-white font-bold font-mono text-sm tracking-tight">
            {fund.annualReturn}%
          </span>
          <span className={clsx("font-mono font-medium text-[10px]", fund.ytdReturn >= 0 ? "text-green-400" : "text-red-400")}>
            {fund.ytdReturn > 0 ? "+" : ""}{fund.ytdReturn}% YTD
          </span>
        </div>
      </div>

      {/* Mobile Bottom Row: Badges (Category, Risk) */}
      <div className="flex items-center gap-2 mt-3 ml-9 md:hidden">
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#222] text-text-muted border border-[#333]">
          {fund.category}
        </span>
        <span className={clsx(
          "px-2 py-0.5 rounded text-[10px] font-medium border",
          fund.risk === 'High' ? "bg-red-500/10 text-red-400 border-red-500/20" : 
          fund.risk === 'Medium' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : 
          "bg-green-500/10 text-green-400 border-green-500/20"
        )}>
          {fund.risk}
        </span>
      </div>

      {/* Desktop: Manager Column */}
      <div className="hidden md:flex col-span-3 items-center">
        <span className="text-text-muted text-xs font-medium truncate">
          {fund.manager}
        </span>
      </div>

      {/* Desktop: Returns Column */}
      <div className="hidden md:flex col-span-3 flex-col items-end pr-4">
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-[10px] uppercase tracking-wider hidden sm:inline">Annual</span>
          <span className="text-white font-bold font-mono text-sm tracking-tight">
            {fund.annualReturn}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-[10px] uppercase tracking-wider hidden sm:inline">YTD</span>
          <span className={clsx("font-mono font-medium text-xs", fund.ytdReturn >= 0 ? "text-green-400" : "text-red-400")}>
            {fund.ytdReturn > 0 ? "+" : ""}{fund.ytdReturn}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default FundRow;
