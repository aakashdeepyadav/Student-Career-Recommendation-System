# Quick Deployment Guide

## 🚀 Free Deployment Stack

| Service | Purpose | Platform | Free Tier |
|---------|---------|----------|-----------|
| **Frontend** | React/Vite App | Vercel | ✅ Unlimited |
| **API Server** | Node.js/Express | Render | ✅ 750 hrs/month |
| **ML Engine** | Python/FastAPI | Render | ✅ 750 hrs/month |
| **Database** | MongoDB | Atlas | ✅ 512MB storage |

---

## 📋 Deployment Checklist

### Step 1: MongoDB Atlas (5 minutes)
1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create FREE cluster (M0)
3. Create database user
4. Allow access from anywhere (0.0.0.0/0)
5. Copy connection string

### Step 2: ML Engine on Render (10 minutes)
1. Push code to GitHub
2. Go to Render → New Web Service
3. Connect GitHub repo
4. Settings:
   - **Name**: `scrs-ml-engine`
   - **Root Directory**: `ml-engine`
   - **Environment**: Python 3
   - **Build**: `pip install -r requirements.txt && python scripts/init_data.py && python scripts/generate_students.py && python scripts/train_models.py`
   - **Start**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
5. Add env var: `CORS_ORIGIN` = `*` (temporarily)
6. Deploy → Copy URL

### Step 3: API Server on Render (10 minutes)
1. Render → New Web Service
2. Connect same GitHub repo
3. Settings:
   - **Name**: `scrs-api-server`
   - **Root Directory**: `api-server`
   - **Environment**: Node
   - **Build**: `npm install`
   - **Start**: `node server.js`
4. Environment Variables:
   - `MONGODB_URI` = Your Atlas connection string
   - `JWT_SECRET` = Random secret (use `openssl rand -hex 32`)
   - `ML_ENGINE_URL` = ML Engine URL from Step 2
   - `FRONTEND_URL` = Will add after Step 4
5. Deploy → Copy URL

### Step 4: Frontend on Vercel (5 minutes)
1. Go to Vercel → Add New Project
2. Import GitHub repo
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework**: Vite
4. Environment Variable:
   - `VITE_API_URL` = `https://scrs-api-server.onrender.com/api`
5. Deploy → Copy URL

### Step 5: Update URLs
1. **API Server** (Render):
   - Update `FRONTEND_URL` = Your Vercel URL
2. **ML Engine** (Render):
   - Update `CORS_ORIGIN` = Your Vercel URL, API Server URL

---

## 🔗 Your URLs After Deployment

```
Frontend:  https://your-app.vercel.app
API:       https://scrs-api-server.onrender.com
ML Engine: https://scrs-ml-engine.onrender.com
Database:  MongoDB Atlas (cloud)
```

---

## ⚠️ Important Notes

1. **Render Free Tier**: Services spin down after 15 min inactivity
   - First request after spin-down: 30-60 seconds
   - Solution: Use UptimeRobot (free) to ping every 5 minutes

2. **MongoDB Atlas**: 
   - Free tier: 512MB storage
   - Connection limit: 500 connections
   - No automatic backups (manual only)

3. **Environment Variables**:
   - Never commit `.env` files
   - Set all vars in platform dashboards
   - Restart services after adding vars

4. **CORS**:
   - Update CORS origins after getting all URLs
   - Use comma-separated list for multiple origins

---

## 🐛 Common Issues

**Issue**: ML Engine timeout on first request
- **Fix**: Wait 30-60 seconds, or use UptimeRobot to keep warm

**Issue**: CORS errors
- **Fix**: Check all CORS_ORIGIN and FRONTEND_URL env vars

**Issue**: Database connection failed
- **Fix**: Check MongoDB Atlas network access (allow 0.0.0.0/0)

**Issue**: Build fails
- **Fix**: Check logs, ensure all dependencies in requirements.txt/package.json

---

## 📚 Full Documentation

See `docs/DEPLOYMENT.md` for detailed step-by-step instructions.

---

## 🎉 You're Done!

After deployment, test:
1. Register a new user
2. Complete questionnaire
3. View results and visualizations

Good luck! 🚀


