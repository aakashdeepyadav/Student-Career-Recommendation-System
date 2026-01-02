# ML Model Workflow Diagram - Mermaid Code

## Figure: ML Engine Workflow Diagram

This diagram shows the complete ML model workflow including dual-algorithm clustering and selection process.

---

## 🎨 Mermaid Code - ML Model Workflow

```mermaid
flowchart TD
    Start([Student Profile Data]) --> Input[Input: Questionnaire Responses<br/>RIASEC 48Q + Skills 10Q + Subjects 4Q]
    
    Input --> RIASEC[RIASEC Scorer<br/>Process 48 responses]
    RIASEC --> RIASECVec[6D RIASEC Vector<br/>R, I, A, S, E, C]
    
    Input --> Skills[Skill Processor<br/>Process 10 skill responses]
    Skills --> SkillVec[10D Skill Vector]
    
    Input --> Subjects[Subject Processor<br/>Process 4 subject preferences]
    Subjects --> SubjectVec[4D Subject Vector]
    
    RIASECVec --> Combine[Profile Processor<br/>Combine Vectors]
    SkillVec --> Combine
    SubjectVec --> Combine
    
    Combine --> ProfileVec[20D Profile Vector<br/>RIASEC + Skills + Subjects]
    
    ProfileVec --> Training[Training Phase<br/>100 Synthetic Students]
    
    Training --> KMeansPP[KMeans++ Algorithm<br/>Initialization: k-means++<br/>n_init: 20<br/>max_iter: 300<br/>random_state: 42]
    
    Training --> KMeansRand[KMeans Random Algorithm<br/>Initialization: random<br/>n_init: 3<br/>max_iter: 100<br/>random_state: 789]
    
    KMeansPP --> Eval1[Evaluate KMeans++<br/>Clustering Quality:<br/>- Silhouette Score<br/>- Calinski-Harabasz<br/>- Davies-Bouldin<br/>Performance:<br/>- Training Time<br/>- Prediction Time<br/>- Cluster Stability<br/>- Inter/Intra Distance<br/>Complexity:<br/>- Inertia]
    
    KMeansRand --> Eval2[Evaluate KMeans Random<br/>Clustering Quality:<br/>- Silhouette Score<br/>- Calinski-Harabasz<br/>- Davies-Bouldin<br/>Performance:<br/>- Training Time<br/>- Prediction Time<br/>- Cluster Stability<br/>- Inter/Intra Distance<br/>Complexity:<br/>- Inertia]
    
    Eval1 --> Weighted[Weighted Scoring System<br/>Quality: 50%<br/>Performance: 25%<br/>Efficiency: 15%<br/>Complexity: 10%]
    Eval2 --> Weighted
    
    Weighted --> Select{Algorithm Selection<br/>Compare Weighted Scores}
    
    Select -->|Best Score| Selected[Selected Algorithm<br/>KMeans++ or KMeans Random]
    
    Selected --> Save[Save Model<br/>clustering_model.joblib<br/>+ Metrics]
    
    Save --> Inference[Inference Phase<br/>New Student Profile]
    
    Inference --> Predict[Cluster Prediction<br/>Assign to 1 of 5 Clusters]
    
    Predict --> Clusters[5 Career Clusters<br/>0: Tech/Analytical<br/>1: Creative<br/>2: Business/Leadership<br/>3: Social/People<br/>4: Practical/Realistic]
    
    ProfileVec --> CareerEmbed[Career Embedding<br/>SentenceTransformer<br/>400D: Text + RIASEC + Skills]
    
    CareerEmbed --> Similarity[Cosine Similarity<br/>Match Profile to Careers]
    
    Similarity --> Top5[Top 5 Career Recommendations<br/>Ranked by Similarity Score]
    
    ProfileVec --> PCA[PCA Dimensionality Reduction<br/>20D → 2D<br/>For Visualization]
    
    ProfileVec --> UMAP[UMAP Dimensionality Reduction<br/>20D → 3D<br/>For Visualization]
    
    PCA --> Viz2D[2D Visualization Coordinates]
    UMAP --> Viz3D[3D Visualization Coordinates]
    
    Clusters --> Output[Output:<br/>- Cluster Assignment<br/>- Algorithm Used<br/>- Career Recommendations<br/>- Visualization Data]
    Top5 --> Output
    Viz2D --> Output
    Viz3D --> Output
    
    Output --> End([Results Returned])
    
    style Start fill:#e1f5ff
    style End fill:#e1f5ff
    style Input fill:#fff4e1
    style RIASEC fill:#e1ffe1
    style Skills fill:#e1ffe1
    style Subjects fill:#e1ffe1
    style Combine fill:#e1ffe1
    style ProfileVec fill:#ffe1e1
    style Training fill:#e1e1ff
    style KMeansPP fill:#e1e1ff
    style KMeansRand fill:#e1e1ff
    style Eval1 fill:#ffe1ff
    style Eval2 fill:#ffe1ff
    style Weighted fill:#ffe1ff
    style Select fill:#ffe1ff
    style Selected fill:#ffe1ff
    style Save fill:#e1e1ff
    style Inference fill:#e1ffe1
    style Predict fill:#e1ffe1
    style Clusters fill:#e1ffe1
    style CareerEmbed fill:#fff4e1
    style Similarity fill:#fff4e1
    style Top5 fill:#fff4e1
    style PCA fill:#fff4e1
    style UMAP fill:#fff4e1
    style Viz2D fill:#fff4e1
    style Viz3D fill:#fff4e1
    style Output fill:#e1f5ff
```

---

## 🎨 Simplified Version (Black & White for IEEE)

```mermaid
flowchart TD
    A[Student Questionnaire<br/>RIASEC + Skills + Subjects] --> B[Profile Processing]
    B --> C[20D Profile Vector]
    
    C --> D[Training Phase]
    D --> E[KMeans++<br/>k-means++ init<br/>20 restarts, 300 iter]
    D --> F[KMeans Random<br/>random init<br/>3 restarts, 100 iter]
    
    E --> G[Evaluation Metrics]
    F --> G
    
    G --> H{Weighted Scoring<br/>Quality 50%<br/>Performance 25%<br/>Efficiency 15%<br/>Complexity 10%}
    
    H --> I[Algorithm Selection]
    I --> J[Save Model]
    
    J --> K[Inference Phase]
    K --> L[Cluster Prediction<br/>5 Clusters]
    
    C --> M[Career Embedding<br/>400D]
    M --> N[Cosine Similarity]
    N --> O[Top 5 Recommendations]
    
    C --> P[PCA: 20D → 2D]
    C --> Q[UMAP: 20D → 3D]
    
    L --> R[Output Results]
    O --> R
    P --> R
    Q --> R
    
    style A fill:#f9f9f9
    style B fill:#e8e8e8
    style C fill:#d8d8d8
    style D fill:#c8c8c8
    style E fill:#b8b8b8
    style F fill:#b8b8b8
    style G fill:#a8a8a8
    style H fill:#989898
    style I fill:#888888
    style J fill:#787878
    style K fill:#686868
    style L fill:#585858
    style M fill:#484848,color:#fff
    style N fill:#383838,color:#fff
    style O fill:#282828,color:#fff
    style P fill:#181818,color:#fff
    style Q fill:#080808,color:#fff
    style R fill:#000000,color:#fff
```

---

## 🎨 Focused Dual-Algorithm Selection Diagram

```mermaid
flowchart LR
    A[20D Profile Vector] --> B[Training Data<br/>100 Students]
    
    B --> C[KMeans++ Training]
    B --> D[KMeans Random Training]
    
    C --> E[KMeans++ Metrics<br/>Silhouette: 0.8270<br/>CH: 1660.03<br/>DB: 0.2443<br/>Time: 1.2s<br/>Inertia: Low]
    
    D --> F[KMeans Random Metrics<br/>Silhouette: 0.8200-0.8270<br/>CH: 1650-1660<br/>DB: 0.244-0.250<br/>Time: 1.5s<br/>Inertia: Medium]
    
    E --> G[Weighted Scoring]
    F --> G
    
    G --> H{Compare Scores<br/>Select Best}
    
    H -->|KMeans++ Wins| I[Selected: KMeans++]
    H -->|Random Wins| J[Selected: KMeans Random]
    
    I --> K[Save Model]
    J --> K
    
    K --> L[Use for Predictions]
    
    style A fill:#e1f5ff
    style B fill:#fff4e1
    style C fill:#e1e1ff
    style D fill:#e1e1ff
    style E fill:#ffe1ff
    style F fill:#ffe1ff
    style G fill:#ffe1ff
    style H fill:#ffe1ff
    style I fill:#e1ffe1
    style J fill:#e1ffe1
    style K fill:#e1ffe1
    style L fill:#e1f5ff
```

---

## 📋 How to Use

### Step 1: Open Mermaid Live Editor
```
https://mermaid.live/
```

### Step 2: Copy and Paste
Copy one of the Mermaid code blocks above and paste into the editor.

### Step 3: Customize
- Adjust colors for IEEE (black & white recommended)
- Modify labels if needed
- Resize elements

### Step 4: Export
- Click "Actions" → "Download PNG" (300 DPI)
- Or "Download SVG" for vector format

---

## 📐 IEEE Formatting Tips

1. **Use Simplified Version**: The black & white version is best for IEEE papers
2. **Resolution**: Export at 300 DPI minimum
3. **Size**: Ensure it fits within IEEE column width (3.5" single, 7" double)
4. **Labels**: All components should be clearly labeled
5. **Arrows**: Show clear direction of flow

---

## 📝 Caption Text

```
Fig. X. ML Engine Workflow Diagram showing the dual-algorithm clustering system. The workflow includes profile processing (RIASEC, Skills, Subjects → 20D vector), dual-algorithm training (KMeans++ and KMeans Random), comprehensive evaluation with weighted scoring, automatic algorithm selection, model persistence, and inference phase producing cluster assignments, career recommendations, and visualization coordinates.
```

---

## ✅ Recommended Diagram

For IEEE paper, use the **Simplified Version (Black & White)** as it:
- Is clean and professional
- Works well in grayscale/black & white
- Clearly shows the dual-algorithm process
- Fits IEEE formatting requirements

---

**Tool**: Mermaid Live Editor (https://mermaid.live/)  
**Export**: PNG (300 DPI) or SVG  
**Style**: Professional, IEEE-compliant

