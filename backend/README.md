# Backend Setup & Run

## 1. Create virtual environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # on Windows: venv\Scripts\activate
```

## 2. Install dependencies

```bash
pip install -r requirements.txt
```

## 3. Configure environment

```bash
cp .env.example .env
# Edit .env and set a strong SECRET_KEY
```

## 4. Seed the database

```bash
python seed.py
```

## 5. Run the server

```bash
# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 6. Access points

- API base: http://localhost:8000/portfolio/v1/api
- Admin panel: http://localhost:8000/portfolio/v1/api/admin
- API docs: http://localhost:8000/docs
- Media files: http://localhost:8000/media

## 7. Default admin credentials

- Email: admin@example.com
- Password: admin123

## Alembic migrations

```bash
alembic upgrade head
alembic downgrade -1
```
