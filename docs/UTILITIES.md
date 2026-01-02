# 🛠️ Utility Scripts

This document describes utility scripts available in the project.

## ML Engine Utilities

### `utils/check_setup.py`
Verifies that all required components are set up correctly.

**Usage:**
```bash
cd ml-engine
python utils/check_setup.py
```

**Checks:**
- Data files exist (careers.json, students.json)
- Model files exist (kmeans, PCA, UMAP)
- Python dependencies installed

### `utils/count_careers.py`
Lists all careers in the system with details.

**Usage:**
```bash
cd ml-engine
python utils/count_careers.py
```

**Output:**
- Total number of careers
- Career list with titles, domains, and salary ranges

### `init_data.py`
Initializes career data and generates embeddings.

**Usage:**
```bash
cd ml-engine
python init_data.py
```

**What it does:**
- Generates career embeddings (25 careers)
- Creates synthetic student data (50 profiles)
- Saves to `data/` directory

### `train_models.py`
Trains ML models (KMeans, PCA, UMAP).

**Usage:**
```bash
cd ml-engine
python train_models.py
```

**What it does:**
- Trains KMeans clustering model
- Trains PCA 2D model
- Trains UMAP 3D model
- Saves models to `model/` directory

## API Server Utilities

### `scripts/create_test_user.js`
Creates a default test user for development.

**Usage:**
```bash
cd api-server
node scripts/create_test_user.js
```

**Creates:**
- Email: `test@scrs.com`
- Password: `test123`

### `scripts/verify_env.js`
Verifies environment variables are set correctly.

**Usage:**
```bash
cd api-server
node scripts/verify_env.js
```

**Checks:**
- PORT
- MONGODB_URI
- JWT_SECRET
- ML_ENGINE_URL

## When to Use

- **First time setup**: Run `init_data.py` then `train_models.py`
- **Verify installation**: Run `check_setup.py`
- **Check careers**: Run `count_careers.py`
- **Create test user**: Run `create_test_user.js`
- **Debug environment**: Run `verify_env.js`


