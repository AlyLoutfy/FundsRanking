import React, { useState, useEffect } from 'react';
import { Calculator, Sparkles, TrendingUp, Coins } from 'lucide-react';
import clsx from 'clsx';

const TimeMachine = ({ annualReturn, onClose }) => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(1000);
  const [years, setYears] = useState(5);
  const [futureValue, setFutureValue] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Compound Interest Formula for Monthly Contributions
    // FV = P * (((1 + r/n)^(n*t) - 1) / (r/n))
    // P = Monthly Investment
    // r = Annual Interest Rate (decimal)
    // n = Number of times compounded per year (12)
    // t = Number of years

    const r = annualReturn / 100;
    const n = 12;
    const t = years;

    const fv = monthlyInvestment * ((Math.pow(1 + r/n, n*t) - 1) / (r/n));
    const invested = monthlyInvestment * 12 * years;

    setFutureValue(Math.round(fv));
    setTotalInvested(invested);
    
    // Trigger animation on change
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [monthlyInvestment, years, annualReturn]);

  const profit = futureValue - totalInvested;
  const profitPercentage = Math.round((profit / totalInvested) * 100);

  return (
    <div className="bg-[#111] border border-[#333] rounded-xl p-4 w-full animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-500/20 rounded-lg">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Time Machine</h3>
        </div>
        <button 
          onClick={onClose}
          className="text-xs text-text-muted hover:text-white transition-colors"
        >
          Close
        </button>
      </div>

      {/* Result Display */}
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 rounded-xl p-4 mb-6 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        
        <p className="text-xs text-purple-300 font-medium mb-1 uppercase tracking-wider">Projected Value</p>
        <div className={clsx(
          "text-3xl font-bold text-white font-display transition-all duration-300 flex items-baseline justify-center gap-1",
          isAnimating ? "scale-110 text-purple-200" : "scale-100"
        )}>
          <span>{futureValue.toLocaleString()}</span>
          <span className="text-sm font-normal text-white/60">EGP</span>
        </div>
        
        <div className="flex items-center justify-center gap-2 mt-2 text-xs">
          <span className="text-text-muted">Invested: {totalInvested.toLocaleString()}</span>
          <span className="text-green-400 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            +{profit.toLocaleString()} ({profitPercentage}%)
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-5">
        {/* Monthly Investment Slider */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-text-muted">Monthly Investment</span>
            <span className="text-white font-bold">{monthlyInvestment.toLocaleString()} EGP</span>
          </div>
          <input
            type="range"
            min="500"
            max="50000"
            step="500"
            value={monthlyInvestment}
            onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
            className="w-full h-2 bg-[#333] rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
          />
          <div className="flex justify-between text-[10px] text-text-muted mt-1">
            <span>500</span>
            <span>50k</span>
          </div>
        </div>

        {/* Years Slider */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-text-muted">Duration</span>
            <span className="text-white font-bold">{years} Years</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full h-2 bg-[#333] rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
          />
          <div className="flex justify-between text-[10px] text-text-muted mt-1">
            <span>1y</span>
            <span>30y</span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-text-muted text-center">
        Based on historical annual return of {annualReturn}%. Past performance does not guarantee future results.
      </div>
    </div>
  );
};

export default TimeMachine;
