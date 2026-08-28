# Panduan Deployment ke cPanel (Node.js Hosting)

Aplikasi **Lingkar Kebaikan** telah dirancang secara modular dan *stand-alone* agar sangat mudah di-*build* dan dijalankan pada cPanel hosting yang mendukung Node.js (cPanel Node.js Selector / Setup Node.js App).

---

## Langkah-Langkah Deployment ke cPanel

### 1. Unggah File Proyek
- Kompres seluruh folder proyek ke dalam format `.zip` (kecuali folder `node_modules` dan `dist` jika sudah ada).
- Unggah file `.zip` tersebut melalui cPanel **File Manager** ke direktori aplikasi Anda (misalnya `public_html/lingkar` atau direktori utama aplikasi Node.js Anda).
- Ekstrak (*Extract*) file `.zip` tersebut di dalam direktori tujuan.

### 2. Konfigurasi Aplikasi Node.js di cPanel
1. Buka menu **Setup Node.js App** di beranda cPanel Anda.
2. Klik **Create Application**.
3. Isi form konfigurasi:
   - **Node.js version**: Pilih versi terbaru yang disarankan (misalnya `Node.js v20.x` atau di atasnya).
   - **Application mode**: `Production`.
   - **Application root**: Jalur folder tempat Anda mengekstrak file (contoh: `lingkar` atau `public_html/lingkar`).
   - **Application URL**: Domain atau subdomain Anda (contoh: `lingkar.namadomain.com`).
   - **Application startup file**: `server.cjs` (File bundel mandiri hasil build backend).
4. Klik **Create**.

### 3. Install Dependencies & Build di cPanel
Setelah aplikasi dibuat, Anda dapat menjalankan perintah melalui terminal SSH cPanel atau terminal bawaan Setup Node.js App:
```bash
# Masuk ke direktori aplikasi
cd /home/username/public_html/lingkar

# Install dependencies
npm install

# Jalankan proses build produksi (mengompilasi frontend Vite & bundel backend esbuild)
npm run build
```

### 4. Konfigurasi Environment Variables (`.env`)
Buat file `.env` di root direktori aplikasi Anda (sesuaikan dengan `.env.example`):
```env
APP_STATUS="production"
GEMINI_API_KEY="masukkan_api_key_anda"
APP_URL="https://namadomain.com"

# Konfigurasi Database MySQL (Opsional, jika menggunakan database MySQL/MariaDB cPanel)
MYSQL_HOST="localhost"
MYSQL_PORT="3306"
MYSQL_USER="cpanel_db_user"
MYSQL_PASSWORD="cpanel_db_password"
MYSQL_DATABASE="cpanel_db_name"
MYSQL_SSL="false"
```
*(Catatan: Anda juga dapat menambahkan environment variables langsung melalui panel Environment Variables di **Setup Node.js App** cPanel).*

### 5. Menjalankan / Restart Aplikasi
1. Kembali ke menu **Setup Node.js App** di cPanel.
2. Klik tombol **Restart** pada aplikasi Anda.
3. Buka URL aplikasi Anda di browser. Aplikasi siap digunakan secara penuh, cepat, dan *stand-alone*!

---

## Troubleshooting: Mengatasi Pesan "Upgrade Required"
Jika saat mengakses link web di cPanel muncul tulisan **"Upgrade Required"**, hal tersebut disebabkan oleh:
1. **Phusion Passenger belum di-restart** setelah perubahan file startup atau konfigurasi port. Cukup klik tombol **Restart** di panel **Setup Node.js App**.
2. **Proses Build Belum Dijalankan**: Pastikan Anda sudah menjalankan `npm install` dan `npm run build` sehingga file `server.cjs` dan folder `dist/` sudah terbentuk di root direktori aplikasi cPanel Anda.
3. **Konfigurasi Startup File**: Pastikan pada **Application startup file** di cPanel tertulis `server.cjs` (bukan `server.ts` atau `index.js`), karena Passenger membutuhkan file bundel CommonJS tersebut.

