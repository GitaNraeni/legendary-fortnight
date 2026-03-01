```markdown
# Discord Multifunction Bot

Bot Discord berbasis **Node.js** dan **discord.js v14** dengan fitur:
- Auto Thread (media / teks)
- Pesan Anonim
- Sistem Feedback
- Clear Chat
- Slowmode
- Slash Command & Prefix Command

Source utama: `index.js` :contentReference[oaicite:0]{index=0}

---

## 🚀 Fitur Utama

### 1. Auto Thread
Membuat thread otomatis ketika ada pesan:
- Mode `media` → hanya file/gambar, teks akan dihapus
- Mode `text` → hanya teks, media akan dihapus
- Bisa aktifkan slowmode otomatis

Command:
```

/autothread
!autothread <media|text> <#channel> <enabled|disabled> [slowmode]

```

---

### 2. Pesan Anonim
User bisa kirim pesan tanpa ketahuan identitasnya lewat tombol + modal.

Command:
```

/setanonim
!setanonim <#channel>

```

---

### 3. Feedback System
User kirim feedback lewat tombol.
Admin bisa balas via DM langsung dari tombol.

Command:
```

/feedback
!feedback <#sendchannel> <#receivechannel>

```

---

### 4. Clear Chat
Hapus pesan 1–100 sekaligus.

```

/clear
!clear <jumlah>

```

---

### 5. Slowmode
Aktif / nonaktif slowmode channel.

```

/slowmode
!slowmode <enable|disable> <#channel> [detik]

```

---

### 6. Ping
Cek latensi bot.

```

/ping
!ping

```

---

## ⚙️ Cara Install

### 1. Clone Repo
```

git clone [https://github.com/GitaNraeni/legendary-fortnight.git](https://github.com/GitaNraeni/legendary-fortnight.git)
cd repository

```

### 2. Install Dependency
```

npm install

```

### 3. Install Package yang Dibutuhkan
Pastikan ada:
- discord.js
- dotenv

Kalau belum:
```

npm install discord.js dotenv

```

---

## 🔑 Setup Token

Buat file `.env` di root folder:

```

TOKEN=ISI_TOKEN_BOT_KAMU

```

Ambil token dari:
https://discord.com/developers/applications

---

## ▶️ Jalankan Bot

```

node index.js

```

Kalau sukses:
```

Logged in as ...

```

Kalau error login, berarti token lu salah. Jangan nyalahin server.

---

## 🛠 Permission yang Dibutuhkan

Bot butuh:
- Manage Channels
- Manage Threads
- Manage Messages
- Send Messages
- View Channel
- Read Message History

Kalau fitur nggak jalan, 90% karena permission lu pelit.

---

## 📁 File Konfigurasi Otomatis

Bot akan membuat file:
- `autothread.json`
- `anonim.json`
- `feedback.json`

File ini nyimpen setting tiap server.

Jangan dihapus kalau nggak mau setting lu lenyap.

---

## 📌 Notes

- Support Slash Command & Prefix `!`
- Activity status auto update
- Semua setting tersimpan per server (guild-based)

---

## 💡 Butuh Bantuan?

Gunakan:
```

/help

```

Atau cek menu bantuan di server.

---

Selesai.  
Sekarang tinggal deploy. Jangan cuma dibaca doang terus botnya nggak dinyalain.
```
