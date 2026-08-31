/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, X } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { NavbarHeader } from './components/NavbarHeader';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { GroupsView } from './components/GroupsView';
import { SharingView } from './components/SharingView';
import { TasksView } from './components/TasksView';
import { FinanceView } from './components/FinanceView';
import { LeaderboardView } from './components/LeaderboardView';
import { TaskDetailModal } from './components/TaskDetailModal';
import { CirclesModal } from './components/CirclesModal';
import { CreateActionModal } from './components/CreateActionModal';
import { CreateGroupModal } from './components/CreateGroupModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { UserProfileModal } from './components/UserProfileModal';
import { FeedbackModal } from './components/FeedbackModal';
import { GroupDetailModal } from './components/GroupDetailModal';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AuthModal } from './components/AuthModal';
import { SEOHead } from './components/SEOHead';
import { Task, Circle } from './types';

const MainContent: React.FC = () => {
  const { activeTab, tasks, isAuthModalOpen, setIsAuthModalOpen, isRefreshingData } = useApp();

  // Modals state & URL query synchronization
  const [selectedTask, setSelectedTaskState] = useState<Task | null>(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#task/')) {
      const taskId = window.location.hash.replace('#task/', '');
      return tasks.find((t) => t.id === taskId) || null;
    }
    return null;
  });

  const setSelectedTask = (task: Task | null) => {
    setSelectedTaskState(task);
    if (task) {
      if (window.location.hash !== `#task/${task.id}`) {
        window.history.pushState(null, '', `#task/${task.id}`);
      }
    } else {
      if (window.location.hash.startsWith('#task/')) {
        const fallbackHash = activeTab === 'home' ? '' : `#${activeTab}`;
        window.history.pushState(null, '', fallbackHash || window.location.pathname);
      }
    }
  };

  const [selectedGroupForModal, setSelectedGroupForModal] = useState<Circle | null>(null);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [userProfileModalTab, setUserProfileModalTab] = useState<'profile' | 'edit' | 'circles' | 'feedback'>('profile');

  const openUserProfileWithTab = (tab: 'profile' | 'edit' | 'circles' | 'feedback') => {
    setUserProfileModalTab(tab);
    setIsUserProfileModalOpen(true);
  };

  const [isCirclesModalOpen, setIsCirclesModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [createInitialType, setCreateInitialType] = useState<
    'post' | 'task' | 'finance' | 'circle' | 'meeting' | null
  >(null);
  const [createDefaultDate, setCreateDefaultDate] = useState<string | undefined>(undefined);

  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  // Regular web app initialization (PWA removed)
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => caches.delete(key));
        });
      }
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleHash = () => {
      if (window.location.hash.startsWith('#task/')) {
        const taskId = window.location.hash.replace('#task/', '');
        const foundTask = tasks.find((t) => t.id === taskId);
        if (foundTask) setSelectedTaskState(foundTask);
      } else if (!window.location.hash.startsWith('#task/') && selectedTask) {
        setSelectedTaskState(null);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [tasks, selectedTask]);

  const handleApplyUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdateToast(false);
    setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  const handleOpenCreateWith = (
    type: 'post' | 'task' | 'finance' | 'circle' | 'meeting',
    defaultDate?: string
  ) => {
    if (type === 'circle') {
      setIsCreateGroupModalOpen(true);
    } else {
      setCreateInitialType(type);
      setCreateDefaultDate(defaultDate);
      setIsCreateModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#1e293b] flex flex-col items-center w-full">
      {/* Real-time Dynamic SEO Head & Social Meta Generator */}
      <SEOHead />

      {/* Top Page Load Progress Bar */}
      {isRefreshingData && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-teal-100 overflow-hidden">
          <div className="h-full bg-teal-600 animate-pulse w-full transition-all duration-300" />
        </div>
      )}

      {/* Maximum Width Mobile/Tablet Constraint Wrapper */}
      <div className="w-full max-w-2xl min-h-screen flex flex-col relative px-3 sm:px-4 pb-10">
        {/* Top Navbar */}
        <NavbarHeader
          onOpenUserProfileModal={() => openUserProfileWithTab('profile')}
          onOpenCirclesModal={() => setIsCirclesModalOpen(true)}
          onOpenNotifDrawer={() => setIsNotifDrawerOpen(true)}
          onOpenCreateModal={() => {
            setCreateInitialType(null);
            setCreateDefaultDate(undefined);
            setIsCreateModalOpen(true);
          }}
          onOpenGroupDetail={(circle) => setSelectedGroupForModal(circle)}
        />

        {/* Dynamic Main View Switcher with Animated Transitions */}
        <main className="flex-1 w-full pt-1 pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full"
            >
              {activeTab === 'home' && (
                <HomeView
                  onOpenTaskDetail={(task) => setSelectedTask(task)}
                  onOpenCreateTask={() => handleOpenCreateWith('task')}
                  onOpenCreatePost={() => handleOpenCreateWith('post')}
                  onOpenCreateTransaction={() => handleOpenCreateWith('finance')}
                  onOpenGroupDetail={(circle) => setSelectedGroupForModal(circle)}
                  onOpenFeedback={() => setIsFeedbackModalOpen(true)}
                />
              )}

              {activeTab === 'groups' && (
                <GroupsView
                  onOpenTaskDetail={(task) => setSelectedTask(task)}
                  onOpenCreateGroupModal={() => setIsCreateGroupModalOpen(true)}
                  onOpenGroupDetail={(circle) => setSelectedGroupForModal(circle)}
                />
              )}

              {activeTab === 'sharing' && (
                <SharingView
                  onOpenCreatePost={() => handleOpenCreateWith('post')}
                />
              )}

              {activeTab === 'tasks' && (
                <TasksView
                  onOpenTaskDetail={(task) => setSelectedTask(task)}
                  onOpenCreateTask={(defaultDate, type) =>
                    handleOpenCreateWith(type || 'task', defaultDate)
                  }
                />
              )}

              {activeTab === 'finance' && (
                <FinanceView
                  onOpenCreateTransaction={() => handleOpenCreateWith('finance')}
                />
              )}

              {activeTab === 'leaderboard' && <LeaderboardView />}

              {activeTab === 'admin' && <AdminDashboardView />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating Bottom Capsule Dock */}
        <BottomNav
          onOpenCreateModal={() => {
            setCreateInitialType(null);
            setCreateDefaultDate(undefined);
            setIsCreateModalOpen(true);
          }}
        />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        {/* User Profile Sheet Modal */}
        <UserProfileModal
          isOpen={isUserProfileModalOpen}
          onClose={() => setIsUserProfileModalOpen(false)}
          onOpenCreateGroup={() => setIsCreateGroupModalOpen(true)}
          onOpenGroupDetail={(circle) => {
            setIsUserProfileModalOpen(false);
            setSelectedGroupForModal(circle);
          }}
          onOpenFeedback={() => {
            setIsUserProfileModalOpen(false);
            setIsFeedbackModalOpen(true);
          }}
          defaultTab={userProfileModalTab as any}
        />

        {/* Feedback Popup Modal */}
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
        />

        {/* Group Detail Sheet Modal */}
        <GroupDetailModal
          circle={selectedGroupForModal}
          isOpen={!!selectedGroupForModal}
          onClose={() => setSelectedGroupForModal(null)}
          onOpenCreateTask={() => handleOpenCreateWith('task')}
        />

        {/* Task Detail Sheet Modal */}
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />

        {/* Switch / Manage Circles Modal */}
        <CirclesModal
          isOpen={isCirclesModalOpen}
          onClose={() => setIsCirclesModalOpen(false)}
        />

        {/* Create Group Modal */}
        <CreateGroupModal
          isOpen={isCreateGroupModalOpen}
          onClose={() => setIsCreateGroupModalOpen(false)}
        />

        {/* Create Action / Task Sheet */}
        <CreateActionModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setCreateDefaultDate(undefined);
          }}
          initialType={createInitialType}
          defaultDate={createDefaultDate}
        />

        {/* Notification Drawer */}
        <NotificationDrawer
          isOpen={isNotifDrawerOpen}
          onClose={() => setIsNotifDrawerOpen(false)}
        />

        {/* PWA New Version Update Floating Toast */}
        <AnimatePresence>
          {showUpdateToast && (
            <motion.div
              id="pwa-update-toast"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[120] bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
                  <RefreshCw className="w-5 h-5 animate-spin text-teal-400" style={{ animationDuration: '3s' }} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                    Pembaruan Tersedia <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </h4>
                  <p className="text-[11px] text-slate-300 truncate">
                    Versi baru aplikasi siap digunakan.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  id="btn-apply-pwa-update"
                  onClick={handleApplyUpdate}
                  className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md transition-all whitespace-nowrap cursor-pointer"
                >
                  Perbarui
                </button>
                <button
                  id="btn-dismiss-pwa-update"
                  onClick={() => setShowUpdateToast(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Tutup notifikasi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <MainContent />
      </ToastProvider>
    </AppProvider>
  );
}
