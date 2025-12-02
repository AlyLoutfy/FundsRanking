import React, { useEffect } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-slideDown">
      <div className={clsx(
        "flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border",
        type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
      )}>
        {type === 'success' ? (
          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-3 h-3" />
          </div>
        )}
        <span className="text-sm font-medium whitespace-nowrap">{message}</span>
        <button 
          onClick={onClose}
          className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-3 h-3 opacity-50 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
