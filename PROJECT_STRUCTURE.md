# 📁 SCRS Project Structure

Complete directory structure and file organization for the Student Career Recommendation System.

## 🏗️ Root Directory

```
Student-Profiling/
├── README.md                    # Main project documentation
├── PROJECT_STRUCTURE.md        # This file - complete structure reference
├── IEEE_Report.md              # IEEE format project report
├── render.yaml                 # Render deployment configuration
├── .gitignore                  # Git ignore rules
│
├── frontend/                   # ⚛️ React Frontend Application
├── api-server/                 # 🟢 Node.js/Express API Server
├── ml-engine/                  # 🐍 Python FastAPI ML Engine
└── docs/                       # 📚 Project Documentation
```

---

## 📂 Frontend (`frontend/`)

React + Vite application with Tailwind CSS and Plotly.js.

```
frontend/
├── public/
│   └── favicon.svg              # SCRS favicon
│
├── src/
│   ├── components/
│   │   ├── charts/              # Chart visualization components
│   │   │   ├── RadarChart.jsx           # RIASEC profile radar chart
│   │   │   ├── SkillBarChart.jsx        # Skills bar chart
│   │   │   ├── ClusterMembershipChart.jsx # Cluster distribution
│   │   │   ├── CareerRecommendationChart.jsx # Career recommendations
│   │   │   └── README.md
│   │   │
│   │   ├── visualizations/      # 2D/3D visualization components
│   │   │   ├── Embedding2D.jsx          # PCA 2D scatter plot
│   │   │   ├── Embedding3D.jsx          # UMAP 3D scatter plot
│   │   │   ├── NearbyCareers3D.jsx      # 3D career proximity
│   │   │   └── README.md
│   │   │
│   │   ├── Layout.jsx           # Main layout with sidebar navigation
│   │   └── ProgressLoader.jsx   # Loading progress indicator
│   │
│   ├── pages/                   # Page components
│   │   ├── Login.jsx            # User login page
│   │   ├── Register.jsx        # User registration page
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── Questionnaire.jsx   # RIASEC + Skills + Subjects assessment
│   │   ├── Results.jsx         # Career recommendations & visualizations
│   │   ├── Profile.jsx         # User profile management
│   │   ├── ModelStatistics.jsx # ML model metrics dashboard
│   │   └── ModelWorkflow.jsx   # ML pipeline explanation
│   │
│   ├── store/                   # Zustand state management
│   │   ├── authStore.js         # Authentication state
│   │   └── profileStore.js     # User profile & recommendations state
│   │
│   ├── App.jsx                  # Main app component with routing
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global styles & Tailwind imports
│
├── index.html                   # HTML template
├── package.json                 # Dependencies & scripts
├── package-lock.json            # Dependency lock file
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
└── vercel.json                  # Vercel deployment configuration
```

**Key Technologies:**
- React 18+ with Hooks
- Vite for build tooling
- Tailwind CSS for styling
- Plotly.js for charts
- Zustand for state management
- React Router DOM for routing

---

## 📂 API Server (`api-server/`)

Node.js/Express REST API with MongoDB and JWT authentication.

```
api-server/
├── middleware/
│   ├── auth.js                  # JWT authentication middleware
│   └── upload.js                # Multer file upload configuration
│
├── models/
│   └── User.js                  # Mongoose user schema
│
├── routes/
│   ├── auth.js                  # Authentication routes (login, register)
│   └── profile.js               # Profile & ML routes (questionnaire, recommendations)
│
├── scripts/                     # Utility scripts
│   ├── create_test_user.js      # Create test user account
│   ├── fix_recommendations.js   # Fix recommendation data
│   └── verify_env.js            # Verify environment variables
│
├── uploads/                     # User-uploaded files (gitignored)
│   └── profile-images/          # Profile pictures
│
├── server.js                    # Express server entry point
├── package.json                 # Dependencies & scripts
├── package-lock.json            # Dependency lock file
└── Procfile                     # Render deployment configuration
```

**Key Technologies:**
- Express.js for REST API
- MongoDB with Mongoose ODM
- JWT for authentication
- Multer for file uploads
- bcrypt for password hashing

---

## 📂 ML Engine (`ml-engine/`)

Python FastAPI service with scikit-learn, UMAP, and SentenceTransformers.

```
ml-engine/
├── core/                        # Core ML modules
│   ├── __init__.py
│   ├── riasec_scorer.py         # RIASEC personality scoring
│   ├── profile_processor.py     # Profile vector generation
│   ├── clustering.py            # Dual-algorithm clustering (KMeans++ & Random)
│   ├── embeddings.py            # Career embeddings & dimensionality reduction
│   ├── similarity.py            # Cosine similarity matching
│   ├── data_loader.py           # Data loading utilities
│   └── README.md
│
├── scripts/                     # Utility & training scripts
│   ├── __init__.py
│   ├── init_data.py             # Initialize career data
│   ├── generate_students.py     # Generate synthetic student data
│   ├── train_models.py           # Train clustering models
│   ├── check_model_metrics.py    # Check saved model metrics
│   ├── diagnose_clustering.py   # Diagnose clustering differences
│   └── README.md
│
├── tests/                       # Test files
│   ├── __init__.py
│   └── test_skill_gap.py        # Skill gap analysis tests
│
├── utils/                       # Utility scripts
│   ├── check_setup.py           # Verify environment setup
│   └── count_careers.py          # Count careers in database
│
├── data/                        # Data files
│   ├── careers.json             # Career definitions (25 careers)
│   ├── students.json            # Synthetic student data (100 students)
│   └── students.csv             # CSV format student data
│
├── model/                       # Trained models (gitignored)
│   ├── clustering_model.joblib  # Dual-algorithm clustering model
│   ├── pca_2d.joblib            # PCA 2D dimensionality reduction
│   └── umap_3d.joblib           # UMAP 3D dimensionality reduction
│
├── venv/                        # Python virtual environment (gitignored)
│
├── app.py                       # FastAPI application entry point
├── requirements.txt             # Python dependencies
├── runtime.txt                  # Python runtime version
├── Procfile                     # Render deployment configuration
├── README.md                    # ML engine documentation
└── STRUCTURE.md                  # ML engine structure details
```

**Key Technologies:**
- FastAPI for REST API
- scikit-learn for clustering (KMeans)
- UMAP for dimensionality reduction
- SentenceTransformers for text embeddings
- NumPy & Pandas for data processing
- joblib for model persistence

**ML Algorithms:**
- **KMeans++**: Smart initialization, better convergence
- **KMeans (Random)**: Random initialization, baseline comparison
- **Auto-Selection**: Automatically selects best algorithm based on deployment metrics

---

## 📂 Documentation (`docs/`)

Comprehensive project documentation.

```
docs/
├── README.md                    # Documentation index
│
├── Setup & Quick Start
│   ├── SETUP.md                 # Detailed setup instructions
│   ├── QUICKSTART.md            # Quick start guide
│   ├── SETUP_COMPLETE.md        # Setup verification checklist
│   └── LOGIN_CREDENTIALS.md     # Default login credentials
│
├── Project Overview
│   ├── PROJECT_STRUCTURE.md     # Detailed structure (this file)
│   ├── PROJECT_FLOW.md          # System flow & architecture
│   ├── FEATURES.md              # Feature documentation
│   └── UNSUPERVISED_LEARNING.md  # ML approach explanation
│
├── ML & Training
│   ├── MODEL_TRAINING.md         # Model training guide
│   ├── CLUSTERING_ANALYSIS.md    # Clustering algorithm analysis
│   ├── CLUSTER_CENTERS_EXPLAINED.md # Cluster center explanation
│   └── WHY_METRICS_ARE_IDENTICAL.md # Algorithm comparison
│
├── Deployment
│   ├── DEPLOYMENT.md             # Complete deployment guide
│   ├── DEPLOYMENT_QUICKSTART.md  # Quick deployment steps
│   ├── DEPLOYMENT_STEPS.md       # Step-by-step deployment
│   ├── DEPLOYMENT_SUMMARY.md     # Deployment summary
│   └── RESTART_ML_ENGINE.md     # ML engine restart guide
│
├── Implementation Details
│   ├── DUAL_CLUSTERING_IMPLEMENTATION.md # Dual-algorithm system
│   ├── DEPLOYMENT_METRICS_IMPLEMENTATION.md # Metrics implementation
│   ├── DATA_PERSISTENCE.md       # Data storage & persistence
│   ├── VISUALIZATIONS_UPDATE.md  # Visualization components
│   └── UI_IMPROVEMENTS.md        # UI enhancement details
│
├── Troubleshooting
│   ├── FIX_MODEL_STATISTICS_UI.md # Model stats UI fixes
│   ├── FIX_OLD_METRICS_IN_UI.md  # Metrics display fixes
│   ├── UPLOAD_FIX.md             # Profile image upload fixes
│   └── STATUS.md                 # Project status & issues
│
├── Utilities & Organization
│   ├── UTILITIES.md              # Utility scripts guide
│   ├── RESTRUCTURING.md          # Project restructuring notes
│   ├── CLEANUP_COMPLETE.md       # Cleanup completion notes
│   ├── CLEANUP_SUMMARY.md        # Cleanup summary
│   └── PROJECT_ORGANIZATION.md   # Project organization guide
│
└── PROJECT_STRUCTURE_ROOT.md     # Root-level structure reference
```

---

## 🔑 Key Files Reference

### Configuration Files
- `frontend/vite.config.js` - Vite build configuration
- `frontend/tailwind.config.js` - Tailwind CSS configuration
- `api-server/server.js` - Express server configuration
- `ml-engine/app.py` - FastAPI application configuration
- `render.yaml` - Render deployment configuration

### Entry Points
- `frontend/src/main.jsx` - Frontend entry point
- `api-server/server.js` - API server entry point
- `ml-engine/app.py` - ML engine entry point

### State Management
- `frontend/src/store/authStore.js` - Authentication state
- `frontend/src/store/profileStore.js` - Profile & recommendations state

### Core ML Modules
- `ml-engine/core/clustering.py` - Dual-algorithm clustering
- `ml-engine/core/embeddings.py` - Embeddings & dimensionality reduction
- `ml-engine/core/similarity.py` - Career similarity matching

---

## 📊 Data Flow

```
User → Frontend → API Server → ML Engine → MongoDB
                ↓
            Results ← Recommendations ← Clustering ← Profile Vector
```

1. **User Registration/Login**: Frontend → API Server → MongoDB
2. **Questionnaire Submission**: Frontend → API Server → ML Engine
3. **Profile Processing**: ML Engine processes RIASEC, Skills, Subjects
4. **Clustering**: ML Engine assigns user to cluster (KMeans++ or Random)
5. **Recommendations**: ML Engine finds top 5 similar careers
6. **Visualization**: ML Engine generates 2D/3D embeddings
7. **Results Display**: Frontend displays recommendations & visualizations

---

## 🗂️ File Organization Principles

1. **Separation of Concerns**: Frontend, API, and ML are separate services
2. **Modular Code**: Core modules in `core/`, utilities in `utils/` or `scripts/`
3. **Organized Components**: Frontend components grouped by type
4. **Centralized Docs**: All documentation in `docs/` folder
5. **Clean Root**: Only essential files at root level
6. **Gitignored**: Generated files, models, uploads, and dependencies

---

## 🚀 Quick Navigation

- **Start Development**: See `docs/QUICKSTART.md`
- **Setup Instructions**: See `docs/SETUP.md`
- **Deployment Guide**: See `docs/DEPLOYMENT.md`
- **ML Training**: See `docs/MODEL_TRAINING.md`
- **Features**: See `docs/FEATURES.md`
- **Architecture**: See `docs/PROJECT_FLOW.md`

---

**Last Updated**: 2025-01-XX
**Project**: Student Career Recommendation System (SCRS)
