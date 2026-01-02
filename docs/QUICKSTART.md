# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites Check
- ✅ Node.js 18+ installed
- ✅ Python 3.9+ installed
- ✅ MongoDB running (local or cloud)

### Step 1: Setup ML Engine

```bash
cd ml-engine
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python init_data.py
python train_models.py
python app.py
```

**Optional**: Verify setup with `python utils/check_setup.py`

✅ ML Engine running on `http://localhost:8001`

### Step 2: Setup Backend API

```bash
cd api-server
npm install

# Create .env file
echo "PORT=3000" > .env
echo "MONGODB_URI=mongodb://localhost:27017/scrs" >> .env
echo "JWT_SECRET=your-secret-key-here" >> .env
echo "ML_ENGINE_URL=http://localhost:8001" >> .env

npm start
```

✅ API Server running on `http://localhost:3000`

### Step 3: Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend running on `http://localhost:5173`

### Step 4: Create Test User (Optional)

To create a default test user for quick testing:

```bash
cd api-server
node scripts/create_test_user.js
```

This creates:
- **Email**: `test@scrs.com`
- **Password**: `test123`

### Step 5: Access Application

Open browser: `http://localhost:5173`

**Option 1: Use Test User**
- Email: `test@scrs.com`
- Password: `test123`

**Option 2: Register New Account**
1. Click "Register" 
2. Create your account
3. Complete the questionnaire
4. View your career profile and recommendations!

## 🎯 What You Get

- **RIASEC Profile**: 6-dimensional interest profile
- **Skill Assessment**: 10 skill dimensions
- **Career Clustering**: KMeans-based clustering
- **Recommendations**: Top 5 career matches with similarity scores
- **Visualizations**: 
  - Radar chart (RIASEC)
  - Bar chart (Skills)
  - 2D PCA scatter plot
  - 3D UMAP scatter plot
- **Skill Gap Analysis**: Identifies areas for improvement

## 📝 Notes

- First run: ML models need to be trained (run `train_models.py`)
- Career embeddings are generated automatically
- All data is stored in MongoDB
- User profiles persist across sessions

## 🐛 Troubleshooting

**ML Engine won't start?**
- Check Python version: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Run `init_data.py` first, then `train_models.py`

**API Server errors?**
- Check MongoDB is running
- Verify `.env` file exists and has correct values
- Check ML engine is running on port 8001

**Frontend not loading?**
- Check API server is running
- Check browser console for errors
- Verify CORS settings in ML engine

