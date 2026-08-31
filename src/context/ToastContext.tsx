import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 w-full max-w-[90%] sm:max-w-md pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`
                flex items-center gap-3 p-4 rounded-2xl shadow-2xl border
                ${toast.type === 'success' ? 'bg-white border-emerald-100' : 
                  toast.type === 'error' ? 'bg-white border-rose-100' : 
                  'bg-white border-blue-100'}
              `}>
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                  ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 
                    toast.type === 'error' ? 'bg-rose-50 text-rose-600' : 
                    'bg-blue-50 text-blue-600'}
                `}>
                  {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                  {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                  {toast.type === 'info' && <Info className="w-5 h-5" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    {toast.type === 'success' ? 'Berhasil!' : 
                     toast.type === 'error' ? 'Oops!' : 
                     'Informasi'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {toast.message}
                  </p>
                </div>

                <button 
                  onClick={() => removeToast(toast.id)}
                  className="p-1 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
