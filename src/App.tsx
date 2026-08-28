/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
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
  const [isCirclesModalOpen, setIsCirclesModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [createInitialType, setCreateInitialType] = useState<
    'post' | 'task' | 'finance' | 'circle' | 'meeting' | null
  >(null);
  const [createDefaultDate, setCreateDefaultDate] = useState<string | undefined>(undefined);

  // Sync hash change for task modal
  React.useEffect(() => {
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
    return () => window.removeEventListener('hashchange', handleHash);
  }, [tasks, selectedTask]);

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
          onOpenUserProfileModal={() => setIsUserProfileModalOpen(true)}
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
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
