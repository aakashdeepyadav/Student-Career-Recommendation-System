# Student Career Recommendation System (SCRS)

An end-to-end career guidance platform that combines RIASEC personality signals, skill profiling, and unsupervised machine learning to recommend suitable careers for students.

## Why This Project

- Uses a practical full-stack architecture (React + Node.js + FastAPI)
- Applies unsupervised ML (KMeans++, KMeans Random, PCA, UMAP)
- Produces explainable outputs: cluster membership, top recommendations, and skill-gap insights
- Can be deployed as separate services for frontend, API, and ML engine

## Project Structure

```
Student-Career-Recommendation-System/
|-- frontend/      # React + Vite client
|-- api-server/    # Node.js + Express API layer
|-- ml-engine/     # Python + FastAPI ML service
|-- render.yaml    # Render multi-service blueprint
`-- README.md
```

## Core Features

- RIASEC-based student profiling
- Skill and subject preference capture
- Automatic career-cluster assignment
- Top career recommendations with similarity score
- Skill-gap insights per recommendation
- Interactive 2D/3D embedding visualizations
- Public access for one-time recommendations (no login, no DB required)

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Plotly, Zustand
- API: Node.js, Express
- ML: Python, FastAPI, scikit-learn, UMAP, sentence-transformers

## Local Setup

### 1) ML Engine

```bash
cd ml-engine
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python scripts/init_data.py
python scripts/generate_students.py
python scripts/train_models.py
python app.py
```

### 2) API Server

```bash
cd api-server
npm install
npm start
```

Required environment variables in api-server/.env:

```env
ML_ENGINE_URL=http://localhost:8001
PORT=3000
FRONTEND_URL=http://localhost:5173
```

Questionnaire submissions go through:

```text
POST /api/assessment/submit-public
```

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

Optional environment variable in frontend/.env:

```env
VITE_API_URL=http://localhost:3000/api
```

## Deployment

This repository includes render.yaml for deploying backend services on Render. The frontend can be deployed separately on Vercel.

Suggested production setup:

- Frontend: Vercel
- API Server: Render Web Service
- ML Engine: Render Web Service

## Resume-Friendly Highlights

- Built a production-style ML application with three independently deployable services
- Implemented unsupervised clustering pipeline and recommendation logic
- Designed interactive visual analytics for model output interpretation
- Delivered a stateless recommendation workflow suitable for zero-friction career guidance
