import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Crown,
  Database,
  Activity,
  Server,
  Settings,
  Users,
  Copy,
  Download,
  Check,
  RefreshCw,
  Trash2,
  HardDrive,
  Cpu,
  Clock,
  Radio,
  FileCode2,
  AlertTriangle,
  Sparkles,
  Info,
  CheckCircle2,
  Lock,
  Globe,
  Sliders,
  Bell,
  Search,
  Save,
  Upload,
  Image as ImageIcon,
  Camera,
  Building2,
  Phone,
  ExternalLink,
  Tag,
  FolderPlus,
  Edit3,
  Star,
  MessageSquarePlus,
  Filter,
  Mail,
  Calendar,
  Plus,
  HelpCircle,
  Bug,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { copyToClipboard } from '../utils/clipboard';
import { AppConfig, SystemMetrics, PostCategoryItem, FeedbackItem, FeedbackStatus } from '../types';
import { uploadMediaFile } from '../utils/imageOptimizer';

export const AdminDashboardView: React.FC = () => {
  const {
    currentUser,
    circles,
    tasks,
    transactions,
    appConfig,
    updateAppConfig,
    postCategories,
    createPostCategory,
    updatePostCategory,
    deletePostCategory,
    feedbacks,
    updateFeedbackStatus,
    deleteFeedback,
  } = useApp();
  const isSuperadmin = currentUser.systemRole === 'superadmin';
  const isAdminOrSuper = currentUser.systemRole === 'superadmin' || currentUser.systemRole === 'admin';

  const [activeTab, setActiveTab] = useState<'monitoring' | 'appConfig' | 'categories' | 'feedbacks' | 'sqlMigration' | 'users'>(() => {
    return currentUser.systemRole === 'admin' ? 'categories' : 'monitoring';
  });

  // Category Management State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PostCategoryItem | null>(null);
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catIcon, setCatIcon] = useState('Tag');
  const [catColor, setCatColor] = useState('teal');
  const [catIsDefault, setCatIsDefault] = useState(false);
  const [catSortOrder, setCatSortOrder] = useState(0);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categoryMsg, setCategoryMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Feedback Inbox State
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<'all' | FeedbackStatus>('all');
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [adminReplyNotes, setAdminReplyNotes] = useState('');
  const [isUpdatingFeedback, setIsUpdatingFeedback] = useState(false);
  const [feedbackActionMsg, setFeedbackActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Metrics State
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isRefreshingMetrics, setIsRefreshingMetrics] = useState(false);
  const [cacheClearMsg, setCacheClearMsg] = useState<string>('');

  // App Config State
  const [config, setConfig] = useState<AppConfig>({
    appName: appConfig?.appName || 'Lingkar',
    appLogo: appConfig?.appLogo || '',
    appCover: appConfig?.appCover || '',
    appFavicon: appConfig?.appFavicon || '',
    appMotto: appConfig?.appMotto || 'Ruang Kolaborasi Komunitas, Tracker Target & Kas Transparan',
    appDescription: appConfig?.appDescription || 'Ekosistem digital tim untuk Circle Sharing, Shared Checklists & Progress Tracker, Gamifikasi Kebaikan, dan Manajemen Kas Transparan.',
    organizationName: appConfig?.organizationName || 'Komunitas Lingkar Kebaikan Indonesia',
    contactEmail: appConfig?.contactEmail || 'kontak@lingkarkebaikan.org',
    contactPhone: appConfig?.contactPhone || '+62 812-3456-7890',
    websiteUrl: appConfig?.websiteUrl || 'https://lingkarkebaikan.org',
    maintenanceMode: appConfig?.maintenanceMode || false,
    allowRegistration: appConfig?.allowRegistration ?? true,
    maxUploadSizeMb: appConfig?.maxUploadSizeMb || 25,
    securityLevel: appConfig?.securityLevel || 'high',
    activeAnnouncement: appConfig?.activeAnnouncement || '🎉 Selamat datang di Lingkar v2.5! Fitur delegasi baru, optimasi kompresi gambar, dan manajemen database SQL kini aktif.',
    showAnnouncement: appConfig?.showAnnouncement ?? true,
    lastUpdated: new Date().toISOString(),
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // SQL Migration State - Default to MySQL as requested
  const [sqlDialect, setSqlDialect] = useState<'postgres' | 'mysql' | 'sqlite'>('mysql');
  const [sqlScript, setSqlScript] = useState<string>('');
  const [isLoadingSql, setIsLoadingSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Users List State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  // Live Database Status State
  const [dbStatusState, setDbStatusState] = useState<{
    connected: boolean;
    engine: string;
    host: string;
    port: number;
    user: string;
    database: string;
    error: string | null;
    lastChecked: string;
    tableCount: number;
  } | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [dbActionMsg, setDbActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSyncingDb, setIsSyncingDb] = useState(false);

  // Fetch Database Status
  const fetchDbStatus = async () => {
    try {
      setIsCheckingDb(true);
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatusState(data);
      }
    } catch (e) {
      console.warn('Failed to fetch DB status:', e);
    } finally {
      setIsCheckingDb(false);
    }
  };

  const handleReconnectDb = async () => {
    try {
      setIsCheckingDb(true);
      setDbActionMsg(null);
      const res = await fetch('/api/db/reconnect', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setDbActionMsg({ type: 'success', text: data.message });
      } else {
        setDbActionMsg({ type: 'error', text: data.message || data.error });
      }
      fetchDbStatus();
      fetchMetrics();
    } catch (e: any) {
      setDbActionMsg({ type: 'error', text: 'Gagal menghubungkan: ' + e.message });
    } finally {
      setIsCheckingDb(false);
    }
  };

  const handleSyncDb = async () => {
    try {
      setIsSyncingDb(true);
      setDbActionMsg(null);
      const res = await fetch('/api/db/sync-local-to-mysql', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setDbActionMsg({ type: 'success', text: data.message });
      } else {
        setDbActionMsg({ type: 'error', text: data.error || 'Gagal sinkronisasi data.' });
      }
      fetchDbStatus();
      fetchMetrics();
    } catch (e: any) {
      setDbActionMsg({ type: 'error', text: 'Gagal sinkronisasi: ' + e.message });
    } finally {
      setIsSyncingDb(false);
    }
  };

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      setIsRefreshingMetrics(true);
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (e) {
      console.warn('Fallback local metrics:', e);
    } finally {
      setIsRefreshingMetrics(false);
    }
  };

  // Fetch Config
  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (e) {}
  };

  // Fetch SQL Schema
  const fetchSql = async (dialect: string) => {
    try {
      setIsLoadingSql(true);
      const res = await fetch(`/api/admin/sql-export?dialect=${dialect}`);
      if (res.ok) {
        const data = await res.json();
        setSqlScript(data.sql);
      }
    } catch (e) {
      console.error('Error fetching SQL:', e);
    } finally {
      setIsLoadingSql(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchMetrics();
    fetchConfig();
    fetchSql(sqlDialect);
    fetchUsers();
    fetchDbStatus();

    const interval = setInterval(() => {
      fetchMetrics();
      fetchDbStatus();
    }, 15000); // Polling every 15s

    return () => clearInterval(interval);
  }, []);

  const handleDialectChange = (newDialect: 'postgres' | 'mysql' | 'sqlite') => {
    setSqlDialect(newDialect);
    fetchSql(newDialect);
  };

  const handleCopySql = () => {
    copyToClipboard(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadSql = () => {
    window.location.href = `/api/admin/sql-export?dialect=${sqlDialect}&download=true`;
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const res = await uploadMediaFile(file);
      if (res.url) {
        const updated = { ...config, appLogo: res.url };
        setConfig(updated);
        await updateAppConfig(updated);
        setConfigSaveSuccess(true);
        setTimeout(() => setConfigSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Error uploading app logo:', e);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      const res = await uploadMediaFile(file);
      if (res.url) {
        const updated = { ...config, appCover: res.url };
        setConfig(updated);
        await updateAppConfig(updated);
        setConfigSaveSuccess(true);
        setTimeout(() => setConfigSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Error uploading app cover:', e);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      const success = await updateAppConfig(config);
      if (success) {
        setConfigSaveSuccess(true);
        setTimeout(() => setConfigSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving config:', err);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleClearCache = async () => {
    try {
      const res = await fetch('/api/admin/clear-cache', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCacheClearMsg(data.message);
        fetchMetrics();
        setTimeout(() => setCacheClearMsg(''), 4000);
      }
    } catch (err) {
      console.error('Clear cache error:', err);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      setIsUpdatingUser(true);
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDescription('');
    setCatIcon('Tag');
    setCatColor('teal');
    setCatIsDefault(false);
    setCatSortOrder(postCategories.length);
    setCategoryMsg(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: PostCategoryItem) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDescription(cat.description || '');
    setCatIcon(cat.icon || 'Tag');
    setCatColor(cat.color || 'teal');
    setCatIsDefault(!!cat.isDefault);
    setCatSortOrder(cat.sortOrder || 0);
    setCategoryMsg(null);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      setCategoryMsg({ type: 'error', text: 'Nama kategori wajib diisi.' });
      return;
    }

    setIsSavingCategory(true);
    setCategoryMsg(null);

    try {
      if (editingCategory) {
        const res = await updatePostCategory(editingCategory.id, {
          name: catName.trim(),
          description: catDescription.trim(),
          icon: catIcon,
          color: catColor,
          isDefault: catIsDefault,
          sortOrder: Number(catSortOrder) || 0,
        });
        if (res.success) {
          setCategoryMsg({ type: 'success', text: res.message || 'Kategori berhasil diperbarui!' });
          setTimeout(() => {
            setIsCategoryModalOpen(false);
            setCategoryMsg(null);
          }, 1200);
        } else {
          setCategoryMsg({ type: 'error', text: res.error || 'Gagal memperbarui kategori.' });
        }
      } else {
        const res = await createPostCategory({
          name: catName.trim(),
          description: catDescription.trim(),
          icon: catIcon,
          color: catColor,
          isDefault: catIsDefault,
          sortOrder: Number(catSortOrder) || 0,
        });
        if (res.success) {
          setCategoryMsg({ type: 'success', text: res.message || 'Kategori baru berhasil dibuat!' });
          setTimeout(() => {
            setIsCategoryModalOpen(false);
            setCategoryMsg(null);
          }, 1200);
        } else {
          setCategoryMsg({ type: 'error', text: res.error || 'Gagal membuat kategori.' });
        }
      }
    } catch (err: any) {
      setCategoryMsg({ type: 'error', text: err.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat: PostCategoryItem) => {
    if (cat.isDefault) {
      alert('Kategori default ("Umum") tidak dapat dihapus karena dibutuhkan sebagai fallback postingan.');
      return;
    }
    if (!window.confirm(`Yakin ingin menghapus kategori "${cat.name}"? Postingan dalam kategori ini akan otomatis dialihkan ke kategori default.`)) {
      return;
    }

    const res = await deletePostCategory(cat.id);
    if (res.success) {
      setCategoryMsg({ type: 'success', text: res.message || 'Kategori berhasil dihapus.' });
      setTimeout(() => setCategoryMsg(null), 3000);
    } else {
      setCategoryMsg({ type: 'error', text: res.error || 'Gagal menghapus kategori.' });
    }
  };

  const handleUpdateFeedbackStatus = async (id: string, status: FeedbackStatus) => {
    try {
      setIsUpdatingFeedback(true);
      setFeedbackActionMsg(null);
      const res = await updateFeedbackStatus(id, status, adminReplyNotes.trim() || undefined);
      if (res.success) {
        setFeedbackActionMsg({ type: 'success', text: 'Status masukan berhasil diperbarui!' });
        if (selectedFeedback && selectedFeedback.id === id) {
          setSelectedFeedback({
            ...selectedFeedback,
            status,
            adminNotes: adminReplyNotes.trim() || selectedFeedback.adminNotes,
            respondedBy: currentUser.name,
            updatedAt: new Date().toISOString(),
          });
        }
        setTimeout(() => setFeedbackActionMsg(null), 3000);
      } else {
        setFeedbackActionMsg({ type: 'error', text: res.error || 'Gagal memperbarui status.' });
      }
    } catch (err: any) {
      setFeedbackActionMsg({ type: 'error', text: err.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setIsUpdatingFeedback(false);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus masukan ini dari database?')) return;
    const res = await deleteFeedback(id);
    if (res.success) {
      if (selectedFeedback?.id === id) {
        setSelectedFeedback(null);
      }
      setFeedbackActionMsg({ type: 'success', text: 'Masukan berhasil dihapus dari database.' });
      setTimeout(() => setFeedbackActionMsg(null), 3000);
    } else {
      setFeedbackActionMsg({ type: 'error', text: res.error || 'Gagal menghapus masukan.' });
    }
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesStatus = feedbackStatusFilter === 'all' || fb.status === feedbackStatusFilter;
    const matchesSearch =
      feedbackSearch.trim() === '' ||
      fb.title.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
      fb.message.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
      fb.userName.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
      fb.category.toLowerCase().includes(feedbackSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden border border-teal-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                {isSuperadmin ? (
                  <>
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    Portal Super Administrator
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    Portal Admin Operasional
                  </>
                )}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Node.js Engine Aktif
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
              Pusat Kendali & Pemantauan Sistem
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Monitoring memori realtime, pengelolaan kategori postingan, kotak saran & masukan pengguna, audit pengguna, dan ekspor skema SQL database.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMetrics}
              disabled={isRefreshingMetrics}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingMetrics ? 'animate-spin' : ''}`} />
              <span>Segarkan Metrik</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 no-scrollbar">
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'monitoring'
              ? 'bg-teal-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Pemantauan Server</span>
        </button>

        {/* Tab Kelola Kategori Postingan */}
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-teal-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Tag className="w-4 h-4 text-teal-400" />
          <span>Kategori Postingan ({postCategories.length})</span>
        </button>

        {/* Tab Saran & Masukan Pengguna */}
        <button
          onClick={() => setActiveTab('feedbacks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer relative ${
            activeTab === 'feedbacks'
              ? 'bg-teal-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <MessageSquarePlus className="w-4 h-4 text-amber-400" />
          <span>Saran & Masukan Pengguna</span>
          {feedbacks.filter((f) => f.status === 'pending').length > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] bg-rose-500 text-white font-bold rounded-full">
              {feedbacks.filter((f) => f.status === 'pending').length}
            </span>
          )}
        </button>

        {isSuperadmin && (
          <button
            onClick={() => setActiveTab('appConfig')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'appConfig'
                ? 'bg-teal-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Edit Info Aplikasi</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('sqlMigration')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'sqlMigration'
              ? 'bg-teal-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Skema SQL Database</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-teal-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Pengguna & Peran</span>
        </button>
      </div>

      {/* TAB 1: SYSTEM METRICS & HEALTH MONITORING */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {cacheClearMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{cacheClearMsg}</span>
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Heap Memory Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-800">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Optimal
                </span>
              </div>
              <div>
                <div className="text-2xl font-display font-black text-slate-900">
                  {metrics?.memory.heapUsedMb || 42.5} <span className="text-xs font-medium text-slate-400">MB</span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Heap Terpakai ({metrics?.memory.heapUsedPercent || 65}% dari {metrics?.memory.heapTotalMb || 64} MB)
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, metrics?.memory.heapUsedPercent || 65)}%` }}
                ></div>
              </div>
            </div>

            {/* RSS Total RAM */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700">
                  <HardDrive className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Node RSS
                </span>
              </div>
              <div>
                <div className="text-2xl font-display font-black text-slate-900">
                  {metrics?.memory.rssMb || 78.2} <span className="text-xs font-medium text-slate-400">MB</span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Total Memory Resident Set
                </div>
              </div>
              <div className="text-[11px] text-slate-400">
                Sistem Bebas: {metrics?.memory.systemFreeMb || 1024} MB
              </div>
            </div>

            {/* Uploads Storage */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700">
                  <Database className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Folder /uploads
                </span>
              </div>
              <div>
                <div className="text-2xl font-display font-black text-slate-900">
                  {metrics?.uploads.totalFiles || 0} <span className="text-xs font-medium text-slate-400">berkas</span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Total Kapasitas: {metrics?.uploads.totalSizeMb || '0.00'} MB
                </div>
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Auto-Kompresi WebP & JPG aktif
              </div>
            </div>

            {/* Uptime & Requests */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Aktif
                </span>
              </div>
              <div>
                <div className="text-2xl font-display font-black text-slate-900">
                  {Math.floor((metrics?.uptimeSeconds || 120) / 60)} <span className="text-xs font-medium text-slate-400">menit</span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {metrics?.totalRequests || 42} Permintaan HTTP Ditangani
                </div>
              </div>
              <div className="text-[11px] text-slate-400">
                {metrics?.activeSessions || 1} Sesi Aktif di Memori
              </div>
            </div>
          </div>

          {/* Action Optimization Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Optimasi Memori & Pembersihan Cache Otomatis
                </h4>
                <p className="text-xs text-slate-500">
                  Menghapus sesi kedaluwarsa, mengoptimasi heap node, dan memicu garbage collection untuk performa 100% stabil tanpa kebocoran memori.
                </p>
              </div>
            </div>

            <button
              onClick={handleClearCache}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <Trash2 className="w-4 h-4 text-teal-400" />
              <span>Bersihkan Cache & Heap</span>
            </button>
          </div>

          {/* System Audit Logs */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-teal-700" />
                Catatan Audit Keamanan & Aktivitas Sistem (Audit Trail)
              </h3>
              <span className="text-xs text-slate-400">
                {metrics?.auditLogs.length || 2} Rekaman
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-3">Waktu</th>
                    <th className="pb-3">Pengguna</th>
                    <th className="pb-3">Aksi / Aktivitas</th>
                    <th className="pb-3">Alamat IP</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(metrics?.auditLogs || []).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 text-slate-500 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                      </td>
                      <td className="py-3 font-semibold text-slate-900">{log.user}</td>
                      <td className="py-3 text-slate-700">{log.action}</td>
                      <td className="py-3 text-slate-400 font-mono text-[11px]">{log.ip}</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: KELOLA KATEGORI POSTINGAN */}
      {activeTab === 'categories' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-teal-800" />
                  Pengelolaan Kategori Postingan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kelola kategori untuk pengelompokan konten berbagi & inspirasi kebaikan. Kategori 'Umum' disetel sebagai opsi default sistem.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddCategory}
                  className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kategori Baru</span>
                </button>
              </div>
            </div>

            {categoryMsg && (
              <div
                className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-2xs ${
                  categoryMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border border-rose-200 text-rose-900'
                }`}
              >
                {categoryMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{categoryMsg.text}</span>
              </div>
            )}

            {/* Categories Grid / Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {postCategories.map((cat) => (
                <div
                  key={cat.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    cat.isDefault
                      ? 'bg-teal-50/50 border-teal-300/80 shadow-2xs'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-teal-800 font-bold text-xs shadow-2xs">
                          <Tag className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-slate-900 truncate">{cat.name}</span>
                      </div>
                      {cat.isDefault && (
                        <span className="px-2 py-0.5 rounded-full bg-teal-800 text-white text-[10px] font-bold shrink-0">
                          Default Sistem
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {cat.description || 'Tidak ada deskripsi rincian.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-slate-400">
                      Urutan: {cat.sortOrder ?? 0}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCategory(cat)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Edit</span>
                      </button>
                      {!cat.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add/Edit Category Modal */}
          {isCategoryModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center">
                      <Tag className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {editingCategory ? 'Edit Kategori Postingan' : 'Tambah Kategori Postingan Baru'}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveCategorySubmit} className="p-5 space-y-4">
                  {categoryMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        categoryMsg.type === 'success'
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : 'bg-rose-50 text-rose-900 border border-rose-200'
                      }`}
                    >
                      <span>{categoryMsg.text}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      Nama Kategori <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      placeholder="Contoh: Diskusi Buku, Tips Produktivitas"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-700 focus:bg-white font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">Deskripsi Singkat</label>
                    <textarea
                      rows={2}
                      value={catDescription}
                      onChange={(e) => setCatDescription(e.target.value)}
                      placeholder="Penjelasan singkat tujuan & jenis postingan pada kategori ini..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-700 focus:bg-white font-medium resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">Urutan Tampil (Sort Order)</label>
                      <input
                        type="number"
                        min="0"
                        value={catSortOrder}
                        onChange={(e) => setCatSortOrder(parseInt(e.target.value) || 0)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-700 focus:bg-white font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">Warna Label</label>
                      <select
                        value={catColor}
                        onChange={(e) => setCatColor(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-700 focus:bg-white font-medium cursor-pointer"
                      >
                        <option value="teal">Teal (Hijau Pirus)</option>
                        <option value="blue">Blue (Biru)</option>
                        <option value="emerald">Emerald (Hijau Zamrud)</option>
                        <option value="amber">Amber (Kuning Keemasan)</option>
                        <option value="purple">Purple (Ungu)</option>
                        <option value="indigo">Indigo (Nila)</option>
                        <option value="rose">Rose (Merah Muda)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={catIsDefault}
                        onChange={(e) => setCatIsDefault(e.target.checked)}
                        className="w-4 h-4 rounded text-teal-800 focus:ring-teal-700 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Jadikan Kategori Default</span>
                        <span className="text-[10px] text-slate-500">Kategori default otomatis terpilih saat pengguna membuat postingan baru.</span>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingCategory}
                      className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      {isSavingCategory ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Simpan Kategori</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: KOTAK SARAN & MASUKAN PENGGUNA */}
      {activeTab === 'feedbacks' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquarePlus className="w-5 h-5 text-amber-500" />
                  Kotak Saran & Masukan Pengguna
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tinjau aspirasi, kritik membangun, ide fitur, dan laporan kendala dari pengguna aplikasi Lingkar Kebaikan.
                </p>
              </div>

              {/* Status Filter & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={feedbackSearch}
                    onChange={(e) => setFeedbackSearch(e.target.value)}
                    placeholder="Cari saran..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-700 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {(
                [
                  { id: 'all', label: 'Semua Masukan', count: feedbacks.length },
                  { id: 'pending', label: 'Menunggu Review', count: feedbacks.filter((f) => f.status === 'pending').length },
                  { id: 'reviewed', label: 'Ditinjau', count: feedbacks.filter((f) => f.status === 'reviewed').length },
                  { id: 'in_progress', label: 'Sedang Dikerjakan', count: feedbacks.filter((f) => f.status === 'in_progress').length },
                  { id: 'resolved', label: 'Selesai / Terwujud', count: feedbacks.filter((f) => f.status === 'resolved').length },
                  { id: 'rejected', label: 'Ditolak / Arsip', count: feedbacks.filter((f) => f.status === 'rejected').length },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFeedbackStatusFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    feedbackStatusFilter === tab.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                      feedbackStatusFilter === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {feedbackActionMsg && (
              <div
                className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-2xs ${
                  feedbackActionMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border border-rose-200 text-rose-900'
                }`}
              >
                {feedbackActionMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{feedbackActionMsg.text}</span>
              </div>
            )}

            {/* Feedback Cards */}
            {filteredFeedbacks.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 space-y-2">
                <MessageSquarePlus className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-xs font-bold text-slate-700">Belum ada saran atau masukan di kategori ini</div>
                <div className="text-[11px] text-slate-400">Pengguna dapat mengirim masukan melalui menu Profil Pengguna.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFeedbacks.map((fb) => {
                  const isSelected = selectedFeedback?.id === fb.id;
                  const statusColors: Record<FeedbackStatus, { bg: string; text: string; label: string }> = {
                    pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: 'Menunggu Review' },
                    reviewed: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', label: 'Ditinjau' },
                    in_progress: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800', label: 'Sedang Dikerjakan' },
                    implemented: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', label: 'Sudah Diterapkan' },
                    resolved: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', label: 'Selesai Terwujud' },
                    rejected: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', label: 'Ditolak / Arsip' },
                  };
                  const currentStatus = statusColors[fb.status] || statusColors.pending;

                  return (
                    <div
                      key={fb.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                        isSelected
                          ? 'bg-teal-50/40 border-teal-300 shadow-xs'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={fb.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={fb.userName}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                              <span>{fb.userName}</span>
                              {fb.userEmail && <span className="text-[10px] text-slate-400 font-normal">({fb.userEmail})</span>}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.2 rounded-md bg-teal-100 text-teal-800 font-bold">
                                {fb.category}
                              </span>
                              <span>•</span>
                              <span>{new Date(fb.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {fb.rating && (
                            <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{fb.rating}/5</span>
                            </div>
                          )}
                          <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${currentStatus.bg} ${currentStatus.text}`}>
                            {currentStatus.label}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-900">{fb.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-white p-3 rounded-xl border border-slate-200/80">
                          {fb.message}
                        </p>
                      </div>

                      {fb.adminNotes && (
                        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 space-y-0.5">
                          <span className="font-bold text-[10px] uppercase tracking-wider block text-amber-800">
                            Catatan Tindak Lanjut Admin ({fb.respondedBy || 'Admin'}):
                          </span>
                          <p>{fb.adminNotes}</p>
                        </div>
                      )}

                      {/* Status Action & Admin Notes Input */}
                      <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-500 font-medium">Ubah Status:</span>
                          {(['pending', 'reviewed', 'in_progress', 'resolved', 'rejected'] as FeedbackStatus[]).map((st) => (
                            <button
                              key={st}
                              type="button"
                              disabled={isUpdatingFeedback}
                              onClick={() => {
                                handleUpdateFeedbackStatus(fb.id, st);
                              }}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                fb.status === st
                                  ? 'bg-teal-800 text-white border-teal-800 shadow-2xs'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {st === 'pending' ? 'Tunda' : st === 'reviewed' ? 'Tinjau' : st === 'in_progress' ? 'Proses' : st === 'resolved' ? 'Selesai' : 'Tolak'}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedFeedback?.id === fb.id) {
                                setSelectedFeedback(null);
                              } else {
                                setSelectedFeedback(fb);
                                setAdminReplyNotes(fb.adminNotes || '');
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold shadow-2xs flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-slate-500" />
                            <span>{selectedFeedback?.id === fb.id ? 'Tutup Catatan' : 'Beri Catatan'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFeedback(fb.id)}
                            className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 shadow-2xs cursor-pointer"
                            title="Hapus masukan"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Admin Note Box if selected */}
                      {selectedFeedback?.id === fb.id && (
                        <div className="pt-2 space-y-2 animate-in fade-in">
                          <label className="text-[11px] font-bold text-slate-700 block">
                            Tulis Catatan / Respons Superadmin untuk masukan ini:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={adminReplyNotes}
                              onChange={(e) => setAdminReplyNotes(e.target.value)}
                              placeholder="Contoh: Fitur ini sudah dimasukkan ke dalam roadmap rilis v2.6..."
                              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-700 font-medium"
                            />
                            <button
                              type="button"
                              disabled={isUpdatingFeedback}
                              onClick={() => handleUpdateFeedbackStatus(fb.id, fb.status)}
                              className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold cursor-pointer transition-all"
                            >
                              Simpan Catatan
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EDIT APP CONFIGURATION & BRANDING (SUPERADMIN ONLY) */}
      {activeTab === 'appConfig' && isSuperadmin && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-teal-800" />
                Profil, Branding & Konfigurasi Aplikasi
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Superadmin dapat mengunggah logo, cover aplikasi, menyesuaikan nama sistem, lembaga, kontak resmi, dan pengumuman.
              </p>
            </div>

            {configSaveSuccess && (
              <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 animate-in fade-in self-start sm:self-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Konfigurasi Berhasil Diperbarui!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-6">
            {/* 1. App Media & Branding Uploads */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-teal-700" />
                Logo & Banner Aplikasi
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Logo Aplikasi (Kotak / Bulat)</label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-2xl border-2 border-teal-600 bg-white overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
                      {config.appLogo ? (
                        <img
                          src={config.appLogo}
                          alt="Logo Aplikasi"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-teal-900 text-white flex items-center justify-center font-bold text-xl">
                          {config.appName.charAt(0) || 'L'}
                        </div>
                      )}
                      {isUploadingLogo && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 text-white animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        ref={logoInputRef}
                        onChange={handleUploadLogo}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploadingLogo}
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        <Upload className="w-3.5 h-3.5 text-teal-700" />
                        <span>{isUploadingLogo ? 'Mengunggah...' : 'Unggah Logo Baru'}</span>
                      </button>
                      <input
                        type="text"
                        placeholder="Atau tempel URL gambar logo..."
                        value={config.appLogo || ''}
                        onChange={(e) => setConfig({ ...config, appLogo: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Banner / Cover Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Cover / Header Banner Aplikasi</label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-24 h-16 rounded-2xl border-2 border-slate-300 bg-slate-200 overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
                      {config.appCover ? (
                        <img
                          src={config.appCover}
                          alt="Cover Aplikasi"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-teal-900 to-slate-900 text-teal-200 flex items-center justify-center text-[10px] font-bold text-center px-1">
                          Header Banner
                        </div>
                      )}
                      {isUploadingCover && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 text-white animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        ref={coverInputRef}
                        onChange={handleUploadCover}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploadingCover}
                        onClick={() => coverInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        <Upload className="w-3.5 h-3.5 text-teal-700" />
                        <span>{isUploadingCover ? 'Mengunggah...' : 'Unggah Cover Banner'}</span>
                      </button>
                      <input
                        type="text"
                        placeholder="Atau tempel URL cover banner..."
                        value={config.appCover || ''}
                        onChange={(e) => setConfig({ ...config, appCover: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Platform Identity Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Aplikasi / Sistem</label>
                <input
                  type="text"
                  required
                  value={config.appName}
                  onChange={(e) => setConfig({ ...config, appName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-700 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Lembaga / Organisasi Pengelola</label>
                <input
                  type="text"
                  value={config.organizationName || ''}
                  onChange={(e) => setConfig({ ...config, organizationName: e.target.value })}
                  placeholder="Contoh: Komunitas Lingkar Kebaikan Indonesia"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-700 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Motto / Tagline Aplikasi</label>
              <input
                type="text"
                value={config.appMotto}
                onChange={(e) => setConfig({ ...config, appMotto: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-700 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Deskripsi Platform</label>
              <textarea
                rows={3}
                value={config.appDescription}
                onChange={(e) => setConfig({ ...config, appDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-700 font-medium"
              />
            </div>

            {/* 3. Contact & Channels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Kontak Resmi</label>
                <input
                  type="email"
                  value={config.contactEmail}
                  onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nomor Kontak / WhatsApp</label>
                <input
                  type="text"
                  value={config.contactPhone || ''}
                  onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
                  placeholder="+62 812-3456-7890"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Website Resmi</label>
                <input
                  type="url"
                  value={config.websiteUrl || ''}
                  onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })}
                  placeholder="https://lingkarkebaikan.org"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>

            {/* 4. Global Announcement */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-500" />
                Pengumuman Global (Banner Atas)
              </label>
              <input
                type="text"
                value={config.activeAnnouncement}
                onChange={(e) => setConfig({ ...config, activeAnnouncement: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-700"
              />
            </div>

            {/* 5. Toggle switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={config.showAnnouncement}
                  onChange={(e) => setConfig({ ...config, showAnnouncement: e.target.checked })}
                  className="rounded text-teal-700 focus:ring-teal-700"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Tampilkan Banner Pengumuman</div>
                  <div className="text-[10px] text-slate-500">Muncul di bagian atas aplikasi untuk setiap anggota</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={config.allowRegistration}
                  onChange={(e) => setConfig({ ...config, allowRegistration: e.target.checked })}
                  className="rounded text-teal-700 focus:ring-teal-700"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Buka Pendaftaran Anggota Baru</div>
                  <div className="text-[10px] text-slate-500">Izinkan pengguna umum mendaftar akun baru</div>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSavingConfig || isUploadingLogo || isUploadingCover}
                className="px-6 py-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
              >
                {isSavingConfig ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Konfigurasi...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan Identitas & Konfigurasi Aplikasi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SQL DATABASE MIGRATION & EXPORT */}
      {activeTab === 'sqlMigration' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 animate-in fade-in duration-200">
          {/* Live MySQL Connection Banner */}
          <div className={`p-5 rounded-2xl border ${
            dbStatusState?.connected
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          } space-y-3`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  dbStatusState?.connected ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold">
                      Status Database Saat Ini: {dbStatusState?.engine || 'Memeriksa...'}
                    </h4>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      dbStatusState?.connected
                        ? 'bg-emerald-200 text-emerald-800'
                        : 'bg-amber-200 text-amber-900'
                    }`}>
                      {dbStatusState?.connected ? '● TERHUBUNG KE MYSQL REAL' : '● MODE IN-MEMORY / OFFLINE'}
                    </span>
                  </div>
                  <p className="text-xs opacity-80 mt-0.5">
                    {dbStatusState?.connected
                      ? `Database: [${dbStatusState.database}] di ${dbStatusState.host}:${dbStatusState.port} • User: ${dbStatusState.user} • ${dbStatusState.tableCount} tabel aktif.`
                      : (dbStatusState?.error || 'Database MySQL belum terhubung. Konfigurasikan file .env di cPanel.')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handleReconnectDb}
                  disabled={isCheckingDb}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-teal-700 ${isCheckingDb ? 'animate-spin' : ''}`} />
                  <span>{isCheckingDb ? 'Menghubungkan...' : 'Uji & Sambungkan Ulang'}</span>
                </button>

                {dbStatusState?.connected && (
                  <button
                    onClick={handleSyncDb}
                    disabled={isSyncingDb}
                    className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <Upload className={`w-3.5 h-3.5 ${isSyncingDb ? 'animate-spin' : ''}`} />
                    <span>{isSyncingDb ? 'Sinkronisasi...' : 'Sinkronkan Data Lokal ke DB'}</span>
                  </button>
                )}
              </div>
            </div>

            {dbActionMsg && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                dbActionMsg.type === 'success' ? 'bg-emerald-100/80 text-emerald-900' : 'bg-rose-100/80 text-rose-900'
              }`}>
                {dbActionMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />}
                <span>{dbActionMsg.text}</span>
              </div>
            )}

            {!dbStatusState?.connected && (
              <div className="text-[11px] bg-white/70 p-3 rounded-xl border border-amber-200/60 text-slate-700 space-y-1">
                <div className="font-bold text-amber-900">💡 Cara Menghubungkan MySQL di Hosting / cPanel:</div>
                <div>1. Buat file <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">.env</code> di root folder hosting Anda.</div>
                <div>2. Isi dengan: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">MYSQL_HOST=localhost</code> (atau <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">127.0.0.1</code>), <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">MYSQL_USER=user_anda</code>, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">MYSQL_PASSWORD=pass_anda</code>, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">MYSQL_DATABASE=db_anda</code>.</div>
                <div>3. Klik tombol <strong>"Uji & Sambungkan Ulang"</strong> di atas atau Restart aplikasi di menu Setup Node.js cPanel.</div>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-teal-800" />
                Struktur & Skema DDL Database SQL Siap Migrasi Online
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ekspor seluruh 14 tabel, relasi foreign key, indeks performa, dan data akun awal yang 100% kompatibel dengan phpMyAdmin, MariaDB, MySQL 5.7/8.0, Cloud SQL, atau RDS.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySql}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-600" />
                    <span>Salin SQL</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadSql}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-teal-400" />
                <span>Unduh File .SQL</span>
              </button>
            </div>
          </div>

          {/* Dialect Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Pilih Format Database:</span>
              {(['mysql', 'postgres', 'sqlite'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => handleDialectChange(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    sqlDialect === d
                      ? 'bg-teal-800 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {d === 'mysql' ? '🐬 MySQL / MariaDB (phpMyAdmin / cPanel / RDS)' : d === 'postgres' ? '🐘 PostgreSQL (Supabase / Neon)' : '📦 SQLite'}
                </button>
              ))}
            </div>

            {sqlDialect === 'mysql' && (
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 100% Valid phpMyAdmin & MariaDB Syntax
              </span>
            )}
          </div>

          {/* SQL Code Preview Container */}
          <div className="relative rounded-2xl bg-slate-950 text-slate-200 p-4 font-mono text-xs overflow-x-auto max-h-[500px] border border-slate-800">
            <div className="sticky top-0 right-0 flex justify-end mb-2">
              <span className="text-[10px] font-bold text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                {sqlDialect.toUpperCase()} NATIVE DDL & DML
              </span>
            </div>
            {isLoadingSql ? (
              <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menghasilkan skema SQL...</span>
              </div>
            ) : (
              <pre className="whitespace-pre">{sqlScript}</pre>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: USERS & ROLES MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-800" />
                Daftar Pengguna & Hak Akses
              </h3>
              <p className="text-xs text-slate-500">
                Kelola hak akses Superadmin, Admin, dan Anggota aktif.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari pengguna..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3">Profil Pengguna</th>
                  <th className="pb-3">Email & Username</th>
                  <th className="pb-3">Peran Akses (Role)</th>
                  <th className="pb-3">Poin & Level</th>
                  <th className="pb-3 text-right">Ubah Peran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList
                  .filter(
                    (u) =>
                      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.username.toLowerCase().includes(userSearch.toLowerCase())
                  )
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="text-slate-700 font-medium">{u.email}</div>
                        <div className="text-slate-400 text-[10px]">@{u.username}</div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            u.role === 'superadmin'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : u.role === 'admin'
                              ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                              : 'bg-teal-100 text-teal-900 border border-teal-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="font-bold text-amber-600">{u.points} Poin</div>
                        <div className="text-slate-400 text-[10px]">Level {u.level}</div>
                      </td>
                      <td className="py-3 text-right">
                        {isSuperadmin && (
                          <select
                            value={u.role}
                            disabled={isUpdatingUser}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

function SaveIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
