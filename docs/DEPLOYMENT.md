# Free Deployment Guide

This guide will help you deploy the entire SCRS platform for free using:
- **Frontend**: Vercel (React/Vite)
- **API Server**: Render (Node.js/Express)
- **ML Engine**: Render (Python/FastAPI)
- **Database**: MongoDB Atlas (Free Tier)

## Prerequisites

1. GitHub account
2. Vercel account (free)
3. Render account (free)
4. MongoDB Atlas account (free)

---

## Step 1: Database Setup (MongoDB Atlas)

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for free
3. Create a new cluster (choose FREE tier - M0)
4. Choose a cloud provider and region (closest to you)
5. Create cluster (takes 3-5 minutes)

### 1.2 Configure Database Access
1. Go to **Database Access** → **Add New Database User**
2. Username: `scrs_user` (or your choice)
3. Password: Generate a strong password (save it!)
4. Database User Privileges: **Read and write to any database**
5. Click **Add User**

### 1.3 Configure Network Access
1. Go to **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (for development)
   - Or add specific IPs for production
3. Click **Confirm**

### 1.4 Get Connection String
1. Go to **Database** → Click **Connect** on your cluster
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `scrs` (or your choice)
6. Save this connection string - you'll need it!

**Example:**
```
mongodb+srv://scrs_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/scrs?retryWrites=true&w=majority
```

---

## Step 2: Deploy ML Engine (Python/FastAPI) on Render

### 2.1 Prepare ML Engine for Deployment

1. **Create `ml-engine/Procfile`**:
```procfile
web: uvicorn app:app --host 0.0.0.0 --port $PORT
```

2. **Create `ml-engine/runtime.txt`** (optional, specify Python version):
```
python-3.10.0
```

3. **Update `ml-engine/app.py`** CORS settings:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2.2 Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `scrs-ml-engine`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python scripts/init_data.py && python scripts/generate_students.py && python scripts/train_models.py`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `ml-engine`

5. **Environment Variables**:
   - `PORT`: `10000` (Render sets this automatically)
   - Add any other env vars your app needs

6. Click **Create Web Service**
7. Wait for deployment (5-10 minutes)
8. **Copy the service URL** (e.g., `https://scrs-ml-engine.onrender.com`)

**Note**: Render free tier spins down after 15 minutes of inactivity. First request may take 30-60 seconds.

---

## Step 3: Deploy API Server (Node.js/Express) on Render

### 3.1 Prepare API Server for Deployment

1. **Create `api-server/Procfile`**:
```procfile
web: node server.js
```

2. **Update `api-server/server.js`** to use environment PORT:
```javascript
const PORT = process.env.PORT || 3000;
```

3. **Update CORS in `api-server/server.js`**:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### 3.2 Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `scrs-api-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Root Directory**: `api-server`

5. **Environment Variables**:
   - `PORT`: `10000` (auto-set by Render)
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a random secret (e.g., `openssl rand -hex 32`)
   - `ML_ENGINE_URL`: Your ML Engine URL from Step 2 (e.g., `https://scrs-ml-engine.onrender.com`)
   - `FRONTEND_URL`: Your frontend URL (will be set after Step 4)

6. Click **Create Web Service**
7. Wait for deployment
8. **Copy the service URL** (e.g., `https://scrs-api-server.onrender.com`)

---

## Step 4: Deploy Frontend (React/Vite) on Vercel

### 4.1 Prepare Frontend for Deployment

1. **Create `frontend/vercel.json`**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

2. **Update `frontend/.env` or create `frontend/.env.production`**:
```env
VITE_API_URL=https://scrs-api-server.onrender.com/api
```

3. **Update `frontend/src/store/authStore.js` and `profileStore.js`**:
   - Ensure they use `import.meta.env.VITE_API_URL`

### 4.2 Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Environment Variables**:
   - `VITE_API_URL`: `https://scrs-api-server.onrender.com/api`

6. Click **Deploy**
7. Wait for deployment (2-3 minutes)
8. **Copy your frontend URL** (e.g., `https://scrs.vercel.app`)

### 4.3 Update Backend URLs

1. Go back to Render dashboard
2. Update **API Server** environment variables:
   - `FRONTEND_URL`: Your Vercel URL (e.g., `https://scrs.vercel.app`)
3. Update **ML Engine** CORS (if needed):
   - Update `allow_origins` in `ml-engine/app.py` to include your frontend URL

---

## Step 5: Update Environment Variables

### 5.1 API Server (Render)
Update these in Render dashboard:
- `FRONTEND_URL`: Your Vercel frontend URL
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Your secret key
- `ML_ENGINE_URL`: Your Render ML Engine URL

### 5.2 Frontend (Vercel)
Update in Vercel dashboard:
- `VITE_API_URL`: Your Render API Server URL + `/api`

---

## Step 6: Test Deployment

1. Visit your Vercel frontend URL
2. Try registering a new user
3. Complete the questionnaire
4. Check if results load correctly

---

## Free Tier Limitations

### Render (Free Tier)
- ✅ 750 hours/month (enough for 24/7)
- ⚠️ Spins down after 15 min inactivity (cold start ~30-60s)
- ⚠️ 512MB RAM
- ⚠️ Shared CPU

### Vercel (Free Tier)
- ✅ Unlimited deployments
- ✅ Global CDN
- ✅ Automatic SSL
- ⚠️ 100GB bandwidth/month
- ⚠️ Serverless functions have limits

### MongoDB Atlas (Free Tier)
- ✅ 512MB storage
- ✅ Shared cluster
- ⚠️ Limited connections
- ⚠️ No backups (manual only)

---

## Troubleshooting

### ML Engine takes too long to start
- **Solution**: Keep it warm with a cron job or use a service like UptimeRobot (free)

### CORS Errors
- **Solution**: Ensure all URLs are correctly set in environment variables
- Check CORS settings in both API server and ML engine

### Database Connection Issues
- **Solution**: Check MongoDB Atlas network access (allow all IPs for testing)
- Verify connection string has correct password

### Environment Variables Not Working
- **Solution**: Restart services after adding env vars
- Check variable names match exactly (case-sensitive)

---

## Optional: Keep Services Warm

### Using UptimeRobot (Free)
1. Sign up at [UptimeRobot](https://uptimerobot.com/)
2. Add monitors for:
   - ML Engine URL (every 5 minutes)
   - API Server URL (every 5 minutes)
3. This prevents cold starts

---

## Production Checklist

- [ ] Update CORS to only allow your frontend domain
- [ ] Use strong JWT_SECRET
- [ ] Enable MongoDB Atlas backups (paid feature)
- [ ] Set up error monitoring (Sentry free tier)
- [ ] Configure custom domain (optional)
- [ ] Set up CI/CD (GitHub Actions)
- [ ] Add rate limiting to API
- [ ] Enable HTTPS everywhere (automatic with Vercel/Render)

---

## Quick Reference URLs

After deployment, you'll have:
- **Frontend**: `https://your-app.vercel.app`
- **API Server**: `https://scrs-api-server.onrender.com`
- **ML Engine**: `https://scrs-ml-engine.onrender.com`
- **Database**: MongoDB Atlas (connection string)

---

## Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Function Logs
3. Check MongoDB Atlas logs: Database → Metrics

Good luck with your deployment! 🚀


