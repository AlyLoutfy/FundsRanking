import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

const SubmitFundModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Equity',
    annualReturn: '',
    risk: 'Medium',
    description: '',
    strategy: '',
    minInvestment: '',
    fees: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    setFormData({ 
      name: '', 
      category: 'Equity', 
      annualReturn: '', 
      risk: 'Medium',
      description: '',
      strategy: '',
      minInvestment: '',
      fees: ''
    });
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-surface z-10">
          <h3 className="text-xl font-bold text-white">Submit a Fund</h3>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-200">
              Note: It takes at most 24h to verify the fund and accept it into our rankings.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Fund Name</label>
            <input
              type="text"
              required
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors"
              placeholder="e.g. CIB Growth Fund"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Description</label>
            <textarea
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors min-h-[80px]"
              placeholder="Brief description of the fund..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Category</label>
              <select
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Equity">Equity</option>
                <option value="Fixed Income">Fixed Income</option>
                <option value="Mixed">Mixed</option>
                <option value="Islamic">Islamic</option>
                <option value="Tech">Tech</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Risk Level</label>
              <select
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors appearance-none"
                value={formData.risk}
                onChange={(e) => setFormData({ ...formData, risk: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Strategy</label>
            <input
              type="text"
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors"
              placeholder="e.g. Long-term capital appreciation"
              value={formData.strategy}
              onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Min Investment</label>
              <input
                type="text"
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors"
                placeholder="e.g. 10,000 EGP"
                value={formData.minInvestment}
                onChange={(e) => setFormData({ ...formData, minInvestment: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Fees</label>
              <input
                type="text"
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors"
                placeholder="e.g. 1.5%"
                value={formData.fees}
                onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Annual Return (%)</label>
            <input
              type="number"
              step="0.1"
              required
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors"
              placeholder="e.g. 15.5"
              value={formData.annualReturn}
              onChange={(e) => setFormData({ ...formData, annualReturn: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mt-6"
          >
            <Check className="w-5 h-5" />
            Submit Fund
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitFundModal;
