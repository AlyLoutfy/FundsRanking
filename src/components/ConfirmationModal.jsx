import React from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger', confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div 
        className="relative w-full max-w-md bg-[#111] border border-[#333] rounded-2xl shadow-2xl overflow-hidden animate-sleekOpen"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <div className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center border",
              type === 'danger' ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-green-500/10 border-green-500/20 text-green-500"
            )}>
              {type === 'danger' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-300 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 bg-[#1a1a1a] border-t border-[#222]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={clsx(
              "px-4 py-2 text-sm font-bold rounded-lg transition-all shadow-lg",
              type === 'danger' 
                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20" 
                : "bg-primary hover:bg-primary-hover text-black shadow-primary/20"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
