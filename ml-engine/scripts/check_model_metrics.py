"""Check if saved model has deployment metrics."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import joblib
import os

model_path = 'model/clustering_model.joblib'

if os.path.exists(model_path):
    data = joblib.load(model_path)
    print('Model has metrics:', 'metrics' in data)
    if 'metrics' in data:
        print('Metrics keys:', list(data['metrics'].keys()))
        print('Has kmeans_plus in metrics:', 'kmeans_plus' in data['metrics'])
        print('Has kmeans_random in metrics:', 'kmeans_random' in data['metrics'])
        if 'kmeans_plus' in data['metrics']:
            print('KMeans++ metrics keys:', list(data['metrics']['kmeans_plus'].keys()))
        if 'kmeans_random' in data['metrics']:
            print('KMeans (Random) metrics keys:', list(data['metrics']['kmeans_random'].keys()))
    best_algo = data.get('best_algorithm')
    if best_algo:
        algo_display = "KMeans++" if best_algo == 'kmeans_plus' or best_algo == 'kmeans' else "KMeans (Random)"
        print(f'Best algorithm: {algo_display} ({best_algo})')
    else:
        print('Best algorithm: Not set')
else:
    print('Model file not found')

