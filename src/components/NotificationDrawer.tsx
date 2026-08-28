import React from 'react';
import { 
  X, 
  Bell, 
  Sparkles, 
  CheckSquare, 
  BookOpen, 
  Wallet, 
  Award, 
  CheckCheck,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NotificationItem } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    markAllNotificationsRead,
    markNotificationRead,
    setActiveTab,
  } = useApp();

  if (!isOpen) return null;

  const handleItemClick = (notif: NotificationItem) => {
    markNotificationRead(notif.id);
    if (notif.linkTab) {
      setActiveTab(notif.linkTab);
    }
    if (notif.postId) {
      window.location.hash = `#sharing/post/${notif.postId}`;
    }
    onClose();
  };

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'point':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'badge':
        return <Award className="w-4 h-4 text-amber-600" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-indigo-600" />;
      case 'sharing':
        return <BookOpen className="w-4 h-4 text-teal-600" />;
      case 'finance':
        return <Wallet className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-sm h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-display">
                Notifikasi Tim
              </h3>
              <p className="text-[10px] text-slate-400">
                Poin, tugas, dan pembaruan kas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={markAllNotificationsRead}
              className="p-1.5 text-xs text-slate-500 hover:text-teal-700 flex items-center gap-1 rounded-lg hover:bg-slate-50"
              title="Tandai Semua Dibaca"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Belum ada notifikasi baru.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  notif.read
                    ? 'bg-slate-50 border-slate-100 hover:bg-slate-100/80'
                    : 'bg-teal-50/70 border-teal-200 hover:bg-teal-50'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white shadow-2xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getNotifIcon(notif.type)}
                </div>

                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs leading-snug">
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 ml-1"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[9px] text-slate-400 block pt-1">
                    {notif.time}
                  </span>
                </div>

                <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 self-center" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
