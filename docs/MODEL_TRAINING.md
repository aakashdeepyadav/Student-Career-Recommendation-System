# 🤖 Model Training Requirements

## 🎓 Unsupervised Learning Approach

**This project uses UNSUPERVISED LEARNING models!** 

- ✅ **No labeled data required** - Models learn patterns from data without ground truth labels
- ✅ **KMeans Clustering** - Discovers natural groupings in student profiles
- ✅ **PCA/UMAP** - Learns dimensionality reduction from data structure
- ✅ **No training labels needed** - Perfect for academic/research projects

## ✅ Current Status

**All models are already trained!** ✅

The following models have been trained and saved:
- ✅ KMeans Clustering Model (`model/kmeans_model.joblib`)
- ✅ PCA 2D Model (`model/pca_2d.joblib`)
- ✅ UMAP 3D Model (`model/umap_3d.joblib`)

---

## 📋 Models That Require Training

### 1. **KMeans Clustering Model** ✅ TRAINED (UNSUPERVISED)
- **Type**: Unsupervised Learning Algorithm
- **Purpose**: Groups students into 5 career clusters (discovers patterns automatically)
- **Training Data**: 50 synthetic student profiles (20D vectors) - **NO LABELS NEEDED**
- **How it works**: Finds natural groupings in the data without knowing the "correct" clusters
- **Output**: 5 cluster centers
- **Status**: ✅ Already trained
- **File**: `model/kmeans_model.joblib`

### 2. **PCA Model (2D)** ✅ TRAINED (UNSUPERVISED)
- **Type**: Unsupervised Dimensionality Reduction
- **Purpose**: Reduces 20D vectors to 2D for visualization (finds principal components)
- **Training Data**: 50 synthetic student profiles - **NO LABELS NEEDED**
- **How it works**: Learns the directions of maximum variance in the data
- **Output**: 2D coordinates for plotting
- **Status**: ✅ Already trained
- **File**: `model/pca_2d.joblib`

### 3. **UMAP Model (3D)** ✅ TRAINED (UNSUPERVISED)
- **Type**: Unsupervised Dimensionality Reduction
- **Purpose**: Reduces 20D vectors to 3D for visualization (preserves local structure)
- **Training Data**: 50 synthetic student profiles - **NO LABELS NEEDED**
- **How it works**: Learns a low-dimensional representation that preserves neighborhood relationships
- **Output**: 3D coordinates for plotting
- **Status**: ✅ Already trained
- **File**: `model/umap_3d.joblib`

---

## 🚫 Models That DON'T Require Training

### 1. **SentenceTransformer (Career Embeddings)**
- **Model**: `all-MiniLM-L6-v2`
- **Type**: Pre-trained model from HuggingFace
- **Purpose**: Creates 384D text embeddings for career descriptions
- **Training Required**: ❌ NO - Uses pre-trained weights
- **Note**: Downloads automatically on first use

### 2. **RIASEC Scorer**
- **Type**: Rule-based algorithm
- **Purpose**: Computes 6D RIASEC profile from questionnaire
- **Training Required**: ❌ NO - Uses fixed mapping rules

### 3. **Profile Processor**
- **Type**: Data processing pipeline
- **Purpose**: Combines RIASEC, skills, subjects into 20D vector
- **Training Required**: ❌ NO - Simple concatenation

### 4. **Similarity Engine**
- **Type**: Cosine similarity computation
- **Purpose**: Matches user profiles to careers
- **Training Required**: ❌ NO - Mathematical computation

---

## 🔄 When to Retrain Models

### Retrain if:
1. **You add more student data** - More training data = better clusters
2. **You change the profile structure** - If you modify the 20D vector format
3. **You want different number of clusters** - Change from 5 to 3, 7, etc.
4. **Models become outdated** - If student profiles change significantly

### Don't retrain if:
- ✅ Just adding new careers (career embeddings are generated on-the-fly)
- ✅ Just adding new users (models work with any new user profile)
- ✅ Models are working correctly

---

## 🛠️ How to Train Models

### Step 1: Prepare Training Data
```bash
cd ml-engine
python init_data.py
```
This creates:
- `data/careers.json` - Career dataset
- `data/students.json` - 50 synthetic student profiles for training

### Step 2: Train Models
```bash
python train_models.py
```

**Output:**
```
Training on 50 student profiles...
Training KMeans clusterer...
[OK] Clustering model trained and saved
Training PCA (2D)...
[OK] PCA model trained and saved
Training UMAP (3D)...
[OK] UMAP model trained and saved

All models trained successfully!
```

### Step 3: Verify Training
```bash
python check_setup.py
```

---

## 📊 Training Data Requirements

### Minimum Requirements:
- **At least 5 student profiles** (for 5 clusters)
- **Recommended: 20-50 profiles** for stable clustering
- **Vector format**: 20D (6D RIASEC + 10D Skills + 4D Subjects)

### Current Training Data:
- **50 synthetic student profiles** ✅
- **Format**: 20D vectors
- **Location**: `data/students.json`

---

## 🔍 How Models Are Used

### During Runtime:

1. **User submits questionnaire**
   ↓
2. **Profile created** (20D vector)
   ↓
3. **KMeans predicts cluster** (uses trained model)
   ↓
4. **PCA/UMAP transform** (uses trained models)
   ↓
5. **Results displayed**

**No training happens during runtime!** Models are only used for prediction/transformation.

---

## 📝 Training Process Details

### KMeans Training:
```python
# Load student vectors (50 profiles, 20D each)
student_vectors = np.array([...])  # Shape: (50, 20)

# Train KMeans
clusterer = KMeans(n_clusters=5)
clusterer.fit(student_vectors)

# Save model
joblib.dump(clusterer, 'model/kmeans_model.joblib')
```

### PCA Training:
```python
# Train PCA on same student vectors
pca = PCA(n_components=2)
pca.fit(student_vectors)

# Save model
joblib.dump(pca, 'model/pca_2d.joblib')
```

### UMAP Training:
```python
# Train UMAP on same student vectors
umap = UMAP(n_components=3)
umap.fit(student_vectors)

# Save model
joblib.dump(umap, 'model/umap_3d.joblib')
```

---

## ⚠️ Important Notes

1. **Models are loaded automatically** when ML engine starts
2. **If models don't exist**, the system will try to train them on startup (if student data exists)
3. **For production**, train models separately using `train_models.py`
4. **Models are saved** in `ml-engine/model/` directory
5. **Career embeddings** are generated on-the-fly (no training needed)

---

## ✅ Summary

| Model | Type | Training Required | Status | File |
|-------|------|------------------|--------|------|
| **KMeans** | **Unsupervised** | ✅ Yes | ✅ Trained | `kmeans_model.joblib` |
| **PCA 2D** | **Unsupervised** | ✅ Yes | ✅ Trained | `pca_2d.joblib` |
| **UMAP 3D** | **Unsupervised** | ✅ Yes | ✅ Trained | `umap_3d.joblib` |
| SentenceTransformer | Pre-trained | ❌ No | ✅ Ready | Auto-downloaded |
| RIASEC Scorer | Rule-based | ❌ No | ✅ Ready | N/A |
| Profile Processor | Algorithm | ❌ No | ✅ Ready | N/A |
| Similarity Engine | Math-based | ❌ No | ✅ Ready | N/A |

## 🎓 Key Points for Academic Projects

1. **✅ Unsupervised Learning**: All ML models use unsupervised learning
   - No labeled training data required
   - Models discover patterns automatically
   - Perfect for exploratory data analysis

2. **✅ No Ground Truth Needed**: 
   - KMeans finds clusters without knowing "correct" clusters
   - PCA/UMAP learn structure without labels
   - Career recommendations based on similarity, not labeled matches

3. **✅ Valid for Academic Assignments**:
   - Demonstrates unsupervised learning concepts
   - Shows clustering and dimensionality reduction
   - No need for labeled datasets

**Answer: Yes, 3 unsupervised models require training, and they are already trained!** ✅

You don't need to do anything - the system is ready to use.

