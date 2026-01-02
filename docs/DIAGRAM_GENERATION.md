# Diagram Generation Guide for IEEE Report

## Figure 1: Total SCRS Workflow Diagram

This document provides instructions and prompts for generating the workflow diagram using AI tools.

**For ML Model Only Diagram**: See `docs/ML_MODEL_DIAGRAM.md`

---

## 📋 Diagram Requirements

The diagram should show:
1. **Data Flow**: User → Frontend → API → ML Engine → Database
2. **Dual-Algorithm Selection Process**: KMeans++ and KMeans (Random) training and selection
3. **Key Components**: Frontend, Backend API, ML Engine, MongoDB
4. **Process Steps**: Registration, Questionnaire, Clustering, Recommendation, Visualization

---

## 🤖 AI Generation Commands

### Option 1: Using ChatGPT/Claude with Mermaid

**Prompt:**
```
Create a Mermaid flowchart diagram showing the complete workflow of a Student Career Recommendation System (SCRS). The diagram should include:

1. User Registration/Login flow
2. Questionnaire submission (RIASEC, Skills, Subjects)
3. Profile processing in ML Engine
4. Dual-algorithm clustering system:
   - KMeans++ training
   - KMeans (Random) training
   - Automatic algorithm selection based on metrics
5. Cluster assignment
6. Career recommendation using cosine similarity
7. Visualization generation (PCA 2D, UMAP 3D)
8. Results display in frontend

Use professional IEEE-style formatting with clear labels. Show data flow with arrows. Include decision points for algorithm selection.
```

**Command to generate:**
```bash
# Save the Mermaid code to a file
# Then use online tools or VS Code extensions to render
```

### Option 2: Using DALL-E / Midjourney / Stable Diffusion

**Prompt:**
```
Create a professional technical diagram showing a complete workflow for a Student Career Recommendation System. The diagram should be in IEEE paper style:

- Black and white or minimal color scheme
- Clear boxes for: Frontend (React), Backend API (Node.js), ML Engine (Python), Database (MongoDB)
- Arrows showing data flow from user registration through questionnaire submission, profile processing, dual-algorithm clustering (KMeans++ and KMeans Random), algorithm selection, cluster assignment, career recommendation, and visualization
- Include labels for each step
- Professional, clean, academic style suitable for IEEE conference paper
- Landscape orientation
- High resolution suitable for publication
```

**Commands:**
```bash
# For DALL-E (OpenAI API)
# Use OpenAI Playground or API

# For Midjourney (Discord)
/imagine prompt: [paste the prompt above]

# For Stable Diffusion (local or online)
# Use tools like Automatic1111, ComfyUI, or online services
```

### Option 3: Using Online AI Diagram Tools

**Tools:**
- **Mermaid Live Editor**: https://mermaid.live/
- **Draw.io (diagrams.net)**: https://app.diagrams.net/
- **Lucidchart**: AI-assisted diagramming
- **Whimsical**: AI diagram generation

**Command for Mermaid:**
```bash
# Copy the Mermaid code below to mermaid.live
# Export as PNG/SVG for IEEE report
```

---

## 📊 Mermaid Code Template

```mermaid
flowchart TD
    Start([User Starts]) --> Register[User Registration/Login]
    Register --> Dashboard[Dashboard]
    Dashboard --> Questionnaire[Questionnaire Submission<br/>RIASEC + Skills + Subjects]
    
    Questionnaire --> API1[Backend API<br/>Node.js/Express]
    API1 --> ML1[ML Engine: Profile Processing<br/>FastAPI]
    
    ML1 --> Vector[20D Profile Vector<br/>RIASEC + Skills + Subjects]
    
    Vector --> Train[Training Phase]
    Train --> KMeansPP[KMeans++ Training<br/>k-means++ init<br/>20 restarts, 300 iter]
    Train --> KMeansRand[KMeans Random Training<br/>random init<br/>3 restarts, 100 iter]
    
    KMeansPP --> Eval1[Evaluate Metrics<br/>Silhouette, CH, DB<br/>Training Time, Inertia]
    KMeansRand --> Eval2[Evaluate Metrics<br/>Silhouette, CH, DB<br/>Training Time, Inertia]
    
    Eval1 --> Select{Algorithm Selection<br/>Weighted Scoring}
    Eval2 --> Select
    
    Select -->|Best Score| Selected[Selected Algorithm<br/>KMeans++ or Random]
    
    Selected --> Cluster[Cluster Assignment<br/>5 Clusters]
    Cluster --> Recommend[Career Recommendation<br/>Cosine Similarity<br/>Top 5 Careers]
    
    Recommend --> Visualize[Visualization Generation<br/>PCA 2D + UMAP 3D]
    
    Visualize --> API2[Backend API]
    API2 --> DB[(MongoDB<br/>Database: scrs)]
    DB --> API2
    
    API2 --> Results[Results Page<br/>Frontend]
    Results --> Charts[Visualizations<br/>Radar, Bar, 2D, 3D]
    Charts --> End([User Views Results])
    
    style Start fill:#e1f5ff
    style End fill:#e1f5ff
    style Register fill:#fff4e1
    style Questionnaire fill:#fff4e1
    style API1 fill:#ffe1e1
    style API2 fill:#ffe1e1
    style ML1 fill:#e1ffe1
    style Train fill:#e1ffe1
    style KMeansPP fill:#e1e1ff
    style KMeansRand fill:#e1e1ff
    style Select fill:#ffe1ff
    style Selected fill:#ffe1ff
    style Cluster fill:#e1ffe1
    style Recommend fill:#e1ffe1
    style Visualize fill:#e1ffe1
    style DB fill:#ffe1e1
    style Results fill:#fff4e1
    style Charts fill:#fff4e1
```

---

## 🎨 Simplified Version (Black & White for IEEE)

```mermaid
flowchart TD
    A[User Registration/Login] --> B[Questionnaire Submission]
    B --> C[Backend API]
    C --> D[ML Engine: Profile Processing]
    D --> E[20D Profile Vector]
    
    E --> F[Dual-Algorithm Training]
    F --> G[KMeans++]
    F --> H[KMeans Random]
    
    G --> I[Evaluation Metrics]
    H --> I
    
    I --> J{Algorithm Selection<br/>Weighted Scoring}
    J --> K[Selected Algorithm]
    
    K --> L[Cluster Assignment]
    L --> M[Career Recommendation]
    M --> N[Visualization Generation]
    
    N --> O[Backend API]
    O --> P[(MongoDB)]
    P --> O
    O --> Q[Frontend Results]
    Q --> R[User Views Results]
    
    style A fill:#f9f9f9
    style B fill:#f9f9f9
    style C fill:#e8e8e8
    style D fill:#e8e8e8
    style E fill:#e8e8e8
    style F fill:#d8d8d8
    style G fill:#d8d8d8
    style H fill:#d8d8d8
    style I fill:#d8d8d8
    style J fill:#c8c8c8
    style K fill:#c8c8c8
    style L fill:#d8d8d8
    style M fill:#d8d8d8
    style N fill:#d8d8d8
    style O fill:#e8e8e8
    style P fill:#e8e8e8
    style Q fill:#f9f9f9
    style R fill:#f9f9f9
```

---

## 🛠️ Step-by-Step Generation Process

### Method 1: Using Mermaid (Recommended for IEEE)

1. **Copy the Mermaid code above**

2. **Go to Mermaid Live Editor:**
   ```
   https://mermaid.live/
   ```

3. **Paste the code and customize**

4. **Export as PNG (high resolution):**
   - Click "Actions" → "Download PNG"
   - Use 300 DPI for IEEE publication

5. **Or export as SVG:**
   - Click "Actions" → "Download SVG"
   - Can be edited in Inkscape/Illustrator

### Method 2: Using AI Image Generation

1. **Use the prompt provided above**

2. **For DALL-E:**
   ```bash
   # Use OpenAI Playground or API
   # Set size to 1024x1024 or 1792x1024 (landscape)
   ```

3. **For Midjourney:**
   ```
   /imagine prompt: [paste the detailed prompt]
   --ar 16:9 --style raw --v 6
   ```

4. **Post-process:**
   - Convert to black & white if needed
   - Add text labels if AI didn't include them
   - Ensure high resolution (300 DPI minimum)

### Method 3: Using Draw.io with AI Assistance

1. **Open Draw.io:**
   ```
   https://app.diagrams.net/
   ```

2. **Use AI assistant (if available) or manually create:**
   - Drag components
   - Add arrows for flow
   - Use IEEE-style formatting

3. **Export:**
   - File → Export as → PNG (300 DPI)

---

## 📐 IEEE Formatting Requirements

- **Resolution**: Minimum 300 DPI
- **Format**: PNG, PDF, or EPS (vector preferred)
- **Color**: Black & white or grayscale (color acceptable if necessary)
- **Font**: Clear, readable (Arial, Times New Roman, or similar)
- **Size**: Fits within IEEE column width (3.5" single column or 7" double column)
- **Labels**: All components clearly labeled
- **Arrows**: Show direction of data flow

---

## ✅ Final Checklist

- [ ] Diagram shows complete workflow
- [ ] Dual-algorithm selection process is clear
- [ ] All components labeled
- [ ] Data flow arrows are clear
- [ ] High resolution (300 DPI minimum)
- [ ] Black & white or minimal color
- [ ] Professional appearance
- [ ] Fits IEEE formatting requirements

---

## 📝 Caption Text

```
Fig. 1. Total SCRS Workflow Diagram showing the complete data flow from user registration through questionnaire submission, profile processing, dual-algorithm clustering (KMeans++ and KMeans Random), automatic algorithm selection, cluster assignment, career recommendation, and visualization generation. The system architecture includes React frontend, Node.js/Express backend API, Python FastAPI ML engine, and MongoDB database.
```

---

**Recommended Tool**: Mermaid Live Editor (https://mermaid.live/)  
**Export Format**: PNG (300 DPI) or SVG  
**Style**: Professional, IEEE-compliant

