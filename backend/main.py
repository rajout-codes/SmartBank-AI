"""SmartBank AI Agent - minimal FastAPI backend."""
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
import bcrypt
from google import genai
from pydantic import BaseModel, EmailStr, Field
from pydantic_settings import BaseSettings
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.orm import Session, declarative_base, relationship, sessionmaker

# --- Config ---
class Settings(BaseSettings):
    secret_key: str = "dev-secret-change-me"
    gemini_api_key: str = ""
    database_url: str = "sqlite:///./smartbank.db"
    cors_origins: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()
engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()
security = HTTPBearer(auto_error=False)

# --- Models ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    role = Column(String, default="customer")
    chats = relationship("Chat", back_populates="user")

class Chat(Base):
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String)
    content = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user = relationship("User", back_populates="chats")

Base.metadata.create_all(bind=engine)

# --- Schemas ---
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = ""

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ChatIn(BaseModel):
    message: str

class EmiIn(BaseModel):
    amount: float = Field(gt=0)
    rate: float = Field(gt=0, le=50)
    tenure_months: int = Field(gt=0, le=360)

class LoanIn(BaseModel):
    salary: float = Field(gt=0)
    age: int = Field(ge=18, le=70)
    employment: str
    existing_emi: float = Field(ge=0, default=0)
    credit_score: int = Field(ge=300, le=900, default=700)

# --- Auth helpers ---
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def verify_password(p: str, h: str) -> bool:
    return bcrypt.checkpw(p.encode(), h.encode())

def create_token(user_id: int, role: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=7)
    return jwt.encode({"sub": str(user_id), "role": role, "exp": exp}, settings.secret_key, algorithm="HS256")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(security), db: Session = Depends(get_db)) -> User:
    if not creds:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, settings.secret_key, algorithms=["HS256"])
        user = db.query(User).filter(User.id == int(payload["sub"])).first()
        if not user:
            raise HTTPException(401, "Invalid token")
        return user
    except JWTError:
        raise HTTPException(401, "Invalid token")

# --- Banking knowledge (lightweight RAG substitute) ---
FAQ = {
    "savings": "A savings account earns interest on deposits. Ideal for emergency funds and daily banking.",
    "fd": "Fixed Deposit (FD) locks money for a set period at a fixed rate. Higher rates than savings, early withdrawal may incur penalty.",
    "neft": "NEFT settles bank transfers in batches (hourly). RTGS is real-time for amounts ≥ ₹2 lakh. Both are safe RBI-regulated systems.",
    "upi": "UPI lets you pay instantly via mobile using a VPA. Never share OTP or UPI PIN with anyone.",
    "credit score": "Credit score (300-900) reflects repayment history. Above 750 improves loan approval and lower interest rates.",
}

CARDS = [
    {"name": "SmartRewards", "type": "rewards", "cashback": "2%", "annual_fee": 500, "best_for": "shopping"},
    {"name": "TravelMax", "type": "travel", "cashback": "1%", "annual_fee": 1500, "best_for": "flights & hotels"},
    {"name": "FuelSaver", "type": "fuel", "cashback": "5% fuel", "annual_fee": 0, "best_for": "commuters"},
    {"name": "CashBack Pro", "type": "cashback", "cashback": "3% all", "annual_fee": 999, "best_for": "everyday spend"},
]

PRODUCTS = [
    {"name": "SmartSave", "type": "savings", "rate": "3.5%", "pros": "Zero balance, free debit card", "cons": "Lower interest"},
    {"name": "Growth FD", "type": "fd", "rate": "7.2%", "pros": "Guaranteed returns", "cons": "Locked tenure"},
    {"name": "Home Loan", "type": "loan", "rate": "8.5%", "pros": "Up to 30yr tenure", "cons": "Collateral required"},
]

def banking_context(msg: str) -> str:
    lower = msg.lower()
    hits = [v for k, v in FAQ.items() if k in lower]
    return "\n".join(hits) if hits else ""

class Gemini:
    def __init__(self, api_key: str):
        self.client = genai.Client(api_key=api_key)

    def generate_content(self, system: str, history: list, message: str):
        prompt = f"""System Instructions:
{system}

Conversation History:
{history}

User:
{message}

Assistant:"""
        return self.client.models.generate_content(model="gemini-2.5-flash", contents=prompt)

def ai_reply(msg: str, history: list[dict]) -> str:
    ctx = banking_context(msg)
    system = (
        "You are SmartBank AI, an educational and a professional banking assistant. "
        "You are an educational and a professional banking assistant. "
        "You can help with Savings Accounts, Fixed Deposits, UPI, Loans, Credit Cards, "
        "EMI calculations, and banking FAQs. "
        "Configure GEMINI_API_KEY to enable AI-powered responses."
    )
    return (
        "I'm SmartBank AI (Demo Mode). "
        "I can help with Savings Accounts, Fixed Deposits, UPI, Loans, Credit Cards, "
        "EMI calculations, and banking FAQs. "
        "Configure GEMINI_API_KEY to enable AI-powered responses."
    )

# --- App ---
app = FastAPI(title="SmartBank AI", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/auth/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(email=data.email, name=data.name or data.email.split("@")[0], hashed_password=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"token": create_token(user.id, user.role), "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role}}

@app.post("/auth/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    return {"token": create_token(user.id, user.role), "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role}}

@app.get("/profile")
def profile(user: User = Depends(get_user)):
    return {"id": user.id, "email": user.email, "name": user.name, "role": user.role}

@app.post("/chat")
def chat(data: ChatIn, user: User = Depends(get_user), db: Session = Depends(get_db)):
    history_rows = db.query(Chat).filter(Chat.user_id == user.id).order_by(Chat.created_at.desc()).limit(10).all()
    history = [{"role": r.role, "content": r.content} for r in reversed(history_rows)]
    reply = ai_reply(data.message, history)
    db.add(Chat(user_id=user.id, role="user", content=data.message))
    db.add(Chat(user_id=user.id, role="assistant", content=reply))
    db.commit()
    return {"reply": reply}

@app.get("/chat/history")
def chat_history(user: User = Depends(get_user), db: Session = Depends(get_db)):
    rows = db.query(Chat).filter(Chat.user_id == user.id).order_by(Chat.created_at).all()
    return [{"role": r.role, "content": r.content, "at": r.created_at.isoformat()} for r in rows]

@app.post("/emi")
def emi(data: EmiIn):
    r = data.rate / 12 / 100
    n = data.tenure_months
    emi_val = data.amount * r * (1 + r) ** n / ((1 + r) ** n - 1)
    total = emi_val * n
    return {"emi": round(emi_val, 2), "total_interest": round(total - data.amount, 2), "total_amount": round(total, 2)}

@app.post("/loan/calculate")
def loan_eligibility(data: LoanIn):
    multiplier = {750: 60, 700: 48, 650: 36, 600: 24}.get(max(600, min(data.credit_score, 900) // 50 * 50), 24)
    max_emi = data.salary * 0.4 - data.existing_emi
    eligible = max(0, min(data.salary * multiplier, max_emi * 240))
    rate = 9.5 if data.credit_score < 700 else 8.5
    emi_est = eligible * (rate / 12 / 100) * (1 + rate / 12 / 100) ** 240 / ((1 + rate / 12 / 100) ** 240 - 1) if eligible else 0
    tips = []
    if data.credit_score < 700:
        tips.append("Improve credit score to unlock better rates")
    if data.existing_emi > data.salary * 0.3:
        tips.append("High existing EMI reduces eligibility")
    if data.age > 55:
        tips.append("Shorter tenure may apply due to age")
    return {"eligible_amount": round(eligible, 2), "estimated_emi": round(emi_est, 2), "rate": rate, "suggestions": tips or ["You look eligible for a standard home/personal loan"]}

@app.get("/cards")
def cards(preference: str = "cashback"):
    pref = preference.lower()
    ranked = sorted(CARDS, key=lambda c: c["type"] == pref or c["best_for"] == pref, reverse=True)
    return {"cards": ranked, "recommended": ranked[0]}

@app.get("/products")
def products():
    return {"products": PRODUCTS}

@app.get("/rag/search")
def rag_search(q: str):
    results = [{"topic": k, "content": v} for k, v in FAQ.items() if q.lower() in k or q.lower() in v.lower()]
    return {"results": results, "sources": [r["topic"] for r in results]}

@app.get("/health")
def health():
    return {"status": "ok"}
