# Portfolio — Deployment Guide

## Portlar

| Servis | URL | Ta'rif |
|--------|-----|--------|
| Portfolio | `http://host:4000/` | Asosiy portfolio sayti |
| Admin panel | `http://host:4000/khudayberdiyev_admin` | Boshqaruv paneli |
| Backend API | `http://host:8000/portfolio/v1/api/` | REST API |

---

## Production Deploy (Docker)

### Talablar
- Docker 24+
- Docker Compose v2

### 1. `.env` sozlang

```env
APP_PORT=4000
SECRET_KEY=<KUCHLI_KALIT>    # openssl rand -hex 32
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
MAX_FILE_SIZE_MB=5
```

### 2. Ishga tushirish

```bash
docker compose up -d --build
```

**Hammasi avtomatik:**
- Frontend + Admin panel build bo'ladi
- Backend ishga tushadi, migratsiyalar ishlaydi
- Birinchi ishga tushishda seed data qo'shiladi
- nginx hamma narsani birlashtiradi

### 3. Foydali buyruqlar

```bash
docker compose logs -f           # loglar
docker compose ps                # holat
docker compose restart backend   # faqat backendni restart
docker compose down              # to'xtatish (ma'lumotlar saqlanadi)
docker compose down -v           # to'xtatish + volume o'chirish
docker compose up -d --build     # rebuild va restart
```

### 4. Ma'lumotlar saqlash joyi

```
Docker volume: portfolio_data
  /data/db/portfolio.db   ← SQLite bazasi
  /data/media/            ← yuklangan fayllar
```

---

## Local Development

### Talablar
- Node.js 20+
- Python 3.12+

### 1. O'rnatish

```bash
# Root papkadan
npm install            # concurrently o'rnatadi
npm run install:all    # frontend + admin-panel paketlari
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python seed.py                # faqat birinchi marta
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend + Admin (bitta buyruq)

```bash
# Root papkadan (yangi terminal)
npm run dev
```

Shundan keyin:
- `http://localhost:4000/` — Portfolio
- `http://localhost:4000/khudayberdiyev_admin` — Admin panel
- `http://localhost:8000/` — Backend API

> Frontend Vite `/khudayberdiyev_admin/*` so'rovlarini admin dev serveriga (`:5174`) proxy qiladi.

---

## Birinchi kirish

```
Email:  admin@example.com
Parol:  admin123
```

**Darhol parolni o'zgartiring!** → Admin panel → Admins

---

## Arxitektura

```
:4000/                         → Portfolio React SPA
:4000/khudayberdiyev_admin/    → Admin React SPA
:4000/portfolio/v1/api/        → Backend (nginx proxy)
:4000/media/                   → Yuklangan fayllar (nginx proxy)
:8000/                         → Backend to'g'ridan-to'g'ri

Docker ichida:
  [nginx:80] → portfolio static
             → admin static
             → proxy → [backend:8000]
                            ↓
                    [SQLite + uploads]
                    (Docker volume: portfolio_data)
```

---

## Server deploy (VPS)

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER && newgrp docker

git clone <repo-url> portfolio && cd portfolio
cp .env.example .env   # SECRET_KEY ni o'zgartiring!

docker compose up -d --build

# Firewall
sudo ufw allow 4000/tcp
sudo ufw allow 8000/tcp
```

### 80/443 portga yo'naltirish (Nginx reverse proxy)

```nginx
server {
    listen 80;
    server_name sizning-domen.uz;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## Xavfsizlik

- Login endpointda rate limit: 10/daqiqa (brute force himoya)
- Contact formda rate limit: 5/daqiqa
- SVG upload bloklangan (XSS)
- Magic bytes validation (extension spoofing)
- JWT Argon2 parol hashing
- CSP, HSTS, X-Frame-Options security headers
- `/docs`, `/redoc` production'da o'chirilgan
- Sensitive yo'llar (`.env`, `.git`) blocked

---

## Muammolar

```bash
# Port band
ss -tlnp | grep 4000

# Container boshlanmayapti
docker compose logs backend
docker compose logs web

# Ma'lumotlar yo'qoldi?
docker volume ls
docker volume inspect portfolio_data
```
