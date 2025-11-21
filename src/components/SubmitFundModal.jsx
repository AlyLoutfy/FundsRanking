import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import clsx from 'clsx';

const SubmitFundModal = ({ isOpen, onClose, onSubmit }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
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

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 400); // Match sleek animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    // The parent controls 'isOpen', so we just call onClose.
    // The useEffect will handle the animation state when isOpen changes to false.
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    handleClose();
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
      className={clsx(
        "fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm",
        isClosing ? "animate-fadeOut" : "animate-fadeIn"
      )}
      onClick={handleClose}
    >
      <div 
        className={clsx(
          "bg-surface border-t md:border border-border rounded-t-2xl md:rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] flex flex-col",
          isClosing 
            ? "animate-drawerClose md:animate-sleekClose" 
            : "animate-drawerOpen md:animate-sleekOpen"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface z-10 shrink-0">
          <h3 className="text-lg font-bold text-white">Submit a Fund</h3>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-200">
              Note: It takes at most 24h to verify the fund and accept it into our rankings.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Fund Name</label>
            <input
              type="text"
              required
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-sm focus:border-primary outline-none transition-colors"
              placeholder="e.g. CIB Growth Fund"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Description</label>
            <textarea
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-sm focus:border-primary outline-none transition-colors min-h-[60px]"
              placeholder="Brief description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Category</label>
              <select
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-sm focus:border-primary outline-none transition-colors appearance-none"
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
              <label className="block text-xs font-medium text-text-muted mb-1">Risk Level</label>
              <select
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-sm focus:border-primary outline-none transition-colors appearance-none"
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
            <label className="block text-xs font-medium text-text-muted mb-1">Strategy</label>
            <input
              type="text"
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-sm focus:border-primary outline-none transition-colors"
              placeholder="e.g. Long-term capital appreciation"
              value={formData.strategy}
              onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Min Investment</label>
              <input
                type="text"
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-sm focus:border-primary outline-none transition-colors"
                placeholder="e.g. 10,000 EGP"
                value={formData.minInvestment}
                onChange={(e) => setFormData({ ...formData, minInvestment: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Fees</label>
              <input
                type="text"
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-sm focus:border-primary outline-none transition-colors"
                placeholder="e.g. 1.5%"
                value={formData.fees}
                onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Annual Return (%)</label>
            <input
              type="number"
              step="0.1"
              required
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-white text-sm focus:border-primary outline-none transition-colors"
              placeholder="e.g. 15.5"
              value={formData.annualReturn}
              onChange={(e) => setFormData({ ...formData, annualReturn: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors mt-4 text-sm"
          >
            <Check className="w-4 h-4" />
            Submit Fund
          </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitFundModal;
