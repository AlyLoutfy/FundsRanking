import React from 'react';
import { Compass, Info } from 'lucide-react';
import clsx from 'clsx';

const DiscoverFunds = ({ funds, onFundClick }) => {
  // Mock sponsored funds data
  const sponsoredFunds = [
    {
      id: 's1',
      name: "Goldman Sachs Egypt Equity",
      manager: "Goldman Sachs",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Goldman_Sachs.svg/1200px-Goldman_Sachs.svg.png",
      annualReturn: 28.4,
      category: "Equity",
      risk: "High",
      description: "Exclusive access to top-tier Egyptian equities managed by global experts.",
      strategy: "High-conviction global-local hybrid strategy.",
      minInvestment: "50,000 EGP",
      fees: "2.0%",
      isSponsored: true
    },
    {
      id: 's2',
      name: "BlackRock MENA Fund",
      manager: "BlackRock",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/BlackRock_logo.svg/1200px-BlackRock_logo.svg.png",
      annualReturn: 26.9,
      category: "Mixed",
      risk: "Medium",
      description: "A diversified portfolio across the MENA region with a focus on Egyptian growth sectors.",
      strategy: "Regional diversification.",
      minInvestment: "100,000 EGP",
      fees: "1.8%",
      isSponsored: true
    }
  ];

  // Get 1 sponsored fund and 4 new funds
  const displaySponsored = sponsoredFunds.slice(0, 1);
  const displayNew = [...funds].slice(-4).reverse().map(f => ({ ...f, isNew: true }));

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

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Compass className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-white font-display">Featured Funds</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {allFunds.map((fund, index) => (
          <div key={fund.id} className="relative group pt-4"> {/* Added more top padding for external badges */}
            
            {/* Tab Style Label for All Cards */}
            {(fund.isSponsored || fund.isNew) && (
              <div className="absolute -top-[1px] right-4 z-20">
                <div className={clsx(
                  "px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-t-lg border-t border-x shadow-lg",
                  fund.isSponsored 
                    ? "bg-[#111] text-yellow-400 border-yellow-500/30 shadow-yellow-500/5" 
                    : "bg-[#111] text-blue-400 border-blue-500/30 shadow-blue-500/5"
                )}>
                  {fund.isSponsored ? "Promoted" : "New"}
                </div>
              </div>
            )}

            <div 
              onClick={() => onFundClick(fund)}
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
                <img 
                  src={fund.logo} 
                  alt={fund.manager} 
                  className={clsx(
                    "w-9 h-9 rounded-lg object-contain shadow-sm shrink-0 transition-opacity",
                    fund.isSponsored ? "bg-white p-0.5 opacity-100" : "object-cover opacity-90 group-hover:opacity-100"
                  )}
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = getLetterAvatar(fund.manager);
                  }}
                />
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
                    <span className="text-[8px] text-text-muted uppercase tracking-wider">Return</span>
                    <span className={clsx("text-xs font-bold", fund.annualReturn >= 0 ? "text-green-400" : "text-red-400")}>
                      {fund.annualReturn > 0 ? "+" : ""}{fund.annualReturn}%
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] text-text-muted uppercase tracking-wider">Type</span>
                    <span className="text-[10px] font-medium text-white/80">{fund.category}</span>
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
