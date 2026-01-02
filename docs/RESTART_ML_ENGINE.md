# Restart ML Engine After Model Retraining

## Issue
After retraining models with the new dual-algorithm system (KMeans++ vs KMeans Random), the Model Statistics page shows "N/A" for all metrics because the ML engine server is still running with old models loaded in memory.

## Solution
**Restart the ML engine server** to load the newly trained models.

## Steps

1. **Stop the current ML engine server** (if running):
   - Press `Ctrl+C` in the terminal where the ML engine is running
   - Or close the terminal window

2. **Restart the ML engine server**:
   ```bash
   cd ml-engine
   .\venv\Scripts\Activate.ps1  # On Windows PowerShell
   python app.py
   ```

3. **Refresh the Model Statistics page** in your browser

## Expected Results

After restarting, you should see:

- **KMeans++ Metrics:**
  - Silhouette Score: ~0.8270
  - Calinski-Harabasz: ~1660.03
  - Davies-Bouldin: ~0.2443
  - Training Time: ~1.8 seconds
  - Inertia: (value will be displayed)

- **KMeans (Random) Metrics:**
  - Silhouette Score: ~0.8270
  - Calinski-Harabasz: ~1660.03
  - Davies-Bouldin: ~0.2443
  - Training Time: ~0.1 seconds (faster!)
  - Inertia: (value will be displayed)

- **Selected Algorithm:** KMeans (Random) - selected because it trains faster

## Why This Happens

The ML engine loads models into memory when it starts. After retraining, the new model files are saved to disk, but the running server still has the old models in memory. Restarting the server forces it to reload models from disk.

## Verification

After restarting, check the ML engine console output. You should see:
- Models loaded successfully
- No warnings about missing deployment metrics
- The selected algorithm displayed


