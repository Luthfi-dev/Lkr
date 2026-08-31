var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_express = __toESM(require("express"), 1);
var import_os = __toESM(require("os"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_promise = __toESM(require("mysql2/promise"), 1);
var import_vite = require("vite");
import_dotenv.default.config({ path: import_path.default.resolve(process.cwd(), ".env") });
var UPLOADS_DIR = import_path.default.join(process.cwd(), "uploads");
if (!import_fs.default.existsSync(UPLOADS_DIR)) {
  import_fs.default.mkdirSync(UPLOADS_DIR, { recursive: true });
}
var APP_STATUS = process.env.APP_STATUS || "development";
console.log(`[APP] Running app in status: [${APP_STATUS}]`);
var appConfig = {
  appName: "Lingkar",
  appLogo: "",
  appCover: "",
  appFavicon: "",
  appMotto: "Ruang Kolaborasi Komunitas, Tracker Target & Kas Transparan",
  appDescription: "Ekosistem digital tim untuk Circle Sharing, Shared Checklists & Progress Tracker, Gamifikasi Kebaikan, dan Manajemen Kas Transparan.",
  organizationName: "Komunitas Lingkar Kebaikan Indonesia",
  contactEmail: "kontak@lingkarkebaikan.org",
  contactPhone: "+62 812-3456-7890",
  websiteUrl: "https://lingkarkebaikan.org",
  maintenanceMode: false,
  allowRegistration: true,
  maxUploadSizeMb: 25,
  securityLevel: "high",
  activeAnnouncement: "\u{1F389} Selamat datang di Lingkar v2.5! Fitur delegasi baru, optimasi kompresi gambar, dan manajemen database SQL kini aktif.",
  showAnnouncement: true,
  lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
};
function hashPassword(pw) {
  return import_crypto.default.createHash("sha256").update(pw + "_lingkar_salt_2026").digest("hex");
}
function verifyPassword(inputPw, storedHash) {
  if (!inputPw || !storedHash) return false;
  const currentStandard = hashPassword(inputPw);
  if (currentStandard === storedHash) return true;
  const trimmedStandard = hashPassword(inputPw.trim());
  if (trimmedStandard === storedHash) return true;
  const plainSha256 = import_crypto.default.createHash("sha256").update(inputPw).digest("hex");
  if (plainSha256 === storedHash) return true;
  const salt2025 = import_crypto.default.createHash("sha256").update(inputPw + "_lingkar_salt_2025").digest("hex");
  if (salt2025 === storedHash) return true;
  if (storedHash === "9b34db034346766465fe95f36e4f3a76ae86e7dfdbe4dbd535198e3b3348f936") {
    return inputPw.trim() === "12345678";
  }
  if (storedHash === inputPw || storedHash === inputPw.trim()) {
    return true;
  }
  return false;
}
function generateSecureToken(userId) {
  return "lnk_" + import_crypto.default.randomBytes(32).toString("hex") + "_" + userId;
}
var dummyUsers = [
  {
    id: "usr_superadmin",
    email: "superadmin@lingkarkebaikan.org",
    username: "superadmin",
    passwordHash: hashPassword("12345678"),
    name: "Super Admin Sistem",
    role: "superadmin",
    // 'superadmin' | 'admin' | 'member'
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "Super Administrator & Architect",
    points: 9999,
    level: 99,
    streakDays: 45,
    badgesCount: 15,
    joinedCircleIds: ["circle_1"],
    createdAt: "2025-01-01T00:00:00.000Z",
    isActive: true
  },
  {
    id: "usr_admin",
    email: "admin@lingkarkebaikan.org",
    username: "admin",
    passwordHash: hashPassword("12345678"),
    name: "Admin Operasional",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    title: "Koordinator Admin Lingkar",
    points: 4520,
    level: 12,
    streakDays: 28,
    badgesCount: 10,
    joinedCircleIds: ["circle_2"],
    createdAt: "2025-06-15T00:00:00.000Z",
    isActive: true
  },
  {
    id: "usr_1",
    email: "user@lingkarkebaikan.org",
    username: "budipratama",
    passwordHash: hashPassword("12345678"),
    name: "Budi Pratama",
    role: "member",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "Koordinator Lingkar Studi",
    points: 1280,
    level: 5,
    streakDays: 14,
    badgesCount: 7,
    joinedCircleIds: ["circle_1"],
    createdAt: "2026-01-10T00:00:00.000Z",
    isActive: true
  }
];
async function getUserJoinedCircleIds(userId) {
  const circleIds = [];
  if (mysqlPool && dbStatus.connected) {
    try {
      const [rows] = await mysqlPool.query(
        "SELECT circle_id FROM circle_members WHERE user_id = ?",
        [userId]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        for (const r of rows) {
          if (r.circle_id && !circleIds.includes(r.circle_id)) {
            circleIds.push(r.circle_id);
          }
        }
        return circleIds;
      }
    } catch {
    }
  }
  const inMemoryJoined = inMemoryCircles.filter((c) => c.members?.some((m) => m.id === userId) || c.adminId === userId).map((c) => c.id);
  const dummy = dummyUsers.find((u) => u.id === userId);
  const dummyJoined = dummy?.joinedCircleIds || [];
  const merged = Array.from(/* @__PURE__ */ new Set([...inMemoryJoined, ...dummyJoined]));
  return merged;
}
async function updateUserSessionsJoinedCircles(userId) {
  const freshCircles = await getUserJoinedCircleIds(userId);
  for (const [token, session] of sessionsMap.entries()) {
    if (session && session.user && session.user.id === userId) {
      session.user.joinedCircleIds = freshCircles;
      sessionsMap.set(token, session);
    }
  }
  saveLocalDb();
}
var sessionsMap = /* @__PURE__ */ new Map();
var inMemoryPosts = [];
var inMemoryCircles = [];
var inMemoryTasks = [];
var inMemoryTransactions = [];
var inMemoryBudgetGoals = [];
var inMemoryMemberDues = [];
var inMemoryMeetings = [];
var inMemoryPostCategories = [
  { id: "cat_umum", name: "Umum", description: "Kategori publikasi umum dan kabar komunitas", icon: "Globe", color: "teal", isDefault: true, sortOrder: 0 },
  { id: "cat_edukasi", name: "Edukasi", description: "Materi pembelajaran dan artikel edukatif", icon: "BookOpen", color: "blue", isDefault: false, sortOrder: 1 },
  { id: "cat_inisiatif", name: "Inisiatif", description: "Inisiatif proyek kebaikan dan gerakan sosial", icon: "Sparkles", color: "emerald", isDefault: false, sortOrder: 2 },
  { id: "cat_pengumuman", name: "Pengumuman", description: "Pengumuman resmi dan agenda penting", icon: "Bell", color: "amber", isDefault: false, sortOrder: 3 },
  { id: "cat_opini", name: "Opini", description: "Sudut pandang, esai, dan catatan refleksi", icon: "Feather", color: "purple", isDefault: false, sortOrder: 4 },
  { id: "cat_buku", name: "Rangkuman Buku", description: "Ringkasan buku inspiratif dan literasi", icon: "Bookmark", color: "indigo", isDefault: false, sortOrder: 5 },
  { id: "cat_keilmuan", name: "Materi Keilmuan", description: "Riset, teknologi, dan sains terapan", icon: "Cpu", color: "cyan", isDefault: false, sortOrder: 6 },
  { id: "cat_misi", name: "Misi Kebaikan", description: "Aksi nyata kerelawanan dan gotong royong", icon: "Heart", color: "rose", isDefault: false, sortOrder: 7 }
];
var inMemoryFeedbacks = [];
var DB_SNAPSHOT_FILE = import_path.default.join(UPLOADS_DIR, "persistent_db_store.json");
function saveLocalDb() {
  try {
    const data = {
      appConfig,
      dummyUsers: dummyUsers.map((u) => ({ ...u })),
      inMemoryPosts,
      inMemoryCircles,
      inMemoryTasks,
      inMemoryTransactions,
      inMemoryBudgetGoals,
      inMemoryMemberDues,
      inMemoryMeetings,
      inMemoryPostCategories,
      inMemoryFeedbacks,
      persistentSessions: Array.from(sessionsMap.entries()),
      savedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    import_fs.default.writeFileSync(DB_SNAPSHOT_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving persistent local DB snapshot:", err);
  }
}
function loadLocalDb() {
  try {
    if (import_fs.default.existsSync(DB_SNAPSHOT_FILE)) {
      const raw = import_fs.default.readFileSync(DB_SNAPSHOT_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (data.appConfig) appConfig = { ...appConfig, ...data.appConfig };
      if (Array.isArray(data.dummyUsers) && data.dummyUsers.length > 0) {
        for (const u of data.dummyUsers) {
          const idx = dummyUsers.findIndex((x) => x.id === u.id);
          if (idx >= 0) {
            dummyUsers[idx] = { ...dummyUsers[idx], ...u };
          } else {
            dummyUsers.push(u);
          }
        }
      }
      if (Array.isArray(data.inMemoryPosts)) inMemoryPosts = data.inMemoryPosts;
      if (Array.isArray(data.inMemoryCircles)) inMemoryCircles = data.inMemoryCircles;
      if (Array.isArray(data.inMemoryTasks)) inMemoryTasks = data.inMemoryTasks;
      if (Array.isArray(data.inMemoryTransactions)) inMemoryTransactions = data.inMemoryTransactions;
      if (Array.isArray(data.inMemoryBudgetGoals)) inMemoryBudgetGoals = data.inMemoryBudgetGoals;
      if (Array.isArray(data.inMemoryMemberDues)) inMemoryMemberDues = data.inMemoryMemberDues;
      if (Array.isArray(data.inMemoryMeetings)) inMemoryMeetings = data.inMemoryMeetings;
      if (Array.isArray(data.inMemoryPostCategories) && data.inMemoryPostCategories.length > 0) {
        inMemoryPostCategories = data.inMemoryPostCategories;
      }
      if (Array.isArray(data.inMemoryFeedbacks)) inMemoryFeedbacks = data.inMemoryFeedbacks;
      if (Array.isArray(data.persistentSessions)) {
        for (const [token, sess] of data.persistentSessions) {
          if (sess && (!sess.expiresAt || sess.expiresAt > Date.now())) {
            sessionsMap.set(token, sess);
          }
        }
      }
      console.log(`\u2705 Berhasil memuat snapshot persistent database lokal & ${sessionsMap.size} sesi login tersimpan`);
    }
  } catch (err) {
    console.error("Error loading persistent local DB snapshot:", err);
  }
}
loadLocalDb();
async function getSessionFromToken(token) {
  if (!token) return null;
  let session = sessionsMap.get(token);
  if (session) {
    if (!session.expiresAt || session.expiresAt > Date.now()) {
      if (session.expiresAt && session.expiresAt - Date.now() < 15 * 24 * 60 * 60 * 1e3) {
        session.expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1e3;
        sessionsMap.set(token, session);
        saveLocalDb();
      }
      return session;
    } else {
      sessionsMap.delete(token);
    }
  }
  if (mysqlPool && dbStatus.connected) {
    try {
      const [rows] = await mysqlPool.query(
        `SELECT s.token, s.expires_at, u.id, u.email, u.username, u.name, u.role, u.avatar, u.title, u.points, u.level, u.streak_days, u.badges_count, u.is_active
         FROM sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.token = ? LIMIT 1`,
        [token]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        const row = rows[0];
        if (row.is_active === 0 || row.is_active === false) {
          return null;
        }
        const expiresAt = Number(row.expires_at) || Date.now() + 30 * 24 * 60 * 60 * 1e3;
        if (expiresAt > Date.now()) {
          const userRole = row.role;
          const systemRole = userRole === "superadmin" ? "superadmin" : userRole === "admin" ? "admin" : "member";
          const displayRole = userRole === "superadmin" ? "Super Administrator" : userRole === "admin" ? "Admin Operasional" : row.title || "Anggota Lingkar";
          const joinedCircleIds = await getUserJoinedCircleIds(row.id);
          session = {
            token: row.token,
            user: {
              id: row.id,
              name: row.name,
              email: row.email,
              username: row.username,
              role: displayRole,
              systemRole,
              avatar: row.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              title: row.title || "Anggota Tim",
              points: Number(row.points) || 0,
              level: Number(row.level) || 1,
              streakDays: Number(row.streak_days) || 1,
              badgesCount: Number(row.badges_count) || 1,
              joinedCircleIds: joinedCircleIds.length > 0 ? joinedCircleIds : ["circle_1"]
            },
            expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1e3
            // 30 days
          };
          sessionsMap.set(token, session);
          saveLocalDb();
          return session;
        }
      }
    } catch (e) {
      console.warn("Error fetching session from MySQL:", e.message);
    }
  }
  for (const u of dummyUsers) {
    if (token.includes(u.id)) {
      const systemRole = u.role === "superadmin" ? "superadmin" : u.role === "admin" ? "admin" : "member";
      const displayRole = u.role === "superadmin" ? "Super Administrator" : u.role === "admin" ? "Admin Operasional" : u.title || "Anggota Lingkar";
      session = {
        token,
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
          username: u.username,
          role: displayRole,
          systemRole,
          avatar: u.avatar,
          title: u.title,
          points: u.points,
          level: u.level,
          streakDays: u.streakDays,
          badgesCount: u.badgesCount,
          joinedCircleIds: u.joinedCircleIds || ["circle_1"]
        },
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1e3
      };
      sessionsMap.set(token, session);
      saveLocalDb();
      return session;
    }
  }
  return null;
}
var mysqlPool = null;
var dbStatus = {
  connected: false,
  engine: "MySQL",
  host: process.env.MYSQL_HOST || "",
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || "",
  database: process.env.MYSQL_DATABASE || "lingkar_kebaikan",
  ssl: process.env.MYSQL_SSL === "true",
  error: null,
  lastChecked: (/* @__PURE__ */ new Date()).toISOString(),
  tableCount: 0
};
async function ensureMySQLTables(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'member',
      avatar TEXT,
      title VARCHAR(255),
      points INT DEFAULT 0,
      level INT DEFAULT 1,
      streak_days INT DEFAULT 0,
      badges_count INT DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_users_email (email),
      INDEX idx_users_username (username),
      INDEX idx_users_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token VARCHAR(128) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      expires_at BIGINT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_sessions_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS circles (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      category VARCHAR(100) NOT NULL,
      avatar TEXT,
      banner_gradient VARCHAR(100) DEFAULT 'from-teal-600 to-emerald-800',
      admin_id VARCHAR(64) DEFAULT NULL,
      kas_balance BIGINT NOT NULL DEFAULT 0,
      tags JSON DEFAULT NULL,
      is_private TINYINT(1) NOT NULL DEFAULT 0,
      meeting_schedule VARCHAR(255) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_circles_category (category),
      INDEX idx_circles_admin (admin_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS circle_members (
      id VARCHAR(64) PRIMARY KEY,
      circle_id VARCHAR(64) NOT NULL,
      user_id VARCHAR(64) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'Anggota',
      contribution_points INT NOT NULL DEFAULT 0,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_circle_user (circle_id, user_id),
      INDEX idx_cm_circle (circle_id),
      INDEX idx_cm_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id VARCHAR(64) PRIMARY KEY,
      circle_id VARCHAR(64) DEFAULT NULL,
      author_id VARCHAR(64) NOT NULL,
      title VARCHAR(255) NOT NULL,
      summary TEXT,
      content MEDIUMTEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      tags JSON DEFAULT NULL,
      likes_count INT NOT NULL DEFAULT 0,
      reading_time VARCHAR(50) DEFAULT '3 mnt',
      points_bonus INT NOT NULL DEFAULT 25,
      image_url TEXT,
      attachment_url TEXT,
      attachments JSON DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_posts_circle (circle_id),
      INDEX idx_posts_author (author_id),
      INDEX idx_posts_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id VARCHAR(64) PRIMARY KEY,
      post_id VARCHAR(64) NOT NULL,
      author_id VARCHAR(64) NOT NULL,
      parent_id VARCHAR(64) DEFAULT NULL,
      content TEXT NOT NULL,
      likes_count INT NOT NULL DEFAULT 0,
      mentions JSON DEFAULT NULL,
      attachments JSON DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_comments_post (post_id),
      INDEX idx_comments_author (author_id),
      INDEX idx_comments_parent (parent_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(64) PRIMARY KEY,
      circle_id VARCHAR(64) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      deadline VARCHAR(100) NOT NULL,
      priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
      status VARCHAR(50) NOT NULL DEFAULT 'todo',
      progress INT NOT NULL DEFAULT 0,
      category VARCHAR(100) NOT NULL DEFAULT 'Target Bersama',
      points_reward INT NOT NULL DEFAULT 50,
      color_theme VARCHAR(50) DEFAULT 'mint',
      frequency VARCHAR(50) DEFAULT 'once',
      streak_days INT NOT NULL DEFAULT 0,
      is_group_goal TINYINT(1) NOT NULL DEFAULT 0,
      collaborative_notes TEXT,
      synced_calendars JSON DEFAULT NULL,
      completed_at DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_tasks_circle (circle_id),
      INDEX idx_tasks_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS subtasks (
      id VARCHAR(64) PRIMARY KEY,
      task_id VARCHAR(64) NOT NULL,
      title VARCHAR(255) NOT NULL,
      completed TINYINT(1) NOT NULL DEFAULT 0,
      priority VARCHAR(50) DEFAULT 'Medium',
      assigned_to VARCHAR(64) DEFAULT NULL,
      type VARCHAR(50) DEFAULT 'checkbox',
      completion_note TEXT,
      note_placeholder VARCHAR(255) DEFAULT NULL,
      target_value DECIMAL(15,2) DEFAULT NULL,
      current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
      unit VARCHAR(50) DEFAULT NULL,
      options JSON DEFAULT NULL,
      selected_option VARCHAR(100) DEFAULT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      INDEX idx_subtasks_task (task_id),
      INDEX idx_subtasks_assigned (assigned_to)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS financial_transactions (
      id VARCHAR(64) PRIMARY KEY,
      circle_id VARCHAR(64) NOT NULL,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      amount BIGINT NOT NULL,
      category VARCHAR(100) NOT NULL,
      transaction_date VARCHAR(50) NOT NULL,
      payer_or_recipient VARCHAR(255) NOT NULL,
      recorded_by VARCHAR(64) NOT NULL,
      receipt_note TEXT,
      proof_url TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'verified',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_finance_circle (circle_id),
      INDEX idx_finance_recorded_by (recorded_by)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS meetings (
      id VARCHAR(64) PRIMARY KEY,
      circle_id VARCHAR(64) DEFAULT NULL,
      title VARCHAR(255) NOT NULL,
      date VARCHAR(50) NOT NULL,
      time_range VARCHAR(50) NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'online',
      meet_url TEXT,
      description TEXT,
      attendees JSON DEFAULT NULL,
      is_completed TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_meetings_circle (circle_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS budget_goals (
      id VARCHAR(64) PRIMARY KEY,
      circle_id VARCHAR(64) NOT NULL,
      title VARCHAR(255) NOT NULL,
      target_amount BIGINT NOT NULL,
      current_amount BIGINT NOT NULL DEFAULT 0,
      deadline VARCHAR(50) NOT NULL,
      purpose TEXT,
      category VARCHAR(100) NOT NULL DEFAULT 'Operasional',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_bg_circle (circle_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS member_dues (
      id VARCHAR(64) PRIMARY KEY,
      circle_id VARCHAR(64) NOT NULL,
      member_id VARCHAR(64) NOT NULL,
      period VARCHAR(50) NOT NULL,
      amount BIGINT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      paid_at VARCHAR(50) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_dues_circle (circle_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(64) PRIMARY KEY,
      timestamp VARCHAR(100) NOT NULL,
      user VARCHAR(255) NOT NULL,
      action VARCHAR(255) NOT NULL,
      ip VARCHAR(100) NOT NULL,
      status VARCHAR(50) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS app_configs (
      config_key VARCHAR(100) PRIMARY KEY,
      config_value JSON NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS post_categories (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      description VARCHAR(255) DEFAULT '',
      icon VARCHAR(50) DEFAULT 'Tag',
      color VARCHAR(50) DEFAULT 'teal',
      is_default TINYINT(1) NOT NULL DEFAULT 0,
      sort_order INT NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS app_feedbacks (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) DEFAULT NULL,
      user_name VARCHAR(255) NOT NULL,
      user_email VARCHAR(255) DEFAULT NULL,
      user_avatar TEXT DEFAULT NULL,
      category VARCHAR(100) NOT NULL DEFAULT 'Saran Fitur',
      title VARCHAR(255) NOT NULL,
      message MEDIUMTEXT NOT NULL,
      rating INT DEFAULT 5,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      admin_notes TEXT DEFAULT NULL,
      responded_by VARCHAR(64) DEFAULT NULL,
      responded_at DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_feedback_status (status),
      INDEX idx_feedback_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  try {
    const [catRows] = await conn.query("SELECT COUNT(*) as cnt FROM post_categories");
    if (Number(catRows?.[0]?.cnt || 0) === 0) {
      for (const cat of inMemoryPostCategories) {
        await conn.query(`
          INSERT IGNORE INTO post_categories (id, name, description, icon, color, is_default, sort_order, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `, [cat.id, cat.name, cat.description || "", cat.icon || "Tag", cat.color || "teal", cat.isDefault ? 1 : 0, cat.sortOrder || 0]);
      }
    }
  } catch (err) {
    console.warn("Skip post category seed check:", err.message);
  }
  try {
    await conn.query(`ALTER TABLE posts ADD COLUMN is_group_private TINYINT(1) NOT NULL DEFAULT 0`);
  } catch {
  }
  try {
    await conn.query(`ALTER TABLE posts ADD COLUMN visibility VARCHAR(50) NOT NULL DEFAULT 'public'`);
  } catch {
  }
  try {
    await conn.query(`ALTER TABLE tasks ADD COLUMN assignees JSON DEFAULT NULL`);
  } catch {
  }
  try {
    await conn.query(`ALTER TABLE tasks ADD COLUMN color_theme VARCHAR(50) DEFAULT 'mint'`);
  } catch {
  }
  try {
    await conn.query(`ALTER TABLE tasks ADD COLUMN frequency VARCHAR(50) DEFAULT 'once'`);
  } catch {
  }
  try {
    await conn.query(`ALTER TABLE tasks ADD COLUMN recurrence_days JSON DEFAULT NULL`);
  } catch {
  }
  try {
    await conn.query(`ALTER TABLE tasks ADD COLUMN recurrence_time VARCHAR(50) DEFAULT NULL`);
  } catch {
  }
  if (APP_STATUS !== "production") {
    try {
      const [userRows] = await conn.query("SELECT COUNT(*) as cnt FROM users");
      const userCount = Number(userRows?.[0]?.cnt || 0);
      if (userCount === 0) {
        console.log("Seeding initial default admin and member accounts...");
        for (const u of dummyUsers) {
          await conn.query(`
            INSERT INTO users (id, email, username, password_hash, name, role, avatar, title, points, level, streak_days, badges_count, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          `, [
            u.id,
            u.email,
            u.username,
            u.passwordHash,
            u.name,
            u.role,
            u.avatar,
            u.title,
            u.points,
            u.level,
            u.streakDays,
            u.badgesCount,
            u.isActive ? 1 : 0
          ]);
        }
      }
    } catch (err) {
      console.warn("Skip user seeding check:", err.message);
    }
    try {
      const [circleRows] = await conn.query("SELECT COUNT(*) as cnt FROM circles");
      const circleCount = Number(circleRows?.[0]?.cnt || 0);
      if (circleCount === 0) {
        console.log("Seeding initial default circles...");
        await conn.query(`
          INSERT INTO circles (id, name, code, description, category, kas_balance, is_private)
          VALUES 
          ('circle_1', 'Lingkar Studi AI & Tech Ethics', 'AI-STUDY-88', 'Kelompok riset dan diskusi mingguan seputar AI terapan dan etika teknologi.', 'Kelompok Studi', 3450000, 0),
          ('circle_2', 'Relawan Mengajar Pesisir', 'PESISIR-01', 'Gerakan akar rumput mendistribusikan buku dan mentoring belajar desa pesisir.', 'Organisasi Akar Rumput', 5820000, 0);
        `);
      }
    } catch (err) {
      console.warn("Skip circle seeding check:", err.message);
    }
    try {
      const [cmRows] = await conn.query("SELECT COUNT(*) as cnt FROM circle_members");
      const cmCount = Number(cmRows?.[0]?.cnt || 0);
      if (cmCount === 0) {
        console.log("Seeding initial circle members...");
        await conn.query(`
          INSERT INTO circle_members (id, circle_id, user_id, role, contribution_points)
          VALUES
          ('cm_1', 'circle_1', 'usr_superadmin', 'Ketua', 9999),
          ('cm_2', 'circle_1', 'usr_1', 'Anggota', 1280),
          ('cm_3', 'circle_2', 'usr_admin', 'Ketua', 4520);
        `);
      }
    } catch (err) {
      console.warn("Skip circle member seeding check:", err.message);
    }
  }
  try {
    const [cfgRows] = await conn.query("SELECT config_value FROM app_configs WHERE config_key = 'main_app_profile'");
    if (cfgRows && cfgRows.length > 0) {
      const val = typeof cfgRows[0].config_value === "string" ? JSON.parse(cfgRows[0].config_value) : cfgRows[0].config_value;
      appConfig = { ...appConfig, ...val };
      console.log("\u2705 Loaded App Configuration from MySQL database");
    } else {
      await conn.query("INSERT INTO app_configs (config_key, config_value) VALUES ('main_app_profile', ?)", [JSON.stringify(appConfig)]);
    }
  } catch (err) {
    console.warn("Skip app_configs load:", err.message);
  }
}
async function syncLocalDataToMySQL(conn) {
  const synced = { circles: 0, posts: 0, tasks: 0 };
  try {
    const [cRows] = await conn.query("SELECT COUNT(*) as cnt FROM circles");
    if (Number(cRows?.[0]?.cnt || 0) === 0 && inMemoryCircles.length > 0) {
      for (const c of inMemoryCircles) {
        await conn.query(`
          INSERT IGNORE INTO circles (id, name, code, description, category, avatar, banner_gradient, admin_id, kas_balance, tags, is_private, meeting_schedule, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          c.id,
          c.name,
          c.code,
          c.description || "",
          c.category || "Komunitas Umum",
          c.avatar || "",
          c.bannerGradient || "from-teal-600 to-emerald-800",
          c.adminId || "usr_superadmin",
          c.kasBalance || 0,
          JSON.stringify(c.tags || []),
          c.isPrivate ? 1 : 0,
          c.meetingSchedule || null
        ]);
        synced.circles++;
        if (Array.isArray(c.members)) {
          for (const m of c.members) {
            await conn.query(`
              INSERT IGNORE INTO circle_members (id, circle_id, user_id, role, contribution_points, joined_at)
              VALUES (?, ?, ?, ?, ?, NOW())
            `, [`cm_${c.id}_${m.id}`, c.id, m.id, m.role || "Anggota", m.contributionPoints || 0]);
          }
        }
      }
      console.log(`\u2728 [DB] Auto-migrated ${synced.circles} circles to MySQL`);
    }
    const [pRows] = await conn.query("SELECT COUNT(*) as cnt FROM posts");
    if (Number(pRows?.[0]?.cnt || 0) === 0 && inMemoryPosts.length > 0) {
      for (const p of inMemoryPosts) {
        await conn.query(`
          INSERT IGNORE INTO posts (id, circle_id, author_id, title, summary, content, category, tags, likes_count, reading_time, points_bonus, image_url, attachment_url, attachments, is_group_private, visibility, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          p.id,
          p.circleId || null,
          p.author?.id || "usr_superadmin",
          p.title,
          p.summary || "",
          p.content,
          p.category || "Wawasan & Refleksi",
          JSON.stringify(p.tags || []),
          p.likesCount || p.likes || 0,
          p.readingTime || "3 mnt",
          p.pointsBonus || 25,
          p.imageUrl || null,
          p.attachmentUrl || null,
          JSON.stringify(p.attachments || []),
          p.isGroupPrivate ? 1 : 0,
          p.visibility || (p.isGroupPrivate ? "group_only" : "public")
        ]);
        synced.posts++;
        if (Array.isArray(p.comments)) {
          for (const cm of p.comments) {
            await conn.query(`
              INSERT IGNORE INTO comments (id, post_id, author_id, parent_id, content, likes_count, mentions, attachments, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `, [
              cm.id,
              p.id,
              cm.authorId || "usr_superadmin",
              cm.parentId || null,
              cm.content,
              cm.likesCount || 0,
              JSON.stringify(cm.mentions || []),
              JSON.stringify(cm.attachments || [])
            ]);
          }
        }
      }
      console.log(`\u2728 [DB] Auto-migrated ${synced.posts} posts to MySQL`);
    }
    const [tRows] = await conn.query("SELECT COUNT(*) as cnt FROM tasks");
    if (Number(tRows?.[0]?.cnt || 0) === 0 && inMemoryTasks.length > 0) {
      for (const t of inMemoryTasks) {
        await conn.query(`
          INSERT IGNORE INTO tasks (id, circle_id, title, description, deadline, priority, status, progress, category, points_reward, color_theme, frequency, streak_days, is_group_goal, collaborative_notes, assignees, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          t.id,
          t.circleId || "circle_1",
          t.title,
          t.description || "",
          t.deadline || "Minggu Depan",
          t.priority || "Medium",
          t.status || "todo",
          t.progress || 0,
          t.category || "Target Bersama",
          t.pointsReward || 50,
          t.colorTheme || "mint",
          t.frequency || "once",
          t.streakDays || 0,
          t.isGroupGoal ? 1 : 0,
          t.collaborativeNotes || null,
          JSON.stringify(t.assignees || [])
        ]);
        synced.tasks++;
        if (Array.isArray(t.subtasks)) {
          for (let i = 0; i < t.subtasks.length; i++) {
            const st = t.subtasks[i];
            await conn.query(`
              INSERT IGNORE INTO subtasks (id, task_id, title, completed, priority, assigned_to, type, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [st.id || `st_${t.id}_${i}`, t.id, st.title, st.completed ? 1 : 0, st.priority || "Medium", st.assignedTo || null, st.type || "checkbox", i]);
          }
        }
      }
      console.log(`\u2728 [DB] Auto-migrated ${synced.tasks} tasks to MySQL`);
    }
  } catch (err) {
    console.error("Error syncing local data to MySQL:", err);
  }
  return synced;
}
async function initMySQLConnection() {
  try {
    import_dotenv.default.config({ path: import_path.default.resolve(process.cwd(), ".env"), override: true });
  } catch {
  }
  const rawHost = process.env.MYSQL_HOST?.trim();
  const user = process.env.MYSQL_USER?.trim();
  const password = process.env.MYSQL_PASSWORD || "";
  const database = process.env.MYSQL_DATABASE?.trim() || "lingkar_kebaikan";
  const port = Number(process.env.MYSQL_PORT) || 3306;
  const ssl = process.env.MYSQL_SSL === "true";
  dbStatus.host = rawHost || "";
  dbStatus.port = port;
  dbStatus.user = user || "";
  dbStatus.database = database;
  dbStatus.ssl = ssl;
  if (!rawHost || !user) {
    dbStatus.connected = false;
    dbStatus.engine = "In-Memory with MySQL Fallback";
    dbStatus.error = "MYSQL_HOST atau MYSQL_USER belum diisi di file .env server cPanel. Menggunakan in-memory storage yang handal & siap migrasi.";
    dbStatus.lastChecked = (/* @__PURE__ */ new Date()).toISOString();
    console.log("\u2139\uFE0F [DB] MySQL env variables not set (MYSQL_HOST/MYSQL_USER empty). Running in In-Memory mode.");
    return;
  }
  const candidateHosts = [rawHost];
  if (rawHost.toLowerCase() === "localhost") {
    candidateHosts.push("127.0.0.1");
  } else if (rawHost === "127.0.0.1") {
    candidateHosts.push("localhost");
  }
  let lastErr = null;
  for (const host of candidateHosts) {
    try {
      if (mysqlPool) {
        try {
          await mysqlPool.end();
        } catch {
        }
      }
      const pool = import_promise.default.createPool({
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 7e3,
        ssl: ssl ? { rejectUnauthorized: false } : void 0
      });
      const conn = await pool.getConnection();
      console.log(`\u2705 [DB] Successfully connected to MySQL database [${database}] at ${host}:${port}`);
      await ensureMySQLTables(conn);
      await syncLocalDataToMySQL(conn);
      const [tables] = await conn.query("SHOW TABLES");
      mysqlPool = pool;
      dbStatus.connected = true;
      dbStatus.host = host;
      dbStatus.engine = "MySQL (Real Connected)";
      dbStatus.error = null;
      dbStatus.tableCount = Array.isArray(tables) ? tables.length : 14;
      dbStatus.lastChecked = (/* @__PURE__ */ new Date()).toISOString();
      conn.release();
      return;
    } catch (err) {
      lastErr = err;
      console.warn(`\u26A0\uFE0F [DB] Connection to MySQL at ${host}:${port} failed: ${err.message}`);
    }
  }
  dbStatus.connected = false;
  dbStatus.engine = "In-Memory (MySQL Error Fallback)";
  let friendlyError = lastErr?.message || "Gagal terhubung ke MySQL database.";
  if (lastErr && lastErr.message && lastErr.message.includes("Access denied for user")) {
    const ipMatch = lastErr.message.match(/@'([^']+)'/);
    const originIp = ipMatch ? ipMatch[1] : "34.34.244.109";
    friendlyError = `Akses Ditolak (Access Denied). IP server preview/AI Studio [${originIp}] belum diizinkan oleh server cPanel Anda. Silakan login ke cPanel -> masuk ke menu 'Remote MySQL' (MySQL Jarak Jauh) -> Tambahkan alamat IP '${originIp}' atau gunakan tanda '%' (untuk mengizinkan semua koneksi luar) agar AI Studio dapat tersambung langsung ke database cPanel Anda.`;
  } else if (lastErr && lastErr.message && (lastErr.message.includes("ETIMEDOUT") || lastErr.message.includes("ECONNREFUSED") || lastErr.message.includes("ENOTFOUND"))) {
    friendlyError = `Koneksi Terputus / Timeout: Server MySQL di ${rawHost}:${port} tidak dapat dijangkau. Pastikan alamat host benar, port 3306 terbuka di firewall VPS/cPanel Anda, dan server MySQL sedang aktif.`;
  }
  dbStatus.error = friendlyError;
  dbStatus.lastChecked = (/* @__PURE__ */ new Date()).toISOString();
  console.error("\u26A0\uFE0F [DB] MySQL connection initialization failed:", dbStatus.error);
}
var serverStartTime = Date.now();
var totalRequestsHandled = 0;
var auditLogs = [
  {
    id: "log_1",
    timestamp: new Date(Date.now() - 36e5).toISOString(),
    user: "Super Admin",
    action: "System startup & security check",
    ip: "127.0.0.1",
    status: "SUCCESS"
  },
  {
    id: "log_2",
    timestamp: new Date(Date.now() - 18e5).toISOString(),
    user: "Admin Operasional",
    action: "Verified financial records sync",
    ip: "127.0.0.1",
    status: "SUCCESS"
  }
];
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = Number(process.env.PORT) || 3e3;
  await initMySQLConnection();
  app.use(import_express.default.json({ limit: "25mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "25mb" }));
  app.use((req, res, next) => {
    totalRequestsHandled++;
    next();
  });
  app.use(
    "/uploads",
    import_express.default.static(UPLOADS_DIR, {
      maxAge: "7d",
      setHeaders: (res) => {
        res.setHeader("Cache-Control", "public, max-age=604800, immutable");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      }
    })
  );
  app.post("/api/upload", async (req, res) => {
    try {
      const { filename, mimeType, dataBase64, originalSize, compressedSize, width, height } = req.body;
      if (!dataBase64) {
        return res.status(400).json({ error: "Data berkas base64 diperlukan." });
      }
      const matches = dataBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      let buffer;
      let finalMime = mimeType || "application/octet-stream";
      if (matches && matches.length === 3) {
        finalMime = matches[1];
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(dataBase64, "base64");
      }
      let ext = "bin";
      if (finalMime.includes("webp")) ext = "webp";
      else if (finalMime.includes("jpeg") || finalMime.includes("jpg")) ext = "jpg";
      else if (finalMime.includes("png")) ext = "png";
      else if (finalMime.includes("pdf")) ext = "pdf";
      else if (finalMime.includes("sheet") || finalMime.includes("excel") || filename?.endsWith(".xlsx")) ext = "xlsx";
      else if (finalMime.includes("slide") || filename?.endsWith(".pptx")) ext = "pptx";
      else if (finalMime.includes("word") || filename?.endsWith(".docx")) ext = "docx";
      else if (finalMime.includes("zip")) ext = "zip";
      const safeBaseName = (filename || "file").replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 30);
      const uniqueName = `upload_${Date.now()}_${import_crypto.default.randomBytes(4).toString("hex")}_${safeBaseName}.${ext}`;
      const filePath = import_path.default.join(UPLOADS_DIR, uniqueName);
      await import_fs.default.promises.writeFile(filePath, buffer);
      const publicUrl = `/uploads/${uniqueName}`;
      auditLogs.unshift({
        id: `log_${Date.now()}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        user: req.headers["x-user-name"] ? String(req.headers["x-user-name"]) : "User",
        action: `Upload media: ${uniqueName} (${Math.round(buffer.length / 1024)} KB)`,
        ip: req.ip || "127.0.0.1",
        status: "SUCCESS"
      });
      if (auditLogs.length > 200) auditLogs.pop();
      res.json({
        success: true,
        url: publicUrl,
        filename: uniqueName,
        name: filename || uniqueName,
        size: buffer.length,
        originalSize: originalSize || buffer.length,
        compressedSize: compressedSize || buffer.length,
        width,
        height,
        savedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Gagal menyimpan berkas ke server: " + err.message });
    }
  });
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({ error: "Email/Username dan Kata Sandi wajib diisi." });
      }
      const rawId = String(identifier || "").trim();
      const cleanEmail = rawId.toLowerCase();
      const cleanUsername = rawId.toLowerCase().replace(/^@/, "");
      let userRecord = null;
      if (mysqlPool && dbStatus.connected) {
        try {
          const [rows] = await mysqlPool.query(
            "SELECT * FROM users WHERE LOWER(TRIM(email)) = ? OR LOWER(TRIM(username)) = ? OR LOWER(TRIM(username)) = ? LIMIT 1",
            [cleanEmail, cleanUsername, rawId.toLowerCase()]
          );
          if (Array.isArray(rows) && rows.length > 0) {
            const dbUser = rows[0];
            userRecord = {
              id: dbUser.id,
              email: dbUser.email,
              username: dbUser.username,
              passwordHash: dbUser.password_hash,
              name: dbUser.name,
              role: dbUser.role,
              avatar: dbUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              title: dbUser.title || "Anggota Tim",
              points: Number(dbUser.points) || 0,
              level: Number(dbUser.level) || 1,
              streakDays: Number(dbUser.streak_days) || 1,
              badgesCount: Number(dbUser.badges_count) || 1,
              joinedCircleIds: await getUserJoinedCircleIds(dbUser.id),
              createdAt: dbUser.created_at,
              isActive: dbUser.is_active === 1 || dbUser.is_active === true
            };
          }
        } catch (dbErr) {
          console.warn("MySQL login query error, using in-memory fallback:", dbErr.message);
          if (dbErr.message && (dbErr.message.includes("doesn't exist") || dbErr.message.includes("ER_NO_SUCH_TABLE"))) {
            try {
              const conn = await mysqlPool.getConnection();
              await ensureMySQLTables(conn);
              conn.release();
            } catch {
            }
          }
        }
      }
      if (!userRecord) {
        userRecord = dummyUsers.find((u) => {
          const uEmail = (u.email || "").toLowerCase().trim();
          const uUsername = (u.username || "").toLowerCase().trim();
          return uEmail === cleanEmail || uUsername === cleanUsername || uUsername === cleanEmail || uEmail.split("@")[0] === cleanUsername || cleanEmail === "budi" && uUsername === "budipratama";
        });
      }
      if (!userRecord) {
        return res.status(401).json({ error: "Pengguna tidak ditemukan. Silakan periksa email atau username Anda." });
      }
      const isPasswordValid = verifyPassword(password, userRecord.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Kata sandi tidak sesuai. Silakan periksa kembali." });
      }
      const expectedStandardHash = hashPassword(password);
      if (userRecord.passwordHash !== expectedStandardHash && mysqlPool && dbStatus.connected) {
        try {
          await mysqlPool.query("UPDATE users SET password_hash = ? WHERE id = ?", [expectedStandardHash, userRecord.id]);
        } catch {
        }
      }
      if (!userRecord.isActive) {
        return res.status(403).json({ error: "Akun Anda sedang dinonaktifkan oleh administrator." });
      }
      const token = generateSecureToken(userRecord.id);
      const systemRole = userRecord.role === "superadmin" ? "superadmin" : userRecord.role === "admin" ? "admin" : "member";
      const displayRole = userRecord.role === "superadmin" ? "Super Administrator" : userRecord.role === "admin" ? "Admin Operasional" : "Anggota Lingkar";
      const userJoinedCircleIds = await getUserJoinedCircleIds(userRecord.id);
      const sessionData = {
        token,
        user: {
          id: userRecord.id,
          name: userRecord.name,
          email: userRecord.email,
          username: userRecord.username,
          role: displayRole,
          systemRole,
          avatar: userRecord.avatar,
          title: userRecord.title,
          points: userRecord.points,
          level: userRecord.level,
          streakDays: userRecord.streakDays,
          badgesCount: userRecord.badgesCount,
          joinedCircleIds: userJoinedCircleIds.length > 0 ? userJoinedCircleIds : userRecord.joinedCircleIds || []
        },
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1e3
        // 30 days persistent session
      };
      sessionsMap.set(token, sessionData);
      saveLocalDb();
      if (mysqlPool && dbStatus.connected) {
        try {
          await mysqlPool.query(
            "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at)",
            [token, userRecord.id, sessionData.expiresAt]
          );
        } catch {
        }
      }
      const logItem = {
        id: `log_${Date.now()}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        user: userRecord.name,
        action: `User login [${systemRole.toUpperCase()}]`,
        ip: req.ip || "127.0.0.1",
        status: "SUCCESS"
      };
      auditLogs.unshift(logItem);
      if (mysqlPool && dbStatus.connected) {
        try {
          await mysqlPool.query(
            "INSERT INTO audit_logs (id, timestamp, user, action, ip, status) VALUES (?, ?, ?, ?, ?, ?)",
            [logItem.id, logItem.timestamp, logItem.user, logItem.action, logItem.ip, logItem.status]
          );
        } catch {
        }
      }
      res.json({
        success: true,
        token,
        user: sessionData.user
      });
    } catch (err) {
      res.status(500).json({ error: "Terjadi kesalahan sistem saat login: " + err.message });
    }
  });
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, username, email, password } = req.body;
      if (!name || !username || !password) {
        return res.status(400).json({ error: "Nama, Username, dan Kata Sandi wajib diisi." });
      }
      const cleanUsername = username.trim().toLowerCase().replace(/^@/, "");
      const cleanEmail = (email || `${cleanUsername}@lingkarkebaikan.org`).trim().toLowerCase();
      if (mysqlPool && dbStatus.connected) {
        try {
          const [existingDb] = await mysqlPool.query(
            "SELECT id FROM users WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1",
            [cleanUsername, cleanEmail]
          );
          if (Array.isArray(existingDb) && existingDb.length > 0) {
            return res.status(400).json({ error: "Username atau Email sudah terdaftar di database MySQL." });
          }
        } catch {
        }
      }
      const existing = dummyUsers.find(
        (u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail
      );
      if (existing) {
        return res.status(400).json({ error: "Username atau Email sudah terdaftar." });
      }
      const newUser = {
        id: `usr_${Date.now()}`,
        email: cleanEmail,
        username: cleanUsername,
        passwordHash: hashPassword(password),
        name: name.trim(),
        role: "member",
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        title: "Anggota Baru Lingkar",
        points: 100,
        // Welcome points
        level: 1,
        streakDays: 1,
        badgesCount: 1,
        joinedCircleIds: ["circle_1"],
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        isActive: true
      };
      dummyUsers.push(newUser);
      if (mysqlPool && dbStatus.connected) {
        try {
          await mysqlPool.query(
            `INSERT INTO users (id, email, username, password_hash, name, role, avatar, title, points, level, streak_days, badges_count, is_active, created_at)
             VALUES (?, ?, ?, ?, ?, 'member', ?, ?, 100, 1, 1, 1, 1, NOW())`,
            [
              newUser.id,
              newUser.email,
              newUser.username,
              newUser.passwordHash,
              newUser.name,
              newUser.avatar,
              newUser.title
            ]
          );
        } catch (dbErr) {
          console.warn("Failed to insert user into MySQL:", dbErr.message);
        }
      }
      const token = generateSecureToken(newUser.id);
      const sessionData = {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          username: newUser.username,
          role: "Anggota Baru Lingkar",
          systemRole: "member",
          avatar: newUser.avatar,
          title: newUser.title,
          points: newUser.points,
          level: newUser.level,
          streakDays: newUser.streakDays,
          badgesCount: newUser.badgesCount,
          joinedCircleIds: newUser.joinedCircleIds
        },
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1e3
        // 30 days
      };
      sessionsMap.set(token, sessionData);
      saveLocalDb();
      if (mysqlPool && dbStatus.connected) {
        try {
          await mysqlPool.query(
            "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
            [token, newUser.id, sessionData.expiresAt]
          );
        } catch {
        }
      }
      const logItem = {
        id: `log_${Date.now()}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        user: newUser.name,
        action: "Registrasi Akun Baru [MEMBER]",
        ip: req.ip || "127.0.0.1",
        status: "SUCCESS"
      };
      auditLogs.unshift(logItem);
      if (mysqlPool && dbStatus.connected) {
        try {
          await mysqlPool.query(
            "INSERT INTO audit_logs (id, timestamp, user, action, ip, status) VALUES (?, ?, ?, ?, ?, ?)",
            [logItem.id, logItem.timestamp, logItem.user, logItem.action, logItem.ip, logItem.status]
          );
        } catch {
        }
      }
      res.json({
        success: true,
        token,
        user: sessionData.user
      });
    } catch (err) {
      res.status(500).json({ error: "Terjadi kesalahan sistem saat registrasi: " + err.message });
    }
  });
  app.get("/api/auth/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const defaultUser = dummyUsers[2];
      return res.json({
        authenticated: false,
        user: {
          id: defaultUser.id,
          name: defaultUser.name,
          email: defaultUser.email,
          username: defaultUser.username,
          role: "Koordinator Lingkar Studi",
          systemRole: "member",
          avatar: defaultUser.avatar,
          title: defaultUser.title,
          points: defaultUser.points,
          level: defaultUser.level,
          streakDays: defaultUser.streakDays,
          badgesCount: defaultUser.badgesCount,
          joinedCircleIds: defaultUser.joinedCircleIds
        }
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const session = await getSessionFromToken(token);
    if (!session) {
      return res.status(401).json({ authenticated: false, error: "Sesi tidak valid atau telah berakhir. Silakan login kembali." });
    }
    const currentJoined = await getUserJoinedCircleIds(session.user.id);
    session.user.joinedCircleIds = currentJoined || [];
    res.json({
      authenticated: true,
      user: session.user
    });
  });
  app.post("/api/auth/logout", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      sessionsMap.delete(token);
      saveLocalDb();
      if (mysqlPool && dbStatus.connected) {
        try {
          await mysqlPool.query("DELETE FROM sessions WHERE token = ?", [token]);
        } catch {
        }
      }
    }
    res.json({ success: true, message: "Berhasil keluar dari sesi." });
  });
  app.get("/api/admin/users", async (req, res) => {
    if (mysqlPool && dbStatus.connected) {
      try {
        const [rows] = await mysqlPool.query("SELECT id, name, email, username, role, avatar, points, level, is_active, created_at FROM users ORDER BY created_at DESC");
        if (Array.isArray(rows) && rows.length > 0) {
          return res.json({
            users: rows.map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              username: u.username,
              role: u.role,
              avatar: u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              points: Number(u.points) || 0,
              level: Number(u.level) || 1,
              joinedCircleIds: ["circle_1"],
              createdAt: u.created_at,
              isActive: u.is_active === 1 || u.is_active === true
            }))
          });
        }
      } catch (err) {
        console.warn("Failed to load users from MySQL (will auto-heal tables):", err.message);
        if (err.message && (err.message.includes("doesn't exist") || err.message.includes("ER_NO_SUCH_TABLE"))) {
          try {
            const conn = await mysqlPool.getConnection();
            await ensureMySQLTables(conn);
            conn.release();
          } catch (createErr) {
            console.error("Failed to auto-heal MySQL tables:", createErr.message);
          }
        }
      }
    }
    res.json({
      users: dummyUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        username: u.username,
        role: u.role,
        avatar: u.avatar,
        points: u.points,
        level: u.level,
        joinedCircleIds: u.joinedCircleIds,
        createdAt: u.createdAt,
        isActive: u.isActive
      }))
    });
  });
  app.post("/api/admin/update-user", async (req, res) => {
    const { userId, role, isActive } = req.body;
    const user = dummyUsers.find((u) => u.id === userId);
    if (user) {
      if (role) user.role = role;
      if (typeof isActive === "boolean") user.isActive = isActive;
    }
    if (mysqlPool && dbStatus.connected) {
      try {
        if (role && typeof isActive === "boolean") {
          await mysqlPool.query("UPDATE users SET role = ?, is_active = ? WHERE id = ?", [role, isActive ? 1 : 0, userId]);
        } else if (role) {
          await mysqlPool.query("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
        } else if (typeof isActive === "boolean") {
          await mysqlPool.query("UPDATE users SET is_active = ? WHERE id = ?", [isActive ? 1 : 0, userId]);
        }
      } catch {
      }
    }
    auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      user: "Administrator",
      action: `Update user ${userId}: Role=${role}, Active=${isActive}`,
      ip: req.ip || "127.0.0.1",
      status: "SUCCESS"
    });
    saveLocalDb();
    res.json({ success: true, user: user || { id: userId, role, isActive } });
  });
  app.post("/api/users/profile", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      let userId = "";
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        const session = await getSessionFromToken(token);
        if (session && session.user) {
          userId = session.user.id;
        }
      }
      if (!userId && req.body.userId) {
        userId = req.body.userId;
      }
      if (!userId) {
        return res.status(401).json({ success: false, error: "Sesi login tidak valid. Silakan login kembali." });
      }
      const { name, title, avatar, username } = req.body;
      const finalName = name && name.trim() ? name.trim() : void 0;
      const finalTitle = title !== void 0 ? title.trim() : void 0;
      const finalAvatar = avatar && avatar.trim() ? avatar.trim() : void 0;
      const finalUsername = username && username.trim() ? username.trim().toLowerCase().replace(/^@/, "") : void 0;
      if (mysqlPool && dbStatus.connected) {
        try {
          const updates = [];
          const params = [];
          if (finalName !== void 0) {
            updates.push("name = ?");
            params.push(finalName);
          }
          if (finalTitle !== void 0) {
            updates.push("title = ?");
            params.push(finalTitle);
          }
          if (finalAvatar !== void 0) {
            updates.push("avatar = ?");
            params.push(finalAvatar);
          }
          if (finalUsername !== void 0) {
            updates.push("username = ?");
            params.push(finalUsername);
          }
          if (updates.length > 0) {
            params.push(userId);
            await mysqlPool.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
          }
        } catch (dbErr) {
          console.error("Failed to update user profile in MySQL:", dbErr.message);
          if (dbErr.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ success: false, error: "Username sudah digunakan oleh pengguna lain. Silakan pilih username yang berbeda." });
          }
          return res.status(500).json({ success: false, error: "Gagal menyimpan perubahan ke database." });
        }
      }
      let targetUser = dummyUsers.find((u) => u.id === userId);
      if (targetUser) {
        if (finalName !== void 0) targetUser.name = finalName;
        if (finalTitle !== void 0) targetUser.title = finalTitle;
        if (finalAvatar !== void 0) targetUser.avatar = finalAvatar;
        if (finalUsername !== void 0) targetUser.username = finalUsername;
      }
      for (const [token, session] of sessionsMap.entries()) {
        if (session.user && session.user.id === userId) {
          sessionsMap.set(token, {
            ...session,
            user: {
              ...session.user,
              name: targetUser ? targetUser.name : finalName || session.user.name,
              title: targetUser ? targetUser.title : finalTitle !== void 0 ? finalTitle : session.user.title,
              avatar: targetUser ? targetUser.avatar : finalAvatar || session.user.avatar,
              username: targetUser ? targetUser.username : finalUsername || session.user.username
            }
          });
        }
      }
      saveLocalDb();
      auditLogs.unshift({
        id: `log_${Date.now()}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        user: targetUser ? targetUser.name : "User",
        action: `User updated profile photo / information (${userId})`,
        ip: req.ip || "127.0.0.1",
        status: "SUCCESS"
      });
      res.json({
        success: true,
        message: "Foto profil dan biodata berhasil diperbarui!",
        user: targetUser || { id: userId, name: finalName, title: finalTitle, avatar: finalAvatar, username: finalUsername }
      });
    } catch (err) {
      console.error("Error updating user profile:", err);
      res.status(500).json({ success: false, error: "Gagal memperbarui profil: " + err.message });
    }
  });
  app.put("/api/users/profile", async (req, res) => {
    let authHeader = req.headers.authorization;
    let userId = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const session = await getSessionFromToken(token);
      if (session && session.user) userId = session.user.id;
    }
    if (!userId && req.body.userId) userId = req.body.userId;
    if (!userId) return res.status(401).json({ success: false, error: "Sesi login tidak valid." });
    const { name, title, avatar, username } = req.body;
    const finalName = name && name.trim() ? name.trim() : void 0;
    const finalTitle = title !== void 0 ? title.trim() : void 0;
    const finalAvatar = avatar && avatar.trim() ? avatar.trim() : void 0;
    const finalUsername = username && username.trim() ? username.trim().toLowerCase().replace(/^@/, "") : void 0;
    if (mysqlPool && dbStatus.connected) {
      try {
        const updates = [];
        const params = [];
        if (finalName !== void 0) {
          updates.push("name = ?");
          params.push(finalName);
        }
        if (finalTitle !== void 0) {
          updates.push("title = ?");
          params.push(finalTitle);
        }
        if (finalAvatar !== void 0) {
          updates.push("avatar = ?");
          params.push(finalAvatar);
        }
        if (finalUsername !== void 0) {
          updates.push("username = ?");
          params.push(finalUsername);
        }
        if (updates.length > 0) {
          params.push(userId);
          await mysqlPool.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
        }
      } catch (dbErr) {
        if (dbErr.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ success: false, error: "Username sudah digunakan oleh pengguna lain. Silakan pilih username yang berbeda." });
        }
        return res.status(500).json({ success: false, error: "Gagal menyimpan perubahan ke database." });
      }
    }
    let targetUser = dummyUsers.find((u) => u.id === userId);
    if (targetUser) {
      if (finalName !== void 0) targetUser.name = finalName;
      if (finalTitle !== void 0) targetUser.title = finalTitle;
      if (finalAvatar !== void 0) targetUser.avatar = finalAvatar;
      if (finalUsername !== void 0) targetUser.username = finalUsername;
    }
    for (const [token, session] of sessionsMap.entries()) {
      if (session.user && session.user.id === userId) {
        sessionsMap.set(token, {
          ...session,
          user: {
            ...session.user,
            name: targetUser ? targetUser.name : finalName || session.user.name,
            title: targetUser ? targetUser.title : finalTitle !== void 0 ? finalTitle : session.user.title,
            avatar: targetUser ? targetUser.avatar : finalAvatar || session.user.avatar,
            username: targetUser ? targetUser.username : finalUsername || session.user.username
          }
        });
      }
    }
    saveLocalDb();
    res.json({
      success: true,
      message: "Foto profil dan biodata berhasil diperbarui!",
      user: targetUser || { id: userId, name: finalName, title: finalTitle, avatar: finalAvatar, username: finalUsername }
    });
  });
  app.post("/api/users/points", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      let userId = "";
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        const session = await getSessionFromToken(token);
        if (session && session.user) {
          userId = session.user.id;
        }
      }
      if (!userId && req.body.userId) {
        userId = req.body.userId;
      }
      if (!userId) {
        return res.status(401).json({ success: false, error: "Sesi login tidak valid. Silakan login kembali." });
      }
      const pointsToAdd = parseInt(req.body.points || 0, 10);
      const reason = String(req.body.reason || "Aktivitas kebaikan tim");
      if (isNaN(pointsToAdd) || pointsToAdd === 0) {
        return res.status(400).json({ success: false, error: "Nilai poin tidak valid." });
      }
      let updatedUser = null;
      if (mysqlPool && dbStatus.connected) {
        try {
          await mysqlPool.query(
            `UPDATE users 
             SET points = GREATEST(0, points + ?),
                 level = FLOOR((GREATEST(0, points + ?)) / 300) + 1
             WHERE id = ?`,
            [pointsToAdd, pointsToAdd, userId]
          );
          const [rows] = await mysqlPool.query("SELECT * FROM users WHERE id = ? LIMIT 1", [userId]);
          if (Array.isArray(rows) && rows.length > 0) {
            const u = rows[0];
            updatedUser = {
              id: u.id,
              name: u.name,
              username: u.username,
              email: u.email,
              avatar: u.avatar,
              role: u.role,
              systemRole: u.role,
              title: u.title,
              points: u.points,
              level: u.level,
              streakDays: u.streak_days || 1,
              badgesCount: u.badges_count || 3,
              joinedCircleIds: ["circle_1", "circle_2"],
              isActive: u.is_active === 1
            };
          }
        } catch (dbErr) {
          console.error("Failed to add points in MySQL:", dbErr.message);
        }
      }
      let targetUser = dummyUsers.find((u) => u.id === userId);
      if (targetUser) {
        targetUser.points = Math.max(0, targetUser.points + pointsToAdd);
        targetUser.level = Math.floor(targetUser.points / 300) + 1;
        if (!updatedUser) {
          updatedUser = targetUser;
        }
      }
      for (const [token, session] of sessionsMap.entries()) {
        if (session.user && session.user.id === userId) {
          const currentPts = Math.max(0, (session.user.points || 0) + pointsToAdd);
          const currentLvl = Math.floor(currentPts / 300) + 1;
          sessionsMap.set(token, {
            ...session,
            user: {
              ...session.user,
              points: currentPts,
              level: currentLvl
            }
          });
        }
      }
      saveLocalDb();
      res.json({
        success: true,
        message: `Berhasil menambahkan +${pointsToAdd} Poin!`,
        reason,
        points: updatedUser ? updatedUser.points : targetUser ? targetUser.points : 0,
        level: updatedUser ? updatedUser.level : targetUser ? targetUser.level : 1,
        user: updatedUser || targetUser
      });
    } catch (err) {
      console.error("Error adding points:", err);
      res.status(500).json({ success: false, error: "Gagal memperbarui poin: " + err.message });
    }
  });
  app.get("/api/leaderboard", async (req, res) => {
    try {
      let leaderboard = [];
      if (mysqlPool && dbStatus.connected) {
        try {
          const [rows] = await mysqlPool.query(
            `SELECT id, name, username, email, avatar, title, points, level, streak_days, badges_count, role, is_active 
             FROM users 
             WHERE is_active = 1 
             ORDER BY points DESC 
             LIMIT 100`
          );
          if (Array.isArray(rows)) {
            leaderboard = rows.map((u, idx) => ({
              rank: idx + 1,
              id: u.id,
              name: u.name,
              username: u.username || u.name.toLowerCase().replace(/\s+/g, ""),
              email: u.email,
              avatar: u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              title: u.title || "Anggota Tim",
              contributionPoints: Number(u.points) || 0,
              level: Number(u.level) || 1,
              streakDays: Number(u.streak_days) || 1,
              badgesCount: Number(u.badges_count) || 3,
              role: u.role || "member"
            }));
          }
        } catch (dbErr) {
          console.error("Leaderboard DB query error:", dbErr.message);
        }
      }
      if (leaderboard.length === 0) {
        const sorted = [...dummyUsers].sort((a, b) => (b.points || 0) - (a.points || 0));
        leaderboard = sorted.map((u, idx) => ({
          rank: idx + 1,
          id: u.id,
          name: u.name,
          username: u.username || u.name.toLowerCase().replace(/\s+/g, ""),
          email: u.email,
          avatar: u.avatar,
          title: u.title,
          contributionPoints: u.points || 0,
          level: u.level || 1,
          streakDays: u.streakDays || 1,
          badgesCount: u.badgesCount || 3,
          role: u.role
        }));
      }
      res.json({
        success: true,
        totalMembers: leaderboard.length,
        leaderboard
      });
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      res.status(500).json({ success: false, error: "Gagal mengambil data peringkat." });
    }
  });
  app.get("/api/db/status", (req, res) => {
    res.json({
      ...dbStatus,
      envConfigured: !!(process.env.MYSQL_HOST && process.env.MYSQL_USER),
      instructions: "Untuk menghubungkan ke database MySQL nyata, isi variabel MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, dan MYSQL_DATABASE di Secrets/Environment."
    });
  });
  app.post("/api/db/reconnect", async (req, res) => {
    try {
      await initMySQLConnection();
      res.json({
        success: dbStatus.connected,
        status: dbStatus,
        message: dbStatus.connected ? `Berhasil tersambung ke database MySQL [${dbStatus.database}] di ${dbStatus.host}:${dbStatus.port}` : `Gagal tersambung: ${dbStatus.error || "Periksa kredensial .env"}`
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message, status: dbStatus });
    }
  });
  app.post("/api/db/sync-local-to-mysql", async (req, res) => {
    try {
      if (!mysqlPool || !dbStatus.connected) {
        return res.status(400).json({ success: false, error: "Database MySQL belum terhubung. Hubungkan MySQL terlebih dahulu." });
      }
      const conn = await mysqlPool.getConnection();
      const result = await syncLocalDataToMySQL(conn);
      conn.release();
      res.json({
        success: true,
        message: `Sinkronisasi selesai! Berhasil memindahkan ${result.circles} grup, ${result.posts} postingan, dan ${result.tasks} tugas ke MySQL.`,
        synced: result
      });
    } catch (err) {
      res.status(500).json({ success: false, error: "Gagal sinkronisasi data: " + err.message });
    }
  });
  app.get("/api/admin/metrics", (req, res) => {
    const mem = process.memoryUsage();
    const systemUptime = Math.floor((Date.now() - serverStartTime) / 1e3);
    const freeMem = import_os.default.freemem();
    const totalMem = import_os.default.totalmem();
    let totalUploadsCount = 0;
    let totalUploadsSizeBytes = 0;
    try {
      if (import_fs.default.existsSync(UPLOADS_DIR)) {
        const files = import_fs.default.readdirSync(UPLOADS_DIR);
        totalUploadsCount = files.length;
        for (const file of files) {
          const stats = import_fs.default.statSync(import_path.default.join(UPLOADS_DIR, file));
          totalUploadsSizeBytes += stats.size;
        }
      }
    } catch {
    }
    res.json({
      uptimeSeconds: systemUptime,
      totalRequests: totalRequestsHandled,
      activeSessions: sessionsMap.size,
      database: dbStatus,
      memory: {
        rssMb: Math.round(mem.rss / (1024 * 1024) * 10) / 10,
        heapTotalMb: Math.round(mem.heapTotal / (1024 * 1024) * 10) / 10,
        heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024) * 10) / 10,
        externalMb: Math.round(mem.external / (1024 * 1024) * 10) / 10,
        systemFreeMb: Math.round(freeMem / (1024 * 1024) * 10) / 10,
        systemTotalMb: Math.round(totalMem / (1024 * 1024) * 10) / 10,
        heapUsedPercent: Math.round(mem.heapUsed / mem.heapTotal * 100)
      },
      uploads: {
        totalFiles: totalUploadsCount,
        totalSizeBytes: totalUploadsSizeBytes,
        totalSizeMb: (totalUploadsSizeBytes / (1024 * 1024)).toFixed(2)
      },
      systemStatus: "HEALTHY",
      nodeVersion: process.version,
      platform: `${import_os.default.platform()} ${import_os.default.arch()} (${import_os.default.cpus().length} vCPUs)`,
      auditLogs: auditLogs.slice(0, 50)
    });
  });
  app.get("/api/admin/config", (req, res) => {
    res.json(appConfig);
  });
  app.get("/api/config", (req, res) => {
    res.json(appConfig);
  });
  app.put("/api/admin/config", async (req, res) => {
    try {
      const updates = req.body;
      appConfig = {
        ...appConfig,
        ...updates,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (mysqlPool && dbStatus.connected) {
        try {
          await mysqlPool.query(
            "INSERT INTO app_configs (config_key, config_value) VALUES ('main_app_profile', ?) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)",
            [JSON.stringify(appConfig)]
          );
        } catch (dbErr) {
          console.warn("Failed to update app_configs in MySQL:", dbErr.message);
        }
      }
      saveLocalDb();
      auditLogs.unshift({
        id: `log_${Date.now()}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        user: "Super Admin",
        action: `Updated application profile / configuration: ${Object.keys(updates).join(", ")}`,
        ip: req.ip || "127.0.0.1",
        status: "SUCCESS"
      });
      res.json({ success: true, config: appConfig });
    } catch (err) {
      res.status(500).json({ error: "Gagal memperbarui konfigurasi: " + err.message });
    }
  });
  app.post("/api/admin/config", async (req, res) => {
    try {
      const updates = req.body;
      appConfig = {
        ...appConfig,
        ...updates,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (mysqlPool && dbStatus.connected) {
        try {
          await mysqlPool.query(
            "INSERT INTO app_configs (config_key, config_value) VALUES ('main_app_profile', ?) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)",
            [JSON.stringify(appConfig)]
          );
        } catch (dbErr) {
          console.warn("Failed to update app_configs in MySQL:", dbErr.message);
        }
      }
      saveLocalDb();
      res.json({ success: true, config: appConfig });
    } catch (err) {
      res.status(500).json({ error: "Gagal memperbarui konfigurasi: " + err.message });
    }
  });
  app.post("/api/admin/clear-cache", (req, res) => {
    let expiredCount = 0;
    const now = Date.now();
    for (const [token, sess] of sessionsMap.entries()) {
      if (sess.expiresAt < now) {
        sessionsMap.delete(token);
        expiredCount++;
      }
    }
    if (global.gc) {
      try {
        global.gc();
      } catch {
      }
    }
    const memAfter = process.memoryUsage();
    auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      user: "Super Admin",
      action: `Manual cache purge & memory optimization (freed ${expiredCount} expired sessions)`,
      ip: req.ip || "127.0.0.1",
      status: "SUCCESS"
    });
    res.json({
      success: true,
      message: `Cache berhasil dibersihkan! ${expiredCount} sesi kedaluwarsa dihapus.`,
      currentHeapUsedMb: Math.round(memAfter.heapUsed / (1024 * 1024) * 10) / 10
    });
  });
  app.get("/api/admin/sql-export", (req, res) => {
    const dialect = req.query.dialect || "mysql";
    const sqlScript = generateSqlMigrationScript(dialect);
    if (req.query.download === "true") {
      res.setHeader("Content-Type", "application/sql");
      res.setHeader("Content-Disposition", `attachment; filename="lingkar_migration_${dialect}_${Date.now()}.sql"`);
      return res.send(sqlScript);
    }
    res.json({
      dialect,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      sql: sqlScript,
      tablesCount: 14,
      instructions: `Script SQL ini 100% kompatibel dan siap diimpor ke phpMyAdmin, MariaDB, MySQL 5.7 / 8.0, Cloud SQL, RDS, atau PlanetScale.`
    });
  });
  app.get("/api/posts", async (req, res) => {
    try {
      if (mysqlPool && dbStatus.connected) {
        const [rows] = await mysqlPool.query(`
          SELECT 
            p.id,
            p.circle_id as circleId,
            COALESCE(c.name, 'Umum') as circleName,
            p.author_id as authorId,
            u.name as author_name,
            u.avatar as author_avatar,
            u.role as author_role,
            u.title as author_title,
            p.title,
            p.summary,
            p.content,
            p.category,
            p.tags,
            p.likes_count as likesCount,
            p.reading_time as readingTime,
            p.points_bonus as pointsBonus,
            p.image_url as imageUrl,
            p.attachment_url as attachmentUrl,
            p.attachments,
            p.is_group_private as isGroupPrivate,
            p.visibility,
            DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i') as createdAt
          FROM posts p
          LEFT JOIN users u ON p.author_id = u.id
          LEFT JOIN circles c ON p.circle_id = c.id
          ORDER BY p.created_at DESC
        `);
        const [commentRows] = await mysqlPool.query(`
          SELECT 
            cm.id,
            cm.post_id as postId,
            cm.author_id as authorId,
            u.name as author_name,
            u.avatar as author_avatar,
            u.role as author_role,
            cm.parent_id as parentId,
            cm.content,
            cm.likes_count as likesCount,
            cm.mentions,
            cm.attachments,
            DATE_FORMAT(cm.created_at, '%Y-%m-%d %H:%i') as createdAt
          FROM comments cm
          LEFT JOIN users u ON cm.author_id = u.id
          ORDER BY cm.created_at DESC
        `);
        const commentsMap = /* @__PURE__ */ new Map();
        for (const c of commentRows || []) {
          const item = {
            id: c.id,
            authorId: c.authorId,
            authorName: c.author_name || "Anggota",
            authorAvatar: c.author_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            content: c.content,
            createdAt: c.createdAt || "Baru saja",
            likesCount: Number(c.likesCount) || 0,
            parentId: c.parentId || void 0,
            mentions: typeof c.mentions === "string" ? JSON.parse(c.mentions) : c.mentions || [],
            attachments: typeof c.attachments === "string" ? JSON.parse(c.attachments) : c.attachments || []
          };
          if (!commentsMap.has(c.postId)) {
            commentsMap.set(c.postId, []);
          }
          commentsMap.get(c.postId).push(item);
        }
        const formattedPosts = (rows || []).map((p) => ({
          id: p.id,
          circleId: p.circleId,
          circleName: p.circleName,
          isGroupPrivate: p.isGroupPrivate === 1 || p.isGroupPrivate === true,
          visibility: p.visibility || (p.isGroupPrivate ? "group_only" : "public"),
          author: {
            id: p.authorId,
            name: p.author_name || "Penulis",
            avatar: p.author_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            role: p.author_role || "Anggota",
            title: p.author_title || ""
          },
          title: p.title,
          summary: p.summary || "",
          content: p.content,
          category: p.category,
          tags: typeof p.tags === "string" ? JSON.parse(p.tags) : p.tags || [],
          likes: Number(p.likesCount) || 0,
          likesCount: Number(p.likesCount) || 0,
          likedByMe: false,
          commentsCount: (commentsMap.get(p.id) || []).length,
          readingTime: p.readingTime || "3 mnt",
          pointsBonus: Number(p.pointsBonus) || 25,
          imageUrl: p.imageUrl || void 0,
          attachmentUrl: p.attachmentUrl || void 0,
          attachments: typeof p.attachments === "string" ? JSON.parse(p.attachments) : p.attachments || [],
          comments: commentsMap.get(p.id) || [],
          createdAt: p.createdAt || "Baru saja"
        }));
        return res.json({ posts: formattedPosts });
      }
      res.json({ posts: inMemoryPosts });
    } catch (err) {
      console.error("Error fetching posts:", err);
      res.status(500).json({ error: "Gagal memuat postingan: " + err.message, posts: [] });
    }
  });
  app.post("/api/posts", async (req, res) => {
    try {
      const { title, summary, content, category, tags, circleId, attachments, imageUrl, isGroupPrivate, visibility, authorId } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: "Judul dan Konten postingan wajib diisi." });
      }
      let tokenAuthorId = authorId;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        const session = await getSessionFromToken(token);
        if (session && session.user) {
          tokenAuthorId = session.user.id;
        }
      }
      const postId = `post_${Date.now()}_${import_crypto.default.randomBytes(3).toString("hex")}`;
      const readingTime = `${Math.max(1, Math.ceil((content.length + (summary || "").length) / 350))} mnt`;
      const finalAuthorId = tokenAuthorId || "usr_1";
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query(`
          INSERT INTO posts (
            id, circle_id, author_id, title, summary, content, category, tags,
            likes_count, reading_time, points_bonus, image_url, attachments,
            is_group_private, visibility, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 25, ?, ?, ?, ?, NOW())
        `, [
          postId,
          circleId || null,
          finalAuthorId,
          title,
          summary || content.slice(0, 160) + "...",
          content,
          category || "Wawasan & Refleksi",
          JSON.stringify(tags || []),
          readingTime,
          imageUrl || null,
          JSON.stringify(attachments || []),
          isGroupPrivate ? 1 : 0,
          visibility || (isGroupPrivate ? "group_only" : "public")
        ]);
        try {
          await mysqlPool.query("UPDATE users SET points = points + 25 WHERE id = ?", [finalAuthorId]);
        } catch {
        }
        const [rows] = await mysqlPool.query(`
          SELECT 
            p.id, p.circle_id as circleId, COALESCE(c.name, 'Umum') as circleName,
            p.author_id as authorId, u.name as author_name, u.avatar as author_avatar, u.role as author_role, u.title as author_title,
            p.title, p.summary, p.content, p.category, p.tags, p.likes_count as likesCount,
            p.reading_time as readingTime, p.points_bonus as pointsBonus, p.image_url as imageUrl,
            p.attachments, p.is_group_private as isGroupPrivate, p.visibility,
            DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i') as createdAt
          FROM posts p
          LEFT JOIN users u ON p.author_id = u.id
          LEFT JOIN circles c ON p.circle_id = c.id
          WHERE p.id = ?
        `, [postId]);
        const created = rows[0];
        const postObj2 = {
          id: created.id,
          circleId: created.circleId,
          circleName: created.circleName,
          isGroupPrivate: created.isGroupPrivate === 1 || created.isGroupPrivate === true,
          visibility: created.visibility,
          author: {
            id: created.authorId,
            name: created.author_name || "Penulis",
            avatar: created.author_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            role: created.author_role || "Anggota",
            title: created.author_title || ""
          },
          title: created.title,
          summary: created.summary,
          content: created.content,
          category: created.category,
          tags: typeof created.tags === "string" ? JSON.parse(created.tags) : created.tags || [],
          likes: 0,
          likesCount: 0,
          likedByMe: false,
          commentsCount: 0,
          readingTime: created.readingTime,
          pointsBonus: 25,
          imageUrl: created.imageUrl || void 0,
          attachments: typeof created.attachments === "string" ? JSON.parse(created.attachments) : created.attachments || [],
          comments: [],
          createdAt: created.createdAt || "Baru saja"
        };
        return res.json({ success: true, post: postObj2 });
      }
      const author = dummyUsers.find((u) => u.id === finalAuthorId) || dummyUsers[2];
      const postObj = {
        id: postId,
        circleId: circleId || void 0,
        circleName: circleId ? "Lingkar Studi AI" : "Umum",
        isGroupPrivate: !!isGroupPrivate,
        visibility: visibility || (isGroupPrivate ? "group_only" : "public"),
        author: {
          id: author.id,
          name: author.name,
          avatar: author.avatar,
          role: author.role,
          title: author.title
        },
        title,
        summary: summary || content.slice(0, 160) + "...",
        content,
        category: category || "Wawasan & Refleksi",
        tags: tags || [],
        likes: 0,
        likesCount: 0,
        likedByMe: false,
        commentsCount: 0,
        readingTime,
        pointsBonus: 25,
        imageUrl: imageUrl || void 0,
        attachments: attachments || [],
        comments: [],
        createdAt: "Baru saja"
      };
      inMemoryPosts.unshift(postObj);
      res.json({ success: true, post: postObj });
    } catch (err) {
      console.error("Error creating post:", err);
      res.status(500).json({ error: "Gagal membuat postingan: " + err.message });
    }
  });
  app.post("/api/posts/:id/like", async (req, res) => {
    try {
      const postId = req.params.id;
      const { delta } = req.body;
      const change = Number(delta) || 1;
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query("UPDATE posts SET likes_count = GREATEST(0, likes_count + ?) WHERE id = ?", [change, postId]);
        return res.json({ success: true });
      }
      const post = inMemoryPosts.find((p) => p.id === postId);
      if (post) {
        post.likes = Math.max(0, (post.likes || 0) + change);
        post.likesCount = post.likes;
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Gagal like postingan: " + err.message });
    }
  });
  app.post("/api/posts/:id/comments", async (req, res) => {
    try {
      const postId = req.params.id;
      const { content, authorId, parentId, mentions, attachments } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Konten komentar wajib diisi." });
      }
      let tokenAuthorId = authorId;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        const session = await getSessionFromToken(token);
        if (session && session.user) {
          tokenAuthorId = session.user.id;
        }
      }
      const commentId = `cm_${Date.now()}_${import_crypto.default.randomBytes(2).toString("hex")}`;
      const finalAuthorId = tokenAuthorId || "usr_1";
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query(`
          INSERT INTO comments (id, post_id, author_id, parent_id, content, likes_count, mentions, attachments, created_at)
          VALUES (?, ?, ?, ?, ?, 0, ?, ?, NOW())
        `, [
          commentId,
          postId,
          finalAuthorId,
          parentId || null,
          content,
          JSON.stringify(mentions || []),
          JSON.stringify(attachments || [])
        ]);
        const [rows] = await mysqlPool.query(`
          SELECT cm.id, cm.post_id as postId, cm.author_id as authorId, u.name as author_name, u.avatar as author_avatar, u.role as author_role,
                 cm.parent_id as parentId, cm.content, cm.likes_count as likesCount, cm.mentions, cm.attachments,
                 DATE_FORMAT(cm.created_at, '%Y-%m-%d %H:%i') as createdAt
          FROM comments cm
          LEFT JOIN users u ON cm.author_id = u.id
          WHERE cm.id = ?
        `, [commentId]);
        const c = rows[0];
        const commentObj2 = {
          id: c.id,
          authorId: c.authorId,
          authorName: c.author_name || "Anggota",
          authorAvatar: c.author_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          content: c.content,
          createdAt: c.createdAt || "Baru saja",
          likesCount: 0,
          parentId: c.parentId || void 0,
          mentions: typeof c.mentions === "string" ? JSON.parse(c.mentions) : c.mentions || [],
          attachments: typeof c.attachments === "string" ? JSON.parse(c.attachments) : c.attachments || []
        };
        return res.json({ success: true, comment: commentObj2 });
      }
      const author = dummyUsers.find((u) => u.id === finalAuthorId) || dummyUsers[2];
      const commentObj = {
        id: commentId,
        authorId: author.id,
        authorName: author.name || "Anggota",
        authorAvatar: author.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        content,
        createdAt: "Baru saja",
        likesCount: 0,
        parentId,
        mentions: mentions || [],
        attachments: attachments || []
      };
      const post = inMemoryPosts.find((p) => p.id === postId);
      if (post) {
        post.comments = post.comments || [];
        post.comments.unshift(commentObj);
      }
      res.json({ success: true, comment: commentObj });
    } catch (err) {
      res.status(500).json({ error: "Gagal menambah komentar: " + err.message });
    }
  });
  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const postId = req.params.id;
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query("DELETE FROM comments WHERE post_id = ?", [postId]);
        await mysqlPool.query("DELETE FROM posts WHERE id = ?", [postId]);
        return res.json({ success: true });
      }
      inMemoryPosts = inMemoryPosts.filter((p) => p.id !== postId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Gagal menghapus postingan: " + err.message });
    }
  });
  app.delete("/api/posts/:postId/comments/:commentId", async (req, res) => {
    try {
      const { commentId } = req.params;
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query("DELETE FROM comments WHERE id = ? OR parent_id = ?", [commentId, commentId]);
        return res.json({ success: true });
      }
      for (const p of inMemoryPosts) {
        if (p.comments) {
          p.comments = p.comments.filter((c) => c.id !== commentId && c.parentId !== commentId);
        }
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Gagal menghapus komentar: " + err.message });
    }
  });
  app.get("/api/posts/categories", async (req, res) => {
    try {
      if (mysqlPool && dbStatus.connected) {
        const [rows] = await mysqlPool.query(`
          SELECT 
            c.id, c.name, c.description, c.icon, c.color, 
            c.is_default as isDefault, c.sort_order as sortOrder,
            DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i') as createdAt,
            COUNT(p.id) as postCount
          FROM post_categories c
          LEFT JOIN posts p ON p.category = c.name
          GROUP BY c.id, c.name, c.description, c.icon, c.color, c.is_default, c.sort_order, c.created_at
          ORDER BY c.is_default DESC, c.sort_order ASC, c.name ASC
        `);
        if (Array.isArray(rows) && rows.length > 0) {
          const categories2 = rows.map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description || "",
            icon: r.icon || "Tag",
            color: r.color || "teal",
            isDefault: r.isDefault === 1 || r.isDefault === true,
            sortOrder: Number(r.sortOrder) || 0,
            postCount: Number(r.postCount) || 0,
            createdAt: r.createdAt || ""
          }));
          return res.json({ success: true, categories: categories2 });
        }
      }
      const categories = inMemoryPostCategories.map((c) => {
        const postCount = inMemoryPosts.filter((p) => p.category === c.name).length;
        return {
          ...c,
          postCount
        };
      });
      res.json({ success: true, categories });
    } catch (err) {
      console.error("Error fetching post categories:", err);
      res.status(500).json({ success: false, error: "Gagal memuat kategori: " + err.message, categories: inMemoryPostCategories });
    }
  });
  app.post("/api/posts/categories", async (req, res) => {
    try {
      const { name, description, icon, color, isDefault } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: "Nama kategori wajib diisi." });
      }
      const trimmedName = name.trim();
      const catId = `cat_${Date.now()}_${import_crypto.default.randomBytes(2).toString("hex")}`;
      const finalDesc = (description || "").trim();
      const finalIcon = icon || "Tag";
      const finalColor = color || "teal";
      const finalDefault = !!isDefault;
      if (mysqlPool && dbStatus.connected) {
        if (finalDefault) {
          await mysqlPool.query("UPDATE post_categories SET is_default = 0");
        }
        await mysqlPool.query(`
          INSERT INTO post_categories (id, name, description, icon, color, is_default, sort_order, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 99, NOW())
        `, [catId, trimmedName, finalDesc, finalIcon, finalColor, finalDefault ? 1 : 0]);
        return res.json({
          success: true,
          message: `Kategori "${trimmedName}" berhasil ditambahkan!`,
          category: {
            id: catId,
            name: trimmedName,
            description: finalDesc,
            icon: finalIcon,
            color: finalColor,
            isDefault: finalDefault,
            sortOrder: 99,
            postCount: 0
          }
        });
      }
      if (finalDefault) {
        inMemoryPostCategories.forEach((c) => c.isDefault = false);
      }
      const newCat = {
        id: catId,
        name: trimmedName,
        description: finalDesc,
        icon: finalIcon,
        color: finalColor,
        isDefault: finalDefault,
        sortOrder: inMemoryPostCategories.length,
        postCount: 0
      };
      inMemoryPostCategories.push(newCat);
      saveLocalDb();
      res.json({ success: true, message: `Kategori "${trimmedName}" berhasil ditambahkan!`, category: newCat });
    } catch (err) {
      console.error("Error creating category:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ success: false, error: "Nama kategori tersebut sudah ada." });
      }
      res.status(500).json({ success: false, error: "Gagal membuat kategori: " + err.message });
    }
  });
  app.put("/api/posts/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, icon, color, isDefault } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: "Nama kategori wajib diisi." });
      }
      const trimmedName = name.trim();
      const finalDesc = (description || "").trim();
      const finalIcon = icon || "Tag";
      const finalColor = color || "teal";
      const finalDefault = !!isDefault;
      if (mysqlPool && dbStatus.connected) {
        const [oldRows] = await mysqlPool.query("SELECT name FROM post_categories WHERE id = ?", [id]);
        const oldName = oldRows?.[0]?.name;
        if (finalDefault) {
          await mysqlPool.query("UPDATE post_categories SET is_default = 0");
        }
        await mysqlPool.query(`
          UPDATE post_categories 
          SET name = ?, description = ?, icon = ?, color = ?, is_default = ?
          WHERE id = ?
        `, [trimmedName, finalDesc, finalIcon, finalColor, finalDefault ? 1 : 0, id]);
        if (oldName && oldName !== trimmedName) {
          await mysqlPool.query("UPDATE posts SET category = ? WHERE category = ?", [trimmedName, oldName]);
        }
        return res.json({
          success: true,
          message: `Kategori "${trimmedName}" berhasil diperbarui!`
        });
      }
      const cat = inMemoryPostCategories.find((c) => c.id === id);
      if (cat) {
        const oldName = cat.name;
        if (finalDefault) {
          inMemoryPostCategories.forEach((c) => c.isDefault = false);
        }
        cat.name = trimmedName;
        cat.description = finalDesc;
        cat.icon = finalIcon;
        cat.color = finalColor;
        cat.isDefault = finalDefault;
        if (oldName !== trimmedName) {
          inMemoryPosts.forEach((p) => {
            if (p.category === oldName) p.category = trimmedName;
          });
        }
        saveLocalDb();
      }
      res.json({ success: true, message: `Kategori "${trimmedName}" berhasil diperbarui!` });
    } catch (err) {
      console.error("Error updating category:", err);
      res.status(500).json({ success: false, error: "Gagal memperbarui kategori: " + err.message });
    }
  });
  app.delete("/api/posts/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (mysqlPool && dbStatus.connected) {
        const [targetRows] = await mysqlPool.query("SELECT name, is_default FROM post_categories WHERE id = ?", [id]);
        if (!targetRows || targetRows.length === 0) {
          return res.status(404).json({ success: false, error: "Kategori tidak ditemukan." });
        }
        const target = targetRows[0];
        if (target.is_default === 1 || target.name === "Umum") {
          return res.status(400).json({ success: false, error: 'Kategori default "Umum" tidak dapat dihapus.' });
        }
        await mysqlPool.query('UPDATE posts SET category = "Umum" WHERE category = ?', [target.name]);
        await mysqlPool.query("DELETE FROM post_categories WHERE id = ?", [id]);
        return res.json({ success: true, message: `Kategori "${target.name}" berhasil dihapus. Postingan dipindahkan ke "Umum".` });
      }
      const idx = inMemoryPostCategories.findIndex((c) => c.id === id);
      if (idx >= 0) {
        const target = inMemoryPostCategories[idx];
        if (target.isDefault || target.name === "Umum") {
          return res.status(400).json({ success: false, error: 'Kategori default "Umum" tidak dapat dihapus.' });
        }
        inMemoryPosts.forEach((p) => {
          if (p.category === target.name) p.category = "Umum";
        });
        inMemoryPostCategories.splice(idx, 1);
        saveLocalDb();
      }
      res.json({ success: true, message: "Kategori berhasil dihapus." });
    } catch (err) {
      console.error("Error deleting category:", err);
      res.status(500).json({ success: false, error: "Gagal menghapus kategori: " + err.message });
    }
  });
  app.post("/api/feedbacks", async (req, res) => {
    try {
      const { category, title, message, rating, userName, userEmail, userAvatar, userId } = req.body;
      if (!title || !message) {
        return res.status(400).json({ success: false, error: "Judul dan isi masukan wajib diisi." });
      }
      let finalUserId = userId;
      let finalUserName = userName || "Pengguna";
      let finalUserEmail = userEmail || "";
      let finalUserAvatar = userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        const session = await getSessionFromToken(token);
        if (session && session.user) {
          finalUserId = session.user.id;
          finalUserName = session.user.name || finalUserName;
          finalUserEmail = session.user.email || finalUserEmail;
          finalUserAvatar = session.user.avatar || finalUserAvatar;
        }
      }
      const feedbackId = `fb_${Date.now()}_${import_crypto.default.randomBytes(3).toString("hex")}`;
      const finalCategory = category || "Saran Fitur";
      const finalRating = Number(rating) || 5;
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query(`
          INSERT INTO app_feedbacks (
            id, user_id, user_name, user_email, user_avatar, category, title, message, rating, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `, [
          feedbackId,
          finalUserId || null,
          finalUserName,
          finalUserEmail || null,
          finalUserAvatar || null,
          finalCategory,
          title.trim(),
          message.trim(),
          finalRating
        ]);
        return res.json({
          success: true,
          message: "Terima kasih! Masukan Anda telah berhasil tersimpan dan akan segera ditinjau oleh Super Admin.",
          feedbackId
        });
      }
      const fbObj = {
        id: feedbackId,
        userId: finalUserId,
        userName: finalUserName,
        userEmail: finalUserEmail,
        userAvatar: finalUserAvatar,
        category: finalCategory,
        title: title.trim(),
        message: message.trim(),
        rating: finalRating,
        status: "pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      inMemoryFeedbacks.unshift(fbObj);
      saveLocalDb();
      res.json({
        success: true,
        message: "Terima kasih! Masukan Anda telah berhasil tersimpan dan akan segera ditinjau oleh Super Admin.",
        feedback: fbObj
      });
    } catch (err) {
      console.error("Error submitting feedback:", err);
      res.status(500).json({ success: false, error: "Gagal mengirim saran masukan: " + err.message });
    }
  });
  app.get("/api/feedbacks", async (req, res) => {
    try {
      if (mysqlPool && dbStatus.connected) {
        const [rows] = await mysqlPool.query(`
          SELECT 
            id, user_id as userId, user_name as userName, user_email as userEmail,
            user_avatar as userAvatar, category, title, message, rating, status,
            admin_notes as adminNotes, responded_by as respondedBy,
            DATE_FORMAT(responded_at, '%Y-%m-%d %H:%i') as respondedAt,
            DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as createdAt
          FROM app_feedbacks
          ORDER BY created_at DESC
        `);
        return res.json({ success: true, feedbacks: rows || [] });
      }
      res.json({ success: true, feedbacks: inMemoryFeedbacks });
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      res.status(500).json({ success: false, error: "Gagal memuat masukan: " + err.message, feedbacks: [] });
    }
  });
  app.patch("/api/feedbacks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminNotes, respondedBy } = req.body;
      if (mysqlPool && dbStatus.connected) {
        const updates = [];
        const params = [];
        if (status !== void 0) {
          updates.push("status = ?");
          params.push(status);
        }
        if (adminNotes !== void 0) {
          updates.push("admin_notes = ?");
          params.push(adminNotes);
        }
        if (respondedBy !== void 0) {
          updates.push("responded_by = ?");
          params.push(respondedBy);
          updates.push("responded_at = NOW()");
        }
        if (updates.length > 0) {
          params.push(id);
          await mysqlPool.query(`UPDATE app_feedbacks SET ${updates.join(", ")} WHERE id = ?`, params);
        }
        return res.json({ success: true, message: "Status masukan berhasil diperbarui!" });
      }
      const fb = inMemoryFeedbacks.find((f) => f.id === id);
      if (fb) {
        if (status !== void 0) fb.status = status;
        if (adminNotes !== void 0) fb.adminNotes = adminNotes;
        if (respondedBy !== void 0) {
          fb.respondedBy = respondedBy;
          fb.respondedAt = (/* @__PURE__ */ new Date()).toISOString();
        }
        saveLocalDb();
      }
      res.json({ success: true, message: "Status masukan berhasil diperbarui!" });
    } catch (err) {
      console.error("Error updating feedback:", err);
      res.status(500).json({ success: false, error: "Gagal memperbarui masukan: " + err.message });
    }
  });
  app.delete("/api/feedbacks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query("DELETE FROM app_feedbacks WHERE id = ?", [id]);
        return res.json({ success: true, message: "Masukan berhasil dihapus." });
      }
      inMemoryFeedbacks = inMemoryFeedbacks.filter((f) => f.id !== id);
      saveLocalDb();
      res.json({ success: true, message: "Masukan berhasil dihapus." });
    } catch (err) {
      console.error("Error deleting feedback:", err);
      res.status(500).json({ success: false, error: "Gagal menghapus masukan: " + err.message });
    }
  });
  app.get("/api/circles", async (req, res) => {
    try {
      if (mysqlPool && dbStatus.connected) {
        const [circleRows] = await mysqlPool.query(`
          SELECT 
            c.id, c.name, c.code, c.description, c.category, c.avatar, c.banner_gradient as bannerGradient,
            c.admin_id as adminId, c.kas_balance as kasBalance, c.tags, c.is_private as isPrivate, c.meeting_schedule as meetingSchedule
          FROM circles c
          ORDER BY c.created_at ASC
        `);
        const [memberRows] = await mysqlPool.query(`
          SELECT 
            cm.id, cm.circle_id as circleId, cm.user_id as userId, cm.role, cm.contribution_points as contributionPoints,
            u.name as userName, u.avatar as userAvatar, u.title as userTitle, u.email as userEmail
          FROM circle_members cm
          LEFT JOIN users u ON cm.user_id = u.id
          ORDER BY cm.joined_at ASC
        `);
        const membersByCircle = /* @__PURE__ */ new Map();
        for (const m of memberRows || []) {
          if (!membersByCircle.has(m.circleId)) {
            membersByCircle.set(m.circleId, []);
          }
          membersByCircle.get(m.circleId).push({
            id: m.userId,
            name: m.userName || "Anggota",
            role: m.role || "Anggota",
            avatar: m.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            contributionPoints: Number(m.contributionPoints) || 0,
            title: m.userTitle || "",
            email: m.userEmail || ""
          });
        }
        const formattedCircles = (circleRows || []).map((c) => ({
          id: c.id,
          name: c.name,
          code: c.code,
          description: c.description || "",
          category: c.category,
          avatar: c.avatar || void 0,
          bannerGradient: c.bannerGradient || "from-teal-600 to-emerald-800",
          adminId: c.adminId || "usr_superadmin",
          kasBalance: Number(c.kasBalance) || 0,
          tags: typeof c.tags === "string" ? JSON.parse(c.tags) : c.tags || [],
          isPrivate: c.isPrivate === 1 || c.isPrivate === true,
          meetingSchedule: c.meetingSchedule || void 0,
          members: membersByCircle.get(c.id) || [],
          memberCount: (membersByCircle.get(c.id) || []).length
        }));
        return res.json({ circles: formattedCircles });
      }
      res.json({ circles: inMemoryCircles });
    } catch (err) {
      console.error("Error fetching circles:", err);
      res.status(500).json({ error: "Gagal memuat data grup: " + err.message, circles: [] });
    }
  });
  app.post("/api/circles", async (req, res) => {
    try {
      const { name, code, description, category, bannerGradient, isPrivate, meetingSchedule, adminId, creatorName, creatorAvatar, avatar, tags } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Nama lingkar/grup wajib diisi." });
      }
      const circleId = `circle_${Date.now()}_${import_crypto.default.randomBytes(2).toString("hex")}`;
      const circleCode = code || `${name.slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const finalAdminId = adminId || "usr_1";
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query(`
          INSERT INTO circles (id, name, code, description, category, avatar, banner_gradient, admin_id, kas_balance, tags, is_private, meeting_schedule, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, NOW())
        `, [
          circleId,
          name,
          circleCode,
          description || "",
          category || "Komunitas Umum",
          avatar || "",
          bannerGradient || "from-teal-600 to-emerald-800",
          finalAdminId,
          JSON.stringify(tags || []),
          isPrivate ? 1 : 0,
          meetingSchedule || null
        ]);
        await mysqlPool.query(`
          INSERT INTO circle_members (id, circle_id, user_id, role, contribution_points, joined_at)
          VALUES (?, ?, ?, 'Ketua', 100, NOW())
        `, [`cm_${Date.now()}`, circleId, finalAdminId]);
        const [created] = await mysqlPool.query("SELECT * FROM circles WHERE id = ?", [circleId]);
        const c = created[0];
        const newCircle2 = {
          id: c.id,
          name: c.name,
          code: c.code,
          description: c.description,
          category: c.category,
          bannerGradient: c.banner_gradient,
          adminId: c.admin_id,
          kasBalance: 0,
          tags: [],
          isPrivate: c.is_private === 1,
          meetingSchedule: c.meeting_schedule,
          members: [{
            id: finalAdminId,
            name: creatorName || "Ketua Komunitas",
            role: "Ketua",
            avatar: creatorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            contributionPoints: 100
          }],
          memberCount: 1
        };
        return res.json({ success: true, circle: newCircle2 });
      }
      const newCircle = {
        id: circleId,
        name,
        code: circleCode,
        description: description || "",
        category: category || "Komunitas Umum",
        bannerGradient: bannerGradient || "from-teal-600 to-emerald-800",
        adminId: finalAdminId,
        kasBalance: 0,
        tags: [],
        isPrivate: !!isPrivate,
        meetingSchedule,
        members: [{
          id: finalAdminId,
          name: creatorName || "Ketua Komunitas",
          role: "Ketua",
          avatar: creatorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          contributionPoints: 100
        }],
        memberCount: 1
      };
      inMemoryCircles.push(newCircle);
      const userRec = dummyUsers.find((u) => u.id === finalAdminId);
      if (userRec) {
        if (!Array.isArray(userRec.joinedCircleIds)) {
          userRec.joinedCircleIds = [];
        }
        if (!userRec.joinedCircleIds.includes(circleId)) {
          userRec.joinedCircleIds.push(circleId);
        }
      }
      await updateUserSessionsJoinedCircles(finalAdminId);
      res.json({ success: true, circle: newCircle });
    } catch (err) {
      console.error("Error creating circle:", err);
      res.status(500).json({ error: "Gagal membuat grup lingkar: " + err.message });
    }
  });
  app.post("/api/circles/join-by-code", async (req, res) => {
    try {
      let { code, userId, userName, userAvatar, userTitle } = req.body;
      if (!code) {
        return res.status(400).json({ error: "Kode grup wajib disertakan." });
      }
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const session = sessionsMap.get(token);
        if (session && session.user) {
          if (!userId) userId = session.user.id;
          if (!userName) userName = session.user.name;
          if (!userAvatar) userAvatar = session.user.avatar;
          if (!userTitle) userTitle = session.user.title;
        }
      }
      if (!userId) {
        userId = "usr_1";
        userName = userName || "Pengguna Lingkar";
      }
      if (mysqlPool && dbStatus.connected) {
        const [circles] = await mysqlPool.query("SELECT * FROM circles WHERE UPPER(code) = UPPER(?)", [code.trim()]);
        if (!circles || circles.length === 0) {
          return res.status(404).json({ error: "Grup dengan kode rahasia tersebut tidak ditemukan." });
        }
        const circle2 = circles[0];
        const [existing] = await mysqlPool.query("SELECT * FROM circle_members WHERE circle_id = ? AND user_id = ?", [circle2.id, userId]);
        if (!existing || existing.length === 0) {
          await mysqlPool.query(`
            INSERT INTO circle_members (id, circle_id, user_id, role, contribution_points, joined_at)
            VALUES (?, ?, ?, 'Anggota', 50, NOW())
          `, [`cm_${Date.now()}_${import_crypto.default.randomBytes(2).toString("hex")}`, circle2.id, userId]);
        }
        const [memberRows] = await mysqlPool.query(`
          SELECT 
            cm.id, cm.circle_id as circleId, cm.user_id as userId, cm.role, cm.contribution_points as contributionPoints,
            u.name as userName, u.avatar as userAvatar, u.title as userTitle, u.email as userEmail
          FROM circle_members cm
          LEFT JOIN users u ON cm.user_id = u.id
          WHERE cm.circle_id = ?
          ORDER BY cm.joined_at ASC
        `, [circle2.id]);
        const members = (memberRows || []).map((m) => ({
          id: m.userId,
          name: m.userName || "Anggota",
          role: m.role || "Anggota",
          avatar: m.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          contributionPoints: Number(m.contributionPoints) || 0,
          title: m.userTitle || "",
          email: m.userEmail || ""
        }));
        const formattedCircle = {
          id: circle2.id,
          name: circle2.name,
          code: circle2.code,
          description: circle2.description || "",
          category: circle2.category,
          avatar: circle2.avatar || void 0,
          bannerGradient: circle2.banner_gradient || "from-teal-600 to-emerald-800",
          adminId: circle2.admin_id || "usr_superadmin",
          kasBalance: Number(circle2.kas_balance) || 0,
          tags: typeof circle2.tags === "string" ? JSON.parse(circle2.tags) : circle2.tags || [],
          isPrivate: circle2.is_private === 1 || circle2.is_private === true,
          meetingSchedule: circle2.meeting_schedule || void 0,
          members,
          memberCount: members.length
        };
        return res.json({ success: true, message: `Selamat bergabung di ${circle2.name}!`, circle: formattedCircle, circleId: circle2.id });
      }
      const circle = inMemoryCircles.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
      if (!circle) {
        return res.status(404).json({ error: "Grup dengan kode rahasia tersebut tidak ditemukan." });
      }
      if (!circle.members) circle.members = [];
      if (!circle.members.some((m) => m.id === userId)) {
        circle.members.push({
          id: userId,
          name: userName || "Anggota Baru",
          role: "Anggota",
          avatar: userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          contributionPoints: 50,
          title: userTitle || ""
        });
        circle.memberCount = circle.members.length;
      }
      const userRec = dummyUsers.find((u) => u.id === userId);
      if (userRec) {
        if (!Array.isArray(userRec.joinedCircleIds)) {
          userRec.joinedCircleIds = [];
        }
        if (!userRec.joinedCircleIds.includes(circle.id)) {
          userRec.joinedCircleIds.push(circle.id);
        }
      }
      await updateUserSessionsJoinedCircles(userId);
      res.json({ success: true, message: `Selamat bergabung di ${circle.name}!`, circle, circleId: circle.id });
    } catch (err) {
      res.status(500).json({ error: "Gagal bergabung: " + err.message });
    }
  });
  app.post("/api/circles/:id/leave", async (req, res) => {
    try {
      const circleId = req.params.id;
      const { userId } = req.body;
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query("DELETE FROM circle_members WHERE circle_id = ? AND user_id = ?", [circleId, userId]);
        return res.json({ success: true });
      }
      const circle = inMemoryCircles.find((c) => c.id === circleId);
      if (circle) {
        circle.members = circle.members.filter((m) => m.id !== userId);
        circle.memberCount = circle.members.length;
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Gagal keluar dari grup: " + err.message });
    }
  });
  app.post("/api/circles/:id/members", async (req, res) => {
    try {
      const circleId = req.params.id;
      const { userId, role, name, avatar } = req.body;
      const finalRole = role || "Anggota";
      if (mysqlPool && dbStatus.connected) {
        const [existing] = await mysqlPool.query(
          "SELECT id FROM circle_members WHERE circle_id = ? AND user_id = ?",
          [circleId, userId]
        );
        if (existing && existing.length > 0) {
          return res.json({ success: true, message: "Sudah bergabung" });
        }
        const cmId = `cm_${Date.now()}_${import_crypto.default.randomBytes(2).toString("hex")}`;
        await mysqlPool.query(`
          INSERT INTO circle_members (id, circle_id, user_id, role, contribution_points, joined_at)
          VALUES (?, ?, ?, ?, 300, NOW())
        `, [cmId, circleId, userId, finalRole]);
        const [userRows] = await mysqlPool.query(
          "SELECT name, avatar, title, email FROM users WHERE id = ?",
          [userId]
        );
        const u = userRows?.[0] || {};
        await updateUserSessionsJoinedCircles(userId);
        return res.json({
          success: true,
          member: {
            id: userId,
            name: u.name || name || "Anggota",
            role: finalRole,
            avatar: u.avatar || avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            contributionPoints: 300,
            title: u.title || "",
            email: u.email || ""
          }
        });
      }
      const circle = inMemoryCircles.find((c) => c.id === circleId);
      if (circle) {
        if (!circle.members) circle.members = [];
        const exists = circle.members.some((m) => m.id === userId);
        if (!exists) {
          const newMember = {
            id: userId,
            name: name || "Anggota Baru",
            avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            role: finalRole,
            joinedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            contributionPoints: 300
          };
          circle.members.push(newMember);
          circle.memberCount = circle.members.length;
        }
      }
      const userRec = dummyUsers.find((u) => u.id === userId);
      if (userRec) {
        if (!Array.isArray(userRec.joinedCircleIds)) {
          userRec.joinedCircleIds = [];
        }
        if (!userRec.joinedCircleIds.includes(circleId)) {
          userRec.joinedCircleIds.push(circleId);
        }
      }
      await updateUserSessionsJoinedCircles(userId);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to add member:", err);
      res.status(500).json({ error: "Gagal menambah anggota: " + err.message });
    }
  });
  app.put("/api/circles/:id/members/:memberId", async (req, res) => {
    try {
      const { id: circleId, memberId } = req.params;
      const { role } = req.body;
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query(
          "UPDATE circle_members SET role = ? WHERE circle_id = ? AND user_id = ?",
          [role, circleId, memberId]
        );
        return res.json({ success: true });
      }
      const circle = inMemoryCircles.find((c) => c.id === circleId);
      if (circle) {
        const m = circle.members?.find((member) => member.id === memberId);
        if (m) {
          m.role = role;
        }
      }
      saveLocalDb();
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to update member role:", err);
      res.status(500).json({ error: "Gagal memperbarui peran anggota: " + err.message });
    }
  });
  app.delete("/api/circles/:id/members/:memberId", async (req, res) => {
    try {
      const { id: circleId, memberId } = req.params;
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query(
          "DELETE FROM circle_members WHERE circle_id = ? AND user_id = ?",
          [circleId, memberId]
        );
        await updateUserSessionsJoinedCircles(memberId);
        return res.json({ success: true });
      }
      const circle = inMemoryCircles.find((c) => c.id === circleId);
      if (circle) {
        circle.members = circle.members?.filter((member) => member.id !== memberId) || [];
        circle.memberCount = circle.members.length;
      }
      const userRec = dummyUsers.find((u) => u.id === memberId);
      if (userRec && Array.isArray(userRec.joinedCircleIds)) {
        userRec.joinedCircleIds = userRec.joinedCircleIds.filter((id) => id !== circleId);
      }
      await updateUserSessionsJoinedCircles(memberId);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to delete member:", err);
      res.status(500).json({ error: "Gagal menghapus anggota: " + err.message });
    }
  });
  app.put("/api/circles/:id", async (req, res) => {
    try {
      const circleId = req.params.id;
      const { name, description, category, avatar, bannerGradient, tags, isPrivate, meetingSchedule } = req.body;
      if (mysqlPool && dbStatus.connected) {
        let updateQuery = "UPDATE circles SET ";
        const updateValues = [];
        if (name !== void 0) {
          updateQuery += "name = ?, ";
          updateValues.push(name);
        }
        if (description !== void 0) {
          updateQuery += "description = ?, ";
          updateValues.push(description);
        }
        if (category !== void 0) {
          updateQuery += "category = ?, ";
          updateValues.push(category);
        }
        if (avatar !== void 0) {
          updateQuery += "avatar = ?, ";
          updateValues.push(avatar);
        }
        if (bannerGradient !== void 0) {
          updateQuery += "banner_gradient = ?, ";
          updateValues.push(bannerGradient);
        }
        if (tags !== void 0) {
          updateQuery += "tags = ?, ";
          updateValues.push(JSON.stringify(tags));
        }
        if (isPrivate !== void 0) {
          updateQuery += "is_private = ?, ";
          updateValues.push(isPrivate ? 1 : 0);
        }
        if (meetingSchedule !== void 0) {
          updateQuery += "meeting_schedule = ?, ";
          updateValues.push(meetingSchedule);
        }
        updateQuery = updateQuery.slice(0, -2);
        updateQuery += " WHERE id = ?";
        updateValues.push(circleId);
        if (updateValues.length > 1) {
          await mysqlPool.query(updateQuery, updateValues);
        }
      }
      const circle = inMemoryCircles.find((c) => c.id === circleId);
      if (circle) {
        if (name !== void 0) circle.name = name;
        if (description !== void 0) circle.description = description;
        if (category !== void 0) circle.category = category;
        if (avatar !== void 0) circle.avatar = avatar;
        if (bannerGradient !== void 0) circle.bannerGradient = bannerGradient;
        if (tags !== void 0) circle.tags = tags;
        if (isPrivate !== void 0) circle.isPrivate = isPrivate;
        if (meetingSchedule !== void 0) circle.meetingSchedule = meetingSchedule;
      }
      saveLocalDb();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Gagal memperbarui grup: " + err.message });
    }
  });
  app.delete("/api/circles/:id", async (req, res) => {
    try {
      const circleId = req.params.id;
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query("DELETE FROM circle_members WHERE circle_id = ?", [circleId]);
        await mysqlPool.query("DELETE FROM tasks WHERE circle_id = ?", [circleId]);
        await mysqlPool.query("DELETE FROM posts WHERE circle_id = ?", [circleId]);
        await mysqlPool.query("DELETE FROM financial_transactions WHERE circle_id = ?", [circleId]);
        await mysqlPool.query("DELETE FROM circles WHERE id = ?", [circleId]);
      }
      inMemoryCircles = inMemoryCircles.filter((c) => c.id !== circleId);
      saveLocalDb();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Gagal menghapus grup: " + err.message });
    }
  });
  app.get("/api/tasks", async (req, res) => {
    try {
      if (mysqlPool && dbStatus.connected) {
        const [taskRows] = await mysqlPool.query(`
          SELECT 
            t.id, t.circle_id as circleId, COALESCE(c.name, 'Umum') as circleName,
            t.title, t.description, t.deadline, t.priority, t.status, t.progress,
            t.category, t.points_reward as pointsReward, t.color_theme as colorTheme,
            t.frequency, t.streak_days as streakDays, t.is_group_goal as isGroupGoal,
            t.collaborative_notes as collaborativeNotes, t.assignees, t.synced_calendars as syncedCalendars,
            DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i') as createdAt
          FROM tasks t
          LEFT JOIN circles c ON t.circle_id = c.id
          ORDER BY t.created_at DESC
        `);
        const [subtaskRows] = await mysqlPool.query(`
          SELECT 
            s.id, s.task_id as taskId, s.title, s.completed, s.priority, s.assigned_to as assignedTo,
            s.type, s.completion_note as completionNote, s.note_placeholder as notePlaceholder,
            s.target_value as targetValue, s.current_value as currentValue, s.unit, s.options,
            s.selected_option as selectedOption, s.sort_order as sortOrder
          FROM subtasks s
          ORDER BY s.sort_order ASC, s.id ASC
        `);
        const subtasksByTask = /* @__PURE__ */ new Map();
        for (const s of subtaskRows || []) {
          if (!subtasksByTask.has(s.taskId)) {
            subtasksByTask.set(s.taskId, []);
          }
          subtasksByTask.get(s.taskId).push({
            id: s.id,
            title: s.title,
            completed: s.completed === 1 || s.completed === true,
            priority: s.priority || "Medium",
            assignedTo: s.assignedTo || void 0,
            type: s.type || "checkbox",
            completionNote: s.completionNote || void 0,
            notePlaceholder: s.notePlaceholder || void 0,
            targetValue: s.targetValue !== null ? Number(s.targetValue) : void 0,
            currentValue: Number(s.currentValue) || 0,
            unit: s.unit || void 0,
            options: typeof s.options === "string" ? JSON.parse(s.options) : s.options || void 0,
            selectedOption: s.selectedOption || void 0
          });
        }
        const formattedTasks = (taskRows || []).map((t) => ({
          id: t.id,
          circleId: t.circleId,
          circleName: t.circleName,
          title: t.title,
          description: t.description || "",
          deadline: t.deadline,
          priority: t.priority || "Medium",
          status: t.status || "todo",
          progress: Number(t.progress) || 0,
          category: t.category || "Target Bersama",
          pointsReward: Number(t.pointsReward) || 50,
          colorTheme: t.colorTheme || "mint",
          frequency: t.frequency || "once",
          streakDays: Number(t.streakDays) || 0,
          isGroupGoal: t.isGroupGoal === 1 || t.isGroupGoal === true,
          collaborativeNotes: t.collaborativeNotes || void 0,
          assignees: typeof t.assignees === "string" ? JSON.parse(t.assignees) : t.assignees || [],
          subtasks: subtasksByTask.get(t.id) || [],
          syncedCalendars: typeof t.syncedCalendars === "string" ? JSON.parse(t.syncedCalendars) : t.syncedCalendars || []
        }));
        return res.json({ tasks: formattedTasks });
      }
      res.json({ tasks: inMemoryTasks });
    } catch (err) {
      console.error("Error fetching tasks:", err);
      res.status(500).json({ error: "Gagal memuat tugas: " + err.message, tasks: [] });
    }
  });
  app.post("/api/tasks", async (req, res) => {
    try {
      const { circleId, title, description, deadline, priority, category, pointsReward, colorTheme, frequency, isGroupGoal, subtasks, assignees } = req.body;
      if (!title) {
        return res.status(400).json({ error: "Judul target/tugas wajib diisi." });
      }
      const taskId = `task_${Date.now()}_${import_crypto.default.randomBytes(2).toString("hex")}`;
      const finalCircleId = circleId || "circle_1";
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query(`
          INSERT INTO tasks (
            id, circle_id, title, description, deadline, priority, status, progress, category,
            points_reward, color_theme, frequency, streak_days, is_group_goal, assignees, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'todo', 0, ?, ?, ?, ?, 0, ?, ?, NOW())
        `, [
          taskId,
          finalCircleId,
          title,
          description || "",
          deadline || "Minggu Depan",
          priority || "Medium",
          category || "Target Bersama",
          pointsReward || 50,
          colorTheme || "mint",
          frequency || "once",
          isGroupGoal ? 1 : 0,
          JSON.stringify(assignees || [])
        ]);
        if (Array.isArray(subtasks) && subtasks.length > 0) {
          for (let i = 0; i < subtasks.length; i++) {
            const st = subtasks[i];
            const stId = st.id || `st_${Date.now()}_${i}`;
            await mysqlPool.query(`
              INSERT INTO subtasks (id, task_id, title, completed, priority, assigned_to, type, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              stId,
              taskId,
              st.title || "Langkah baru",
              st.completed ? 1 : 0,
              st.priority || "Medium",
              st.assignedTo || null,
              st.type || "checkbox",
              i
            ]);
          }
        }
        const [circleRows] = await mysqlPool.query("SELECT name FROM circles WHERE id = ?", [finalCircleId]);
        const circleName = circleRows[0]?.name || "Grup Komunitas";
        const taskObj2 = {
          id: taskId,
          circleId: finalCircleId,
          circleName,
          title,
          description: description || "",
          deadline: deadline || "Minggu Depan",
          priority: priority || "Medium",
          status: "todo",
          progress: 0,
          category: category || "Target Bersama",
          pointsReward: pointsReward || 50,
          colorTheme: colorTheme || "mint",
          frequency: frequency || "once",
          streakDays: 0,
          isGroupGoal: !!isGroupGoal,
          assignees: assignees || [],
          subtasks: (subtasks || []).map((s, idx) => ({
            id: s.id || `st_${Date.now()}_${idx}`,
            title: s.title,
            completed: !!s.completed,
            priority: s.priority || "Medium",
            assignedTo: s.assignedTo || void 0,
            type: s.type || "checkbox"
          }))
        };
        return res.json({ success: true, task: taskObj2 });
      }
      const taskObj = {
        id: taskId,
        circleId: finalCircleId,
        circleName: "Lingkar Studi AI",
        title,
        description: description || "",
        deadline: deadline || "Minggu Depan",
        priority: priority || "Medium",
        status: "todo",
        progress: 0,
        category: category || "Target Bersama",
        pointsReward: pointsReward || 50,
        colorTheme: colorTheme || "mint",
        frequency: frequency || "once",
        streakDays: 0,
        isGroupGoal: !!isGroupGoal,
        assignees: assignees || [],
        subtasks: subtasks || []
      };
      inMemoryTasks.unshift(taskObj);
      res.json({ success: true, task: taskObj });
    } catch (err) {
      console.error("Error creating task:", err);
      res.status(500).json({ error: "Gagal membuat tugas: " + err.message });
    }
  });
  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = req.params.id;
      const updates = req.body;
      if (mysqlPool && dbStatus.connected) {
        let updateParts = [];
        let updateVals = [];
        if (updates.status !== void 0) {
          updateParts.push("status = ?");
          updateVals.push(updates.status);
        }
        if (updates.progress !== void 0) {
          updateParts.push("progress = ?");
          updateVals.push(Number(updates.progress) || 0);
        }
        if (updates.title !== void 0) {
          updateParts.push("title = ?");
          updateVals.push(updates.title);
        }
        if (updates.description !== void 0) {
          updateParts.push("description = ?");
          updateVals.push(updates.description);
        }
        if (updates.deadline !== void 0) {
          updateParts.push("deadline = ?");
          updateVals.push(updates.deadline);
        }
        if (updates.priority !== void 0) {
          updateParts.push("priority = ?");
          updateVals.push(updates.priority);
        }
        if (updates.category !== void 0) {
          updateParts.push("category = ?");
          updateVals.push(updates.category);
        }
        if (updates.pointsReward !== void 0) {
          updateParts.push("points_reward = ?");
          updateVals.push(Number(updates.pointsReward) || 50);
        }
        if (updates.streakDays !== void 0) {
          updateParts.push("streak_days = ?");
          updateVals.push(Number(updates.streakDays) || 0);
        }
        if (updates.collaborativeNotes !== void 0) {
          updateParts.push("collaborative_notes = ?");
          updateVals.push(updates.collaborativeNotes);
        }
        if (updates.assignees !== void 0) {
          updateParts.push("assignees = ?");
          updateVals.push(JSON.stringify(updates.assignees));
        }
        if (updateParts.length > 0) {
          updateVals.push(taskId);
          await mysqlPool.query(`UPDATE tasks SET ${updateParts.join(", ")} WHERE id = ?`, updateVals);
        }
        if (Array.isArray(updates.subtasks)) {
          for (const st of updates.subtasks) {
            if (st.id) {
              const [existingSt] = await mysqlPool.query("SELECT id FROM subtasks WHERE id = ?", [st.id]);
              if (existingSt && existingSt.length > 0) {
                await mysqlPool.query(`
                  UPDATE subtasks SET 
                    completed = ?, title = ?, priority = ?, assigned_to = ?, type = ?,
                    completion_note = ?, current_value = ?, selected_option = ?
                  WHERE id = ? AND task_id = ?
                `, [
                  st.completed ? 1 : 0,
                  st.title || "Langkah",
                  st.priority || "Medium",
                  st.assignedTo || null,
                  st.type || "checkbox",
                  st.completionNote || null,
                  st.currentValue !== void 0 ? st.currentValue : 0,
                  st.selectedOption || null,
                  st.id,
                  taskId
                ]);
              } else {
                await mysqlPool.query(`
                  INSERT INTO subtasks (id, task_id, title, completed, priority, assigned_to, type, completion_note, current_value, selected_option, sort_order)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 99)
                `, [
                  st.id,
                  taskId,
                  st.title || "Langkah",
                  st.completed ? 1 : 0,
                  st.priority || "Medium",
                  st.assignedTo || null,
                  st.type || "checkbox",
                  st.completionNote || null,
                  st.currentValue !== void 0 ? st.currentValue : 0,
                  st.selectedOption || null
                ]);
              }
            }
          }
        }
        return res.json({ success: true });
      }
      const task = inMemoryTasks.find((t) => t.id === taskId);
      if (task) {
        Object.assign(task, updates);
        if (Array.isArray(updates.subtasks)) {
          task.subtasks = updates.subtasks;
        }
      }
      saveLocalDb();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Gagal memperbarui tugas: " + err.message });
    }
  });
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = req.params.id;
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query("DELETE FROM subtasks WHERE task_id = ?", [taskId]);
        await mysqlPool.query("DELETE FROM tasks WHERE id = ?", [taskId]);
        return res.json({ success: true });
      }
      inMemoryTasks = inMemoryTasks.filter((t) => t.id !== taskId);
      saveLocalDb();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Gagal menghapus tugas: " + err.message });
    }
  });
  app.post("/api/tasks/:id/subtasks/:subtaskId/toggle", async (req, res) => {
    try {
      const { id: taskId, subtaskId } = req.params;
      const { note } = req.body || {};
      if (mysqlPool && dbStatus.connected) {
        if (note !== void 0) {
          await mysqlPool.query("UPDATE subtasks SET completed = 1 - completed, completion_note = ? WHERE id = ? AND task_id = ?", [note, subtaskId, taskId]);
        } else {
          await mysqlPool.query("UPDATE subtasks SET completed = 1 - completed WHERE id = ? AND task_id = ?", [subtaskId, taskId]);
        }
        const [stRows] = await mysqlPool.query("SELECT completed FROM subtasks WHERE task_id = ?", [taskId]);
        if (stRows && stRows.length > 0) {
          const doneCount = stRows.filter((r) => r.completed === 1).length;
          const prog = Math.round(doneCount / stRows.length * 100);
          const newStatus = prog === 100 ? "done" : prog > 0 ? "ongoing" : "todo";
          await mysqlPool.query("UPDATE tasks SET progress = ?, status = ? WHERE id = ?", [prog, newStatus, taskId]);
        }
        return res.json({ success: true });
      }
      const task = inMemoryTasks.find((t) => t.id === taskId);
      if (task) {
        const sub = task.subtasks?.find((s) => s.id === subtaskId);
        if (sub) {
          sub.completed = !sub.completed;
          if (note !== void 0) sub.completionNote = note;
          const done = task.subtasks.filter((s) => s.completed).length;
          task.progress = Math.round(done / task.subtasks.length * 100);
          task.status = task.progress === 100 ? "done" : task.progress > 0 ? "ongoing" : "todo";
        }
      }
      saveLocalDb();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Gagal toggle subtask: " + err.message });
    }
  });
  app.put("/api/tasks/:id/subtasks/:subtaskId", async (req, res) => {
    try {
      const { id: taskId, subtaskId } = req.params;
      const { completed, currentValue, selectedOption, completionNote, assignedTo, title, priority } = req.body;
      if (mysqlPool && dbStatus.connected) {
        let parts = [];
        let vals = [];
        if (completed !== void 0) {
          parts.push("completed = ?");
          vals.push(completed ? 1 : 0);
        }
        if (currentValue !== void 0) {
          parts.push("current_value = ?");
          vals.push(Number(currentValue) || 0);
        }
        if (selectedOption !== void 0) {
          parts.push("selected_option = ?");
          vals.push(selectedOption);
        }
        if (completionNote !== void 0) {
          parts.push("completion_note = ?");
          vals.push(completionNote);
        }
        if (assignedTo !== void 0) {
          parts.push("assigned_to = ?");
          vals.push(assignedTo);
        }
        if (title !== void 0) {
          parts.push("title = ?");
          vals.push(title);
        }
        if (priority !== void 0) {
          parts.push("priority = ?");
          vals.push(priority);
        }
        if (parts.length > 0) {
          vals.push(subtaskId, taskId);
          await mysqlPool.query(`UPDATE subtasks SET ${parts.join(", ")} WHERE id = ? AND task_id = ?`, vals);
        }
        const [stRows] = await mysqlPool.query("SELECT completed FROM subtasks WHERE task_id = ?", [taskId]);
        if (stRows && stRows.length > 0) {
          const doneCount = stRows.filter((r) => r.completed === 1).length;
          const prog = Math.round(doneCount / stRows.length * 100);
          const newStatus = prog === 100 ? "done" : prog > 0 ? "ongoing" : "todo";
          await mysqlPool.query("UPDATE tasks SET progress = ?, status = ? WHERE id = ?", [prog, newStatus, taskId]);
        }
        return res.json({ success: true });
      }
      const task = inMemoryTasks.find((t) => t.id === taskId);
      if (task) {
        const sub = task.subtasks?.find((s) => s.id === subtaskId);
        if (sub) {
          if (completed !== void 0) sub.completed = !!completed;
          if (currentValue !== void 0) sub.currentValue = Number(currentValue) || 0;
          if (selectedOption !== void 0) sub.selectedOption = selectedOption;
          if (completionNote !== void 0) sub.completionNote = completionNote;
          if (assignedTo !== void 0) sub.assignedTo = assignedTo;
          if (title !== void 0) sub.title = title;
          if (priority !== void 0) sub.priority = priority;
          const done = task.subtasks.filter((s) => s.completed).length;
          task.progress = Math.round(done / task.subtasks.length * 100);
          task.status = task.progress === 100 ? "done" : task.progress > 0 ? "ongoing" : "todo";
        }
      }
      saveLocalDb();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Gagal update subtask: " + err.message });
    }
  });
  app.post("/api/tasks/:id/subtasks", async (req, res) => {
    try {
      const taskId = req.params.id;
      const { title, priority, assignedTo, type, notePlaceholder, targetValue, unit, options } = req.body;
      const subtaskId = `st_${Date.now()}_${import_crypto.default.randomBytes(2).toString("hex")}`;
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query(`
          INSERT INTO subtasks (id, task_id, title, completed, priority, assigned_to, type, note_placeholder, target_value, unit, options, sort_order)
          VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, 99)
        `, [
          subtaskId,
          taskId,
          title || "Langkah baru",
          priority || "Medium",
          assignedTo || null,
          type || "checkbox",
          notePlaceholder || null,
          targetValue || null,
          unit || null,
          options ? JSON.stringify(options) : null
        ]);
        return res.json({
          success: true,
          subtask: {
            id: subtaskId,
            title,
            completed: false,
            priority: priority || "Medium",
            assignedTo,
            type: type || "checkbox",
            notePlaceholder,
            targetValue,
            unit,
            options
          }
        });
      }
      const task = inMemoryTasks.find((t) => t.id === taskId);
      const subObj = {
        id: subtaskId,
        title: title || "Langkah baru",
        completed: false,
        priority: priority || "Medium",
        assignedTo,
        type: type || "checkbox",
        notePlaceholder,
        targetValue,
        unit,
        options
      };
      if (task) {
        if (!task.subtasks) task.subtasks = [];
        task.subtasks.push(subObj);
      }
      saveLocalDb();
      res.json({ success: true, subtask: subObj });
    } catch (err) {
      res.status(500).json({ error: "Gagal menambah subtask: " + err.message });
    }
  });
  app.delete("/api/tasks/:id/subtasks/:subtaskId", async (req, res) => {
    try {
      const { id: taskId, subtaskId } = req.params;
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query("DELETE FROM subtasks WHERE id = ? AND task_id = ?", [subtaskId, taskId]);
        return res.json({ success: true });
      }
      const task = inMemoryTasks.find((t) => t.id === taskId);
      if (task) {
        task.subtasks = task.subtasks.filter((s) => s.id !== subtaskId);
      }
      saveLocalDb();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Gagal menghapus subtask: " + err.message });
    }
  });
  app.get("/api/finance/transactions", async (req, res) => {
    try {
      if (mysqlPool && dbStatus.connected) {
        const [rows] = await mysqlPool.query(`
          SELECT 
            ft.id, ft.circle_id as circleId, ft.type, ft.title, ft.amount, ft.category,
            ft.transaction_date as date, ft.payer_or_recipient as payerOrRecipient,
            ft.recorded_by as recordedBy, u.name as recorderName,
            ft.receipt_note as receiptNote, ft.proof_url as proofUrl, ft.status
          FROM financial_transactions ft
          LEFT JOIN users u ON ft.recorded_by = u.id
          ORDER BY ft.created_at DESC
        `);
        const formatted = (rows || []).map((r) => ({
          id: r.id,
          circleId: r.circleId,
          type: r.type,
          title: r.title,
          amount: Number(r.amount) || 0,
          category: r.category,
          date: r.date,
          payerOrRecipient: r.payerOrRecipient,
          recordedBy: r.recordedBy,
          recorderName: r.recorderName || "Anggota",
          receiptNote: r.receiptNote || void 0,
          proofUrl: r.proofUrl || void 0,
          status: r.status || "verified"
        }));
        return res.json({ transactions: formatted });
      }
      res.json({ transactions: inMemoryTransactions });
    } catch (err) {
      console.error("Error fetching transactions:", err);
      res.status(500).json({ error: "Gagal memuat transaksi kas: " + err.message, transactions: [] });
    }
  });
  app.post("/api/finance/transactions", async (req, res) => {
    try {
      const { circleId, type, title, amount, category, date, payerOrRecipient, recordedBy, receiptNote, proofUrl } = req.body;
      if (!title || !amount || !circleId) {
        return res.status(400).json({ error: "Data transaksi belum lengkap (grup, judul, nominal)." });
      }
      const txId = `tx_${Date.now()}_${import_crypto.default.randomBytes(2).toString("hex")}`;
      const numAmount = Number(amount);
      const finalDate = date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const finalRecordedBy = recordedBy || "usr_1";
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query(`
          INSERT INTO financial_transactions (
            id, circle_id, type, title, amount, category, transaction_date, payer_or_recipient, recorded_by, receipt_note, proof_url, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', NOW())
        `, [
          txId,
          circleId,
          type,
          title,
          numAmount,
          category || "Operasional",
          finalDate,
          payerOrRecipient || "Umum",
          finalRecordedBy,
          receiptNote || null,
          proofUrl || null
        ]);
        const balanceDelta = type === "income" ? numAmount : -numAmount;
        await mysqlPool.query("UPDATE circles SET kas_balance = kas_balance + ? WHERE id = ?", [balanceDelta, circleId]);
        const txObj2 = {
          id: txId,
          circleId,
          type,
          title,
          amount: numAmount,
          category: category || "Operasional",
          date: finalDate,
          payerOrRecipient: payerOrRecipient || "Umum",
          recordedBy: finalRecordedBy,
          receiptNote: receiptNote || void 0,
          proofUrl: proofUrl || void 0,
          status: "verified"
        };
        return res.json({ success: true, transaction: txObj2 });
      }
      const txObj = {
        id: txId,
        circleId,
        type,
        title,
        amount: numAmount,
        category: category || "Operasional",
        date: finalDate,
        payerOrRecipient: payerOrRecipient || "Umum",
        recordedBy: finalRecordedBy,
        receiptNote: receiptNote || void 0,
        proofUrl: proofUrl || void 0,
        status: "verified"
      };
      inMemoryTransactions.unshift(txObj);
      res.json({ success: true, transaction: txObj });
    } catch (err) {
      console.error("Error creating transaction:", err);
      res.status(500).json({ error: "Gagal mencatat transaksi: " + err.message });
    }
  });
  app.delete("/api/finance/transactions/:id", async (req, res) => {
    try {
      const txId = req.params.id;
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query("DELETE FROM financial_transactions WHERE id = ?", [txId]);
        return res.json({ success: true });
      }
      inMemoryTransactions = inMemoryTransactions.filter((t) => t.id !== txId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Gagal menghapus transaksi: " + err.message });
    }
  });
  app.get("/api/finance/budget-goals", async (req, res) => {
    try {
      if (mysqlPool && dbStatus.connected) {
        const [rows] = await mysqlPool.query("SELECT * FROM budget_goals ORDER BY created_at DESC");
        return res.json({
          budgetGoals: (rows || []).map((r) => ({
            id: r.id,
            circleId: r.circle_id,
            title: r.title,
            targetAmount: Number(r.target_amount) || 0,
            currentAmount: Number(r.current_amount) || 0,
            deadline: r.deadline,
            purpose: r.purpose,
            category: r.category
          }))
        });
      }
      res.json({ budgetGoals: inMemoryBudgetGoals });
    } catch (err) {
      res.status(500).json({ error: "Gagal memuat target anggaran: " + err.message, budgetGoals: [] });
    }
  });
  app.post("/api/finance/budget-goals", async (req, res) => {
    try {
      const { circleId, title, targetAmount, deadline, purpose, category } = req.body;
      const bgId = `bg_${Date.now()}_${import_crypto.default.randomBytes(2).toString("hex")}`;
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query(`
          INSERT INTO budget_goals (id, circle_id, title, target_amount, current_amount, deadline, purpose, category, created_at)
          VALUES (?, ?, ?, ?, 0, ?, ?, ?, NOW())
        `, [bgId, circleId || "circle_1", title, Number(targetAmount) || 0, deadline || "Akhir Bulan", purpose || "", category || "Operasional"]);
        return res.json({ success: true, budgetGoal: { id: bgId, circleId, title, targetAmount: Number(targetAmount) || 0, currentAmount: 0, deadline, purpose, category } });
      }
      const bgObj = { id: bgId, circleId: circleId || "circle_1", title, targetAmount: Number(targetAmount) || 0, currentAmount: 0, deadline, purpose, category };
      inMemoryBudgetGoals.push(bgObj);
      res.json({ success: true, budgetGoal: bgObj });
    } catch (err) {
      res.status(500).json({ error: "Gagal menambah target anggaran: " + err.message });
    }
  });
  app.get("/api/finance/member-dues", async (req, res) => {
    try {
      if (mysqlPool && dbStatus.connected) {
        const [rows] = await mysqlPool.query("SELECT * FROM member_dues ORDER BY created_at DESC");
        return res.json({
          memberDues: (rows || []).map((r) => ({
            id: r.id,
            circleId: r.circle_id,
            memberId: r.member_id,
            period: r.period,
            amount: Number(r.amount) || 0,
            status: r.status,
            paidAt: r.paid_at
          }))
        });
      }
      res.json({ memberDues: inMemoryMemberDues });
    } catch (err) {
      res.status(500).json({ error: "Gagal memuat iuran anggota: " + err.message, memberDues: [] });
    }
  });
  app.get("/api/meetings", async (req, res) => {
    try {
      if (mysqlPool && dbStatus.connected) {
        const [rows] = await mysqlPool.query("SELECT * FROM meetings ORDER BY created_at DESC");
        return res.json({
          meetings: (rows || []).map((r) => ({
            id: r.id,
            circleId: r.circle_id,
            title: r.title,
            date: r.date,
            timeRange: r.time_range,
            type: r.type,
            meetUrl: r.meet_url,
            description: r.description,
            attendees: typeof r.attendees === "string" ? JSON.parse(r.attendees) : r.attendees || [],
            isCompleted: r.is_completed === 1
          }))
        });
      }
      res.json({ meetings: inMemoryMeetings });
    } catch (err) {
      res.status(500).json({ error: "Gagal memuat agenda rapat: " + err.message, meetings: [] });
    }
  });
  app.post("/api/meetings", async (req, res) => {
    try {
      const { circleId, title, date, timeRange, type, meetUrl, description, attendees } = req.body;
      const meetingId = `meet_${Date.now()}_${import_crypto.default.randomBytes(2).toString("hex")}`;
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query(`
          INSERT INTO meetings (id, circle_id, title, date, time_range, type, meet_url, description, attendees, is_completed, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())
        `, [
          meetingId,
          circleId || null,
          title,
          date || "Besok",
          timeRange || "20:00 - 21:00 WIB",
          type || "online",
          meetUrl || "https://meet.google.com/new",
          description || "",
          JSON.stringify(attendees || [])
        ]);
        const meetingObj2 = {
          id: meetingId,
          circleId,
          title,
          date: date || "Besok",
          timeRange: timeRange || "20:00 - 21:00 WIB",
          type: type || "online",
          meetUrl: meetUrl || "https://meet.google.com/new",
          description: description || "",
          attendees: attendees || [],
          isCompleted: false
        };
        return res.json({ success: true, meeting: meetingObj2 });
      }
      const meetingObj = {
        id: meetingId,
        circleId,
        title,
        date: date || "Besok",
        timeRange: timeRange || "20:00 - 21:00 WIB",
        type: type || "online",
        meetUrl: meetUrl || "https://meet.google.com/new",
        description: description || "",
        attendees: attendees || [],
        isCompleted: false
      };
      inMemoryMeetings.unshift(meetingObj);
      res.json({ success: true, meeting: meetingObj });
    } catch (err) {
      res.status(500).json({ error: "Gagal membuat agenda rapat: " + err.message });
    }
  });
  app.delete("/api/meetings/:id", async (req, res) => {
    try {
      const meetingId = req.params.id;
      if (mysqlPool && dbStatus.connected) {
        await mysqlPool.query("DELETE FROM meetings WHERE id = ?", [meetingId]);
        return res.json({ success: true });
      }
      inMemoryMeetings = inMemoryMeetings.filter((m) => m.id !== meetingId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Gagal menghapus meeting: " + err.message });
    }
  });
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      service: "Lingkar Fullstack Platform",
      version: "2.5.0-production"
    });
  });
  if (process.env.SERVE_DIST !== "true") {
    try {
      const vite = await (0, import_vite.createServer)({
        server: { middlewareMode: true },
        appType: "spa"
      });
      app.use(vite.middlewares);
      console.log("\u26A1 Vite dev middleware mounted successfully");
    } catch (e) {
      console.warn("Vite dev middleware failed, falling back to static dist:", e);
      serveStaticDist(app);
    }
  } else {
    serveStaticDist(app);
  }
  function serveStaticDist(expressApp) {
    const distPath = import_path.default.join(process.cwd(), "dist");
    expressApp.use(import_express.default.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html") || filePath.endsWith("sw.js") || filePath.endsWith("manifest.json") || filePath.endsWith(".js") || filePath.endsWith(".css")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        }
      }
    }));
    expressApp.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(3e3, "0.0.0.0", () => {
    console.log(`\u{1F680} Lingkar Server running on http://0.0.0.0:3000`);
    console.log(`\u{1F4C1} Uploads stored in: ${UPLOADS_DIR}`);
  });
}
function generateSqlMigrationScript(dialect) {
  const isPostgres = dialect === "postgres";
  const isSqlite = dialect === "sqlite";
  const isMysql = !isPostgres && !isSqlite;
  if (isMysql) {
    return `-- ==========================================================
-- LINGKAR PLATFORM: DATABASE MIGRATION & DDL SCHEMA
-- Target Dialect: MYSQL / MARIADB / phpMyAdmin (Cloud SQL / RDS / PlanetScale)
-- Generated: ${(/* @__PURE__ */ new Date()).toISOString()}
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- 1. USERS & ROLES TABLE
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`email\` VARCHAR(255) NOT NULL,
  \`username\` VARCHAR(100) NOT NULL,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`role\` VARCHAR(50) NOT NULL DEFAULT 'member', -- 'superadmin', 'admin', 'member'
  \`avatar\` TEXT,
  \`title\` VARCHAR(255) DEFAULT NULL,
  \`points\` INT NOT NULL DEFAULT 0,
  \`level\` INT NOT NULL DEFAULT 1,
  \`streak_days\` INT NOT NULL DEFAULT 0,
  \`badges_count\` INT NOT NULL DEFAULT 0,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_users_email\` (\`email\`),
  UNIQUE KEY \`idx_users_username\` (\`username\`),
  KEY \`idx_users_role\` (\`role\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. SESSIONS TABLE
CREATE TABLE IF NOT EXISTS \`sessions\` (
  \`token\` VARCHAR(128) NOT NULL,
  \`user_id\` VARCHAR(64) NOT NULL,
  \`expires_at\` BIGINT NOT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`token\`),
  KEY \`idx_sessions_user\` (\`user_id\`),
  CONSTRAINT \`fk_sessions_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CIRCLES (GROUPS) TABLE
CREATE TABLE IF NOT EXISTS \`circles\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`code\` VARCHAR(50) NOT NULL,
  \`description\` TEXT,
  \`category\` VARCHAR(100) NOT NULL,
  \`avatar\` TEXT,
  \`banner_gradient\` VARCHAR(100) DEFAULT 'from-teal-600 to-emerald-800',
  \`admin_id\` VARCHAR(64) DEFAULT NULL,
  \`kas_balance\` BIGINT NOT NULL DEFAULT 0,
  \`tags\` JSON DEFAULT NULL,
  \`is_private\` TINYINT(1) NOT NULL DEFAULT 0,
  \`meeting_schedule\` VARCHAR(255) DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_circles_code\` (\`code\`),
  KEY \`idx_circles_category\` (\`category\`),
  KEY \`idx_circles_admin\` (\`admin_id\`),
  CONSTRAINT \`fk_circles_admin\` FOREIGN KEY (\`admin_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CIRCLE MEMBERS JOIN TABLE
CREATE TABLE IF NOT EXISTS \`circle_members\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`circle_id\` VARCHAR(64) NOT NULL,
  \`user_id\` VARCHAR(64) NOT NULL,
  \`role\` VARCHAR(50) NOT NULL DEFAULT 'Anggota', -- 'Ketua', 'Bendahara', 'Sekretaris', 'Anggota', 'Kreator'
  \`contribution_points\` INT NOT NULL DEFAULT 0,
  \`joined_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_circle_user\` (\`circle_id\`, \`user_id\`),
  KEY \`idx_cm_circle\` (\`circle_id\`),
  KEY \`idx_cm_user\` (\`user_id\`),
  CONSTRAINT \`fk_cm_circle\` FOREIGN KEY (\`circle_id\`) REFERENCES \`circles\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_cm_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. POSTS & SHARING MODULE
CREATE TABLE IF NOT EXISTS \`posts\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`circle_id\` VARCHAR(64) DEFAULT NULL,
  \`author_id\` VARCHAR(64) NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`summary\` TEXT,
  \`content\` MEDIUMTEXT NOT NULL,
  \`category\` VARCHAR(100) NOT NULL,
  \`tags\` JSON DEFAULT NULL,
  \`likes_count\` INT NOT NULL DEFAULT 0,
  \`reading_time\` VARCHAR(50) DEFAULT '3 mnt',
  \`points_bonus\` INT NOT NULL DEFAULT 25,
  \`image_url\` TEXT,
  \`attachment_url\` TEXT,
  \`attachments\` JSON DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_posts_circle\` (\`circle_id\`),
  KEY \`idx_posts_author\` (\`author_id\`),
  KEY \`idx_posts_category\` (\`category\`),
  CONSTRAINT \`fk_posts_circle\` FOREIGN KEY (\`circle_id\`) REFERENCES \`circles\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_posts_author\` FOREIGN KEY (\`author_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. COMMENTS & THREADED REPLIES
CREATE TABLE IF NOT EXISTS \`comments\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`post_id\` VARCHAR(64) NOT NULL,
  \`author_id\` VARCHAR(64) NOT NULL,
  \`parent_id\` VARCHAR(64) DEFAULT NULL,
  \`content\` TEXT NOT NULL,
  \`likes_count\` INT NOT NULL DEFAULT 0,
  \`mentions\` JSON DEFAULT NULL,
  \`attachments\` JSON DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_comments_post\` (\`post_id\`),
  KEY \`idx_comments_author\` (\`author_id\`),
  KEY \`idx_comments_parent\` (\`parent_id\`),
  CONSTRAINT \`fk_comments_post\` FOREIGN KEY (\`post_id\`) REFERENCES \`posts\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_comments_author\` FOREIGN KEY (\`author_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_comments_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`comments\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TASKS & COLLABORATIVE GOALS
CREATE TABLE IF NOT EXISTS \`tasks\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`circle_id\` VARCHAR(64) NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`description\` TEXT,
  \`deadline\` VARCHAR(100) NOT NULL,
  \`priority\` VARCHAR(50) NOT NULL DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
  \`status\` VARCHAR(50) NOT NULL DEFAULT 'todo', -- 'todo', 'ongoing', 'done'
  \`progress\` INT NOT NULL DEFAULT 0,
  \`category\` VARCHAR(100) NOT NULL DEFAULT 'Target Bersama',
  \`points_reward\` INT NOT NULL DEFAULT 50,
  \`color_theme\` VARCHAR(50) DEFAULT 'mint',
  \`frequency\` VARCHAR(50) DEFAULT 'once', -- 'once', 'daily', 'weekly', 'monthly'
  \`streak_days\` INT NOT NULL DEFAULT 0,
  \`is_group_goal\` TINYINT(1) NOT NULL DEFAULT 0,
  \`collaborative_notes\` TEXT,
  \`synced_calendars\` JSON DEFAULT NULL,
  \`completed_at\` DATETIME DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_tasks_circle\` (\`circle_id\`),
  KEY \`idx_tasks_status\` (\`status\`),
  CONSTRAINT \`fk_tasks_circle\` FOREIGN KEY (\`circle_id\`) REFERENCES \`circles\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. SUBTASKS & ADVANCED CHECKLISTS
CREATE TABLE IF NOT EXISTS \`subtasks\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`task_id\` VARCHAR(64) NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`completed\` TINYINT(1) NOT NULL DEFAULT 0,
  \`priority\` VARCHAR(50) DEFAULT 'Medium',
  \`assigned_to\` VARCHAR(64) DEFAULT NULL,
  \`type\` VARCHAR(50) DEFAULT 'checkbox', -- 'checkbox', 'checkbox_note', 'number_input', 'select_option'
  \`completion_note\` TEXT,
  \`note_placeholder\` VARCHAR(255) DEFAULT NULL,
  \`target_value\` DECIMAL(15,2) DEFAULT NULL,
  \`current_value\` DECIMAL(15,2) NOT NULL DEFAULT 0,
  \`unit\` VARCHAR(50) DEFAULT NULL,
  \`options\` JSON DEFAULT NULL,
  \`selected_option\` VARCHAR(100) DEFAULT NULL,
  \`sort_order\` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (\`id\`),
  KEY \`idx_subtasks_task\` (\`task_id\`),
  KEY \`idx_subtasks_assigned\` (\`assigned_to\`),
  CONSTRAINT \`fk_subtasks_task\` FOREIGN KEY (\`task_id\`) REFERENCES \`tasks\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_subtasks_assigned\` FOREIGN KEY (\`assigned_to\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TASK ASSIGNEES (MANY-TO-MANY DELEGATION)
CREATE TABLE IF NOT EXISTS \`task_assignees\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`task_id\` VARCHAR(64) NOT NULL,
  \`user_id\` VARCHAR(64) NOT NULL,
  \`delegated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_task_user\` (\`task_id\`, \`user_id\`),
  KEY \`idx_ta_task\` (\`task_id\`),
  KEY \`idx_ta_user\` (\`user_id\`),
  CONSTRAINT \`fk_ta_task\` FOREIGN KEY (\`task_id\`) REFERENCES \`tasks\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_ta_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. FINANCIAL TRANSACTIONS & KAS AUDIT
CREATE TABLE IF NOT EXISTS \`financial_transactions\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`circle_id\` VARCHAR(64) NOT NULL,
  \`type\` VARCHAR(50) NOT NULL, -- 'income', 'expense', 'dues'
  \`title\` VARCHAR(255) NOT NULL,
  \`amount\` BIGINT NOT NULL,
  \`category\` VARCHAR(100) NOT NULL,
  \`transaction_date\` VARCHAR(50) NOT NULL,
  \`payer_or_recipient\` VARCHAR(255) NOT NULL,
  \`recorded_by\` VARCHAR(64) NOT NULL,
  \`receipt_note\` TEXT,
  \`proof_url\` TEXT,
  \`status\` VARCHAR(50) NOT NULL DEFAULT 'verified',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_finance_circle\` (\`circle_id\`),
  KEY \`idx_finance_recorded_by\` (\`recorded_by\`),
  CONSTRAINT \`fk_ft_circle\` FOREIGN KEY (\`circle_id\`) REFERENCES \`circles\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_ft_user\` FOREIGN KEY (\`recorded_by\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. BUDGET GOALS
CREATE TABLE IF NOT EXISTS \`budget_goals\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`circle_id\` VARCHAR(64) NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`target_amount\` BIGINT NOT NULL,
  \`current_amount\` BIGINT NOT NULL DEFAULT 0,
  \`deadline\` VARCHAR(100) NOT NULL,
  \`purpose\` TEXT,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_budget_circle\` (\`circle_id\`),
  CONSTRAINT \`fk_bg_circle\` FOREIGN KEY (\`circle_id\`) REFERENCES \`circles\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. MEMBER DUES
CREATE TABLE IF NOT EXISTS \`member_dues\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`circle_id\` VARCHAR(64) NOT NULL,
  \`user_id\` VARCHAR(64) NOT NULL,
  \`amount\` BIGINT NOT NULL,
  \`month\` VARCHAR(50) NOT NULL,
  \`is_paid\` TINYINT(1) NOT NULL DEFAULT 0,
  \`paid_date\` DATETIME DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_dues_circle\` (\`circle_id\`),
  KEY \`idx_dues_user\` (\`user_id\`),
  CONSTRAINT \`fk_dues_circle\` FOREIGN KEY (\`circle_id\`) REFERENCES \`circles\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_dues_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS \`audit_logs\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`timestamp\` VARCHAR(100) NOT NULL,
  \`user\` VARCHAR(255) NOT NULL,
  \`action\` VARCHAR(255) NOT NULL,
  \`ip\` VARCHAR(100) NOT NULL,
  \`status\` VARCHAR(50) NOT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_audit_user\` (\`user\`),
  KEY \`idx_audit_created\` (\`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. APP CONFIGURATION
CREATE TABLE IF NOT EXISTS \`app_configs\` (
  \`config_key\` VARCHAR(100) NOT NULL,
  \`config_value\` JSON NOT NULL,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`config_key\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. POST CATEGORIES
CREATE TABLE IF NOT EXISTS \`post_categories\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`description\` VARCHAR(255) DEFAULT '',
  \`icon\` VARCHAR(50) DEFAULT 'Tag',
  \`color\` VARCHAR(50) DEFAULT 'teal',
  \`is_default\` TINYINT(1) NOT NULL DEFAULT 0,
  \`sort_order\` INT NOT NULL DEFAULT 0,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_category_name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. USER FEEDBACK & SUGGESTIONS
CREATE TABLE IF NOT EXISTS \`app_feedbacks\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`user_id\` VARCHAR(64) DEFAULT NULL,
  \`user_name\` VARCHAR(255) NOT NULL,
  \`user_email\` VARCHAR(255) DEFAULT NULL,
  \`user_avatar\` TEXT DEFAULT NULL,
  \`category\` VARCHAR(100) NOT NULL DEFAULT 'Saran Fitur',
  \`title\` VARCHAR(255) NOT NULL,
  \`message\` MEDIUMTEXT NOT NULL,
  \`rating\` INT DEFAULT 5,
  \`status\` VARCHAR(50) NOT NULL DEFAULT 'pending',
  \`admin_notes\` TEXT DEFAULT NULL,
  \`responded_by\` VARCHAR(64) DEFAULT NULL,
  \`responded_at\` DATETIME DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_feedback_status\` (\`status\`),
  KEY \`idx_feedback_user\` (\`user_id\`),
  CONSTRAINT \`fk_feedbacks_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- SEED INITIAL DATA (DUMMY ACCOUNTS WITH PASSWORD: 12345678)
-- Password hash: SHA256('12345678_lingkar_salt_2026')
-- ==========================================================

INSERT IGNORE INTO \`users\` (\`id\`, \`email\`, \`username\`, \`password_hash\`, \`name\`, \`role\`, \`title\`, \`points\`, \`level\`, \`streak_days\`, \`is_active\`)
VALUES 
('usr_superadmin', 'superadmin@lingkarkebaikan.org', 'superadmin', 'c004003f86cd248bf701a44e3523f376a721293d099702f9cab0a57a0092d3dc', 'Super Admin Sistem', 'superadmin', 'Super Administrator & Architect', 9999, 99, 45, 1),
('usr_admin', 'admin@lingkarkebaikan.org', 'admin', 'c004003f86cd248bf701a44e3523f376a721293d099702f9cab0a57a0092d3dc', 'Admin Operasional', 'admin', 'Koordinator Admin Lingkar', 4520, 12, 28, 1),
('usr_1', 'user@lingkarkebaikan.org', 'budipratama', 'c004003f86cd248bf701a44e3523f376a721293d099702f9cab0a57a0092d3dc', 'Budi Pratama', 'member', 'Koordinator Lingkar Studi', 1280, 5, 14, 1);

-- Seed Default Post Categories
INSERT IGNORE INTO \`post_categories\` (\`id\`, \`name\`, \`description\`, \`icon\`, \`color\`, \`is_default\`, \`sort_order\`)
VALUES
('cat_umum', 'Umum', 'Kategori publikasi umum dan kabar komunitas', 'Globe', 'teal', 1, 0),
('cat_edukasi', 'Edukasi', 'Materi pembelajaran dan artikel edukatif', 'BookOpen', 'blue', 0, 1),
('cat_inisiatif', 'Inisiatif', 'Inisiatif proyek kebaikan dan gerakan sosial', 'Sparkles', 'emerald', 0, 2),
('cat_pengumuman', 'Pengumuman', 'Pengumuman resmi dan agenda penting', 'Bell', 'amber', 0, 3),
('cat_opini', 'Opini', 'Sudut pandang, esai, dan catatan refleksi', 'Feather', 'purple', 0, 4),
('cat_buku', 'Rangkuman Buku', 'Ringkasan buku inspiratif dan literasi', 'Bookmark', 'indigo', 0, 5),
('cat_keilmuan', 'Materi Keilmuan', 'Riset, teknologi, dan sains terapan', 'Cpu', 'cyan', 0, 6),
('cat_misi', 'Misi Kebaikan', 'Aksi nyata kerelawanan dan gotong royong', 'Heart', 'rose', 0, 7);

-- Seed Circles
INSERT IGNORE INTO \`circles\` (\`id\`, \`name\`, \`code\`, \`description\`, \`category\`, \`kas_balance\`, \`is_private\`)
VALUES 
('circle_1', 'Lingkar Studi AI & Tech Ethics', 'AI-STUDY-88', 'Kelompok riset dan diskusi mingguan seputar AI terapan dan etika teknologi.', 'Kelompok Studi', 3450000, 0),
('circle_2', 'Relawan Mengajar Pesisir', 'PESISIR-01', 'Gerakan akar rumput mendistribusikan buku dan mentoring belajar desa pesisir.', 'Organisasi Akar Rumput', 5820000, 0);

-- Seed Circle Members
INSERT IGNORE INTO \`circle_members\` (\`id\`, \`circle_id\`, \`user_id\`, \`role\`, \`contribution_points\`)
VALUES
('cm_1', 'circle_1', 'usr_superadmin', 'Ketua', 9999),
('cm_2', 'circle_1', 'usr_1', 'Anggota', 1280),
('cm_3', 'circle_2', 'usr_admin', 'Ketua', 4520);

SET FOREIGN_KEY_CHECKS = 1;
`;
  }
  if (isPostgres) {
    return `-- ==========================================================
-- LINGKAR PLATFORM: DATABASE MIGRATION & DDL SCHEMA
-- Target Dialect: POSTGRESQL (Cloud SQL / Supabase / Neon / RDS)
-- Generated: ${(/* @__PURE__ */ new Date()).toISOString()}
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & ROLES TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    avatar TEXT,
    title VARCHAR(255),
    points INT DEFAULT 0,
    level INT DEFAULT 1,
    streak_days INT DEFAULT 0,
    badges_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. SESSIONS TABLE
CREATE TABLE IF NOT EXISTS sessions (
    token VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- 3. CIRCLES (GROUPS) TABLE
CREATE TABLE IF NOT EXISTS circles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    avatar TEXT,
    banner_gradient VARCHAR(100) DEFAULT 'from-teal-600 to-emerald-800',
    admin_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    kas_balance BIGINT DEFAULT 0,
    tags JSONB,
    is_private BOOLEAN DEFAULT FALSE,
    meeting_schedule VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_circles_code ON circles(code);
CREATE INDEX IF NOT EXISTS idx_circles_category ON circles(category);

-- 4. CIRCLE MEMBERS JOIN TABLE
CREATE TABLE IF NOT EXISTS circle_members (
    id VARCHAR(64) PRIMARY KEY,
    circle_id VARCHAR(64) NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'Anggota',
    contribution_points INT DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(circle_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_circle_members_circle ON circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_user ON circle_members(user_id);

-- 5. POSTS & SHARING MODULE
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(64) PRIMARY KEY,
    circle_id VARCHAR(64) REFERENCES circles(id) ON DELETE CASCADE,
    author_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags JSONB,
    likes_count INT DEFAULT 0,
    reading_time VARCHAR(50) DEFAULT '3 mnt',
    points_bonus INT DEFAULT 25,
    image_url TEXT,
    attachment_url TEXT,
    attachments JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_circle ON posts(circle_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);

-- 6. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(64) PRIMARY KEY,
    post_id VARCHAR(64) NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id VARCHAR(64) REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    mentions JSONB,
    attachments JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(64) PRIMARY KEY,
    circle_id VARCHAR(64) NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
    status VARCHAR(50) NOT NULL DEFAULT 'todo',
    progress INT DEFAULT 0,
    category VARCHAR(100) NOT NULL DEFAULT 'Target Bersama',
    points_reward INT DEFAULT 50,
    color_theme VARCHAR(50) DEFAULT 'mint',
    frequency VARCHAR(50) DEFAULT 'once',
    streak_days INT DEFAULT 0,
    is_group_goal BOOLEAN DEFAULT FALSE,
    collaborative_notes TEXT,
    synced_calendars JSONB,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. SUBTASKS TABLE
CREATE TABLE IF NOT EXISTS subtasks (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(50) DEFAULT 'Medium',
    assigned_to VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) DEFAULT 'checkbox',
    completion_note TEXT,
    note_placeholder VARCHAR(255),
    target_value NUMERIC,
    current_value NUMERIC DEFAULT 0,
    unit VARCHAR(50),
    options JSONB,
    selected_option VARCHAR(100),
    sort_order INT DEFAULT 0
);

-- 9. TASK ASSIGNEES TABLE
CREATE TABLE IF NOT EXISTS task_assignees (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delegated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, user_id)
);

-- 10. FINANCIAL TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS financial_transactions (
    id VARCHAR(64) PRIMARY KEY,
    circle_id VARCHAR(64) NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount BIGINT NOT NULL,
    category VARCHAR(100) NOT NULL,
    transaction_date VARCHAR(50) NOT NULL,
    payer_or_recipient VARCHAR(255) NOT NULL,
    recorded_by VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receipt_note TEXT,
    proof_url TEXT,
    status VARCHAR(50) DEFAULT 'verified',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. BUDGET GOALS TABLE
CREATE TABLE IF NOT EXISTS budget_goals (
    id VARCHAR(64) PRIMARY KEY,
    circle_id VARCHAR(64) NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    target_amount BIGINT NOT NULL,
    current_amount BIGINT DEFAULT 0,
    deadline VARCHAR(100) NOT NULL,
    purpose TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. MEMBER DUES TABLE
CREATE TABLE IF NOT EXISTS member_dues (
    id VARCHAR(64) PRIMARY KEY,
    circle_id VARCHAR(64) NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    month VARCHAR(50) NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_date TIMESTAMPTZ
);

-- 13. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp VARCHAR(100) NOT NULL,
    "user" VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    ip VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 14. APP CONFIGS TABLE
CREATE TABLE IF NOT EXISTS app_configs (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA
INSERT INTO users (id, email, username, password_hash, name, role, title, points, level, streak_days)
VALUES 
('usr_superadmin', 'superadmin@lingkarkebaikan.org', 'superadmin', 'c004003f86cd248bf701a44e3523f376a721293d099702f9cab0a57a0092d3dc', 'Super Admin Sistem', 'superadmin', 'Super Administrator & Architect', 9999, 99, 45),
('usr_admin', 'admin@lingkarkebaikan.org', 'admin', 'c004003f86cd248bf701a44e3523f376a721293d099702f9cab0a57a0092d3dc', 'Admin Operasional', 'admin', 'Koordinator Admin Lingkar', 4520, 12, 28),
('usr_1', 'user@lingkarkebaikan.org', 'budipratama', 'c004003f86cd248bf701a44e3523f376a721293d099702f9cab0a57a0092d3dc', 'Budi Pratama', 'member', 'Koordinator Lingkar Studi', 1280, 5, 14)
ON CONFLICT (id) DO NOTHING;

INSERT INTO circles (id, name, code, description, category, kas_balance, is_private)
VALUES 
('circle_1', 'Lingkar Studi AI & Tech Ethics', 'AI-STUDY-88', 'Kelompok riset dan diskusi mingguan seputar AI terapan dan etika teknologi.', 'Kelompok Studi', 3450000, FALSE),
('circle_2', 'Relawan Mengajar Pesisir', 'PESISIR-01', 'Gerakan akar rumput mendistribusikan buku dan mentoring belajar desa pesisir.', 'Organisasi Akar Rumput', 5820000, FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO circle_members (id, circle_id, user_id, role, contribution_points)
VALUES
('cm_1', 'circle_1', 'usr_superadmin', 'Ketua', 9999),
('cm_2', 'circle_1', 'usr_1', 'Anggota', 1280),
('cm_3', 'circle_2', 'usr_admin', 'Ketua', 4520)
ON CONFLICT (id) DO NOTHING;
`;
  }
  return `-- ==========================================================
-- LINGKAR PLATFORM: DATABASE MIGRATION & DDL SCHEMA
-- Target Dialect: SQLITE (Local / Embedded)
-- Generated: ${(/* @__PURE__ */ new Date()).toISOString()}
-- ==========================================================

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    avatar TEXT,
    title TEXT,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    badges_count INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS circles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    avatar TEXT,
    banner_gradient TEXT DEFAULT 'from-teal-600 to-emerald-800',
    admin_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    kas_balance INTEGER DEFAULT 0,
    tags TEXT,
    is_private INTEGER DEFAULT 0,
    meeting_schedule TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS circle_members (
    id TEXT PRIMARY KEY,
    circle_id TEXT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'Anggota',
    contribution_points INTEGER DEFAULT 0,
    joined_at TEXT DEFAULT (datetime('now')),
    UNIQUE(circle_id, user_id)
);

CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    circle_id TEXT REFERENCES circles(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT,
    likes_count INTEGER DEFAULT 0,
    reading_time TEXT DEFAULT '3 mnt',
    points_bonus INTEGER DEFAULT 25,
    image_url TEXT,
    attachment_url TEXT,
    attachments TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    mentions TEXT,
    attachments TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    circle_id TEXT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    deadline TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Medium',
    status TEXT NOT NULL DEFAULT 'todo',
    progress INTEGER DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'Target Bersama',
    points_reward INTEGER DEFAULT 50,
    color_theme TEXT DEFAULT 'mint',
    frequency TEXT DEFAULT 'once',
    streak_days INTEGER DEFAULT 0,
    is_group_goal INTEGER DEFAULT 0,
    collaborative_notes TEXT,
    synced_calendars TEXT,
    completed_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subtasks (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    priority TEXT DEFAULT 'Medium',
    assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
    type TEXT DEFAULT 'checkbox',
    completion_note TEXT,
    note_placeholder TEXT,
    target_value REAL,
    current_value REAL DEFAULT 0,
    unit TEXT,
    options TEXT,
    selected_option TEXT,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS task_assignees (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delegated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(task_id, user_id)
);

CREATE TABLE IF NOT EXISTS financial_transactions (
    id TEXT PRIMARY KEY,
    circle_id TEXT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    amount INTEGER NOT NULL,
    category TEXT NOT NULL,
    transaction_date TEXT NOT NULL,
    payer_or_recipient TEXT NOT NULL,
    recorded_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receipt_note TEXT,
    proof_url TEXT,
    status TEXT DEFAULT 'verified',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS budget_goals (
    id TEXT PRIMARY KEY,
    circle_id TEXT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_amount INTEGER NOT NULL,
    current_amount INTEGER DEFAULT 0,
    deadline TEXT NOT NULL,
    purpose TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS member_dues (
    id TEXT PRIMARY KEY,
    circle_id TEXT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    month TEXT NOT NULL,
    is_paid INTEGER DEFAULT 0,
    paid_date TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    user TEXT NOT NULL,
    action TEXT NOT NULL,
    ip TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS app_configs (
    config_key TEXT PRIMARY KEY,
    config_value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO users (id, email, username, password_hash, name, role, title, points, level, streak_days)
VALUES 
('usr_superadmin', 'superadmin@lingkarkebaikan.org', 'superadmin', '9b34db034346766465fe95f36e4f3a76ae86e7dfdbe4dbd535198e3b3348f936', 'Super Admin Sistem', 'superadmin', 'Super Administrator & Architect', 9999, 99, 45),
('usr_admin', 'admin@lingkarkebaikan.org', 'admin', '9b34db034346766465fe95f36e4f3a76ae86e7dfdbe4dbd535198e3b3348f936', 'Admin Operasional', 'admin', 'Koordinator Admin Lingkar', 4520, 12, 28),
('usr_1', 'user@lingkarkebaikan.org', 'budipratama', '9b34db034346766465fe95f36e4f3a76ae86e7dfdbe4dbd535198e3b3348f936', 'Budi Pratama', 'member', 'Koordinator Lingkar Studi', 1280, 5, 14);
`;
}
startServer();
//# sourceMappingURL=server.cjs.map
