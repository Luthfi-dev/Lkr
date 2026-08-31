export type Priority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'todo' | 'ongoing' | 'done';
export type TaskFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'custom_days';

export interface TaskCompletionRecord {
  id: string;
  completedAt: string;
  completedById: string;
  completedByName: string;
  note?: string;
  pointsEarned?: number;
}

export type CircleCategory = 
  | 'Organisasi Akar Rumput'
  | 'Kelompok Studi'
  | 'Divisi Kerja'
  | 'Support Group'
  | 'Komunitas Kebaikan';

export type PostCategory = string;

export interface PostCategoryItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isDefault?: boolean;
  sortOrder?: number;
  postCount?: number;
  createdAt?: string;
}

export type FeedbackCategory =
  | 'Saran Fitur'
  | 'Laporan Bug'
  | 'Laporan Kendala (Bug)'
  | 'Kritik & Masukan'
  | 'Desain & Tampilan'
  | 'Desain & Tampilan (UI/UX)'
  | 'Performa & Kecepatan'
  | 'Ide Komunitas'
  | 'Lainnya';

export type FeedbackStatus =
  | 'pending'
  | 'reviewed'
  | 'in_progress'
  | 'implemented'
  | 'resolved'
  | 'rejected';

export interface FeedbackItem {
  id: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  category: FeedbackCategory;
  title: string;
  message: string;
  rating?: number;
  status: FeedbackStatus;
  adminNotes?: string;
  respondedBy?: string;
  respondedAt?: string;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense' | 'dues';

export type SystemRole = 'superadmin' | 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar: string;
  role: string; // Display role e.g. "Koordinator Lingkar", "Super Administrator"
  systemRole?: SystemRole; // 'superadmin' | 'admin' | 'member'
  title?: string;
  points: number;
  level: number;
  streakDays: number;
  badgesCount: number;
  joinedCircleIds: string[];
  createdAt?: string;
  isActive?: boolean;
}

export interface AppConfig {
  appName: string;
  appLogo?: string;
  appCover?: string;
  appFavicon?: string;
  appMotto: string;
  appDescription: string;
  organizationName?: string;
  contactEmail: string;
  contactPhone?: string;
  websiteUrl?: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxUploadSizeMb: number;
  securityLevel: string;
  activeAnnouncement: string;
  showAnnouncement: boolean;
  lastUpdated: string;
}

export interface SystemMetrics {
  uptimeSeconds: number;
  totalRequests: number;
  activeSessions: number;
  memory: {
    rssMb: number;
    heapTotalMb: number;
    heapUsedMb: number;
    externalMb: number;
    systemFreeMb: number;
    systemTotalMb: number;
    heapUsedPercent: number;
  };
  uploads: {
    totalFiles: number;
    totalSizeBytes: number;
    totalSizeMb: string;
  };
  systemStatus: string;
  nodeVersion: string;
  platform: string;
  auditLogs: Array<{
    id: string;
    timestamp: string;
    user: string;
    action: string;
    ip: string;
    status: string;
  }>;
}

export interface TaskAssignee {
  id: string;
  name: string;
  avatar: string;
}

export interface UserCompletion {
  userId: string;
  userName: string;
  avatar: string;
  completed: boolean;
  completedSubtaskIds: string[];
  completedCount: number;
  subtaskNotes?: Record<string, string>; // Map of subtaskId -> note
  updatedAt: string;
}

export interface PostAttachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'doc' | 'sheet' | 'slide' | 'zip' | 'link';
  url: string;
}

export type SubtaskType = 'checkbox' | 'checkbox_note' | 'number_input' | 'select_option';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  priority?: Priority;
  assignedTo?: string; // name or id of assignee
  type?: SubtaskType; // 'checkbox' | 'checkbox_note' | 'number_input' | 'select_option'
  // for checkbox_note
  completionNote?: string;
  notePlaceholder?: string; // custom placeholder determined by admin/creator
  // for number_input
  targetValue?: number;
  currentValue?: number;
  unit?: string; // e.g. "Halaman", "Pax", "Juz", "Rp", "Orang", "Unit"
  // for select_option
  options?: string[]; // e.g. ["Belum", "Sedang Dikerjakan", "Review", "Selesai"]
  selectedOption?: string;
}

export interface Task {
  id: string;
  circleId: string;
  circleName: string;
  title: string;
  description: string;
  deadline: string;
  priority: Priority;
  status: TaskStatus;
  progress: number;
  assignees: TaskAssignee[];
  subtasks: Subtask[];
  category: string;
  pointsReward: number;
  colorTheme: 'mint' | 'lavender' | 'peach' | 'sky';
  createdAt: string;
  commentsCount?: number;
  frequency?: TaskFrequency; // 'once' | 'daily' | 'weekly' | 'monthly' | 'custom_days'
  recurrenceDays?: number[]; // [0=Min, 1=Sen, 2=Sel, 3=Rab, 4=Kam, 5=Jum, 6=Sab]
  recurrenceTime?: string; // e.g. "08:00 WIB"
  streakDays?: number; // for daily/recurring tasks
  isGroupGoal?: boolean; // collaborative goal for all members
  isDelegated?: boolean; // delegated per member (independent completion)
  userCompletions?: UserCompletion[]; // completions tracking per member
  collaborativeNotes?: string;
  syncedCalendars?: ('google' | 'outlook' | 'ics')[];
  calendarSyncedAt?: string;
  completedAt?: string;
  completedByName?: string;
  completionHistory?: TaskCompletionRecord[];
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  parentId?: string; // For nested replies / threading
  replies?: Comment[];
  mentions?: string[]; // user IDs or names mentioned with @
  attachments?: PostAttachment[];
  likes?: number;
  likedByMe?: boolean;
}

export interface Post {
  id: string;
  circleId: string;
  circleName: string;
  isGroupPrivate?: boolean;
  visibility?: 'public' | 'group_only';
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  title: string;
  summary: string;
  content: string;
  category: PostCategory;
  tags: string[];
  likes: number;
  likedByMe: boolean;
  savedByMe: boolean;
  comments: Comment[];
  commentsCount?: number;
  readingTime: string;
  pointsBonus: number;
  mentions?: string[];
  attachments?: PostAttachment[];
  imageUrl?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  circleId: string;
  circleName: string;
  type: TransactionType;
  title: string;
  amount: number;
  category: string;
  date: string;
  payerOrRecipient: string;
  recordedBy: string;
  receiptNote?: string;
  proofUrl?: string;
  status: 'verified' | 'pending';
}

export interface BudgetGoal {
  id: string;
  circleId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  purpose: string;
}

export interface MemberDue {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  amount: number;
  month: string;
  isPaid: boolean;
  paidDate?: string;
}

export interface CircleMember {
  id: string;
  name: string;
  avatar: string;
  role: 'Ketua' | 'Bendahara' | 'Sekretaris' | 'Anggota' | 'Kreator';
  joinedAt: string;
  contributionPoints: number;
}

export interface Circle {
  id: string;
  name: string;
  code: string;
  description: string;
  category: CircleCategory;
  avatar: string;
  bannerGradient: string;
  members: CircleMember[];
  adminId?: string;
  kasBalance: number;
  tags: string[];
  isPrivate: boolean;
  createdAt: string;
  meetingSchedule?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  tier: 'Perunggu' | 'Perak' | 'Emas' | 'Berlian';
  pointsRequired: number;
  unlocked: boolean;
  unlockedAt?: string;
  progressPercent: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'sharing' | 'finance' | 'badge' | 'point' | 'system';
  time: string;
  read: boolean;
  linkTab?: 'home' | 'groups' | 'sharing' | 'tasks' | 'finance' | 'leaderboard';
  postId?: string;
}

export interface MeetingAgenda {
  id: string;
  circleId: string;
  circleName: string;
  title: string;
  timeRange: string;
  date: string;
  meetUrl: string;
  attendees: TaskAssignee[];
  type: 'Diskusi Rutin' | 'Evaluasi Kas' | 'Review Modul' | 'Briefing Aksi' | 'Koordinasi Tim';
  description?: string;
  status?: 'upcoming' | 'completed';
}

export interface LeaderboardMember {
  rank: number;
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar: string;
  title: string;
  contributionPoints: number;
  level: number;
  streakDays: number;
  badgesCount: number;
  role: string;
}

