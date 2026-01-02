# 🎯 SCRS Project Flow & Architecture

## 📊 System Overview

The Student Career Recommendation System (SCRS) is a full-stack ML application that profiles students using psychological assessments, clusters them using unsupervised learning, and recommends careers based on similarity matching.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│                    http://localhost:5173                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Login   │  │Register  │  │Question- │  │ Results  │      │
│  │  Page    │  │  Page    │  │  naire   │  │   Page   │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│       │              │              │              │            │
│       └──────────────┴──────────────┴──────────────┘            │
│                           │                                      │
│                    (Axios HTTP)                                 │
└───────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Node.js)                        │
│                    http://localhost:3000                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Auth       │  │   Profile    │  │   MongoDB   │         │
│  │   Routes     │  │   Routes     │  │   Database  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│       │                  │                  │                   │
│       └──────────────────┴──────────────────┘                   │
│                           │                                      │
│                    (HTTP Proxy)                                 │
└───────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ML ENGINE (Python/FastAPI)                   │
│                    http://localhost:8001                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  RIASEC      │  │  Clustering  │  │  Embeddings  │         │
│  │  Scorer      │  │  (Dual Algo) │  │  (PCA/UMAP)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Similarity  │  │  Profile     │  │  Career      │         │
│  │  Engine      │  │  Processor   │  │  Embedder    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        1. USER REGISTRATION                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  User enters   │
                    │  credentials  │
                    └────────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  POST /register │
                    │  (Backend API)  │
                    └────────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Hash password  │
                    │  (bcrypt)       │
                    └────────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Save to MongoDB│
                    └────────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Generate JWT   │
                    │  Token          │
                    └────────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Return token  │
                    │  + user data   │
                    └─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        2. USER LOGIN                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  User enters   │
                    │  email/password│
                    └────────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  POST /login    │
                    │  (Backend API)  │
                    └────────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Verify password│
                    │  (bcrypt)       │
                    └────────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Generate JWT   │
                    │  Token          │
                    └────────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Store token in │
                    │  localStorage   │
                    └─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   3. QUESTIONNAIRE SUBMISSION                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  User completes │
                    │  questionnaire  │
                    │  (48 RIASEC +   │
                    │   10 Skills +   │
                    │   4 Subjects)   │
                    └────────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  POST /submit   │
                    │  (Backend API)  │
                    └────────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  POST /profile  │
                    │  (ML Engine)    │
                    └────────┬───────┘
                             │
                             ▼
                    ┌─────────────────────────────────────────┐
                    │         ML PROCESSING PIPELINE          │
                    │                                         │
                    │  1. RIASEC Scorer                       │
                    │     Input: 48 responses                 │
                    │     Output: 6D vector [R,I,A,S,E,C]    │
                    │                                         │
                    │  2. Skill Processor                     │
                    │     Input: 10 responses                │
                    │     Output: 10D vector                 │
                    │                                         │
                    │  3. Subject Processor                   │
                    │     Input: 4 responses                 │
                    │     Output: 4D vector                  │
                    │                                         │
                    │  4. Profile Combiner                    │
                    │     Combine: 6D + 10D + 4D             │
                    │     Output: 20D combined vector        │
                    └────────┬────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  POST /cluster  │
                    │  (ML Engine)    │
                    └────────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Dual Algorithm │
                    │  Clustering     │
                    │  (KMeans++/Random) │
                    └────────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Assign user to │
                    │  cluster         │
                    │  (e.g., Tech/    │
                    │   Analytical)   │
                    └────────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  POST /recommend │
                    │  (ML Engine)     │
                    └────────┬───────┘
                             │
                             ▼
                    ┌─────────────────────────────────────────┐
                    │      SIMILARITY MATCHING                 │
                    │                                         │
                    │  For each career:                       │
                    │  1. Get career embedding (400D)        │
                    │  2. Compute cosine similarity           │
                    │     with user vector (20D)               │
                    │  3. Sort by similarity score            │
                    │  4. Return top 5 matches               │
                    └────────┬────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  POST /visualize│
                    │  (ML Engine)    │
                    └────────┬───────┘
                             │
                             ▼
                    ┌─────────────────────────────────────────┐
                    │      DIMENSIONALITY REDUCTION            │
                    │                                         │
                    │  1. PCA (2D)                            │
                    │     Transform 20D → 2D                  │
                    │                                         │
                    │  2. UMAP (3D)                           │
                    │     Transform 20D → 3D                  │
                    │                                         │
                    │  Apply to:                              │
                    │  - User vector                          │
                    │  - Career vectors (extracted 20D)       │
                    │  - Cluster centers                      │
                    └────────┬────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Save profile  │
                    │  to MongoDB    │
                    └────────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Return results │
                    │  to frontend    │
                    └─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        4. RESULTS DISPLAY                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────────────────────────────┐
                    │         FRONTEND VISUALIZATIONS         │
                    │                                         │
                    │  1. Radar Chart (RIASEC Profile)        │
                    │     - 6 dimensions displayed            │
                    │                                         │
                    │  2. Bar Chart (Skills)                  │
                    │     - 10 skill levels                  │
                    │                                         │
                    │  3. 2D Scatter Plot (PCA)               │
                    │     - User point                        │
                    │     - Career points                     │
                    │     - Cluster centers                   │
                    │                                         │
                    │  4. 3D Scatter Plot (UMAP)              │
                    │     - Interactive 3D visualization       │
                    │                                         │
                    │  5. Career Recommendations              │
                    │     - Top 5 matches                     │
                    │     - Similarity scores                 │
                    │     - Skill gap analysis                │
                    └─────────────────────────────────────────┘
```

---

## 🧠 ML Pipeline Details

### Step 1: Profile Creation

```
Questionnaire Responses
         │
         ├─ RIASEC (48 questions)
         │   └─→ RIASEC Scorer
         │       └─→ [R, I, A, S, E, C] (6D vector)
         │
         ├─ Skills (10 questions)
         │   └─→ Skill Processor
         │       └─→ [10 skill scores] (10D vector)
         │
         └─ Subjects (4 questions)
             └─→ Subject Processor
                 └─→ [4 subject preferences] (4D vector)
                         │
                         ▼
              Profile Combiner
                         │
                         ▼
          Combined Vector (20D)
    [R,I,A,S,E,C, Skills..., Subjects...]
```

### Step 2: Clustering

```
User Vector (20D)
         │
         ▼
    Dual Algorithm System
    (KMeans++ & KMeans Random)
    (trained on 100 student profiles)
         │
         ├─→ KMeans++ (Smart Init)
         │   └─→ Better convergence
         │
         ├─→ KMeans (Random Init)
         │   └─→ Baseline comparison
         │
         ├─→ Auto-Select Best Algorithm
         │   └─→ Based on deployment metrics
         │
         └─→ Cluster Assignment
             ├─→ Cluster 0: Tech/Analytical
             ├─→ Cluster 1: Creative
             ├─→ Cluster 2: Business/Leadership
             ├─→ Cluster 3: Social/People
             └─→ Cluster 4: Practical/Realistic
```

### Step 3: Career Recommendation

```
User Vector (20D)
         │
         ▼
    For each career:
         │
         ├─ Career Embedding (400D)
         │   [384D text + 6D RIASEC + 10D skills]
         │
         ├─ Extract matching dimensions
         │   [6D RIASEC + 10D skills + 4D subjects] = 20D
         │
         ├─ Compute Cosine Similarity
         │   similarity = cosine(user_20D, career_20D)
         │
         └─ Sort by similarity
             └─→ Top 5 Careers
```

### Step 4: Visualization

```
User Vector (20D)
         │
         ├─→ PCA Model (trained)
         │   └─→ 2D coordinates [x, y]
         │
         └─→ UMAP Model (trained)
             └─→ 3D coordinates [x, y, z]

Career Vectors (20D extracted)
         │
         ├─→ PCA Transform
         │   └─→ 2D coordinates for each career
         │
         └─→ UMAP Transform
             └─→ 3D coordinates for each career
```

---

## 📦 Data Structures

### User Profile Vector (20D)
```
Index 0-5:   RIASEC scores [R, I, A, S, E, C]
Index 6-15:  Skill scores [10 skills]
Index 16-19: Subject preferences [STEM, Arts, Business, Social]
```

### Career Embedding (400D)
```
Index 0-383:   Text embedding (SentenceTransformer)
Index 384-389: RIASEC scores [R, I, A, S, E, C]
Index 390-399: Skill scores [10 skills]
```

### For Visualization (20D extracted from career)
```
Index 0-5:   RIASEC scores (from career)
Index 6-15:  Skill scores (from career)
Index 16-19: Subject preferences (zeros/default)
```

---

## 🔐 Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /register or /login
       ▼
┌─────────────┐
│ Backend API │
└──────┬──────┘
       │
       │ 2. Verify credentials
       │    Hash/Compare password
       ▼
┌─────────────┐
│  MongoDB    │
│  (User DB)  │
└──────┬──────┘
       │
       │ 3. Create/Find user
       ▼
┌─────────────┐
│ Backend API │
└──────┬──────┘
       │
       │ 4. Generate JWT token
       │    (expires in 7 days)
       ▼
┌─────────────┐
│   Client    │
│ (localStorage│
│   token)    │
└─────────────┘
```

---

## 🎯 Key Components

### Frontend Components
- **Login/Register**: Authentication UI
- **Dashboard**: User home page
- **Questionnaire**: Multi-section form (RIASEC, Skills, Subjects)
- **Results**: Visualizations and recommendations
- **Charts**: Radar, Bar, 2D/3D scatter plots

### Backend Components
- **Auth Routes**: Registration and login
- **Profile Routes**: Questionnaire submission, profile retrieval
- **MongoDB**: User data storage
- **JWT Middleware**: Token verification

### ML Components
- **RIASEC Scorer**: Computes 6D interest profile
- **Profile Processor**: Combines vectors into 20D
- **Dual-Algorithm Clusterer**: KMeans++ and KMeans (Random) with automatic selection
- **Career Embedder**: Creates 400D career vectors
- **Similarity Engine**: Cosine similarity matching
- **Embedding Reducer**: PCA (2D) and UMAP (3D)

---

## 🚀 Request Flow Example

### Complete Request: Submit Questionnaire

```
1. User fills questionnaire
   ↓
2. Frontend: POST /api/profile/submit
   Headers: { Authorization: Bearer <token> }
   Body: { riasec_responses, skill_responses, subject_preferences }
   ↓
3. Backend API: Verify JWT token
   ↓
4. Backend API: POST http://localhost:8001/profile
   (Proxy to ML Engine)
   ↓
5. ML Engine: Process profile
   - RIASEC Scorer → 6D
   - Skill Processor → 10D
   - Subject Processor → 4D
   - Combine → 20D
   ↓
6. Backend API: POST http://localhost:8001/cluster
   ↓
7. ML Engine: Dual-algorithm clustering (KMeans++ or KMeans Random)
   → Cluster ID, name, and algorithm used
   ↓
8. Backend API: POST http://localhost:8001/recommend
   ↓
9. ML Engine: Similarity matching
   → Top 5 careers with scores
   ↓
10. Backend API: POST http://localhost:8001/visualize
    ↓
11. ML Engine: Dimensionality reduction
    → 2D and 3D coordinates
    ↓
12. Backend API: Save to MongoDB
    ↓
13. Backend API: Return all data
    ↓
14. Frontend: Display results
    - Radar chart
    - Bar chart
    - 2D/3D plots
    - Recommendations
```

---

## 📊 Database Schema

### User Document (MongoDB)
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  profile: {
    riasec_profile: { R, I, A, S, E, C },
    riasec_vector: [6 numbers],
    skill_vector: [10 numbers],
    subject_vector: [4 numbers],
    combined_vector: [20 numbers],
    skills: Object
  },
  cluster: {
    cluster_id: Number,
    cluster_name: String
  },
  recommendations: [{
    career_id: String,
    title: String,
    similarity_score: Number,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Visualization Flow

```
User Profile (20D)
         │
         ├─→ PCA Transform → [x, y] (2D)
         │
         └─→ UMAP Transform → [x, y, z] (3D)

Career Embeddings (400D)
         │
         ├─→ Extract 20D (RIASEC + Skills + Subjects)
         │
         ├─→ PCA Transform → [[x,y], [x,y], ...] (2D for each)
         │
         └─→ UMAP Transform → [[x,y,z], [x,y,z], ...] (3D for each)

Cluster Centers (20D)
         │
         ├─→ PCA Transform → [[x,y], ...] (2D for each cluster)
         │
         └─→ UMAP Transform → [[x,y,z], ...] (3D for each cluster)
```

---

## ✅ Summary

1. **User registers/logs in** → JWT token stored
2. **User completes questionnaire** → 62 questions answered
3. **ML Engine processes** → Creates 20D profile vector
4. **Clustering assigns** → User to one of 5 clusters
5. **Similarity matching** → Finds top 5 career matches
6. **Dimensionality reduction** → Creates 2D/3D coordinates
7. **Results displayed** → Charts, plots, recommendations

The entire system is **unsupervised** (no labeled training data needed) and uses **clustering** and **similarity matching** to provide personalized career recommendations.

