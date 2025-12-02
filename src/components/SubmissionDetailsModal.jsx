import React from 'react';
import { formatDate } from '../lib/utils';
import { X, Building2, FileText, TrendingUp, DollarSign, ShieldAlert, Target } from 'lucide-react';

const SubmissionDetailsModal = ({ isOpen, onClose, submission }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

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

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    onClose();
  };

  if (!isVisible && !isOpen) return null;
  if (!submission) return null;

  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-text-muted mb-0.5">{label}</p>
        <p className="text-sm font-medium text-white">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm ${
        isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`relative w-full max-w-2xl bg-[#111] border border-[#333] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
          isClosing ? 'animate-sleekClose' : 'animate-sleekOpen'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#222]">
          <div>
            <h3 className="text-xl font-bold text-white">{submission.fund_name}</h3>
            <p className="text-sm text-text-muted mt-1">Submitted on {formatDate(submission.created_at)}</p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border ${
            submission.status === 'approved' ? 'bg-green-500/10 border-green-500/20' :
            submission.status === 'rejected' ? 'bg-red-500/10 border-red-500/20' :
            'bg-yellow-500/10 border-yellow-500/20'
          }`}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold uppercase tracking-wider ${
                  submission.status === 'approved' ? 'text-green-400' :
                  submission.status === 'rejected' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {submission.status}
                </span>
                {submission.processed_by_email && (
                  <span className="text-xs text-text-muted">
                    Processed by {submission.processed_by_email}
                  </span>
                )}
              </div>
              {submission.processed_at && (
                <p className="text-xs text-text-muted/70">
                  {submission.status === 'approved' ? 'Approved' : 'Rejected'} on {new Date(submission.processed_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailRow icon={Building2} label="Fund Manager" value={submission.manager} />
            <DetailRow icon={Target} label="Category" value={submission.category} />
            <DetailRow icon={TrendingUp} label="Annual Return" value={`${submission.return_1y}%`} />
            <DetailRow icon={ShieldAlert} label="Risk Level" value={submission.risk_level} />
            <DetailRow icon={DollarSign} label="Min Investment" value={submission.min_investment?.toLocaleString()} />
            <DetailRow icon={FileText} label="Fees" value={submission.fees} />
          </div>

          {/* Full Width Items */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-text-muted mb-2">Description</h4>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-gray-300 leading-relaxed">
                {submission.description}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-text-muted mb-2">Strategy</h4>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-gray-300 leading-relaxed">
                {submission.strategy}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetailsModal;
