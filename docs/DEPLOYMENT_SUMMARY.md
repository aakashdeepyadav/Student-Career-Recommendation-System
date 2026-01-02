# Deployment Summary - What to Use Where

## 🎯 Platform Selection Guide

### Frontend (React/Vite) → **Vercel** ✅
**Why Vercel?**
- ✅ Perfect for React/Vite apps
- ✅ Automatic deployments from GitHub
- ✅ Global CDN (fast worldwide)
- ✅ Free SSL certificates
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month (free tier)
- ✅ Zero configuration needed

**Alternative**: Netlify (also good, but Vercel is faster for Vite)

---

### API Server (Node.js/Express) → **Render** ✅
**Why Render?**
- ✅ Free tier: 750 hours/month (enough for 24/7)
- ✅ Easy Node.js deployment
- ✅ Automatic HTTPS
- ✅ Environment variables management
- ✅ Auto-deploy from GitHub
- ⚠️ Spins down after 15 min inactivity (use UptimeRobot to keep warm)

**Alternatives**: 
- Railway (free tier, but limited)
- Fly.io (free tier, more complex)

---

### ML Engine (Python/FastAPI) → **Render** ✅
**Why Render?**
- ✅ Free tier: 750 hours/month
- ✅ Python 3 support
- ✅ Can run long build commands (model training)
- ✅ Same platform as API (easier management)
- ⚠️ Spins down after 15 min inactivity

**Alternatives**:
- Railway (free tier, simpler)
- Fly.io (free tier, more control)

---

### Database → **MongoDB Atlas** ✅
**Why MongoDB Atlas?**
- ✅ Free tier: 512MB storage
- ✅ Managed service (no server setup)
- ✅ Automatic backups (paid) / Manual (free)
- ✅ Easy connection from anywhere
- ✅ 500 connections (free tier)
- ✅ Perfect for Node.js/Mongoose

**Alternatives**:
- Railway PostgreSQL (free tier, but need to migrate)
- Supabase (free tier, PostgreSQL)

---

## 📋 Quick Deployment Order

1. **MongoDB Atlas** (5 min) - Get connection string
2. **ML Engine on Render** (10 min) - Get ML Engine URL
3. **API Server on Render** (10 min) - Get API URL
4. **Frontend on Vercel** (5 min) - Get Frontend URL
5. **Update URLs** (5 min) - Link everything together

**Total Time: ~35 minutes**

---

## 🔗 Service URLs After Deployment

```
Frontend:  https://your-app.vercel.app
API:       https://scrs-api-server.onrender.com
ML Engine: https://scrs-ml-engine.onrender.com
Database:  mongodb+srv://... (Atlas connection string)
```

---

## 💰 Cost Breakdown

| Service | Platform | Free Tier | Cost |
|---------|----------|-----------|------|
| Frontend | Vercel | Unlimited | $0 |
| API Server | Render | 750 hrs/month | $0 |
| ML Engine | Render | 750 hrs/month | $0 |
| Database | MongoDB Atlas | 512MB | $0 |
| **TOTAL** | | | **$0/month** |

---

## ⚠️ Free Tier Limitations

### Render
- ✅ 750 hours/month (enough for 24/7)
- ⚠️ Spins down after 15 min inactivity
- ⚠️ 512MB RAM per service
- ⚠️ Shared CPU

**Solution**: Use UptimeRobot (free) to ping every 5 minutes

### Vercel
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ⚠️ Serverless functions have execution limits

### MongoDB Atlas
- ✅ 512MB storage
- ⚠️ No automatic backups (free tier)
- ⚠️ 500 connection limit

---

## 🚀 Why This Stack?

1. **Vercel for Frontend**: Best performance, zero config, perfect for React
2. **Render for Backend**: Reliable, free tier is generous, easy setup
3. **MongoDB Atlas**: Industry standard, free tier is sufficient, easy to scale

---

## 📚 Next Steps

1. Read [DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md) for detailed instructions
2. Or use [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md) for quick reference
3. Follow the step-by-step guide
4. Test your deployment
5. Keep services warm with UptimeRobot

---

## 🆘 Need Help?

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/

Good luck! 🚀


