import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import FundRow from './components/FundRow';
import SubmitFundModal from './components/SubmitFundModal';
import FundDetailsModal from './components/FundDetailsModal';
import { funds as initialFunds } from './data/funds';
import DiscoverFunds from './components/DiscoverFunds';
import { ArrowUpDown, Filter, Search } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

function App() {
  const [funds, setFunds] = useState(initialFunds);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [visibleCount, setVisibleCount] = useState(50);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [timePeriod, setTimePeriod] = useState('all');
  const [sortField, setSortField] = useState('annualReturn');

  const [sortDirection, setSortDirection] = useState('desc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const { t } = useLanguage();
  
  // Update sort field based on time period
  useEffect(() => {
    if (timePeriod === 'ytd' || timePeriod === 'last30Days') {
      setSortField('ytdReturn');
    } else {
      setSortField('annualReturn');
    }
  }, [timePeriod]);
  
  const filteredFunds = funds.filter(fund => {
    const matchesSearch = fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fund.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || fund.category === categoryFilter;
    const matchesRisk = riskFilter === 'all' || fund.risk === riskFilter;
    return matchesSearch && matchesCategory && matchesRisk;
  });

  const sortedFunds = [...filteredFunds].sort((a, b) => {
    if (sortField === 'manager') {
      const comparison = a.manager.localeCompare(b.manager);
      return sortDirection === 'asc' ? comparison : -comparison;
    }
    const diff = b[sortField] - a[sortField];
    return sortDirection === 'desc' ? diff : -diff;
  });
  const visibleFunds = sortedFunds.slice(0, visibleCount);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to desc for new field
    }
  };

  // Handle Escape key to close modals
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setSelectedFund(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleAddFund = (newFundData) => {
    const newFund = {
      id: funds.length + 1,
      ...newFundData,
      logo: `https://ui-avatars.com/api/?name=${newFundData.name}&background=random`,
      ytdReturn: 0 // Default for new funds
    };
    setFunds([newFund, ...funds]);
  };

  return (
    <Layout 
      onOpenSubmitModal={() => setIsModalOpen(true)}
    >
      <SubmitFundModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddFund}
      />

      <FundDetailsModal 
        isOpen={!!selectedFund}
        onClose={() => setSelectedFund(null)}
        fund={selectedFund}
        allFunds={funds}
      />
      
      {/* Discover Section (Sponsored + New) */}
      <DiscoverFunds funds={funds} onFundClick={setSelectedFund} />

      <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-2xl">
        {/* Leaderboard Header */}
        <div className="px-6 py-6">
          {/* Desktop: Single Row with Title + Search on Left, Filters on Right */}
          <div className="hidden md:flex items-center justify-between gap-4">
            {/* Left: Title + Search */}
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white font-display pt-1">{t('leaderboard')}</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted rtl:left-auto rtl:right-3" />
                <input 
                  type="text" 
                  placeholder={t('searchPlaceholder')} 
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-primary outline-none transition-colors rtl:pl-4 rtl:pr-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Right: Filter Controls */}
            <div className="flex flex-row gap-3">
              {/* Time Period Filter */}
              <div className="relative group">
                <select 
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  className="appearance-none bg-[#1a1a1a] text-white text-sm font-medium px-4 py-2 pr-8 rounded-lg border border-[#333] focus:border-primary outline-none cursor-pointer hover:bg-[#222] transition-colors rtl:pl-8 rtl:pr-4"
                >
                  <option value="all">{t('allTime')}</option>
                  <option value="ytd">{t('ytd')}</option>
                  <option value="lastYear">{t('lastYear')}</option>
                  <option value="last30Days">{t('last30Days')}</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted rtl:right-auto rtl:left-3">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div className="relative group">
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none bg-[#1a1a1a] text-white text-sm font-medium px-4 py-2 pr-8 rounded-lg border border-[#333] focus:border-primary outline-none cursor-pointer hover:bg-[#222] transition-colors rtl:pl-8 rtl:pr-4"
                >
                  <option value="all">{t('allCategories')}</option>
                  <option value="Equity">{t('equity')}</option>
                  <option value="Fixed Income">{t('fixedIncome')}</option>
                  <option value="Balanced">{t('balanced')}</option>
                  <option value="Islamic">{t('islamic')}</option>
                  <option value="Growth">{t('growth')}</option>
                  <option value="Money Market">{t('moneyMarket')}</option>
                  <option value="Tech">{t('tech')}</option>
                  <option value="Mixed">{t('mixed')}</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted rtl:right-auto rtl:left-3">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Risk Filter */}
              <div className="relative group">
                <select 
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="appearance-none bg-[#1a1a1a] text-white text-sm font-medium px-4 py-2 pr-8 rounded-lg border border-[#333] focus:border-primary outline-none cursor-pointer hover:bg-[#222] transition-colors rtl:pl-8 rtl:pr-4"
                >
                  <option value="all">{t('allRiskLevels')}</option>
                  <option value="Low">{t('lowRisk')}</option>
                  <option value="Medium">{t('mediumRisk')}</option>
                  <option value="High">{t('highRisk')}</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted rtl:right-auto rtl:left-3">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Stacked Layout */}
          <div className="md:hidden">
            {/* Title + Filter Toggle */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white font-display pt-1">{t('leaderboard')}</h2>
              <button 
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-[#333] rounded-lg text-xs font-medium text-white hover:bg-[#222] transition-colors"
              >
                <Filter className="w-3 h-3" />
                <span>{t('filters')}</span>
                {(timePeriod !== 'all' || categoryFilter !== 'all' || riskFilter !== 'all') && (
                  <span className="flex h-2 w-2 rounded-full bg-primary ml-1"></span>
                )}
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted rtl:left-auto rtl:right-3" />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')} 
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg py-1.5 pl-9 pr-4 text-sm text-white focus:border-primary outline-none transition-colors rtl:pl-4 rtl:pr-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Mobile Filter Controls (Expanded) */}
        <div className={`${showMobileFilters ? 'flex' : 'hidden'} md:hidden flex-col gap-3 px-6 pb-6 animate-in fade-in slide-in-from-top-2`}>
          {/* Time Period Filter */}
          <div className="relative group w-full">
            <select 
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="appearance-none bg-[#1a1a1a] text-white text-sm font-medium px-4 py-1.5 pr-8 rounded-lg border border-[#333] focus:border-primary outline-none cursor-pointer hover:bg-[#222] transition-colors w-full rtl:pl-8 rtl:pr-4"
            >
              <option value="all">{t('allTime')}</option>
              <option value="ytd">{t('ytd')}</option>
              <option value="lastYear">{t('lastYear')}</option>
              <option value="last30Days">{t('last30Days')}</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted rtl:right-auto rtl:left-3">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          <div className="relative group w-full">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-[#1a1a1a] text-white text-sm font-medium px-4 py-1.5 pr-8 rounded-lg border border-[#333] focus:border-primary outline-none cursor-pointer hover:bg-[#222] transition-colors w-full rtl:pl-8 rtl:pr-4"
            >
              <option value="all">{t('allCategories')}</option>
              <option value="Equity">{t('equity')}</option>
              <option value="Fixed Income">{t('fixedIncome')}</option>
              <option value="Balanced">{t('balanced')}</option>
              <option value="Islamic">{t('islamic')}</option>
              <option value="Growth">{t('growth')}</option>
              <option value="Money Market">{t('moneyMarket')}</option>
              <option value="Tech">{t('tech')}</option>
              <option value="Mixed">{t('mixed')}</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted rtl:right-auto rtl:left-3">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Risk Filter */}
          <div className="relative group w-full">
            <select 
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="appearance-none bg-[#1a1a1a] text-white text-sm font-medium px-4 py-1.5 pr-8 rounded-lg border border-[#333] focus:border-primary outline-none cursor-pointer hover:bg-[#222] transition-colors w-full rtl:pl-8 rtl:pr-4"
            >
              <option value="all">{t('allRiskLevels')}</option>
              <option value="Low">{t('lowRisk')}</option>
              <option value="Medium">{t('mediumRisk')}</option>
              <option value="High">{t('highRisk')}</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted rtl:right-auto rtl:left-3">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="overflow-x-auto">
          <div className="w-full">
            <div className="hidden md:grid grid-cols-12 items-center px-6 py-4 bg-[#111] text-xs font-medium text-text-muted uppercase tracking-wider border-b border-[#222]">
              <div className="col-span-1 text-center">{t('rank')}</div>
              <div className="col-span-5 pl-2 rtl:pr-2 rtl:pl-0">{t('fund')}</div>
              <div 
                className="col-span-3 cursor-pointer hover:text-primary transition-colors flex items-center gap-1 group"
                onClick={() => handleSort('manager')}
              >
                <span>{t('manager')}</span>
                {sortField === 'manager' && (
                  <span className="text-[10px] opacity-70">({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})</span>
                )}
              </div>
              <div 
                className="col-span-3 text-right pr-4 rtl:pl-4 rtl:pr-0 cursor-pointer hover:text-primary transition-colors flex items-center justify-end gap-1 group"
                onClick={() => handleSort(timePeriod === 'ytd' || timePeriod === 'last30Days' ? 'ytdReturn' : 'annualReturn')}
              >
                <span>{t('returns')}</span>
                {(sortField === 'annualReturn' || sortField === 'ytdReturn') && (
                  <span className="text-[10px] opacity-70">({sortDirection === 'desc' ? '↓' : '↑'})</span>
                )}
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-[#222]">
              {visibleFunds.map((fund, index) => (
                <FundRow 
                  key={fund.id} 
                  rank={index + 1} 
                  fund={fund} 
                  onClick={() => setSelectedFund(fund)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {visibleCount < sortedFunds.length && (
          <div className="p-4 border-t border-border flex justify-center">
            <button 
              onClick={() => setVisibleCount(prev => Math.min(prev + 50, sortedFunds.length))}
              className="px-6 py-2 bg-surface-hover border border-border rounded-lg text-sm font-medium text-text hover:text-white hover:border-primary/50 transition-colors"
            >
              {t('showMore')} ({sortedFunds.length - visibleCount} {t('remaining')})
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default App;
