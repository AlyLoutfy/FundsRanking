import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

const AdvertiseModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    message: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send an email or API request
    console.log("Advertise Request:", formData);
    alert("Thanks for your interest! We'll be in touch shortly.");
    onClose();
    setFormData({ companyName: '', email: '', message: '' });
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-[#111] border border-[#222] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[#222] flex items-center justify-between">
          <h3 className="text-xl font-bold text-white font-display">Advertise on FundsRank</h3>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-text-muted leading-relaxed">
              Reach thousands of investors and fund managers daily. Your brand appears in rotating sponsor slots across all FundsRank pages.
            </p>
          </div>

          {/* Availability Badge */}
          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm font-medium text-white">Available Slots This Month</span>
            </div>
            <span className="text-lg font-bold text-primary">3 Left</span>
          </div>

          {/* Pricing Card */}
          <div className="bg-[#161616] border border-[#333] rounded-xl p-5">
            <h4 className="text-white font-bold text-sm mb-2">Pricing</h4>
            <p className="text-text-muted text-xs mb-4">
              Pay a <span className="text-white font-medium">10,000 EGP monthly fee</span> to display your ad. 
              This ensures high visibility for your brand.
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">10,000 EGP</span>
              <span className="text-text-muted text-xs">/month</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Company Name</label>
              <input
                type="text"
                required
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary outline-none transition-colors placeholder:text-text-muted/30"
                placeholder="e.g. FinTech Co."
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary outline-none transition-colors placeholder:text-text-muted/30"
                placeholder="you@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <Send className="w-4 h-4" />
              Send Inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdvertiseModal;
