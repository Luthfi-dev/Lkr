import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  Circle,
  CircleMember,
  Post,
  Comment,
  PostAttachment,
  Task,
  TaskAssignee,
  TaskFrequency,
  FinancialTransaction,
  BudgetGoal,
  Badge,
  NotificationItem,
  MeetingAgenda,
  MemberDue,
  TaskStatus,
  PostCategory,
  TransactionType,
  Priority,
  Subtask,
  AppConfig,
} from '../types';
import {
  guestUser,
  initialCurrentUser,
  initialBadges,
} from '../data/mockData';

interface AppContextType {
  currentUser: User;
  circles: Circle[];
  activeCircleId: string | 'all';
  activeCircle: Circle | null;
  posts: Post[];
  tasks: Task[];
  transactions: FinancialTransaction[];
  budgetGoals: BudgetGoal[];
  memberDues: MemberDue[];
  badges: Badge[];
  notifications: NotificationItem[];
  meetings: MeetingAgenda[];
  allUsers: User[];
  searchQuery: string;
  activeTab: 'home' | 'groups' | 'sharing' | 'tasks' | 'finance' | 'leaderboard' | 'admin';
  selectedGroupForRoom: string | null;
  soundEnabled: boolean;
  isAuthModalOpen: boolean;
  isAuthenticated: boolean;
  postLoginAction: (() => void) | null;
  setPostLoginAction: React.Dispatch<React.SetStateAction<(() => void) | null>>;
  isRefreshingData: boolean;
  appConfig: AppConfig;
  refreshData: () => Promise<void>;
  fetchAppConfig: () => Promise<void>;
  updateAppConfig: (newCfg: Partial<AppConfig>) => Promise<boolean>;
  updateUserProfile: (data: { name?: string; title?: string; avatar?: string; username?: string }) => Promise<{ success: boolean; user?: User; error?: string }>;

  // Actions
  setActiveTab: (tab: 'home' | 'groups' | 'sharing' | 'tasks' | 'finance' | 'leaderboard' | 'admin') => void;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (identifier: string, password: string) => Promise<{ success: boolean; role?: string; error?: string }>;
  registerUser: (data: { name: string; username: string; email?: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setActiveCircleId: (id: string | 'all') => void;
  openGroupRoom: (circleId: string) => void;
  closeGroupRoom: () => void;
  setSearchQuery: (query: string) => void;
  toggleSound: () => void;
  
  // Post Actions
  createPost: (data: {
    title: string;
    summary: string;
    content: string;
    category: PostCategory;
    tags: string[];
    circleId?: string;
    mentions?: string[];
    attachments?: PostAttachment[];
    imageUrl?: string;
    isGroupPrivate?: boolean;
    visibility?: 'public' | 'group_only';
  }) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  savePost: (postId: string) => void;
  addComment: (
    postId: string,
    content: string,
    mentions?: string[],
    attachments?: PostAttachment[]
  ) => Promise<void>;
  addThreadReply: (
    postId: string,
    parentCommentId: string,
    content: string,
    mentions?: string[],
    attachments?: PostAttachment[]
  ) => Promise<void>;
  likeComment: (postId: string, commentId: string) => void;
  deletePost: (postId: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;

  // Task Actions
  createTask: (data: {
    title: string;
    description: string;
    deadline: string;
    priority: Priority;
    category: string;
    circleId?: string;
    colorTheme?: 'mint' | 'lavender' | 'peach' | 'sky';
    subtasks?: (string | Partial<Subtask>)[];
    assignees?: TaskAssignee[];
    frequency?: TaskFrequency;
    recurrenceDays?: number[];
    recurrenceTime?: string;
    isGroupGoal?: boolean;
    pointsReward?: number;
  }) => Promise<void>;
  updateTask: (taskId: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<void>;
  updateSubtask: (taskId: string, subtaskId: string, subtaskData: Partial<Subtask>) => void;
  toggleSubtask: (taskId: string, subtaskId: string, note?: string) => Promise<void>;
  updateSubtaskValue: (taskId: string, subtaskId: string, currentValue: number) => void;
  updateSubtaskOption: (taskId: string, subtaskId: string, selectedOption: string) => void;
  updateSubtaskNote: (taskId: string, subtaskId: string, note: string) => void;
  delegateSubtask: (taskId: string, subtaskId: string, assigneeName: string) => void;
  addSubtaskToTask: (taskId: string, subtaskData: string | Partial<Subtask>, priority?: Priority, assignedTo?: string) => Promise<void>;
  claimSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtaskFromTask: (taskId: string, subtaskId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  completeRecurringTask: (taskId: string, note?: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  assignTaskToMember: (taskId: string, assignee: TaskAssignee) => void;
  unassignTaskMember: (taskId: string, memberId: string) => void;
  claimTask: (taskId: string) => void;
  toggleDailyStreak: (taskId: string) => void;

  // Meeting / Agenda Actions
  createMeeting: (data: {
    title: string;
    date: string;
    timeRange: string;
    type: MeetingAgenda['type'];
    circleId?: string;
    meetUrl?: string;
    description?: string;
    attendees?: TaskAssignee[];
  }) => Promise<void>;
  deleteMeeting: (meetingId: string) => Promise<void>;
  toggleMeetingStatus: (meetingId: string) => void;

  // Circle Actions
  updateCircle: (
    circleId: string,
    data: Partial<Pick<Circle, 'name' | 'description' | 'category' | 'avatar' | 'bannerGradient' | 'tags' | 'isPrivate' | 'meetingSchedule'>>
  ) => Promise<void>;
  createCircle: (data: {
    name: string;
    category: Circle['category'];
    description: string;
    tags: string[];
  }) => Promise<string>;
  createCircleWithDetails: (data: {
    name: string;
    category: Circle['category'];
    description: string;
    tags: string[];
    avatar?: string;
    bannerGradient?: string;
    initialMembers?: { id: string; name: string; avatar: string; role: CircleMember['role'] }[];
    treasurerId?: string;
    initialTask?: {
      title: string;
      deadline: string;
      priority: Priority;
      category: string;
    };
  }) => Promise<string>;
  deleteCircle: (circleId: string) => Promise<void>;
  leaveCircle: (circleId: string) => Promise<void>;
  joinCircleByCode: (code: string) => Promise<{ success: boolean; message: string }>;
  addMemberToCircle: (
    circleId: string,
    member: { id: string; name: string; avatar: string; role?: CircleMember['role'] }
  ) => void;
  updateMemberRole: (
    circleId: string,
    memberId: string,
    newRole: CircleMember['role']
  ) => void;
  removeMemberFromCircle: (circleId: string, memberId: string) => void;

  // Finance Actions
  addTransaction: (data: {
    title: string;
    amount: number;
    type: TransactionType;
    category: string;
    circleId?: string;
    payerOrRecipient: string;
    receiptNote?: string;
  }) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBudgetGoal: (data: {
    title: string;
    targetAmount: number;
    deadline: string;
    purpose: string;
    circleId?: string;
  }) => Promise<void>;
  deleteBudgetGoal: (goalId: string) => void;
  toggleMemberDue: (dueId: string) => void;

  // Gamification & Points
  addPoints: (points: number, reason: string) => void;
  triggerCelebration: () => void;

  // Notifications
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'time' | 'read'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage loader helper
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`lingkar_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('lingkar_auth_token');
    }
    return false;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('lingkar_auth_token')) {
      return loadStored('user', initialCurrentUser);
    }
    return guestUser;
  });

  // Dynamic real database state initialized as empty arrays (will be filled immediately via API)
  const [circles, setCircles] = useState<Circle[]>([]);
  const [activeCircleId, setActiveCircleId] = useState<string | 'all'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([]);
  const [memberDues, setMemberDues] = useState<MemberDue[]>([]);
  const [badges, setBadges] = useState<Badge[]>(() =>
    loadStored('badges', initialBadges)
  );
  const [postLoginAction, setPostLoginAction] = useState<(() => void) | null>(null);
  const [rawNotifications, setRawNotifications] = useState<NotificationItem[]>([]);
  const notifications = isAuthenticated ? rawNotifications : [];
  const [meetings, setMeetings] = useState<MeetingAgenda[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Hash Router for Online Page Navigation & Direct URL Indexing
  const getTabFromHash = (hash: string): 'home' | 'groups' | 'sharing' | 'tasks' | 'finance' | 'leaderboard' | 'admin' => {
    const cleanHash = hash.replace(/^#\/?/, '').split('/')[0];
    if (cleanHash === 'groups' || cleanHash === 'group') return 'groups';
    if (cleanHash === 'tasks' || cleanHash === 'task') return 'tasks';
    if (cleanHash === 'finance') return 'finance';
    if (cleanHash === 'sharing' || cleanHash === 'posts') return 'sharing';
    if (cleanHash === 'leaderboard') return 'leaderboard';
    if (cleanHash === 'admin') return 'admin';
    return 'home';
  };

  const getGroupIdFromHash = (hash: string): string | null => {
    const parts = hash.replace(/^#\/?/, '').split('/');
    if (parts[0] === 'group' && parts[1]) {
      return parts[1];
    }
    return null;
  };

  const [activeTab, setActiveTabState] = useState<
    'home' | 'groups' | 'sharing' | 'tasks' | 'finance' | 'leaderboard' | 'admin'
  >(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return getTabFromHash(window.location.hash);
    }
    return 'home';
  });

  const [selectedGroupForRoom, setSelectedGroupForRoom] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return getGroupIdFromHash(window.location.hash);
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRefreshingData, setIsRefreshingData] = useState(false);

  const [appConfig, setAppConfig] = useState<AppConfig>({
    appName: 'Lingkar',
    appLogo: '',
    appCover: '',
    appFavicon: '',
    appMotto: 'Ruang Kolaborasi Komunitas, Tracker Target & Kas Transparan',
    appDescription: 'Ekosistem digital tim untuk Circle Sharing, Shared Checklists & Progress Tracker, Gamifikasi Kebaikan, dan Manajemen Kas Transparan.',
    organizationName: 'Komunitas Lingkar Kebaikan Indonesia',
    contactEmail: 'kontak@lingkarkebaikan.org',
    contactPhone: '+62 812-3456-7890',
    websiteUrl: 'https://lingkarkebaikan.org',
    maintenanceMode: false,
    allowRegistration: true,
    maxUploadSizeMb: 25,
    securityLevel: 'high',
    activeAnnouncement: '',
    showAnnouncement: false,
  });

  const fetchAppConfig = async () => {
    try {
      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const data = await res.json();
        setAppConfig(data);
      }
    } catch (e) {
      console.error('Error fetching app config:', e);
    }
  };

  const updateAppConfig = async (newCfg: Partial<AppConfig>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('lingkar_auth_token');
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newCfg),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setAppConfig(data.config);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error updating app config:', e);
      return false;
    }
  };

  const updateUserProfile = async (data: {
    name?: string;
    title?: string;
    avatar?: string;
    username?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const token = localStorage.getItem('lingkar_auth_token');
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...data, userId: currentUser.id }),
      });
      const result = await res.json();
      if (result.success && result.user) {
        const updatedUser: User = {
          ...currentUser,
          name: result.user.name || currentUser.name,
          title: result.user.title !== undefined ? result.user.title : currentUser.title,
          avatar: result.user.avatar || currentUser.avatar,
          username: result.user.username || currentUser.username,
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('lingkar_user', JSON.stringify(updatedUser));

        // Update in allUsers list
        setAllUsers((prev) =>
          prev.map((u) => (u.id === currentUser.id ? { ...u, ...updatedUser } : u))
        );

        return { success: true, user: updatedUser };
      }
      return { success: false, error: result.error || 'Gagal memperbarui profil.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Terjadi kesalahan jaringan.' };
    }
  };

  // Function to refresh all data directly from MySQL database
  const refreshData = async () => {
    setIsRefreshingData(true);
    const token = localStorage.getItem('lingkar_auth_token');
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const [postsRes, circlesRes, tasksRes, txRes, bgRes, duesRes, meetRes, usersRes, cfgRes] = await Promise.allSettled([
        fetch('/api/posts', { headers: authHeaders }),
        fetch('/api/circles', { headers: authHeaders }),
        fetch('/api/tasks', { headers: authHeaders }),
        fetch('/api/finance/transactions', { headers: authHeaders }),
        fetch('/api/finance/budget-goals', { headers: authHeaders }),
        fetch('/api/finance/member-dues', { headers: authHeaders }),
        fetch('/api/meetings', { headers: authHeaders }),
        fetch('/api/admin/users', { headers: authHeaders }),
        fetch('/api/admin/config'),
      ]);

      if (postsRes.status === 'fulfilled' && postsRes.value.ok) {
        const data = await postsRes.value.json();
        if (Array.isArray(data.posts)) {
          setPosts(data.posts);
        }
      }
      if (circlesRes.status === 'fulfilled' && circlesRes.value.ok) {
        const data = await circlesRes.value.json();
        if (Array.isArray(data.circles)) {
          setCircles(data.circles);
        }
      }
      if (tasksRes.status === 'fulfilled' && tasksRes.value.ok) {
        const data = await tasksRes.value.json();
        if (Array.isArray(data.tasks)) {
          setTasks(data.tasks);
        }
      }
      if (txRes.status === 'fulfilled' && txRes.value.ok) {
        const data = await txRes.value.json();
        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }
      }
      if (bgRes.status === 'fulfilled' && bgRes.value.ok) {
        const data = await bgRes.value.json();
        if (Array.isArray(data.budgetGoals)) {
          setBudgetGoals(data.budgetGoals);
        }
      }
      if (duesRes.status === 'fulfilled' && duesRes.value.ok) {
        const data = await duesRes.value.json();
        if (Array.isArray(data.memberDues)) {
          setMemberDues(data.memberDues);
        }
      }
      if (meetRes.status === 'fulfilled' && meetRes.value.ok) {
        const data = await meetRes.value.json();
        if (Array.isArray(data.meetings)) {
          setMeetings(data.meetings);
        }
      }
      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        const data = await usersRes.value.json();
        if (Array.isArray(data.users)) {
          setAllUsers(data.users);
        }
      }
      if (cfgRes.status === 'fulfilled' && cfgRes.value.ok) {
        const data = await cfgRes.value.json();
        if (data && data.appName) {
          setAppConfig(data);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data dari database:', err);
    } finally {
      setIsRefreshingData(false);
    }
  };

  // Re-fetch fresh database records whenever user changes page tab or opens a group room
  useEffect(() => {
    refreshData();
  }, [activeTab, selectedGroupForRoom]);

  // Check auth session on load and fetch database entities
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const token = localStorage.getItem('lingkar_auth_token');
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.authenticated && data.user) {
              setCurrentUser(data.user);
              setIsAuthenticated(true);
            }
          } else {
            localStorage.removeItem('lingkar_auth_token');
            localStorage.removeItem('lingkar_user');
            setIsAuthenticated(false);
            setCurrentUser(guestUser);
          }
        } catch (e) {
          // fallback
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(guestUser);
      }

      // Load dynamic database entities
      await refreshData();
    };

    checkAuthAndLoad();
  }, []);

  const login = async (identifier: string, password: string): Promise<{ success: boolean; role?: string; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (res.ok && data.token && data.user) {
        localStorage.setItem('lingkar_auth_token', data.token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        playSoundEffect('coin');

        // Refresh all dynamic DB data with authenticated token
        refreshData();

        if (postLoginAction) {
          const action = postLoginAction;
          setPostLoginAction(null);
          setTimeout(() => {
            action();
          }, 150);
        } else {
          // Automatic dashboard redirection based on role:
          const userRole = data.user.systemRole || (data.user.role === 'superadmin' ? 'superadmin' : data.user.role === 'admin' ? 'admin' : 'member');
          if (userRole === 'superadmin' || userRole === 'admin') {
            setActiveTab('admin');
            if (typeof window !== 'undefined') {
              window.location.hash = 'admin';
            }
          } else {
            setActiveTab('home');
            if (typeof window !== 'undefined') {
              window.location.hash = 'home';
            }
          }
        }
        return { success: true, role: data.user.systemRole || data.user.role };
      }
      return { success: false, error: data.error || 'Autentikasi gagal.' };
    } catch (e: any) {
      console.error('Login error:', e);
      return { success: false, error: e.message || 'Terjadi kesalahan sistem.' };
    }
  };

  const registerUser = async (data: { name: string; username: string; email?: string; password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.token && resData.user) {
        localStorage.setItem('lingkar_auth_token', resData.token);
        setCurrentUser(resData.user);
        setIsAuthenticated(true);
        playSoundEffect('success');

        // Refresh dynamic DB data
        refreshData();

        if (postLoginAction) {
          const action = postLoginAction;
          setPostLoginAction(null);
          setTimeout(() => {
            action();
          }, 150);
        } else {
          // New user is redirected to User Dashboard (home)
          setActiveTab('home');
          if (typeof window !== 'undefined') {
            window.location.hash = 'home';
          }
        }
        return { success: true };
      }
      return { success: false, error: resData.error || 'Gagal mendaftar akun baru.' };
    } catch (e: any) {
      console.error('Registration error:', e);
      return { success: false, error: e.message || 'Terjadi kesalahan sistem.' };
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('lingkar_auth_token');
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {}
    localStorage.removeItem('lingkar_auth_token');
    localStorage.removeItem('lingkar_user');
    setIsAuthenticated(false);
    setCurrentUser(guestUser);
    setActiveCircleId('all');
    setSelectedGroupForRoom(null);
    setActiveTabState('home');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', window.location.pathname);
      window.location.hash = '';
    }
    // Refresh for guest view
    refreshData();
  };

  // Handle URL hash changes (Back / Forward / Direct Link / Refresh)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const targetTab = getTabFromHash(hash);
      const targetGroupId = getGroupIdFromHash(hash);

      setActiveTabState(targetTab);
      setSelectedGroupForRoom(targetGroupId);
      if (targetGroupId) {
        setActiveCircleId(targetGroupId);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setActiveTab = (tab: 'home' | 'groups' | 'sharing' | 'tasks' | 'finance' | 'leaderboard' | 'admin') => {
    setActiveTabState(tab);
    if (tab !== 'groups') {
      setSelectedGroupForRoom(null);
    }
    const targetHash = tab === 'home' ? '' : `#${tab}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetHash || window.location.pathname);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const openGroupRoom = (circleId: string) => {
    setSelectedGroupForRoom(circleId);
    setActiveCircleId(circleId);
    setActiveTabState('groups');
    const targetHash = `#group/${circleId}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetHash);
    }
  };

  const closeGroupRoom = () => {
    setSelectedGroupForRoom(null);
    if (window.location.hash.startsWith('#group')) {
      window.history.pushState(null, '', '#groups');
    }
  };

  // Sync current user to localStorage
  useEffect(() => {
    if (currentUser.id && currentUser.id !== 'guest') {
      localStorage.setItem('lingkar_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const activeCircle =
    activeCircleId === 'all'
      ? null
      : circles.find((c) => c.id === activeCircleId) || null;

  // Sound & Confetti triggers
  const playSoundEffect = (type: 'success' | 'click' | 'coin') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'coin') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // Audio context may be restricted by autoplay policy
    }
  };

  const triggerCelebration = () => {
    playSoundEffect('success');
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#0f766e', '#10b981', '#38bdf8', '#f59e0b', '#8b5cf6'],
    });
  };

  const toggleSound = () => setSoundEnabled((prev) => !prev);

  const addPoints = (points: number, reason: string) => {
    playSoundEffect('coin');
    setCurrentUser((prev) => {
      const newPoints = prev.points + points;
      const newLevel = Math.floor(newPoints / 300) + 1;
      return {
        ...prev,
        points: newPoints,
        level: newLevel,
      };
    });

    addNotification({
      title: `+${points} Poin Kebaikan Diraih!`,
      message: reason,
      type: 'point',
      linkTab: 'leaderboard',
    });
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'time' | 'read'>) => {
    const newItem: NotificationItem = {
      ...notif,
      id: `notif_${Date.now()}`,
      time: 'Baru saja',
      read: false,
    };
    setRawNotifications((prev) => [newItem, ...prev]);

    // Trigger native browser/OS push notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(newItem.title, {
            body: newItem.message,
            icon: '/favicon.ico',
          });
        } catch {}
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            try {
              new Notification(newItem.title, {
                body: newItem.message,
                icon: '/favicon.ico',
              });
            } catch {}
          }
        }).catch(() => {});
      }
    }
  };

  const markAllNotificationsRead = () => {
    setRawNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markNotificationRead = (id: string) => {
    setRawNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // ==========================================
  // POST OPERATIONS (Connected to MySQL API)
  // ==========================================
  const createPost = async (data: {
    title: string;
    summary: string;
    content: string;
    category: PostCategory;
    tags: string[];
    circleId?: string;
    mentions?: string[];
    attachments?: PostAttachment[];
    imageUrl?: string;
    isGroupPrivate?: boolean;
    visibility?: 'public' | 'group_only';
  }) => {
    const targetCircleId = data.circleId || (activeCircleId !== 'all' ? activeCircleId : circles[0]?.id || 'circle_1');
    const targetCircle = circles.find((c) => c.id === targetCircleId) || circles[0];

    const words = data.content.split(/\s+/).length;
    const estTime = `${Math.max(1, Math.ceil(words / 150))} mnt`;

    const token = localStorage.getItem('lingkar_auth_token');
    const authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          circleId: targetCircle?.id || 'circle_1',
          title: data.title,
          summary: data.summary || data.content.slice(0, 120) + '...',
          content: data.content,
          category: data.category,
          tags: data.tags,
          readingTime: estTime,
          pointsBonus: 35,
          mentions: data.mentions,
          attachments: data.attachments,
          imageUrl: data.imageUrl,
          isGroupPrivate: data.isGroupPrivate ?? false,
          visibility: data.visibility || (data.isGroupPrivate ? 'group_only' : 'public'),
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.post) {
          setPosts((prev) => [resData.post, ...prev]);
        }
      } else {
        // Optimistic fallback
        const fallbackPost: Post = {
          id: `post_${Date.now()}`,
          circleId: targetCircle?.id || 'circle_1',
          circleName: targetCircle?.name || 'Umum',
          isGroupPrivate: data.isGroupPrivate ?? false,
          visibility: data.visibility || (data.isGroupPrivate ? 'group_only' : 'public'),
          author: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            role: currentUser.role,
          },
          title: data.title,
          summary: data.summary || data.content.slice(0, 120) + '...',
          content: data.content,
          category: data.category,
          tags: data.tags.length > 0 ? data.tags : ['Wawasan', 'Berbagi'],
          likes: 1,
          likedByMe: true,
          savedByMe: false,
          comments: [],
          readingTime: estTime,
          pointsBonus: 35,
          mentions: data.mentions || [],
          attachments: data.attachments || [],
          imageUrl: data.imageUrl,
          createdAt: new Date().toISOString(),
        };
        setPosts((prev) => [fallbackPost, ...prev]);
      }
    } catch (err) {
      console.error('Error creating post on server:', err);
    }

    addPoints(35, `Membagikan wawasan baru: "${data.title.slice(0, 30)}..."`);
    triggerCelebration();

    if (data.mentions && data.mentions.length > 0) {
      addNotification({
        title: 'Anda Ditandai (@mention)',
        message: `${currentUser.name} menandai anggota (${data.mentions.join(', ')}) dalam postingan "${data.title.slice(0, 25)}..."`,
        type: 'sharing',
        linkTab: 'sharing',
      });
    }
  };

  const likePost = async (postId: string) => {
    const targetPost = posts.find((p) => p.id === postId);
    if (targetPost && !targetPost.likedByMe) {
      addNotification({
        title: 'Postingan Disukai ❤️',
        message: `${currentUser.name} menyukai postingan "${targetPost.title.slice(0, 30)}..."`,
        type: 'sharing',
        linkTab: 'sharing',
        postId: targetPost.id,
      });
    }

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = post.likedByMe;
          return {
            ...post,
            likedByMe: !isLiked,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      })
    );

    const token = localStorage.getItem('lingkar_auth_token');
    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (e) {}
  };

  const savePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            savedByMe: !post.savedByMe,
          };
        }
        return post;
      })
    );
  };

  const addComment = async (
    postId: string,
    content: string,
    mentions?: string[],
    attachments?: PostAttachment[]
  ) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    const token = localStorage.getItem('lingkar_auth_token');
    const authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          content: content.trim(),
          mentions: mentions || [],
          attachments: attachments || [],
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.comment) {
          const targetPost = posts.find((p) => p.id === postId);
          if (targetPost) {
            addNotification({
              title: 'Komentar Baru 💬',
              message: `${currentUser.name} mengomentari postingan "${targetPost.title.slice(0, 30)}..."`,
              type: 'sharing',
              linkTab: 'sharing',
              postId: postId,
            });
          }

          setPosts((prev) =>
            prev.map((post) => {
              if (post.id === postId) {
                return {
                  ...post,
                  comments: [resData.comment, ...post.comments],
                  commentsCount: (post.commentsCount || 0) + 1,
                };
              }
              return post;
            })
          );
        }
      }
    } catch (e) {
      console.error('Error adding comment:', e);
    }

    addPoints(10, 'Berpartisipasi dalam diskusi ilmu dan wawasan tim');

    if (mentions && mentions.length > 0) {
      addNotification({
        title: 'Anda Ditandai (@mention)',
        message: `${currentUser.name} menandai Anda dalam diskusi: "${content.slice(0, 35)}..."`,
        type: 'sharing',
        linkTab: 'sharing',
      });
    }
  };

  const addThreadReply = async (
    postId: string,
    parentCommentId: string,
    content: string,
    mentions?: string[],
    attachments?: PostAttachment[]
  ) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    const token = localStorage.getItem('lingkar_auth_token');
    const authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          content: content.trim(),
          parentId: parentCommentId,
          mentions: mentions || [],
          attachments: attachments || [],
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.comment) {
          const targetPost = posts.find((p) => p.id === postId);
          if (targetPost) {
            addNotification({
              title: 'Balasan Diskusi 💭',
              message: `${currentUser.name} membalas diskusi pada postingan "${targetPost.title.slice(0, 30)}..."`,
              type: 'sharing',
              linkTab: 'sharing',
              postId: postId,
            });
          }

          setPosts((prev) =>
            prev.map((post) => {
              if (post.id === postId) {
                const updatedComments = post.comments.map((c) => {
                  if (c.id === parentCommentId) {
                    const existingReplies = c.replies || [];
                    return {
                      ...c,
                      replies: [...existingReplies, resData.comment],
                    };
                  }
                  return c;
                });

                return {
                  ...post,
                  comments: updatedComments,
                  commentsCount: (post.commentsCount || 0) + 1,
                };
              }
              return post;
            })
          );
        }
      }
    } catch (e) {
      console.error('Error adding reply:', e);
    }

    addPoints(15, 'Membalas utas percakapan dan memperdalam diskusi tim');
  };

  const likeComment = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const updatedComments = post.comments.map((c) => {
            if (c.id === commentId) {
              const isLiked = c.likedByMe || false;
              return {
                ...c,
                likedByMe: !isLiked,
                likes: isLiked ? (c.likes || 1) - 1 : (c.likes || 0) + 1,
              };
            }
            if (c.replies && c.replies.length > 0) {
              const updatedReplies = c.replies.map((r) => {
                if (r.id === commentId) {
                  const isLiked = r.likedByMe || false;
                  return {
                    ...r,
                    likedByMe: !isLiked,
                    likes: isLiked ? (r.likes || 1) - 1 : (r.likes || 0) + 1,
                  };
                }
                return r;
              });
              return { ...c, replies: updatedReplies };
            }
            return c;
          });

          return { ...post, comments: updatedComments };
        }
        return post;
      })
    );
  };

  const deletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    playSoundEffect('click');

    const token = localStorage.getItem('lingkar_auth_token');
    try {
      await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) {}
  };

  const deleteComment = async (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const filterComments = (comments: Comment[]): Comment[] => {
            return comments
              .filter((c) => c.id !== commentId)
              .map((c) => ({
                ...c,
                replies: c.replies ? filterComments(c.replies) : [],
              }));
          };
          const updated = filterComments(p.comments);
          return {
            ...p,
            comments: updated,
            commentsCount: Math.max(0, (p.commentsCount || 1) - 1),
          };
        }
        return p;
      })
    );
    playSoundEffect('click');

    const token = localStorage.getItem('lingkar_auth_token');
    try {
      await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) {}
  };

  // Helper to compute subtask progress & completion accurately
  const calcTaskSubtaskStats = (subtasks: Subtask[]) => {
    if (!subtasks || subtasks.length === 0) return { progress: 0, status: 'ongoing' as TaskStatus };

    let totalWeight = 0;
    for (const st of subtasks) {
      if (st.type === 'number_input') {
        const target = Number(st.targetValue) || 1;
        const current = Number(st.currentValue) || 0;
        const ratio = Math.min(1, Math.max(0, current / target));
        totalWeight += ratio;
      } else if (st.type === 'select_option') {
        if (st.completed || st.selectedOption === 'Selesai' || st.selectedOption === 'Tuntas' || st.selectedOption === 'Selesai Sempurna') {
          totalWeight += 1;
        } else if (st.selectedOption === 'Sedang Dikerjakan' || st.selectedOption === 'Review' || st.selectedOption === 'Proses') {
          totalWeight += 0.5;
        } else if (st.options && st.selectedOption) {
          const idx = st.options.indexOf(st.selectedOption);
          if (idx >= 0 && st.options.length > 1) {
            totalWeight += idx / (st.options.length - 1);
          }
        }
      } else {
        totalWeight += st.completed ? 1 : 0;
      }
    }

    const progress = Math.min(100, Math.round((totalWeight / subtasks.length) * 100));
    const status: TaskStatus = progress === 100 ? 'done' : 'ongoing';
    return { progress, status };
  };

  // ==========================================
  // TASK OPERATIONS (Connected to MySQL API)
  // ==========================================
  const createTask = async (data: {
    title: string;
    description: string;
    deadline: string;
    priority: Priority;
    category: string;
    circleId?: string;
    colorTheme?: 'mint' | 'lavender' | 'peach' | 'sky';
    subtasks?: (string | Partial<Subtask>)[];
    assignees?: TaskAssignee[];
    frequency?: TaskFrequency;
    recurrenceDays?: number[];
    recurrenceTime?: string;
    isGroupGoal?: boolean;
    pointsReward?: number;
  }) => {
    const targetCircleId = data.circleId || (activeCircleId !== 'all' ? activeCircleId : circles[0]?.id || 'circle_1');
    const targetCircle = circles.find((c) => c.id === targetCircleId) || circles[0];

    const token = localStorage.getItem('lingkar_auth_token');
    const authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          circleId: targetCircle?.id || 'circle_1',
          title: data.title,
          description: data.description,
          deadline: data.deadline,
          priority: data.priority,
          category: data.category,
          colorTheme: data.colorTheme,
          subtasks: data.subtasks,
          assignees: data.assignees,
          frequency: data.frequency,
          recurrenceDays: data.recurrenceDays,
          recurrenceTime: data.recurrenceTime,
          isGroupGoal: data.isGroupGoal,
          pointsReward: data.pointsReward,
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.task) {
          setTasks((prev) => [resData.task, ...prev]);
        }
      }
    } catch (e) {
      console.error('Error creating task:', e);
    }

    addPoints(20, `Membuat target ${data.frequency === 'daily' ? 'rutin harian' : data.frequency === 'weekly' ? 'rutin mingguan' : 'bersama'}: "${data.title}"`);
    playSoundEffect('click');
  };

  const addSubtaskToTask = async (
    taskId: string,
    subtaskData: string | Partial<Subtask>,
    priority: Priority = 'Medium',
    assignedTo?: string
  ) => {
    const token = localStorage.getItem('lingkar_auth_token');
    const title = typeof subtaskData === 'string' ? subtaskData : subtaskData.title || 'Langkah baru';
    const subPriority = typeof subtaskData === 'string' ? priority : subtaskData.priority || priority;
    const subType = typeof subtaskData === 'string' ? 'checkbox' : subtaskData.type || 'checkbox';

    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          priority: subPriority,
          assignedTo,
          type: subType,
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.subtask) {
          setTasks((prev) =>
            prev.map((task) => {
              if (task.id === taskId) {
                const updatedSubtasks = [...task.subtasks, resData.subtask];
                const { progress, status } = calcTaskSubtaskStats(updatedSubtasks);
                return { ...task, subtasks: updatedSubtasks, progress, status };
              }
              return task;
            })
          );
        }
      }
    } catch (e) {
      console.error('Error adding subtask:', e);
    }

    playSoundEffect('click');
    addPoints(5, `Menambahkan sub-tahap target: "${title}"`);
  };

  const claimSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const updated = task.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, assignedTo: currentUser.name } : st
          );
          return {
            ...task,
            subtasks: updated,
          };
        }
        return task;
      })
    );
    playSoundEffect('coin');
    addPoints(10, `Mengklaim tanggung jawab subtask target`);
  };

  const delegateSubtask = (taskId: string, subtaskId: string, assigneeName: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const updated = task.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, assignedTo: assigneeName } : st
          );
          return {
            ...task,
            subtasks: updated,
          };
        }
        return task;
      })
    );
    playSoundEffect('click');
    addNotification({
      title: 'Subtask Didelegasikan',
      message: `Subtask berhasil ditugaskan kepada ${assigneeName}.`,
      type: 'task',
      linkTab: 'tasks',
    });
  };

  const toggleDailyStreak = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const currentStreak = task.streakDays || 0;
          const newStreak = currentStreak + 1;
          playSoundEffect('coin');
          addPoints(15, `Streak harian tercapai 🔥 (+1 hari)`);
          triggerCelebration();
          return {
            ...task,
            streakDays: newStreak,
          };
        }
        return task;
      })
    );
  };

  const assignTaskToMember = (taskId: string, assignee: TaskAssignee) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const already = t.assignees.some((a) => a.id === assignee.id);
          if (already) return t;
          return {
            ...t,
            assignees: [...t.assignees, assignee],
          };
        }
        return t;
      })
    );
    playSoundEffect('click');
    addNotification({
      title: 'Tugas Didelegasikan',
      message: `Tugas berhasil didelegasikan kepada ${assignee.name}.`,
      type: 'task',
      linkTab: 'tasks',
    });
  };

  const unassignTaskMember = (taskId: string, memberId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            assignees: t.assignees.filter((a) => a.id !== memberId),
          };
        }
        return t;
      })
    );
  };

  const claimTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isAssigned = t.assignees.some((a) => a.id === currentUser.id);
          if (isAssigned) return t;
          return {
            ...t,
            assignees: [
              ...t.assignees,
              { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar },
            ],
          };
        }
        return t;
      })
    );
    playSoundEffect('coin');
    addPoints(15, `Mengambil alih & siap mengerjakan tugas`);
    triggerCelebration();
  };

  const toggleSubtask = async (taskId: string, subtaskId: string, note?: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          let wasToggled = false;
          const updatedSubtasks = task.subtasks.map((st) => {
            if (st.id === subtaskId) {
              if (st.type === 'checkbox_note' && !st.completed) {
                const finalNote = note !== undefined ? note.trim() : (st.completionNote || '').trim();
                if (!finalNote) {
                  return st;
                }
                wasToggled = true;
                return {
                  ...st,
                  completed: true,
                  completionNote: finalNote,
                };
              }

              const newCompleted = !st.completed;
              wasToggled = true;
              return {
                ...st,
                completed: newCompleted,
                completionNote: note !== undefined ? note : st.completionNote,
              };
            }
            return st;
          });

          if (!wasToggled) return task;

          const { progress, status } = calcTaskSubtaskStats(updatedSubtasks);

          if (progress === 100 && task.status !== 'done') {
            triggerCelebration();
            addPoints(task.pointsReward, `Menuntaskan seluruh target: "${task.title}"`);
          } else {
            playSoundEffect('click');
            addPoints(10, `Menyelesaikan sub-checklist`);
          }

          return {
            ...task,
            subtasks: updatedSubtasks,
            progress,
            status,
          };
        }
        return task;
      })
    );

    const token = localStorage.getItem('lingkar_auth_token');
    try {
      await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}/toggle`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) {}
  };

  const updateSubtaskValue = (taskId: string, subtaskId: string, currentValue: number) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map((st) => {
            if (st.id === subtaskId) {
              const target = Number(st.targetValue) || 1;
              const val = Math.max(0, currentValue);
              const isCompleted = val >= target;
              return {
                ...st,
                currentValue: val,
                completed: isCompleted,
              };
            }
            return st;
          });

          const { progress, status } = calcTaskSubtaskStats(updatedSubtasks);

          if (progress === 100 && task.status !== 'done') {
            triggerCelebration();
            addPoints(task.pointsReward, `Menuntaskan target nilai: "${task.title}"`);
          }

          return {
            ...task,
            subtasks: updatedSubtasks,
            progress,
            status,
          };
        }
        return task;
      })
    );
  };

  const updateSubtaskOption = (taskId: string, subtaskId: string, selectedOption: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map((st) => {
            if (st.id === subtaskId) {
              const isDoneOption = selectedOption === 'Selesai' || selectedOption === 'Tuntas' || selectedOption === 'Selesai Sempurna';
              return {
                ...st,
                selectedOption,
                completed: isDoneOption,
              };
            }
            return st;
          });

          const { progress, status } = calcTaskSubtaskStats(updatedSubtasks);
          playSoundEffect('click');

          if (progress === 100 && task.status !== 'done') {
            triggerCelebration();
            addPoints(task.pointsReward, `Menuntaskan target: "${task.title}"`);
          }

          return {
            ...task,
            subtasks: updatedSubtasks,
            progress,
            status,
          };
        }
        return task;
      })
    );
  };

  const updateSubtaskNote = (taskId: string, subtaskId: string, note: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const trimmed = note.trim();
          const updatedSubtasks = task.subtasks.map((st) => {
            if (st.id === subtaskId) {
              const isCompleted = st.type === 'checkbox_note' ? trimmed.length > 0 : st.completed;
              return {
                ...st,
                completionNote: trimmed || undefined,
                completed: isCompleted,
              };
            }
            return st;
          });

          const { progress, status } = calcTaskSubtaskStats(updatedSubtasks);
          playSoundEffect('click');

          if (progress === 100 && task.status !== 'done') {
            triggerCelebration();
            addPoints(task.pointsReward, `Menuntaskan seluruh target: "${task.title}"`);
          }

          return {
            ...task,
            subtasks: updatedSubtasks,
            progress,
            status,
          };
        }
        return task;
      })
    );
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const isDone = status === 'done';
    const nowFormatted = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          if (isDone && task.status !== 'done') {
            triggerCelebration();
            addPoints(task.pointsReward, `Menyelesaikan tugas: "${task.title}"`);
          }

          const newRecord = isDone ? {
            id: `rec_${Date.now()}`,
            completedAt: nowFormatted,
            completedById: currentUser.id,
            completedByName: currentUser.name,
            pointsEarned: task.pointsReward,
            note: 'Tugas ditandai selesai',
          } : null;

          const updatedHistory = newRecord
            ? [...(task.completionHistory || []), newRecord]
            : task.completionHistory;

          return {
            ...task,
            status,
            progress: isDone ? 100 : status === 'todo' ? 0 : Math.max(task.progress, 25),
            completedAt: isDone ? nowFormatted : undefined,
            completedByName: isDone ? currentUser.name : undefined,
            completionHistory: updatedHistory,
          };
        }
        return task;
      })
    );

    const token = localStorage.getItem('lingkar_auth_token');
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status,
          progress: isDone ? 100 : 25,
        }),
      });
    } catch (e) {}
  };

  const completeRecurringTask = async (taskId: string, note?: string) => {
    const nowFormatted = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const newStreak = (task.streakDays || 0) + 1;
          const newRecord = {
            id: `rec_rec_${Date.now()}`,
            completedAt: nowFormatted,
            completedById: currentUser.id,
            completedByName: currentUser.name,
            pointsEarned: task.pointsReward,
            note: note || `Tuntas siklus tugas ${task.frequency === 'daily' ? 'harian' : task.frequency === 'weekly' ? 'mingguan' : 'rutin'} 🔥`,
          };

          triggerCelebration();
          playSoundEffect('coin');
          addPoints(task.pointsReward, `Tuntas siklus tugas rutin: "${task.title}" (+${task.pointsReward} Poin, Streak: ${newStreak} 🔥)`);
          
          addNotification({
            title: 'Tugas Rutin Diselesaikan 🔥',
            message: `Tugas "${task.title}" berhasil dituntaskan untuk hari ini oleh ${currentUser.name}. Streak: ${newStreak} hari.`,
            type: 'task',
            linkTab: 'tasks',
          });

          return {
            ...task,
            streakDays: newStreak,
            completedAt: nowFormatted,
            completedByName: currentUser.name,
            completionHistory: [...(task.completionHistory || []), newRecord],
            subtasks: task.subtasks.map((st) => ({ ...st, completed: true })),
            progress: 100,
          };
        }
        return task;
      })
    );

    const token = localStorage.getItem('lingkar_auth_token');
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          progress: 100,
          status: 'done',
        }),
      });
    } catch (e) {}
  };

  const updateTask = async (
    taskId: string,
    data: Partial<Omit<Task, 'id' | 'createdAt'>>
  ) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = data.subtasks !== undefined ? data.subtasks : task.subtasks;
          const { progress, status } = calcTaskSubtaskStats(updatedSubtasks);

          const updatedTask: Task = {
            ...task,
            ...data,
            subtasks: updatedSubtasks,
            progress: data.status !== undefined && data.status === 'done' ? 100 : (data.progress !== undefined ? data.progress : progress),
            status: data.status !== undefined ? data.status : status,
          };

          return updatedTask;
        }
        return task;
      })
    );
    playSoundEffect('click');

    const token = localStorage.getItem('lingkar_auth_token');
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
    } catch (e) {}

    addNotification({
      title: 'Target Tugas Diperbarui',
      message: `Perubahan pada target "${data.title || 'Tugas'}" berhasil disimpan.`,
      type: 'task',
      linkTab: 'tasks',
    });
  };

  const updateSubtask = (
    taskId: string,
    subtaskId: string,
    subtaskData: Partial<Subtask>
  ) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map((st) => {
            if (st.id === subtaskId) {
              return {
                ...st,
                ...subtaskData,
              };
            }
            return st;
          });
          const { progress, status } = calcTaskSubtaskStats(updatedSubtasks);
          return {
            ...task,
            subtasks: updatedSubtasks,
            progress,
            status,
          };
        }
        return task;
      })
    );
    playSoundEffect('click');
  };

  const deleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    playSoundEffect('click');

    const token = localStorage.getItem('lingkar_auth_token');
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) {}
  };

  const deleteSubtaskFromTask = async (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.filter((st) => st.id !== subtaskId);
          const { progress, status } = calcTaskSubtaskStats(updatedSubtasks);
          return {
            ...task,
            subtasks: updatedSubtasks,
            progress,
            status,
          };
        }
        return task;
      })
    );
    playSoundEffect('click');

    const token = localStorage.getItem('lingkar_auth_token');
    try {
      await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) {}
  };

  // ==========================================
  // MEETING OPERATIONS (Connected to MySQL API)
  // ==========================================
  const createMeeting = async (data: {
    title: string;
    date: string;
    timeRange: string;
    type: MeetingAgenda['type'];
    circleId?: string;
    meetUrl?: string;
    description?: string;
    attendees?: TaskAssignee[];
  }) => {
    const targetCircleId = data.circleId || (activeCircleId !== 'all' ? activeCircleId : circles[0]?.id || 'circle_1');
    const targetCircle = circles.find((c) => c.id === targetCircleId) || circles[0];

    const token = localStorage.getItem('lingkar_auth_token');
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          circleId: targetCircle?.id || 'circle_1',
          title: data.title,
          date: data.date,
          timeRange: data.timeRange,
          type: data.type,
          meetUrl: data.meetUrl,
          description: data.description,
          attendees: data.attendees,
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.meeting) {
          setMeetings((prev) => [resData.meeting, ...prev]);
        }
      }
    } catch (e) {
      console.error('Error creating meeting:', e);
    }

    addPoints(15, `Menjadwalkan agenda tim: "${data.title}"`);
    playSoundEffect('click');
  };

  const deleteMeeting = async (meetingId: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== meetingId));

    const token = localStorage.getItem('lingkar_auth_token');
    try {
      await fetch(`/api/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) {}
  };

  const toggleMeetingStatus = (meetingId: string) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === meetingId) {
          const nextStatus = m.status === 'completed' ? 'upcoming' : 'completed';
          if (nextStatus === 'completed') {
            triggerCelebration();
            addPoints(25, `Menyelesaikan agenda pertemuan: "${m.title}"`);
          }
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  // ==========================================
  // CIRCLE OPERATIONS (Connected to MySQL API)
  // ==========================================
  const createCircle = async (data: {
    name: string;
    category: Circle['category'];
    description: string;
    tags: string[];
  }) => {
    return createCircleWithDetails({
      name: data.name,
      category: data.category,
      description: data.description,
      tags: data.tags,
    });
  };

  const createCircleWithDetails = async (data: {
    name: string;
    category: Circle['category'];
    description: string;
    tags: string[];
    avatar?: string;
    bannerGradient?: string;
    initialMembers?: { id: string; name: string; avatar: string; role: CircleMember['role'] }[];
    treasurerId?: string;
    initialTask?: {
      title: string;
      deadline: string;
      priority: Priority;
      category: string;
    };
  }) => {
    const token = localStorage.getItem('lingkar_auth_token');
    let newCircleId = `circle_${Date.now()}`;

    try {
      const res = await fetch('/api/circles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          description: data.description,
          tags: data.tags,
          avatar: data.avatar,
          bannerGradient: data.bannerGradient,
          isPrivate: false,
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.circle) {
          newCircleId = resData.circle.id;
          setCircles((prev) => [resData.circle, ...prev]);
        }
      }
    } catch (e) {
      console.error('Error creating circle:', e);
    }

    setCurrentUser((prev) => ({
      ...prev,
      joinedCircleIds: [...prev.joinedCircleIds, newCircleId],
    }));

    setActiveCircleId(newCircleId);
    setSelectedGroupForRoom(newCircleId);
    setActiveTab('groups');
    triggerCelebration();
    addPoints(100, `Menginisiasi Grup Baru: "${data.name}"`);
    return newCircleId;
  };

  const addMemberToCircle = (
    circleId: string,
    member: { id: string; name: string; avatar: string; role?: CircleMember['role'] }
  ) => {
    const today = new Date().toISOString().split('T')[0];
    setCircles((prev) =>
      prev.map((c) => {
        if (c.id === circleId) {
          const exists = c.members.some((m) => m.id === member.id);
          if (exists) return c;
          const newMember: CircleMember = {
            id: member.id,
            name: member.name,
            avatar: member.avatar,
            role: member.role || 'Anggota',
            joinedAt: today,
            contributionPoints: 300,
          };
          return {
            ...c,
            members: [...c.members, newMember],
          };
        }
        return c;
      })
    );
    playSoundEffect('click');
    addNotification({
      title: 'Anggota Baru Bergabung',
      message: `${member.name} telah ditambahkan ke dalam grup.`,
      type: 'system',
      linkTab: 'groups',
    });
  };

  const updateMemberRole = (
    circleId: string,
    memberId: string,
    newRole: CircleMember['role']
  ) => {
    setCircles((prev) =>
      prev.map((c) => {
        if (c.id === circleId) {
          return {
            ...c,
            members: c.members.map((m) =>
              m.id === memberId ? { ...m, role: newRole } : m
            ),
          };
        }
        return c;
      })
    );
    playSoundEffect('click');
    addPoints(10, `Memperbarui peran anggota menjadi ${newRole}`);
  };

    const updateCircle = async (circleId: string, data: Partial<Pick<Circle, 'name' | 'description' | 'category' | 'avatar' | 'bannerGradient' | 'tags' | 'isPrivate' | 'meetingSchedule'>>) => {
    try {
      const token = localStorage.getItem('lingkar_auth_token');
      await fetch(`/api/circles/${circleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      setCircles((prev) =>
        prev.map((c) => {
          if (c.id === circleId) {
            return { ...c, ...data };
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Failed to update circle', err);
    }
  };

  const removeMemberFromCircle = (circleId: string, memberId: string) => {
    setCircles((prev) =>
      prev.map((c) => {
        if (c.id === circleId) {
          return {
            ...c,
            members: c.members.filter((m) => m.id !== memberId),
          };
        }
        return c;
      })
    );
    playSoundEffect('click');
  };

  const deleteCircle = async (circleId: string) => {
    setCircles((prev) => prev.filter((c) => c.id !== circleId));
    if (activeCircleId === circleId) {
      setActiveCircleId('all');
    }
    if (selectedGroupForRoom === circleId) {
      setSelectedGroupForRoom(null);
    }
    playSoundEffect('click');

    const token = localStorage.getItem('lingkar_auth_token');
    try {
      await fetch(`/api/circles/${circleId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) {}
  };

  const leaveCircle = async (circleId: string) => {
    const target = circles.find((c) => c.id === circleId);
    const circleName = target ? target.name : 'Grup';

    setCircles((prev) =>
      prev.map((c) => {
        if (c.id === circleId) {
          return {
            ...c,
            members: c.members.filter((m) => m.id !== currentUser.id),
          };
        }
        return c;
      })
    );

    setCurrentUser((prev) => ({
      ...prev,
      joinedCircleIds: prev.joinedCircleIds.filter((id) => id !== circleId),
    }));

    if (selectedGroupForRoom === circleId) {
      setSelectedGroupForRoom(null);
    }
    if (activeCircleId === circleId) {
      setActiveCircleId('all');
    }

    playSoundEffect('click');
    addNotification({
      title: 'Keluar dari Grup',
      message: `Anda telah berhasil keluar dari grup ${circleName}.`,
      type: 'system',
      linkTab: 'groups',
    });

    const token = localStorage.getItem('lingkar_auth_token');
    try {
      await fetch(`/api/circles/${circleId}/leave`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) {}
  };

  const joinCircleByCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    const cleanCode = code.trim().toUpperCase();
    const token = localStorage.getItem('lingkar_auth_token');

    try {
      const res = await fetch('/api/circles/join-by-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code: cleanCode }),
      });

      const data = await res.json();
      if (res.ok && data.circle) {
        setCircles((prev) => {
          const idx = prev.findIndex((c) => c.id === data.circle.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = data.circle;
            return next;
          }
          return [data.circle, ...prev];
        });

        setCurrentUser((prev) => ({
          ...prev,
          joinedCircleIds: Array.from(new Set([...prev.joinedCircleIds, data.circle.id])),
        }));

        setActiveCircleId(data.circle.id);
        triggerCelebration();
        addPoints(50, `Bergabung ke dalam ${data.circle.name}`);
        return { success: true, message: `Berhasil bergabung dengan ${data.circle.name}!` };
      }
      return { success: false, message: data.error || 'Kode Lingkar tidak ditemukan.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Gagal menghubungi server.' };
    }
  };

  // ==========================================
  // FINANCE OPERATIONS (Connected to MySQL API)
  // ==========================================
  const addTransaction = async (data: {
    title: string;
    amount: number;
    type: TransactionType;
    category: string;
    circleId?: string;
    payerOrRecipient: string;
    receiptNote?: string;
  }) => {
    const targetCircleId = data.circleId || (activeCircleId !== 'all' ? activeCircleId : circles[0]?.id || 'circle_1');
    const targetCircle = circles.find((c) => c.id === targetCircleId) || circles[0];

    const token = localStorage.getItem('lingkar_auth_token');
    try {
      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          circleId: targetCircle?.id || 'circle_1',
          type: data.type,
          title: data.title,
          amount: data.amount,
          category: data.category,
          payerOrRecipient: data.payerOrRecipient,
          receiptNote: data.receiptNote,
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.transaction) {
          setTransactions((prev) => [resData.transaction, ...prev]);

          // Update local circle kasBalance
          setCircles((prev) =>
            prev.map((c) => {
              if (c.id === (targetCircle?.id || 'circle_1')) {
                const delta = data.type === 'income' || data.type === 'dues' ? data.amount : -data.amount;
                return { ...c, kasBalance: Math.max(0, c.kasBalance + delta) };
              }
              return c;
            })
          );
        }
      }
    } catch (e) {
      console.error('Error creating transaction:', e);
    }

    addPoints(25, `Mencatat pembukuan kas transparan: ${data.title}`);
    playSoundEffect('coin');
  };

  const deleteTransaction = async (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    // Reverse balance
    setCircles((prev) =>
      prev.map((c) => {
        if (c.id === tx.circleId) {
          const delta = tx.type === 'income' || tx.type === 'dues' ? -tx.amount : tx.amount;
          return { ...c, kasBalance: Math.max(0, c.kasBalance + delta) };
        }
        return c;
      })
    );

    const token = localStorage.getItem('lingkar_auth_token');
    try {
      await fetch(`/api/finance/transactions/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) {}
  };

  const addBudgetGoal = async (data: {
    title: string;
    targetAmount: number;
    deadline: string;
    purpose: string;
    circleId?: string;
  }) => {
    const targetCircleId = data.circleId || (activeCircleId !== 'all' ? activeCircleId : circles[0]?.id || 'circle_1');
    const token = localStorage.getItem('lingkar_auth_token');

    try {
      const res = await fetch('/api/finance/budget-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          circleId: targetCircleId,
          title: data.title,
          targetAmount: data.targetAmount,
          deadline: data.deadline,
          purpose: data.purpose,
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.budgetGoal) {
          setBudgetGoals((prev) => [resData.budgetGoal, ...prev]);
        }
      }
    } catch (e) {
      console.error('Error adding budget goal:', e);
    }

    addPoints(15, `Membuat target pendanaan/kas tim: ${data.title}`);
  };

  const deleteBudgetGoal = (goalId: string) => {
    setBudgetGoals((prev) => prev.filter((g) => g.id !== goalId));
    playSoundEffect('click');
  };

  const toggleMemberDue = (dueId: string) => {
    setMemberDues((prev) =>
      prev.map((due) => {
        if (due.id === dueId) {
          const newStatus = !due.isPaid;
          if (newStatus) {
            playSoundEffect('coin');
            addPoints(20, `Membayar iuran kas kebaikan bulan ${due.month}`);
          }
          return {
            ...due,
            isPaid: newStatus,
            paidDate: newStatus ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return due;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        circles,
        activeCircleId,
        activeCircle,
        posts,
        tasks,
        transactions,
        budgetGoals,
        memberDues,
        badges,
        notifications,
        meetings,
        allUsers,
        searchQuery,
        activeTab,
        selectedGroupForRoom,
        soundEnabled,
        isAuthModalOpen,
        isAuthenticated,
        postLoginAction,
        setPostLoginAction,
        isRefreshingData,
        appConfig,
        refreshData,
        fetchAppConfig,
        updateAppConfig,
        updateUserProfile,
        setActiveTab,
        setIsAuthModalOpen,
        login,
        registerUser,
        logout,
        setActiveCircleId,
        openGroupRoom,
        closeGroupRoom,
        setSearchQuery,
        toggleSound,
        createPost,
        likePost,
        savePost,
        addComment,
        addThreadReply,
        likeComment,
        deletePost,
        deleteComment,
        createTask,
        updateTask,
        updateSubtask,
        assignTaskToMember,
        unassignTaskMember,
        claimTask,
        toggleSubtask,
        updateSubtaskValue,
        updateSubtaskOption,
        updateSubtaskNote,
        delegateSubtask,
        addSubtaskToTask,
        claimSubtask,
        deleteSubtaskFromTask,
        toggleDailyStreak,
        updateTaskStatus,
        completeRecurringTask,
        deleteTask,
        createMeeting,
        deleteMeeting,
        toggleMeetingStatus,
        createCircle,
        updateCircle,
        createCircleWithDetails,
        deleteCircle,
        leaveCircle,
        joinCircleByCode,
        addMemberToCircle,
        updateMemberRole,
        removeMemberFromCircle,
        addTransaction,
        deleteTransaction,
        addBudgetGoal,
        deleteBudgetGoal,
        toggleMemberDue,
        addPoints,
        triggerCelebration,
        markAllNotificationsRead,
        markNotificationRead,
        addNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
