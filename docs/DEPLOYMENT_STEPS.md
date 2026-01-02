# Step-by-Step Deployment Instructions

## Overview

Deploy your SCRS platform using:
- **Vercel** (Frontend) - Free, unlimited
- **Render** (Backend Services) - Free tier available
- **MongoDB Atlas** (Database) - Free tier available

---

## Part 1: Database Setup (MongoDB Atlas)

### 1.1 Create Account
1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Verify your email

### 1.2 Create Cluster
1. Click **Build a Database**
2. Choose **FREE** (M0) tier
3. Select cloud provider (AWS recommended)
4. Choose region closest to you
5. Cluster name: `Cluster0` (default)
6. Click **Create**

⏱️ **Wait 3-5 minutes** for cluster creation

### 1.3 Create Database User
1. Go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Authentication Method: **Password**
4. Username: `scrs_user`
5. Password: Click **Autogenerate Secure Password** (SAVE THIS!)
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### 1.4 Configure Network Access
1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
   - ⚠️ For production, restrict to specific IPs
4. Click **Confirm**

### 1.5 Get Connection String
1. Go to **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `<dbname>` with `scrs`

**Example Connection String:**
```
mongodb+srv://scrs_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/scrs?retryWrites=true&w=majority
```

✅ **Save this connection string - you'll need it!**

---

## Part 2: Deploy ML Engine (Render)

### 2.1 Prepare Repository
1. Push your code to GitHub (if not already)
2. Ensure all files are committed

### 2.2 Create Render Service
1. Go to: https://dashboard.render.com/
2. Sign up/Login (use GitHub for easy connection)
3. Click **New +** → **Web Service**
4. Connect your GitHub repository
5. Select your repository

### 2.3 Configure ML Engine Service
**Basic Settings:**
- **Name**: `scrs-ml-engine`
- **Region**: Choose closest to you
- **Branch**: `main` (or your default branch)
- **Root Directory**: `ml-engine`
- **Environment**: `Python 3`
- **Build Command**: 
  ```bash
  pip install -r requirements.txt && python scripts/init_data.py && python scripts/generate_students.py && python scripts/train_models.py
  ```
- **Start Command**: 
  ```bash
  uvicorn app:app --host 0.0.0.0 --port $PORT
  ```

**Environment Variables:**
- `PORT`: `10000` (Render sets this automatically)
- `CORS_ORIGIN`: `*` (temporarily, update after frontend deployment)

### 2.4 Deploy
1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
   - First build will take longer (installing dependencies, training models)
3. Once deployed, copy the service URL
   - Example: `https://scrs-ml-engine.onrender.com`

✅ **Save this URL - you'll need it for API server!**

---

## Part 3: Deploy API Server (Render)

### 3.1 Create Another Render Service
1. In Render dashboard, click **New +** → **Web Service**
2. Connect the same GitHub repository

### 3.2 Configure API Server Service
**Basic Settings:**
- **Name**: `scrs-api-server`
- **Region**: Same as ML Engine
- **Branch**: `main`
- **Root Directory**: `api-server`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

**Environment Variables:**
- `PORT`: `10000` (auto-set)
- `MONGODB_URI`: Your MongoDB Atlas connection string from Part 1
- `JWT_SECRET`: Generate using:
  ```bash
  openssl rand -hex 32
  ```
  Or use: https://randomkeygen.com/
- `ML_ENGINE_URL`: Your ML Engine URL from Part 2
  - Example: `https://scrs-ml-engine.onrender.com`
- `FRONTEND_URL`: Leave empty for now (update after Part 4)

### 3.3 Deploy
1. Click **Create Web Service**
2. Wait for deployment (2-3 minutes)
3. Copy the service URL
   - Example: `https://scrs-api-server.onrender.com`

✅ **Save this URL - you'll need it for frontend!**

---

## Part 4: Deploy Frontend (Vercel)

### 4.1 Create Vercel Account
1. Go to: https://vercel.com/signup
2. Sign up with GitHub (recommended)

### 4.2 Import Project
1. Go to: https://vercel.com/dashboard
2. Click **Add New Project**
3. Import your GitHub repository
4. Select the repository

### 4.3 Configure Project
**Project Settings:**
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

**Environment Variables:**
- `VITE_API_URL`: Your API Server URL + `/api`
  - Example: `https://scrs-api-server.onrender.com/api`

### 4.4 Deploy
1. Click **Deploy**
2. Wait for deployment (2-3 minutes)
3. Copy your frontend URL
   - Example: `https://scrs.vercel.app`

✅ **Save this URL!**

---

## Part 5: Update Environment Variables

### 5.1 Update API Server (Render)
1. Go to Render dashboard → `scrs-api-server`
2. Go to **Environment** tab
3. Update `FRONTEND_URL`:
   - Value: Your Vercel frontend URL
   - Example: `https://scrs.vercel.app`
4. Click **Save Changes**
5. Service will automatically redeploy

### 5.2 Update ML Engine (Render)
1. Go to Render dashboard → `scrs-ml-engine`
2. Go to **Environment** tab
3. Update `CORS_ORIGIN`:
   - Value: Your frontend URL, API server URL (comma-separated)
   - Example: `https://scrs.vercel.app,https://scrs-api-server.onrender.com`
4. Click **Save Changes**
5. Service will automatically redeploy

---

## Part 6: Test Your Deployment

### 6.1 Test Frontend
1. Visit your Vercel URL
2. Try registering a new user
3. Complete the questionnaire
4. Check if results load

### 6.2 Check Logs (if issues)
- **Render**: Dashboard → Service → Logs
- **Vercel**: Dashboard → Project → Deployments → View Function Logs
- **MongoDB Atlas**: Database → Metrics

---

## Optional: Keep Services Warm

Render free tier spins down after 15 minutes of inactivity.

### Using UptimeRobot (Free)
1. Sign up: https://uptimerobot.com/
2. Add monitor for ML Engine:
   - URL: `https://scrs-ml-engine.onrender.com/`
   - Interval: 5 minutes
3. Add monitor for API Server:
   - URL: `https://scrs-api-server.onrender.com/health`
   - Interval: 5 minutes

This prevents cold starts (30-60 second delay on first request).

---

## Troubleshooting

### Issue: ML Engine build fails
**Solution**: Check logs, ensure all dependencies are in `requirements.txt`

### Issue: CORS errors
**Solution**: 
- Check `CORS_ORIGIN` in ML Engine
- Check `FRONTEND_URL` in API Server
- Ensure URLs match exactly (no trailing slashes)

### Issue: Database connection fails
**Solution**:
- Check MongoDB Atlas Network Access (allow 0.0.0.0/0)
- Verify connection string has correct password
- Check database user has read/write permissions

### Issue: Environment variables not working
**Solution**:
- Restart services after adding env vars
- Check variable names (case-sensitive)
- Verify no extra spaces in values

---

## Your Final URLs

After deployment:
- **Frontend**: `https://your-app.vercel.app`
- **API**: `https://scrs-api-server.onrender.com`
- **ML Engine**: `https://scrs-ml-engine.onrender.com`
- **Database**: MongoDB Atlas (cloud)

---

## Next Steps

1. ✅ Test all functionality
2. ✅ Set up custom domain (optional)
3. ✅ Configure error monitoring (Sentry free tier)
4. ✅ Set up CI/CD (GitHub Actions)
5. ✅ Add rate limiting
6. ✅ Enable MongoDB backups (paid feature)

---

## Support

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/

Good luck! 🚀


