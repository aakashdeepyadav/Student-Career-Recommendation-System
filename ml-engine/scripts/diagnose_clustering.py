"""
Diagnostic script to analyze differences between KMeans++ and KMeans (Random).
This helps understand algorithm performance and selection criteria.
"""

import numpy as np
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.clustering import StudentClusterer
from core.data_loader import DataLoader
from sklearn.metrics import adjusted_rand_score, normalized_mutual_info_score
from scipy.optimize import linear_sum_assignment

def analyze_clustering_differences():
    """Analyze differences between KMeans++ and KMeans (Random) clustering."""
    
    print("=" * 70)
    print("  Clustering Algorithm Comparison Analysis")
    print("=" * 70)
    
    # Load data
    dl = DataLoader()
    students = dl.load_students()
    vectors = np.array([s['combined_vector'] for s in students if 'combined_vector' in s])
    
    print(f"\nLoaded {len(vectors)} student profiles")
    print(f"Feature dimension: {vectors.shape[1]}")
    
    # Train both algorithms
    clusterer = StudentClusterer(algorithm='auto')
    clusterer.fit(vectors)
    
    # Get predictions
    kmeans_plus_labels = clusterer.kmeans_plus.predict(vectors)
    kmeans_random_labels = clusterer.kmeans_random.predict(vectors)
    
    print("\n" + "=" * 70)
    print("  1. CLUSTER ASSIGNMENTS")
    print("=" * 70)
    
    # Cluster sizes
    kmeans_plus_sizes = np.bincount(kmeans_plus_labels, minlength=5)
    kmeans_random_sizes = np.bincount(kmeans_random_labels, minlength=5)
    
    print("\nCluster sizes:")
    print(f"{'Cluster':<10} {'KMeans++':<12} {'KMeans Random':<15} {'Difference':<10}")
    print("-" * 55)
    for i in range(5):
        diff = abs(kmeans_plus_sizes[i] - kmeans_random_sizes[i])
        print(f"{i:<10} {kmeans_plus_sizes[i]:<12} {kmeans_random_sizes[i]:<15} {diff:<10}")
    
    # Label agreement
    exact_match = np.sum(kmeans_plus_labels == kmeans_random_labels)
    match_pct = exact_match / len(kmeans_plus_labels) * 100
    print(f"\nExact label matches: {exact_match}/{len(kmeans_plus_labels)} ({match_pct:.1f}%)")
    
    # Adjusted Rand Index (measures cluster similarity, ignoring labels)
    ari = adjusted_rand_score(kmeans_plus_labels, kmeans_random_labels)
    nmi = normalized_mutual_info_score(kmeans_plus_labels, kmeans_random_labels)
    
    print(f"\nAdjusted Rand Index (ARI): {ari:.4f}")
    print("  (1.0 = identical cluster structure, 0.0 = random)")
    print(f"Normalized Mutual Information (NMI): {nmi:.4f}")
    print("  (1.0 = perfect agreement, 0.0 = independent)")
    
    print("\n" + "=" * 70)
    print("  2. CLUSTER CENTERS/MEANS")
    print("=" * 70)
    
    # Compare centers
    kmeans_plus_centers = clusterer.kmeans_plus.cluster_centers_
    kmeans_random_centers = clusterer.kmeans_random.cluster_centers_
    
    print("\nFinding best label mapping...")
    
    # Find optimal label mapping using Hungarian algorithm
    # Calculate distance matrix between all pairs
    distance_matrix = np.zeros((5, 5))
    for i in range(5):
        for j in range(5):
            distance_matrix[i, j] = np.linalg.norm(kmeans_plus_centers[i] - kmeans_random_centers[j])
    
    # Use Hungarian algorithm to find optimal matching
    row_ind, col_ind = linear_sum_assignment(distance_matrix)
    
    print("\nOptimal cluster mapping (KMeans++ -> KMeans Random):")
    print(f"{'KMeans++':<12} {'KMeans Random':<15} {'Distance':<15}")
    print("-" * 45)
    total_distance = 0
    for i, j in zip(row_ind, col_ind):
        dist = distance_matrix[i, j]
        total_distance += dist
        print(f"{i:<12} {j:<15} {dist:.6f}")
    
    print(f"\nTotal center distance (after optimal mapping): {total_distance:.6f}")
    print(f"Average center distance: {total_distance/5:.6f}")
    
    # Remap KMeans Random labels to match KMeans++
    label_mapping = {col_ind[i]: row_ind[i] for i in range(5)}
    kmeans_random_labels_remapped = np.array([label_mapping[label] for label in kmeans_random_labels])
    
    # Now check agreement
    remapped_match = np.sum(kmeans_plus_labels == kmeans_random_labels_remapped)
    remapped_pct = remapped_match / len(kmeans_plus_labels) * 100
    print(f"\nAfter optimal remapping: {remapped_match}/{len(kmeans_plus_labels)} ({remapped_pct:.1f}%) match")
    
    print("\n" + "=" * 70)
    print("  3. WHY METRICS ARE IDENTICAL")
    print("=" * 70)
    
    print("\nExplanation:")
    if ari > 0.99:
        print("[OK] ARI = 1.0 means both algorithms found the SAME cluster structure")
        print("[OK] The data is well-separated, so both converge to the optimal solution")
        print("[OK] Metrics are identical because they measure the same structure")
        print("[OK] Only the cluster IDs (labels) are different - this is normal!")
    else:
        print("[WARNING] ARI < 1.0 means there are some differences in cluster assignments")
        print("  But metrics might still be similar if clusters are similar")
    
    print("\n" + "=" * 70)
    print("  4. KEY DIFFERENCES (Even with same metrics)")
    print("=" * 70)
    
    # Get metrics
    metrics = clusterer.get_metrics()
    kmeans_plus_metrics = metrics.get('kmeans_plus', {})
    kmeans_random_metrics = metrics.get('kmeans_random', {})
    
    print("\nTraining Time:")
    print(f"  KMeans++:      {kmeans_plus_metrics.get('training_time', 0):.3f}s")
    print(f"  KMeans Random: {kmeans_random_metrics.get('training_time', 0):.3f}s")
    print(f"  Difference:    {abs(kmeans_plus_metrics.get('training_time', 0) - kmeans_random_metrics.get('training_time', 0)):.3f}s")
    
    print("\nPrediction Time:")
    print(f"  KMeans++:      {kmeans_plus_metrics.get('prediction_time_ms', 0):.3f}ms")
    print(f"  KMeans Random: {kmeans_random_metrics.get('prediction_time_ms', 0):.3f}ms")
    
    print("\nModel Complexity (Inertia):")
    if 'inertia' in kmeans_plus_metrics:
        print(f"  KMeans++ Inertia:      {kmeans_plus_metrics['inertia']:.2f}")
    if 'inertia' in kmeans_random_metrics:
        print(f"  KMeans Random Inertia: {kmeans_random_metrics['inertia']:.2f}")
    
    print("\nCluster Assignments:")
    print("  KMeans++:      Hard assignments (cluster ID)")
    print("  KMeans Random: Hard assignments (cluster ID)")
    print("  Note: Both use hard assignments, but initialization affects convergence quality")
    
    print("\n" + "=" * 70)
    print("  5. CONCLUSION")
    print("=" * 70)
    
    print("\n[OK] This is NOT a bug - it's expected behavior!")
    print("[OK] Both algorithms may find similar solutions for well-separated data")
    print("[OK] The metrics may be identical because both converge to optimal solutions")
    print("[OK] Key differences:")
    print("  - Training speed: May differ based on initialization")
    print("  - Convergence quality: KMeans++ typically finds better solutions faster")
    print("  - Inertia: Lower inertia indicates tighter clusters")
    
    print("\nTo see more differences, you could:")
    print("  1. Add more noise to the data (reduce cluster_strength)")
    print("  2. Use more complex/closer clusters")
    print("  3. Focus on deployment metrics (speed, probabilities)")

if __name__ == "__main__":
    analyze_clustering_differences()

