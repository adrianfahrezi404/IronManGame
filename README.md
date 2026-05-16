# 🦾 Iron Man MK-II: Flight Simulation

![Platform](https://img.shields.io/badge/Platform-Windows-blue)
![Framework](https://img.shields.io/badge/.NET_Framework-4.7.2-purple)
![Language](https://img.shields.io/badge/Language-C%23-green)
![UI](https://img.shields.io/badge/UI-Windows_Forms-orange)


Sebuah simulasi interaktif karakter **Iron Man** yang dibuat menggunakan **C# Windows Forms** dengan teknik **Computer Graphics 2D**. Aplikasi ini mendemonstrasikan berbagai konsep grafika komputer seperti transformasi geometri, animasi real-time, sistem partikel, dan rendering berbasis GDI+.

> 📚 Project ini dibuat untuk memenuhi tugas mata kuliah **Grafika Komputer - Semester 3**.

---

## 📸 Fitur Utama

### 🎨 Procedural Character Rendering (Penggambaran Karakter Murni dengan Kode)
Saya menggambar karakter Iron Man dalam simulasi ini **tidak menggunakan aset gambar (.png/.jpg) sama sekali**. Seluruh bagian tubuh karakter dirender murni dari nol secara prosedural menggunakan kombinasi bidang gambar (primitif grafis) melalui GDI+:
- **Kepala & Masker:** Kombinasi `FillRectangle` dan `FillPolygon` dengan perhitungan koordinat sudut yang presisi untuk membentuk helm khas Iron Man.
- **Arc Reactor:** Menggunakan `FillEllipse` dengan efek warna *Cyan* di bagian dada.
- **Proporsi Tubuh:** Menggabungkan berbagai bentuk dasar untuk badan, tangan, dan kaki, yang kemudian digabungkan ke dalam satu sistem transformasi terpusat agar bisa berotasi dan bergerak secara kesatuan.

### 🎮 Kontrol Interaktif
- **W / A / S / D** — Menggerakkan karakter Iron Man ke atas, kiri, bawah, dan kanan
- **Mouse** — Mengarahkan tangan kanan Iron Man (mode Aim & Fire)
- **Tombol "Next Phase"** — Mengubah state/fase animasi karakter

### 🔄 Sistem State (Fase Animasi)
Karakter Iron Man memiliki 4 state yang bisa diubah secara berurutan:

| State | Deskripsi |
|-------|-----------|
| **Idle** | Karakter diam dengan animasi hover (naik-turun) |
| **Aim** | Tangan kanan mengikuti arah kursor mouse |
| **Fire** | Tangan kanan menembakkan laser beam ke arah kursor |
| **Fly** | Mode terbang — bintang bergerak cepat, efek thruster meningkat |

### ✨ Efek Visual
- **Animasi Hover** — Karakter bergoyang naik-turun saat Idle menggunakan fungsi `Sin()`
- **Sistem Partikel (Thruster)** — Api keluar dari kaki Iron Man saat bergerak atau terbang
- **Starfield** — Latar belakang bintang yang bergerak, makin cepat saat mode Fly
- **Laser Beam** — Efek tembakan laser dengan gradient `White → Cyan`
- **Anti-Aliased Rendering** — Grafis halus menggunakan `SmoothingMode.AntiAlias`

---

## 🏗️ Arsitektur Project

```
IronManGame/
├── IronManGame.slnx              # Solution file
├── .gitignore                    # Git ignore rules
├── README.md                     # Dokumentasi project (file ini)
└── IronManGame/
    ├── Program.cs                # Entry point aplikasi
    ├── Form1.cs                  # Logic utama game (rendering & kontrol)
    ├── Form1.Designer.cs         # Auto-generated UI designer
    ├── IronManGame.csproj        # Project configuration
    ├── App.config                # Runtime configuration
    └── Properties/
        ├── AssemblyInfo.cs       # Assembly metadata
        ├── Resources.resx        # Resource file
        ├── Resources.Designer.cs # Auto-generated resource accessor
        ├── Settings.settings     # Application settings
        └── Settings.Designer.cs  # Auto-generated settings accessor
```

---

## 🔧 Konsep Grafika Komputer yang Digunakan

### 1. Transformasi 2D
- **Translasi** — `TranslateTransform()` untuk memindahkan origin gambar ke posisi player
- **Rotasi** — `RotateTransform()` untuk memutar tangan kanan mengikuti arah mouse
- **Scaling** — `ScaleTransform(1.5f, 1.5f)` untuk memperbesar karakter 1.5x

### 2. Rendering Primitif
- **Rectangle** — `FillRectangle()` untuk kepala, badan, tangan, dan kaki
- **Polygon** — `FillPolygon()` untuk mask helm dan badan trapesoid
- **Ellipse** — `FillEllipse()` untuk Arc Reactor di dada dan efek partikel

### 3. Sistem Partikel
- Class `Particle` mengatur posisi, kecepatan, ukuran, dan umur partikel
- Warna acak antara `Orange` dan `Yellow` untuk efek api realistis
- Transparansi berkurang seiring waktu (fade-out) menggunakan alpha channel

### 4. Animasi Real-Time
- `Timer` dengan interval **20ms (~50 FPS)** untuk game loop
- `DoubleBuffered = true` untuk mencegah flickering
- Fungsi trigonometri `Math.Sin()` untuk animasi hover
- `Math.Atan2()` untuk kalkulasi sudut arah mouse

### 5. Gradient & Warna
- `LinearGradientBrush` untuk efek laser beam (White → Cyan)
- Warna khas Iron Man: `Crimson`, `DarkRed`, `Gold`, `Cyan`

---

## ⚙️ Prasyarat

Sebelum menjalankan project ini, pastikan Anda memiliki:

- **OS**: Windows 10/11
- **Runtime**: [.NET Framework 4.7.2](https://dotnet.microsoft.com/en-us/download/dotnet-framework/net472) (biasanya sudah terinstall di Windows 10+)
- **IDE** (salah satu):
  - [Visual Studio 2022 Community](https://visualstudio.microsoft.com/) (Gratis — **Direkomendasikan**)
  - [Visual Studio Code](https://code.visualstudio.com/) + Extension [C# Dev Kit](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit)
  - [JetBrains Rider](https://www.jetbrains.com/rider/) (Gratis untuk mahasiswa)

---

## 🚀 Cara Menjalankan

### Opsi 1: Visual Studio (Direkomendasikan)
```
1. Clone repository ini
2. Buka file IronManGame.slnx di Visual Studio
3. Tekan F5 atau klik tombol Start
```

### Opsi 2: Visual Studio Code
```
1. Clone repository ini
2. Install extension "C# Dev Kit" dari Microsoft
3. Buka folder project di VS Code
4. Tekan F5 untuk menjalankan
```

### Opsi 3: Command Line (MSBuild)
```bash
# Build project
MSBuild.exe IronManGame\IronManGame.csproj /p:Configuration=Debug

# Jalankan hasil build
IronManGame\bin\Debug\IronManGame.exe
```

---

## 🎯 Cara Bermain

1. **Jalankan aplikasi** — Karakter Iron Man akan muncul di tengah layar
2. **Gerakkan karakter** — Gunakan tombol `W` `A` `S` `D` untuk bergerak
3. **Ubah fase** — Klik tombol **"Next Phase >>"** untuk berpindah state:
   - `Idle` → `Aim` → `Fire` → `Fly` → kembali ke `Idle`
4. **Arahkan mouse** — Pada state Aim/Fire, tangan kanan akan mengikuti kursor
5. **Perhatikan efek visual** — Api thruster, laser beam, dan bintang yang bergerak

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Keterangan |
|-----------|------------|
| **C#** | Bahasa pemrograman utama |
| **Windows Forms** | Framework UI untuk aplikasi desktop |
| **GDI+ (System.Drawing)** | Library grafika 2D untuk rendering |
| **.NET Framework 4.7.2** | Runtime environment |

---

## 👤 Informasi

- **Mata Kuliah**: Grafika Komputer
- **Semester**: 3

---

## 📄 Lisensi

Project ini dibuat untuk keperluan akademik/tugas kuliah.
