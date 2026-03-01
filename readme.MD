# KAIZY Bot - Discord Auto Thread & Anonymous System

![Node.js](https://img.shields.io/badge/Node.js-18.x-brightgreen)
![Discord.js](https://img.shields.io/badge/discord.js-v14-blue)
![License](https://img.shields.io/badge/license-MIT-yellow)

**KAIZY Bot** adalah bot Discord multifungsi untuk mengatur channel media & teks secara otomatis, lengkap dengan sistem anonim, feedback, auto-thread, slowmode, dan slash command modern.

---

## ✨ Fitur Utama

* **Auto Thread (Media / Text)**
  Otomatis membuat thread setiap ada pesan sesuai mode channel.

* **Media Only Channel**
  Hanya menerima gambar / video. Teks langsung dihapus.

* **Text Only Channel**
  Hanya menerima teks. Media langsung dihapus.

* **Anonymous Message System**
  User bisa kirim pesan anonim lewat tombol + modal.

* **Feedback System**
  User kirim feedback dan admin bisa balas via DM langsung.

* **Clear Chat**
  Hapus 1–100 pesan sekaligus.

* **Slowmode Manager**
  Atur slowmode langsung dari command.

* **Slash Command & Prefix Support**
  Support `/command` dan `!command`.

* **Dynamic Bot Status**
  Status bot update otomatis berdasarkan jumlah server & fitur aktif.

---

## 📜 Command List

| Command       | Deskripsi                               |
| ------------- | --------------------------------------- |
| `/autothread` | Aktif/nonaktif auto-thread (media/text) |
| `/setanonim`  | Setup sistem pesan anonim               |
| `/feedback`   | Setup sistem feedback                   |
| `/clear`      | Hapus pesan (1–100)                     |
| `/slowmode`   | Atur slowmode channel                   |
| `/ping`       | Cek latensi bot                         |
| `/help`       | Tampilkan menu bantuan                  |

Versi prefix:

```
!autothread
!setanonim
!feedback
!clear
!slowmode
!ping
!help
```

---

## 🔧 Cara Install & Run

### 1. Clone Repository

```bash
git clone https://github.com/username/kaizy-bot.git
cd kaizy-bot
```

### 2. Install Dependency

```bash
npm install
```

Pastikan package utama:

* discord.js v14
* dotenv

Kalau belum ada:

```bash
npm install discord.js dotenv
```

---

### 3. Setup .env

Buat file `.env` di root folder:

```bash
TOKEN=YOUR_DISCORD_BOT_TOKEN
```

Ambil token dari:
[https://discord.com/developers/applications](https://discord.com/developers/applications)

---

### 4. Jalankan Bot

```bash
node index.js
```

Kalau berhasil akan muncul:

```
Logged in as ...
```

Kalau error login, token lu salah. Simpel.

---

## 📂 Struktur File

```
├── index.js
├── autothread.json
├── anonim.json
├── feedback.json
├── .env
├── package.json
└── README.md
```

File JSON otomatis dibuat untuk menyimpan setting tiap server.

---

## 🔐 Permission yang Dibutuhkan

Bot butuh:

* Manage Channels
* Manage Threads
* Manage Messages
* Send Messages
* View Channel
* Read Message History

Kalau fitur nggak jalan, cek permission dulu. Jangan panik duluan.

---

**Author:** [KWOCAG](https://discord.com/users/1219604670054404188)

**KAIZY**

**Invite Bot:**
[KLIK DISINI](https://discord.com/oauth2/authorize?client_id=1349536671359565884&permissions=8&integration_type=0&scope=bot+applications.commands)

---
