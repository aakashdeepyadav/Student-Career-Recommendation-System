# Project Structure

## Overview

This is a full-stack career recommendation system with the following structure:

```
Student-Profiling/
├── frontend/              # React frontend application
├── api-server/            # Node.js/Express API server
├── ml-engine/            # Python FastAPI ML engine
├── docs/                 # Project documentation
└── README.md            # Main project README
```

## Frontend (`frontend/`)

```
frontend/
├── src/
│   ├── components/
│   │   ├── charts/              # Chart components (Radar, Bar, etc.)
│   │   ├── visualizations/     # 2D/3D visualization components
│   │   ├── Layout.jsx          # Main layout with sidebar
│   │   └── ProgressLoader.jsx  # Loading progress component
│   ├── pages/                  # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Questionnaire.jsx
│   │   ├── Results.jsx
│   │   ├── Profile.jsx
│   │   ├── ModelStatistics.jsx
│   │   └── ModelWorkflow.jsx
│   ├── store/                  # Zustand state management
│   │   ├── authStore.js
│   │   └── profileStore.js
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── package.json
└── vite.config.js
```

## API Server (`api-server/`)

```
api-server/
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   └── User.js              # Mongoose user model
├── routes/
│   ├── auth.js              # Authentication routes
│   └── profile.js           # Profile and ML routes
├── scripts/
│   ├── create_test_user.js
│   ├── fix_recommendations.js
│   └── verify_env.js
└── server.js                # Express server entry point
```

## ML Engine (`ml-engine/`)

```
ml-engine/
├── core/                     # Core ML modules
│   ├── riasec_scorer.py
│   ├── profile_processor.py
│   ├── clustering.py
│   ├── embeddings.py
│   ├── similarity.py
│   └── data_loader.py
├── scripts/                  # Utility scripts
│   ├── init_data.py
│   ├── generate_students.py
│   └── train_models.py
├── tests/                    # Test files
│   └── test_skill_gap.py
├── utils/                    # Utility scripts
│   ├── check_setup.py
│   └── count_careers.py
├── data/                     # Data files
│   ├── careers.json
│   ├── students.json
│   └── students.csv
├── model/                    # Trained models (gitignored)
│   ├── kmeans_model.joblib
│   ├── pca_2d.joblib
│   └── umap_3d.joblib
├── app.py                    # FastAPI application
├── requirements.txt
└── venv/                     # Python virtual environment (gitignored)
```

## Documentation (`docs/`)

All project documentation is centralized in the `docs/` folder:

- `README.md` - Documentation index
- `SETUP.md` - Setup instructions
- `QUICKSTART.md` - Quick start guide
- `PROJECT_STRUCTURE.md` - This file
- `FEATURES.md` - Feature documentation
- `MODEL_TRAINING.md` - Model training guide
- And more...

## Key Design Decisions

1. **Separation of Concerns**: Frontend, API, and ML engine are separate services
2. **Modular ML Engine**: Core modules in `core/`, scripts in `scripts/`
3. **Organized Components**: Frontend components grouped by type (charts, visualizations)
4. **Centralized Docs**: All documentation in `docs/` folder
5. **Clean Root**: Only essential files at root level


