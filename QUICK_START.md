# 🚀 Quick Start Commands

## Prerequisites
- Node.js 18+, Python 3.9+, MongoDB running

---

## ⚡ Start All Services

### Terminal 1: ML Engine (Python)
```bash
cd ml-engine
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
python scripts/init_data.py
python scripts/train_models.py
python app.py
```
✅ Runs on `http://localhost:8001`

---

### Terminal 2: API Server (Node.js)
```bash
cd api-server
npm install
npm start
```
✅ Runs on `http://localhost:3000`

**Note:** Create `.env` file first:
```env
MONGODB_URI=mongodb://localhost:27017/scrs
JWT_SECRET=your-secret-key
PORT=3000
ML_ENGINE_URL=http://localhost:8001
```

---

### Terminal 3: Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
✅ Runs on `http://localhost:5173`

---

## 🎯 Access Application

Open: **http://localhost:5173**

**Test User:**
- Email: `test@scrs.com`
- Password: `test123`

*(Create test user: `cd api-server && node scripts/create_test_user.js`)*

---

## 📋 One-Time Setup (First Time Only)

```bash
# ML Engine - Install & Train
cd ml-engine
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python scripts/init_data.py
python scripts/train_models.py

# API Server - Install
cd ../api-server
npm install

# Frontend - Install
cd ../frontend
npm install
```

---

## 🔄 Daily Start (After Initial Setup)

```bash
# Terminal 1
cd ml-engine
venv\Scripts\activate
python app.py

# Terminal 2
cd api-server
npm start

# Terminal 3
cd frontend
npm run dev
```

---

## 🛑 Stop All Services

Press `Ctrl+C` in each terminal window.

---

## ✅ Verify Services

- ML Engine: http://localhost:8001/health
- API Server: http://localhost:3000/health
- Frontend: http://localhost:5173

---

**Database:** `scrs` (created automatically)


