# Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- MongoDB (local or cloud)

## Step-by-Step Setup

### 1. Clone and Navigate

```bash
cd Student-Profiling
```

### 2. Setup ML Engine (Python)

```bash
cd ml-engine

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize data (creates career embeddings and synthetic student data)
python init_data.py

# Train models (clustering and dimensionality reduction)
python train_models.py

# Create .env file
cp .env.example .env
# Edit .env and set PORT=8001

# Start ML engine
python app.py
```

The ML engine will run on `http://localhost:8001`

### 3. Setup Backend API (Node.js)

```bash
cd api-server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and set:
# - PORT=3000
# - MONGODB_URI=mongodb://localhost:27017/scrs
# - JWT_SECRET=your-secret-key
# - ML_ENGINE_URL=http://localhost:8001

# Start server
npm start
# Or for development with auto-reload:
npm run dev
```

The API server will run on `http://localhost:3000`

### 4. Setup Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional, defaults work)
# VITE_API_URL=http://localhost:3000/api

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Running the Application

1. **Start MongoDB** (if using local MongoDB)
2. **Start ML Engine**: `cd ml-engine && python app.py`
3. **Start API Server**: `cd api-server && npm start`
4. **Start Frontend**: `cd frontend && npm run dev`

## Access the Application

Open `http://localhost:5173` in your browser.

## Troubleshooting

### ML Engine Issues
- Ensure all Python dependencies are installed
- Run `init_data.py` before `train_models.py`
- Check that models are generated in `ml-engine/model/`

### API Server Issues
- Verify MongoDB is running
- Check `.env` file configuration
- Ensure ML engine is running on port 8001

### Frontend Issues
- Clear browser cache
- Check browser console for errors
- Verify API server is running

## Production Deployment

For production:
1. Set proper environment variables
2. Use production MongoDB
3. Build frontend: `cd frontend && npm run build`
4. Use process managers (PM2, systemd) for services
5. Set up reverse proxy (nginx) if needed

