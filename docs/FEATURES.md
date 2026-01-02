# Features Documentation

## 🎯 Core Features

### 1. Smart Interest & Skill Profiling

**RIASEC Assessment (48 questions)**
- Realistic (R): Practical, hands-on work
- Investigative (I): Analytical, scientific work
- Artistic (A): Creative, expressive work
- Social (S): Helping, teaching work
- Enterprising (E): Leading, persuading work
- Conventional (C): Organized, detail-oriented work

**Skill Assessment (10 questions)**
- Programming/Coding
- Problem Solving
- Communication
- Creativity
- Leadership
- Analytical Thinking
- Mathematics
- Design
- Research
- Teamwork

**Subject Preferences (4 questions)**
- STEM
- Arts & Humanities
- Business & Economics
- Social Sciences

### 2. Unsupervised Career Clustering

- **Algorithms**: Dual-algorithm system (KMeans++ and KMeans with Random Initialization)
- **Auto-Selection**: Automatically selects the best algorithm based on comprehensive deployment metrics
- **Clusters**:
  - Tech/Analytical
  - Creative
  - Business/Leadership
  - Social/People
  - Practical/Realistic
- **Training**: Uses synthetic student data (100 profiles)
- **Prediction**: Assigns users to clusters based on profile vector using the selected algorithm

### 3. Career Embedding Engine

- **Method**: SentenceTransformers (MiniLM)
- **Components**:
  - Text embedding (384D) from career title + description
  - RIASEC scores (6D)
  - Skill vector (10D)
- **Total**: 400D embedding per career
- **Careers**: 10 pre-loaded careers with embeddings

### 4. Similarity-Based Recommendations

- **Algorithm**: Cosine similarity
- **Output**: Top 5 career matches
- **Features**:
  - Similarity score (0-1, displayed as percentage)
  - Career description
  - Domain classification
  - Salary range
  - Required skills
  - Skill gap analysis

### 5. Interactive Visualizations

**2D Embedding (PCA)**
- Principal Component Analysis
- Shows careers, cluster centers, and user position
- Interactive hover tooltips

**3D Embedding (UMAP)**
- Uniform Manifold Approximation and Projection
- 3D scatter plot visualization
- Rotatable and zoomable

**Radar Chart**
- RIASEC profile visualization
- 6 dimensions displayed

**Bar Chart**
- Skill proficiency levels
- Normalized 0-1 scale

### 6. Skill Gap Analysis

- Compares user skills vs. required skills
- Identifies areas needing improvement
- Visual progress bars
- Prioritized by gap size

### 7. Full-Stack Architecture

**Frontend (React)**
- Modern UI with Tailwind CSS
- Responsive design
- State management with Zustand
- Chart visualizations with Plotly

**Backend API (Node.js)**
- Express.js REST API
- JWT authentication
- MongoDB user storage
- ML service integration

**ML Engine (Python)**
- FastAPI service
- Scikit-learn models
- SentenceTransformers
- UMAP dimensionality reduction

## 📊 Data Flow

1. **User Registration/Login** → JWT token
2. **Questionnaire Submission** → Profile vector generation
3. **Clustering** → Cluster assignment
4. **Similarity Matching** → Career recommendations
5. **Dimensionality Reduction** → Visualization coordinates
6. **Results Display** → Charts and recommendations

## 🔧 Technical Details

### Profile Vector (20D)
- RIASEC: 6 dimensions
- Skills: 10 dimensions
- Subjects: 4 dimensions

### Career Embedding (400D)
- Text: 384 dimensions (MiniLM)
- RIASEC: 6 dimensions
- Skills: 10 dimensions

### Models
- **KMeans++**: 5 clusters with k-means++ initialization, saved to `model/clustering_model.joblib`
- **KMeans (Random)**: 5 clusters with random initialization, saved to `model/clustering_model.joblib`
- **PCA**: 2 components, saved to `model/pca_2d.joblib`
- **UMAP**: 3 components, saved to `model/umap_3d.joblib`

## 🎨 UI/UX Features

- Clean, modern design
- Gradient backgrounds
- Smooth transitions
- Interactive charts
- Responsive layout
- Error handling
- Loading states

## 🔐 Security

- Password hashing (bcrypt)
- JWT authentication
- Protected routes
- CORS configuration
- Environment variables

## 📈 Future Enhancements

- More career options (expandable dataset)
- Real-time model retraining
- User feedback integration
- Advanced analytics
- Export reports (PDF)
- Social sharing
- Comparison with peers

