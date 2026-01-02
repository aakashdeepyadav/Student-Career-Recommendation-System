# ML Engine Structure

## Current Organization

```
ml-engine/
├── app.py                    # FastAPI main application
├── requirements.txt          # Python dependencies
│
├── core/                     # Core ML modules
│   ├── __init__.py
│   ├── riasec_scorer.py      # RIASEC scoring
│   ├── profile_processor.py  # Profile processing
│   ├── clustering.py        # KMeans clustering
│   ├── embeddings.py        # Career embeddings & PCA/UMAP
│   ├── similarity.py        # Cosine similarity & skill gaps
│   ├── data_loader.py       # Data loading utilities
│   └── README.md
│
├── scripts/                  # Utility scripts
│   ├── __init__.py
│   ├── init_data.py         # Initialize career data
│   ├── generate_students.py # Generate 100 synthetic students
│   ├── train_models.py      # Train clustering models
│   └── README.md
│
├── tests/                    # Test files
│   ├── __init__.py
│   └── test_skill_gap.py
│
├── utils/                    # Utility scripts
│   ├── check_setup.py       # Verify setup
│   └── count_careers.py     # Count careers
│
├── data/                     # Data files
│   ├── careers.json         # 25 careers with embeddings
│   ├── students.json        # 100 synthetic students (JSON)
│   └── students.csv         # 100 synthetic students (CSV)
│
└── model/                    # Trained models (gitignored)
    ├── kmeans_model.joblib
    ├── pca_2d.joblib
    └── umap_3d.joblib
```

## Import Structure

### From app.py:
```python
from core.riasec_scorer import RIASECScorer
from core.profile_processor import ProfileProcessor
from core.clustering import StudentClusterer
from core.embeddings import EmbeddingReducer, CareerEmbedder
from core.similarity import SimilarityEngine
from core.data_loader import DataLoader
```

### From scripts:
Scripts add parent directory to sys.path:
```python
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from core.data_loader import DataLoader
```

## Running Scripts

All scripts should be run from the `ml-engine/` directory:

```bash
# From ml-engine/ directory
python scripts/init_data.py
python scripts/generate_students.py
python scripts/train_models.py
```

## Clean Structure

✅ **Core modules** organized in `core/`
✅ **Scripts** organized in `scripts/`
✅ **Tests** organized in `tests/`
✅ **Utils** organized in `utils/`
✅ **Data** in `data/`
✅ **Models** in `model/` (gitignored)
✅ **No duplicate directories**
✅ **No unnecessary files** (removed package.json, node_modules)




