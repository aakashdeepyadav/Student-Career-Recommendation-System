# Project Structure

```
Student-Profiling/
├── README.md                 # Main project documentation
├── SETUP.md                  # Setup instructions
├── PROJECT_STRUCTURE.md      # This file
├── .gitignore               # Git ignore rules
│
├── ml-engine/               # Python ML Service
│   ├── app.py               # FastAPI main application
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variables template
│   ├── riasec_scorer.py     # RIASEC profile computation
│   ├── profile_processor.py # Profile vector generation
│   ├── clustering.py        # KMeans clustering
│   ├── embeddings.py        # PCA/UMAP reduction & career embeddings
│   ├── similarity.py        # Cosine similarity engine
│   ├── data_loader.py       # Data loading utilities
│   ├── init_data.py         # Initialize career data
│   ├── train_models.py      # Train clustering models
│   ├── model/               # Saved ML models (generated)
│   │   ├── kmeans_model.joblib
│   │   ├── pca_2d.joblib
│   │   └── umap_3d.joblib
│   └── data/                # Data files
│       ├── careers.json     # Career dataset (generated)
│       └── students.json    # Student dataset (generated)
│
├── api-server/               # Node.js Backend API
│   ├── server.js            # Express server
│   ├── package.json         # Node dependencies
│   ├── .env.example         # Environment variables template
│   ├── models/
│   │   └── User.js          # MongoDB user model
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   └── profile.js       # Profile routes
│   └── middleware/
│       └── auth.js          # JWT authentication middleware
│
└── frontend/                # React Frontend
    ├── package.json         # Node dependencies
    ├── vite.config.js       # Vite configuration
    ├── tailwind.config.js   # Tailwind CSS config
    ├── postcss.config.js    # PostCSS config
    ├── index.html           # HTML entry point
    └── src/
        ├── main.jsx         # React entry point
        ├── App.jsx          # Main app component
        ├── App.css          # App styles
        ├── index.css        # Global styles
        ├── store/           # Zustand state management
        │   ├── authStore.js # Authentication state
        │   └── profileStore.js # Profile state
        ├── pages/           # Page components
        │   ├── Login.jsx    # Login page
        │   ├── Register.jsx # Registration page
        │   ├── Dashboard.jsx # Dashboard
        │   ├── Questionnaire.jsx # Questionnaire form
        │   └── Results.jsx  # Results display
        └── components/      # Reusable components
            ├── RadarChart.jsx # RIASEC radar chart
            ├── SkillBarChart.jsx # Skills bar chart
            ├── Embedding2D.jsx # 2D PCA visualization
            └── Embedding3D.jsx # 3D UMAP visualization
```

## Key Components

### ML Engine (Python)
- **RIASEC Scorer**: Computes 6D RIASEC profile from questionnaire
- **Profile Processor**: Combines RIASEC, skills, subjects into 20D vector
- **Clustering**: KMeans clustering of student profiles
- **Embeddings**: Career embeddings using SentenceTransformers
- **Similarity**: Cosine similarity for career matching
- **Dimensionality Reduction**: PCA (2D) and UMAP (3D) for visualization

### Backend API (Node.js)
- **Authentication**: JWT-based auth with bcrypt password hashing
- **Profile Management**: Stores user profiles and recommendations
- **ML Integration**: Proxies requests to Python ML service

### Frontend (React)
- **Questionnaire**: Multi-section form (RIASEC, Skills, Subjects)
- **Visualizations**: 
  - Radar chart (RIASEC)
  - Bar chart (Skills)
  - 2D scatter plot (PCA)
  - 3D scatter plot (UMAP)
- **Results**: Career recommendations with skill gap analysis

