import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Sparkles, TrendingUp, Coins } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '../context/LanguageContext';

const TimeMachine = ({ annualReturn, onClose }) => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(1000);
  const [years, setYears] = useState(5);
  const [futureValue, setFutureValue] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useLanguage();
  
  // For formatted display in inputs
  const [monthlyInputValue, setMonthlyInputValue] = useState('1,000');
  const [yearsInputValue, setYearsInputValue] = useState('5');

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

  const handleMonthlyInvestmentChange = (value) => {
    // Remove commas and parse
    const cleanValue = value.replace(/,/g, '');
    const numValue = Number(cleanValue);
    
    if (isNaN(numValue) && cleanValue !== '') {
      return;
    }
    
    // Format with commas immediately as user types
    const formatted = cleanValue === '' ? '' : Number(cleanValue).toLocaleString();
    setMonthlyInputValue(formatted);
    
    if (numValue >= 500 && numValue <= 200000) {
      setMonthlyInvestment(numValue);
    } else if (numValue < 500 && cleanValue !== '') {
      setMonthlyInvestment(500);
    } else if (numValue > 200000) {
      setMonthlyInvestment(200000);
    }
  };

  const handleMonthlyInvestmentBlur = () => {
    // Format with commas on blur
    setMonthlyInputValue(monthlyInvestment.toLocaleString());
  };

  const handleYearsChange = (value) => {
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      return;
    }
    
    setYearsInputValue(value);
    
    if (numValue >= 1 && numValue <= 40) {
      setYears(numValue);
    } else if (numValue < 1) {
      setYears(1);
    } else if (numValue > 40) {
      setYears(40);
    }
  };

  const handleYearsBlur = () => {
    setYearsInputValue(years.toString());
  };

  // Calculate dynamic width based on content
  const getInputWidth = (value) => {
    // Roughly 8.5px per character + 20px padding for better spacing
    return `${Math.max(2, value.length) * 8.5 + 20}px`;
  };

  return (
    <div className="bg-[#111] border border-[#333] rounded-xl p-4 w-full animate-in fade-in zoom-in-95 duration-200">
      
      {/* Result Display */}
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 rounded-xl p-4 mb-6 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        
        <p className="text-xs text-purple-300 font-medium mb-1 uppercase tracking-wider">{t('projectedValue')}</p>
        <div className={clsx(
          "text-3xl font-bold text-white font-display transition-all duration-300 flex items-baseline justify-center gap-1",
          isAnimating ? "scale-110 text-purple-200" : "scale-100"
        )}>
          <span>{futureValue.toLocaleString()}</span>
          <span className="text-sm font-normal text-white/60">{t('egp')}</span>
        </div>
        
        <div className="flex items-center justify-center gap-2 mt-2 text-xs">
          <span className="text-text-muted">{t('invested')}: {totalInvested.toLocaleString()}</span>
          <span className="text-green-400 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            +{profit.toLocaleString()} ({profitPercentage}%)
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-5">
        {/* Monthly Investment Control */}
        <div>
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-text-muted">{t('monthlyInvestment')}</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={monthlyInputValue}
                onChange={(e) => handleMonthlyInvestmentChange(e.target.value)}
                onBlur={handleMonthlyInvestmentBlur}
                onFocus={(e) => e.target.select()}
                style={{ width: getInputWidth(monthlyInputValue) }}
                className="bg-[#1a1a1a] border border-[#333] rounded-lg px-2 py-1 text-white text-xs font-bold text-center focus:border-purple-500 focus:outline-none transition-colors"
              />
              <span className="text-white/60 text-xs">{t('egp')}</span>
            </div>
          </div>
          <input
            type="range"
            min="500"
            max="200000"
            step="500"
            value={monthlyInvestment}
            onChange={(e) => {
              const val = Number(e.target.value);
              setMonthlyInvestment(val);
              setMonthlyInputValue(val.toLocaleString());
            }}
            className="w-full h-2 bg-[#333] rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all rtl:rotate-180"
          />
          <div className="flex justify-between text-[10px] text-text-muted mt-1">
            <span>500</span>
            <span>200k</span>
          </div>
        </div>

        {/* Duration Control */}
        <div>
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-text-muted">{t('duration')}</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={yearsInputValue}
                onChange={(e) => handleYearsChange(e.target.value)}
                onBlur={handleYearsBlur}
                onFocus={(e) => e.target.select()}
                style={{ width: getInputWidth(yearsInputValue) }}
                className="bg-[#1a1a1a] border border-[#333] rounded-lg px-2 py-1 text-white text-xs font-bold text-center focus:border-blue-500 focus:outline-none transition-colors"
              />
              <span className="text-white/60 text-xs">{t('years')}</span>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="40"
            step="1"
            value={years}
            onChange={(e) => {
              const val = Number(e.target.value);
              setYears(val);
              setYearsInputValue(val.toString());
            }}
            className="w-full h-2 bg-[#333] rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all rtl:rotate-180"
          />
          <div className="flex justify-between text-[10px] text-text-muted mt-1">
            <span>1y</span>
            <span>40y</span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-text-muted text-center">
        {t('timeMachineDisclaimer').replace('{return}', annualReturn)}
      </div>
    </div>
  );
};

export default TimeMachine;
