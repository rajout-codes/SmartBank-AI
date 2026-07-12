# SmartBank AI Agent

Minimal educational banking AI demo. **No real transactions.**

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env         # add GEMINI_API_KEY (optional)
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Open http://localhost:3000 — register or login, then explore.

## Features (minimal)
- JWT auth (register/login)
- AI chat (Gemini or offline FAQ fallback)
- EMI & loan eligibility calculators
- Credit card comparison
- FAQ search (lightweight RAG)
- Dark/light theme

## API
`http://localhost:8000/docs` — Swagger UI

## Env Vars
| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | JWT secret |
| `GEMINI_API_KEY` | Optional — enables full AI chat |
| `DATABASE_URL` | SQLite default |
| `CORS_ORIGINS` | Frontend URL |

## Structure
```
SmartBank/
├── backend/main.py      # All API logic in one file
├── frontend/src/        # Next.js 15 app
├── .gitignore
└── README.md
```
