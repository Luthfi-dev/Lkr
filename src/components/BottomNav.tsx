import React from 'react';
import { 
  Home, 
  Users, 
  CheckSquare, 
  Wallet, 
  BookOpen, 
  Trophy, 
  Plus 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BottomNavProps {
  onOpenCreateModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenCreateModal }) => {
  const { activeTab, setActiveTab, isAuthenticated, setIsAuthModalOpen } = useApp();

  const navItems = [
    { id: 'home' as const, label: 'Beranda', icon: Home, requiresAuth: false },
    { id: 'groups' as const, label: 'Grup', icon: Users, requiresAuth: true },
    { id: 'tasks' as const, label: 'Target', icon: CheckSquare, requiresAuth: true },
    { id: 'finance' as const, label: 'Kas', icon: Wallet, requiresAuth: true },
    { id: 'sharing' as const, label: 'Berbagi', icon: BookOpen, requiresAuth: false },
    { id: 'leaderboard' as const, label: 'Peringkat', icon: Trophy, requiresAuth: true },
  ];

  const handleNavClick = (item: (typeof navItems)[0]) => {
    if (item.requiresAuth && !isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setActiveTab(item.id);
  };

  return (
    <div className="fixed bottom-3 inset-x-0 z-40 flex items-center justify-center px-1.5 sm:px-4 pointer-events-none">
      <div className="flex items-center gap-0.5 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 bg-slate-950/95 text-white rounded-full shadow-2xl backdrop-blur-xl border border-slate-800 pointer-events-auto transition-all max-w-[98vw] sm:max-w-fit">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const href = item.id === 'home' ? '#' : `#${item.id}`;
          return (
            <a
              key={item.id}
              id={`tab-${item.id}`}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item);
              }}
              className={`relative flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-teal-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {isActive && (
                <span className="text-[11px] sm:text-xs tracking-tight font-medium hidden min-[360px]:inline animate-in fade-in zoom-in-90 duration-150">
                  {item.label}
                </span>
              )}
            </a>
          );
        })}

        {/* Separator */}
        <div className="w-px h-4 sm:h-5 bg-slate-800 mx-0.5" />

        {/* Quick Action Floating Plus Button */}
        <button
          id="quick-create-fab"
          onClick={() => {
            if (!isAuthenticated) {
              setIsAuthModalOpen(true);
            } else {
              onOpenCreateModal();
            }
          }}
          aria-label="Tambah Baru"
          className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 font-bold shadow-md hover:rotate-90 hover:scale-105 active:scale-95 transition-all duration-300 flex-shrink-0"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
