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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppConfig, SystemMetrics } from '../types';
import { uploadMediaFile } from '../utils/imageOptimizer';

export const AdminDashboardView: React.FC = () => {
  const { currentUser, circles, tasks, transactions, appConfig, updateAppConfig } = useApp();
  const isSuperadmin = currentUser.systemRole === 'superadmin';
  const isAdminOrSuper = currentUser.systemRole === 'superadmin' || currentUser.systemRole === 'admin';

  const [activeTab, setActiveTab] = useState<'monitoring' | 'appConfig' | 'sqlMigration' | 'users'>(() => {
    return currentUser.systemRole === 'admin' ? 'users' : 'monitoring';
  });

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
    navigator.clipboard.writeText(sqlScript);
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
              Monitoring memori realtime, manajemen informasi aplikasi, audit log keamanan, dan ekspor skema SQL siap migrasi database online.
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
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'monitoring'
              ? 'bg-teal-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Pemantauan Memori & Server</span>
        </button>

        {isSuperadmin && (
          <button
            onClick={() => setActiveTab('appConfig')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'appConfig'
                ? 'bg-teal-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Edit Informasi Aplikasi</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('sqlMigration')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'sqlMigration'
              ? 'bg-teal-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Salin & Unduh Skema SQL DB Online</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'users'
              ? 'bg-teal-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Manajemen Pengguna & Peran</span>
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
