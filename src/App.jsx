import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import FundRow from './components/FundRow';
import SubmitFundModal from './components/SubmitFundModal';
import { funds as initialFunds } from './data/funds';
import { ArrowUpDown, Filter } from 'lucide-react';

function App() {
  const [funds, setFunds] = useState(initialFunds);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [timePeriod, setTimePeriod] = useState('all');
  const [sortField, setSortField] = useState('annualReturn');

  const [sortDirection, setSortDirection] = useState('desc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
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
      searchTerm={searchTerm} 
      onSearchChange={setSearchTerm}
      onOpenSubmitModal={() => setIsModalOpen(true)}
    >
      <SubmitFundModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddFund}
      />
      <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-2xl">
        {/* Leaderboard Header */}
        <div className="flex flex-row items-start justify-between px-6 py-6 gap-4">
          <h2 className="text-xl font-bold text-white font-display pt-1">Leaderboard</h2>
          
            {/* Filters */}
            <div className="flex flex-col items-end gap-3 w-auto">
              {/* Mobile Filter Toggle */}
              <button 
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm font-medium text-white hover:bg-[#222] transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {(timePeriod !== 'all' || categoryFilter !== 'all' || riskFilter !== 'all') && (
                  <span className="flex h-2 w-2 rounded-full bg-primary ml-1"></span>
                )}
              </button>

              {/* Filter Controls - Hidden on mobile unless toggled */}
              <div className={`${showMobileFilters ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-3 w-full md:w-auto animate-in fade-in slide-in-from-top-2 md:animate-none`}>
                {/* Time Period Filter */}
                <div className="relative group w-full md:w-auto">
                  <select 
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value)}
                    className="appearance-none bg-[#1a1a1a] text-white text-sm font-medium px-4 py-2 pr-8 rounded-lg border border-[#333] focus:border-primary outline-none cursor-pointer hover:bg-[#222] transition-colors w-full md:w-auto"
                  >
                    <option value="all">All Time</option>
                    <option value="ytd">YTD</option>
                    <option value="lastYear">Last Year</option>
                    <option value="last30Days">Last 30 Days</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="relative group w-full md:w-auto">
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="appearance-none bg-[#1a1a1a] text-white text-sm font-medium px-4 py-2 pr-8 rounded-lg border border-[#333] focus:border-primary outline-none cursor-pointer hover:bg-[#222] transition-colors w-full md:w-auto"
                  >
                    <option value="all">All Categories</option>
                    <option value="Equity">Equity</option>
                    <option value="Fixed Income">Fixed Income</option>
                    <option value="Balanced">Balanced</option>
                    <option value="Islamic">Islamic</option>
                    <option value="Growth">Growth</option>
                    <option value="Money Market">Money Market</option>
                    <option value="Tech">Tech</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Risk Filter */}
                <div className="relative group w-full md:w-auto">
                  <select 
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="appearance-none bg-[#1a1a1a] text-white text-sm font-medium px-4 py-2 pr-8 rounded-lg border border-[#333] focus:border-primary outline-none cursor-pointer hover:bg-[#222] transition-colors w-full md:w-auto"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Table Header */}
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-12 items-center px-6 py-4 bg-[#111] text-xs font-medium text-text-muted uppercase tracking-wider border-b border-[#222]">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-5 pl-2">Fund</div>
              <div 
                className="col-span-3 cursor-pointer hover:text-primary transition-colors flex items-center gap-1 group"
                onClick={() => handleSort('manager')}
              >
                <span>Manager</span>
                {sortField === 'manager' && (
                  <span className="text-[10px] opacity-70">({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})</span>
                )}
              </div>
              <div 
                className="col-span-3 text-right pr-4 cursor-pointer hover:text-primary transition-colors flex items-center justify-end gap-1 group"
                onClick={() => handleSort(timePeriod === 'ytd' || timePeriod === 'last30Days' ? 'ytdReturn' : 'annualReturn')}
              >
                <span>Returns</span>
                {(sortField === 'annualReturn' || sortField === 'ytdReturn') && (
                  <span className="text-[10px] opacity-70">({sortDirection === 'desc' ? '↓' : '↑'})</span>
                )}
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-[#222]">
              {visibleFunds.map((fund, index) => (
                <FundRow key={fund.id} rank={index + 1} fund={fund} />
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
              Show More ({sortedFunds.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default App;
