import React from 'react';
import clsx from 'clsx';
import FundDetailsPopover from './FundDetailsPopover';

const FundRow = ({ rank, fund }) => {
  const getMedal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  return (
    <div className="group grid grid-cols-12 items-center px-6 py-3 hover:bg-[#161616] transition-colors cursor-pointer relative hover:z-50">
      {/* Rank */}
      <div className="col-span-1 flex items-center justify-center">
        <div className="relative w-6 h-6 flex items-center justify-center">
          {rank <= 3 ? (
            <span className="text-lg filter drop-shadow-lg">{getMedal(rank)}</span>
          ) : (
            <span className="text-text-muted font-mono font-medium text-sm">{rank}</span>
          )}
        </div>
      </div>

      {/* Fund Info */}
      <div className="col-span-5 flex items-center gap-3 pl-2">
        <div className="relative">
          <img 
            src={fund.logo} 
            alt={fund.name} 
            className="w-8 h-8 rounded-lg object-cover border border-[#333] shadow-sm group-hover:border-[#444] transition-colors"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = `https://ui-avatars.com/api/?name=${fund.manager}&background=random&color=fff&size=64`;
            }}
          />
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold text-sm leading-tight group-hover:text-primary transition-colors mb-0.5">
              {fund.name}
            </h3>
            <FundDetailsPopover fund={fund} />
          </div>
          <p className="text-text-muted text-[10px] font-medium truncate max-w-[200px] flex items-center gap-1.5">
            <span>{fund.category}</span>
            <span className="w-0.5 h-0.5 rounded-full bg-text-muted/50"></span>
            <span className={clsx(
              fund.risk === "High" ? "text-red-400" : 
              fund.risk === "Medium" ? "text-yellow-400" : "text-green-400"
            )}>{fund.risk} Risk</span>
          </p>
        </div>
      </div>

      {/* Manager Column */}
      <div className="col-span-3 flex items-center">
        <span className="text-text-muted text-xs font-medium truncate">
          {fund.manager}
        </span>
      </div>

      {/* Returns */}
      <div className="col-span-3 flex flex-col items-end pr-4">
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
