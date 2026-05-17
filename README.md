# 🦾 Iron Man MK-II: Flight Simulation

![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Web-blue)
![Framework](https://img.shields.io/badge/.NET_Framework-4.7.2-purple)
![Web](https://img.shields.io/badge/Web-HTML5_Canvas-orange)
![Language](https://img.shields.io/badge/Language-C%23%20%7C%20JavaScript-green)


Sebuah simulasi interaktif karakter **Iron Man** yang mendemonstrasikan berbagai konsep **Grafika Komputer 2D** seperti transformasi geometri, animasi real-time, sistem partikel, dan rendering berbasis primitif.

> 📚 Project ini dibuat untuk memenuhi tugas mata kuliah **Grafika Komputer - Semester 3**.

---

## 📸 Fitur Utama

### 🎮 Kontrol Interaktif
- **W / A / S / D** — Menggerakkan karakter Iron Man ke atas, kiri, bawah, dan kanan
- **Mouse** — Mengarahkan tangan kanan Iron Man (mode Aim & Fire)
- **Tombol "Next Phase"** — Mengubah state/fase animasi karakter

#### 🔄 Sistem State (Fase Animasi)
Karakter Iron Man memiliki 4 state yang bisa diubah secara berurutan:

| State | Deskripsi |
|-------|-----------| 
| **Idle** | Karakter diam dengan animasi hover (naik-turun) |
| **Aim** | Tangan kanan mengikuti arah kursor mouse |
| **Fire** | Tangan kanan menembakkan laser beam ke arah kursor |
| **Fly** | Mode terbang — bintang bergerak cepat, efek thruster meningkat |

#### ✨ Efek Visual
- **Animasi Hover** — Karakter bergoyang naik-turun saat Idle menggunakan fungsi `Sin()`
- **Sistem Partikel (Thruster)** — Api keluar dari kaki Iron Man saat bergerak atau terbang
- **Starfield** — Latar belakang bintang yang bergerak, makin cepat saat mode Fly
- **Laser Beam** — Efek tembakan laser dengan gradient `White → Cyan`
- **Anti-Aliased Rendering** — Grafis halus menggunakan `SmoothingMode.AntiAlias`

---

### 🌐 Versi Web (HTML5 Canvas + JavaScript)

Versi web adalah **port lengkap** dari versi desktop dengan **fitur tambahan** yang signifikan.

#### 🎮 Kontrol (Desktop Browser)
- **W / A / S / D** — Menggerakkan karakter
- **Mouse** — Mengarahkan tangan kanan
- **Space** — Menembakkan laser beam
- **Click** — Alternatif menembak (klik pada canvas)

#### 📱 Kontrol (Mobile / Touchscreen)
- **Layar kiri** — Virtual joystick untuk bergerak
- **Layar kanan** — Sentuh untuk aim & fire

#### 🆕 Fitur Baru (Tidak ada di Versi Desktop)

| Fitur | Deskripsi |
|-------|-----------|
| **Sistem Musuh** | 3 tipe drone musuh (Basic, Fast, Heavy) dengan AI dan kemampuan menembak |
| **Wave System** | Gelombang musuh bertahap — makin lama makin sulit |
| **Skor & Combo** | Poin per musuh dihancurkan + combo multiplier (x2, x3, dst) |
| **Health Bar** | Shield 100 HP, berkurang saat terkena peluru/tabrakan musuh |
| **Health Pickup** | Drop acak dari musuh yang mati (+20 HP), berupa ikon hijau |
| **High Score** | Skor tertinggi tersimpan otomatis di browser (`localStorage`) |
| **Game Over** | Layar "Mission Failed" dengan skor akhir dan opsi retry |
| **Screen Shake** | Efek guncangan layar saat terkena damage atau membunuh musuh |
| **Virtual Joystick** | Kontrol sentuh untuk perangkat mobile |
| **Responsive Canvas** | Otomatis menyesuaikan ukuran layar |
| **Glassmorphism HUD** | UI premium dengan efek blur, glow, dan animasi pulse |
| **Glow Effects** | Arc Reactor, mata helm, dan laser memiliki efek glow bercahaya |
| **Laser Cooldown** | Indikator cooldown di atas karakter (0.35 detik) |
| **Efek Ledakan** | Partikel ledakan saat musuh dihancurkan |

---

## 🔧 Konsep Grafika Komputer yang Digunakan

### 1. Transformasi 2D

| Transformasi | Desktop (C# / GDI+) | Web (Canvas API) |
|---|---|---|
| **Translasi** | `TranslateTransform()` | `ctx.translate()` |
| **Rotasi** | `RotateTransform()` | `ctx.rotate()` |
| **Scaling** | `ScaleTransform(1.5f, 1.5f)` | `ctx.scale(1.5, 1.5)` |
| **Save/Restore** | `Graphics.Save/Restore()` | `ctx.save()/restore()` |

### 2. Rendering Primitif

| Primitif | Desktop (C# / GDI+) | Web (Canvas API) |
|---|---|---|
| **Rectangle** | `FillRectangle()` | `ctx.fillRect()` |
| **Polygon** | `FillPolygon()` | `ctx.beginPath() + fill()` |
| **Ellipse** | `FillEllipse()` | `ctx.arc() + fill()` |
| **Gradient** | `LinearGradientBrush` | `ctx.createLinearGradient()` |

### 3. Sistem Partikel
- Class `Particle` mengatur posisi, kecepatan, ukuran, dan umur partikel
- Warna acak antara `Orange` dan `Yellow` untuk efek api realistis
- Transparansi berkurang seiring waktu (fade-out) menggunakan alpha channel
- Versi web menambahkan **ExplosionParticle** untuk efek ledakan radial

### 4. Animasi Real-Time
- Desktop: `Timer` dengan interval **20ms (~50 FPS)**, `DoubleBuffered = true`
- Web: `requestAnimationFrame()` (~60 FPS), Canvas sudah double-buffered
- Fungsi trigonometri `Math.Sin()` untuk animasi hover
- `Math.Atan2()` untuk kalkulasi sudut arah mouse

### 5. Gradient & Warna
- `LinearGradientBrush` / `createLinearGradient()` untuk efek laser beam (White → Cyan)
- Warna khas Iron Man: `Crimson`, `DarkRed`, `Gold`, `Cyan`
- Versi web menambahkan **shadowBlur** untuk efek glow pada Arc Reactor dan mata

---

## ⚙️ Prasyarat

### Versi Desktop
- **OS**: Windows 10/11
- **Runtime**: [.NET Framework 4.7.2](https://dotnet.microsoft.com/en-us/download/dotnet-framework/net472) (biasanya sudah terinstall di Windows 10+)
- **IDE** (salah satu):
  - [Visual Studio 2022 Community](https://visualstudio.microsoft.com/) (Gratis — **Direkomendasikan**)
  - [Visual Studio Code](https://code.visualstudio.com/) + Extension [C# Dev Kit](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit)
  - [JetBrains Rider](https://www.jetbrains.com/rider/) (Gratis untuk mahasiswa)

### Versi Web
- **Browser modern** (Chrome, Firefox, Edge, Safari)
- **Opsional**: Web server lokal (Live Server, Python, atau Node.js)

---

## 🚀 Cara Menjalankan

### 🖥️ Versi Desktop (folder `IronManGame/`)

#### Opsi 1: Visual Studio (Direkomendasikan)
```
1. Clone repository ini
2. Buka file IronManGame.slnx di Visual Studio
3. Tekan F5 atau klik tombol Start
```

#### Opsi 2: Visual Studio Code
```
1. Clone repository ini
2. Install extension "C# Dev Kit" dari Microsoft
3. Buka folder project di VS Code
4. Tekan F5 untuk menjalankan
```

#### Opsi 3: Command Line (MSBuild)
```bash
# Build project
MSBuild.exe IronManGame\IronManGame.csproj /p:Configuration=Debug

# Jalankan hasil build
IronManGame\bin\Debug\IronManGame.exe
```

---

### 🌐 Versi Web (folder `web/`)

#### Opsi 1: VS Code Live Server (Direkomendasikan)
```
1. Buka folder project di VS Code
2. Install extension "Live Server" (jika belum ada)
3. Klik kanan file web/index.html → "Open with Live Server"
4. Browser akan otomatis terbuka
```

#### Opsi 2: Python HTTP Server
```bash
cd web
python -m http.server 3000
# Buka http://localhost:3000 di browser
```

#### Opsi 3: NPX Serve (Node.js)
```bash
npx -y serve web -l 3000
# Buka http://localhost:3000 di browser
```

> **💡 Catatan**: Versi web juga bisa dibuka langsung dengan double-click `web/index.html` di File Explorer tanpa server, karena tidak menggunakan ES Modules.

---

## 🎯 Cara Bermain

### Versi Desktop
1. **Jalankan aplikasi** — Karakter Iron Man akan muncul di tengah layar
2. **Gerakkan karakter** — Gunakan tombol `W` `A` `S` `D` untuk bergerak
3. **Ubah fase** — Klik tombol **"Next Phase >>"** untuk berpindah state:
   - `Idle` → `Aim` → `Fire` → `Fly` → kembali ke `Idle`
4. **Arahkan mouse** — Pada state Aim/Fire, tangan kanan akan mengikuti kursor
5. **Perhatikan efek visual** — Api thruster, laser beam, dan bintang yang bergerak

### Versi Web
1. **Buka game** — Layar menu dengan Iron Man hovering akan muncul
2. **Mulai permainan** — Klik canvas atau tekan `Space`
3. **Gerakkan karakter** — `W` `A` `S` `D` (desktop) atau virtual joystick (mobile)
4. **Arahkan tangan** — Gerakkan mouse ke arah target
5. **Tembak laser** — Tekan `Space` atau klik mouse
6. **Hancurkan musuh** — Drone akan muncul per gelombang (wave), semakin sulit
7. **Ambil health pickup** — Ikon hijau ✚ yang jatuh dari musuh yang mati
8. **Capai skor tinggi** — Combo kill untuk poin bonus!

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| **C#** | Desktop | Bahasa pemrograman utama versi desktop |
| **Windows Forms** | Desktop | Framework UI untuk aplikasi desktop |
| **GDI+ (System.Drawing)** | Desktop | Library grafika 2D untuk rendering |
| **.NET Framework 4.7.2** | Desktop | Runtime environment |
| **HTML5 Canvas** | Web | API grafika 2D untuk rendering di browser |
| **JavaScript (ES6+)** | Web | Bahasa pemrograman utama versi web |
| **CSS3** | Web | Styling dengan glassmorphism & animasi |

---

## 👤 Informasi

- **Mata Kuliah**: Grafika Komputer
- **Semester**: 3

---

## 📄 Lisensi

Project ini dibuat untuk keperluan akademik/tugas kuliah.
