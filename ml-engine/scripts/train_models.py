"""
Train clustering and embedding models.
Run this after initializing data.

Usage: python scripts/train_models.py
"""
import numpy as np
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.data_loader import DataLoader
from core.clustering import StudentClusterer
from core.embeddings import EmbeddingReducer

def main():
    data_loader = DataLoader()
    
    # Load students
    students = data_loader.load_students()
    
    if len(students) == 0:
        print("No student data found. Please run init_data.py first.")
        return
    
    student_vectors = np.array([s.get('combined_vector', []) for s in students if 'combined_vector' in s])
    
    if len(student_vectors) == 0:
        print("No valid student vectors found.")
        return
    
    print(f"Training on {len(student_vectors)} student profiles...")
    
    # Train clusterer (auto-selects best algorithm: KMeans++ or KMeans Random)
    print("Training clustering models (KMeans++ and KMeans Random)...")
    print("Will automatically select the best performing algorithm...")
    clusterer = StudentClusterer(n_clusters=5, algorithm='auto')
    clusterer.fit(student_vectors)
    print(f"[OK] Clustering model trained and saved")
    algo = clusterer.get_active_algorithm()
    algo_display = "KMeans++" if algo == 'kmeans_plus' or algo == 'kmeans' else "KMeans (Random)"
    print(f"[OK] Selected algorithm: {algo_display}")
    metrics = clusterer.get_metrics()
    if metrics:
        print(f"[OK] Comparison metrics:")
        if 'kmeans_plus' in metrics:
            print(f"  KMeans++ - Silhouette: {metrics['kmeans_plus']['silhouette']:.4f}, CH: {metrics['kmeans_plus']['calinski_harabasz']:.2f}")
        if 'kmeans_random' in metrics:
            print(f"  KMeans (Random) - Silhouette: {metrics['kmeans_random']['silhouette']:.4f}, CH: {metrics['kmeans_random']['calinski_harabasz']:.2f}")
    
    # Train embedding reducers
    print("Training PCA (2D)...")
    reducer = EmbeddingReducer()
    reducer.fit_pca_2d(student_vectors)
    print("[OK] PCA model trained and saved")
    
    print("Training UMAP (3D)...")
    reducer.fit_umap_3d(student_vectors)
    print("[OK] UMAP model trained and saved")
    
    print("\nAll models trained successfully!")

if __name__ == "__main__":
    main()

