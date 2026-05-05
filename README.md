# 🔐 Portfolio — Docker Compose Setup

## ⚡ Bitta buyruq bilan ishga tushirish

```bash
docker compose up -d
```

**Xolos.** Hammasi avtomatik:
- ✅ Frontend va admin panel build bo'ladi
- ✅ Backend ishga tushadi, migratsiyalar ishlaydi
- ✅ Birinchi ishga tushishda seed data qo'shiladi
- ✅ nginx hamma narsani birlаshtiradi

---

## 🌍 Manzillar

| Xizmat | URL |
|--------|-----|
| Portfolio (frontend) | `http://SERVER_IP:8080/` |
| Admin Panel | `http://SERVER_IP:8080/khudayberdiyev_admin/` |
| API | `http://SERVER_IP:8080/portfolio/v1/api/` |
| Health | `http://SERVER_IP:8080/health` |

**Default admin:**
- Email: `admin@example.com`
- Parol: `admin123` ← **birinchi kirishda o'zgartiring!**

---

## ⚙️ Sozlamalar (`.env` fayli)

```env
APP_PORT=8080          # CTFd 80 portda bo'lsa shu qoladi
SECRET_KEY=...         # JWT kalit — o'zgartiring!
MAX_FILE_SIZE_MB=5
```

---

## 📦 Foydali buyruqlar

```bash
# Ishga tushirish
docker compose up -d

# Log ko'rish
docker compose logs -f

# To'xtatish
docker compose down

# Ma'lumotlarni saqlab restart
docker compose restart

# Ma'lumotlarni o'chirish (barchasini noldan boshlash)
docker compose down -v

# Backend loglar
docker compose logs backend -f

# Rebuild (kod o'zgarganda)
docker compose up -d --build
```

---

## 🔒 Xavfsizlik

- SVG upload bloklangan (XSS)
- Magic bytes validation (extension spoofing oldini oladi)
- Contact formda rate limit: 5/daqiqa
- `/docs` va `/redoc` production'da o'chirilgan
- JWT 64-baytli kuchli kalit
- CSP, X-Frame-Options, X-Content-Type-Options headerlari

---

## 🏗️ Arxitektura

```
Internet:8080
    │
    ▼
[nginx:80] ←── portfolio (React SPA)
    │       └── /khudayberdiyev_admin (Admin SPA)
    │
    ├── /portfolio/v1/api/* ──► [backend:8000]
    └── /media/* ─────────────► [backend:8000]
                                      │
                                 [SQLite + uploads]
                                 (Docker volume)
```
