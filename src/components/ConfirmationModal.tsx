import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, HelpCircle, AlertCircle, X, Check } from 'lucide-react';

export type ConfirmationType = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  cancelLabel?: string;
  type?: ConfirmationType;
  variant?: ConfirmationType;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  itemName,
  confirmText,
  confirmLabel,
  cancelText,
  cancelLabel,
  type,
  variant,
  isLoading = false,
}) => {
  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else if (typeof onCancel === 'function') {
      onCancel();
    }
  };

  const activeType: ConfirmationType = variant || type || 'danger';
  const activeConfirmText = confirmLabel || confirmText || 'Ya, Lanjutkan';
  const activeCancelText = cancelLabel || cancelText || 'Batal';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isLoading, onClose, onCancel]);

  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      icon: Trash2,
      bg: 'bg-rose-50 border-rose-200 text-rose-600',
      btn: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-rose-200/50',
      badge: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-50 border-amber-200 text-amber-600',
      btn: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-amber-200/50',
      badge: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    info: {
      icon: HelpCircle,
      bg: 'bg-sky-50 border-sky-200 text-sky-600',
      btn: 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white shadow-sky-200/50',
      badge: 'text-sky-700 bg-sky-50 border-sky-200',
    },
    success: {
      icon: Check,
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
      btn: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-200/50',
      badge: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
  }[activeType] || {
    icon: AlertCircle,
    bg: 'bg-slate-50 border-slate-200 text-slate-600',
    btn: 'bg-slate-800 hover:bg-slate-900 text-white',
    badge: 'text-slate-700 bg-slate-50 border-slate-200',
  };

  const Icon = iconConfig.icon;

  return (
    <div
      id="confirmation-modal-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          handleClose();
        }
      }}
    >
      <div
        id="confirmation-modal-container"
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/80 space-y-4 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
      >
        {/* Mobile Pull Bar Indicator */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${iconConfig.bg}`}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-base font-bold text-slate-900 font-display leading-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {itemName && (
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Item Terpilih:
            </div>
            <div className="text-xs font-semibold text-slate-800 break-words line-clamp-2">
              "{itemName}"
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            id="confirmation-modal-cancel-btn"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all active:scale-98"
          >
            {activeCancelText}
          </button>

          <button
            type="button"
            id="confirmation-modal-confirm-btn"
            onClick={() => {
              if (typeof onConfirm === 'function') {
                onConfirm();
              }
              handleClose();
            }}
            disabled={isLoading}
            className={`flex-1 py-2.5 px-4 font-bold text-xs rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5 ${iconConfig.btn}`}
          >
            {activeConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
