# Student Career Recommendation System (SCRS)

A full-stack ML-powered career recommendation system using unsupervised learning (dual-algorithm clustering: KMeans++ and KMeans Random) to match students with ideal career paths based on RIASEC personality assessment, skills, and subject preferences.

## 🏗️ Project Structure

```
Student-Profiling/
├── frontend/              # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── charts/              # Chart components
│       │   ├── visualizations/      # 2D/3D visualizations
│       │   ├── Layout.jsx
│       │   └── ProgressLoader.jsx
│       ├── pages/                   # Page components
│       └── store/                   # Zustand state management
│
├── api-server/            # Node.js/Express API
│   ├── middleware/       # JWT authentication
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   └── scripts/          # Utility scripts
│
├── ml-engine/             # Python FastAPI ML engine
│   ├── core/             # Core ML modules
│   ├── scripts/          # Data & model scripts
│   ├── tests/            # Test files
│   ├── utils/            # Utility scripts
│   ├── data/             # Data files (JSON, CSV)
│   ├── model/            # Trained models
│   └── app.py            # FastAPI application
│
└── docs/                  # Project documentation
```

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)

### Setup

1. **ML Engine** (Python):
   ```bash
   cd ml-engine
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   pip install -r requirements.txt
   python scripts/init_data.py
   python scripts/generate_students.py
   python scripts/train_models.py
   python app.py  # Runs on http://localhost:8001
   ```

2. **API Server** (Node.js):
   ```bash
   cd api-server
   npm install
   # Create .env file (see .env.example)
   npm start  # Runs on http://localhost:3000
   ```

3. **Frontend** (React):
   ```bash
   cd frontend
   npm install
   # Create .env file (see .env.example)
   npm run dev  # Runs on http://localhost:5173
   ```

## 🌐 Free Deployment

Deploy this entire platform for **FREE** using:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

📖 **See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete deployment guide**

**Quick Start**: See [docs/DEPLOYMENT_QUICKSTART.md](docs/DEPLOYMENT_QUICKSTART.md)

## 📚 Documentation

All documentation is in the `docs/` folder:
- `SETUP.md` - Detailed setup instructions
- `QUICKSTART.md` - Quick start guide
- `PROJECT_STRUCTURE.md` - Detailed structure
- `FEATURES.md` - Feature list
- `DEPLOYMENT.md` - Complete deployment guide
- `DEPLOYMENT_QUICKSTART.md` - Quick deployment steps
- And more...

## 🎯 Features

- **RIASEC Assessment**: 48-question personality assessment
- **Skill Analysis**: 10-skill evaluation
- **Dual-Algorithm Clustering**: KMeans++ and KMeans (Random) with automatic selection
- **Career Recommendations**: Top 5 careers with similarity scores
- **Skill Gap Analysis**: Identifies areas for improvement
- **Interactive Visualizations**: 2D/3D embeddings, cluster membership, career proximity
- **Model Statistics**: Comprehensive ML metrics dashboard
- **User Profiles**: Editable profile with image upload

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Plotly.js, Zustand
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT
- **ML Engine**: Python, FastAPI, scikit-learn, UMAP, SentenceTransformers
- **ML Models**: KMeans++ & KMeans (Random), PCA, UMAP

## 📊 Data

- **25 Career Options** across 5 domains
- **100 Synthetic Students** for training (in CSV format)
- **5 Clusters**: Tech/Analytical, Creative, Business/Leadership, Social/People, Practical/Realistic

## 📝 License

This project is for educational purposes.
