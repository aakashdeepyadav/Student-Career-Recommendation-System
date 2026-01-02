# ML Engine

Python FastAPI service for ML operations including clustering, embeddings, and career recommendations.

## Structure

```
ml-engine/
├── app.py                 # FastAPI application (main entry point)
├── core/                  # Core ML modules
│   ├── riasec_scorer.py
│   ├── profile_processor.py
│   ├── clustering.py
│   ├── embeddings.py
│   ├── similarity.py
│   └── data_loader.py
├── scripts/               # Utility scripts
│   ├── init_data.py       # Initialize career data
│   ├── generate_students.py  # Generate synthetic student data
│   └── train_models.py    # Train clustering models
├── tests/                 # Test files
│   └── test_skill_gap.py
├── utils/                 # Utility scripts
│   ├── check_setup.py
│   └── count_careers.py
├── data/                  # Data files
│   ├── careers.json
│   ├── students.json
│   └── students.csv
├── model/                 # Trained models (gitignored)
│   ├── kmeans_model.joblib
│   ├── pca_2d.joblib
│   └── umap_3d.joblib
└── requirements.txt       # Python dependencies
```

## Setup

1. Create virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Initialize data:
   ```bash
   python scripts/init_data.py
   ```

4. Generate student data:
   ```bash
   python scripts/generate_students.py
   ```

5. Train models:
   ```bash
   python scripts/train_models.py
   ```

6. Run the server:
   ```bash
   python app.py
   ```

The server will run on `http://localhost:8001`

## API Endpoints

- `GET /` - Health check
- `POST /profile` - Process questionnaire and create profile
- `POST /cluster` - Get cluster assignment
- `POST /recommend` - Get career recommendations
- `POST /visualize` - Get visualization data
- `GET /careers` - Get all careers
- `GET /model-statistics` - Get model performance metrics

## Core Modules

- **RIASECScorer**: Calculates RIASEC personality scores
- **ProfileProcessor**: Converts questionnaire to feature vectors
- **StudentClusterer**: KMeans clustering for student grouping
- **EmbeddingReducer**: PCA/UMAP for dimensionality reduction
- **CareerEmbedder**: Creates career embeddings
- **SimilarityEngine**: Cosine similarity for recommendations
- **DataLoader**: Loads and manages data files




