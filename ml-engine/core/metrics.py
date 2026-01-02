"""
Advanced Clustering Metrics
Includes Dunn Index and external validation metrics (ARI, NMI, FMI) using pseudo-ground truth.
"""

import numpy as np
from sklearn.metrics import (
    adjusted_rand_score,
    normalized_mutual_info_score,
    fowlkes_mallows_score
)
from typing import Tuple, Optional


def calculate_dunn_index(vectors: np.ndarray, labels: np.ndarray) -> float:
    """
    Calculate Dunn Index - ratio of minimum inter-cluster distance to maximum intra-cluster distance.
    Higher values indicate better clustering.
    
    Args:
        vectors: Feature vectors (n_samples, n_features)
        labels: Cluster assignments (n_samples,)
    
    Returns:
        Dunn Index value
    """
    if len(np.unique(labels)) < 2:
        return 0.0
    
    n_clusters = len(np.unique(labels))
    clusters = [vectors[labels == i] for i in range(n_clusters)]
    
    # Calculate minimum inter-cluster distance
    min_inter_cluster_dist = float('inf')
    for i in range(n_clusters):
        for j in range(i + 1, n_clusters):
            if len(clusters[i]) > 0 and len(clusters[j]) > 0:
                # Distance between cluster centers
                center_i = np.mean(clusters[i], axis=0)
                center_j = np.mean(clusters[j], axis=0)
                dist = np.linalg.norm(center_i - center_j)
                min_inter_cluster_dist = min(min_inter_cluster_dist, dist)
    
    # Calculate maximum intra-cluster distance
    max_intra_cluster_dist = 0.0
    for i in range(n_clusters):
        if len(clusters[i]) > 1:
            # Maximum distance between points in same cluster
            for k in range(len(clusters[i])):
                for l in range(k + 1, len(clusters[i])):
                    dist = np.linalg.norm(clusters[i][k] - clusters[i][l])
                    max_intra_cluster_dist = max(max_intra_cluster_dist, dist)
    
    if max_intra_cluster_dist == 0:
        return 0.0
    
    return min_inter_cluster_dist / max_intra_cluster_dist


def create_riasec_ground_truth(students_data: list) -> Optional[np.ndarray]:
    """
    Create pseudo-ground truth labels based on dominant RIASEC dimension.
    This allows us to calculate external validation metrics.
    
    PRIORITY ORDER:
    1. combined_vector[:6] - Most reliable (always exists for students used in clustering)
    2. riasec_vector - Direct RIASEC vector
    3. riasec_profile - Dict format
    
    Args:
        students_data: List of student dictionaries with riasec_profile
    
    Returns:
        Ground truth labels array or None
    """
    if not students_data:
        print("[METRICS] No students data provided")
        return None
    
    labels = []
    valid_count = 0
    skipped_count = 0
    
    for idx, student in enumerate(students_data):
        riasec_values = None
        
        # PRIORITY 1: combined_vector (first 6 elements are RIASEC: R, I, A, S, E, C)
        if 'combined_vector' in student:
            combined_vec = student['combined_vector']
            if isinstance(combined_vec, (list, np.ndarray)) and len(combined_vec) >= 6:
                riasec_values = np.array(combined_vec[:6])
                if np.sum(riasec_values) > 0:  # Check not all zeros
                    dominant_idx = int(np.argmax(riasec_values))
                    labels.append(dominant_idx)
                    valid_count += 1
                    continue
        
        # PRIORITY 2: riasec_vector
        if 'riasec_vector' in student:
            riasec_vec = student['riasec_vector']
            if isinstance(riasec_vec, (list, np.ndarray)) and len(riasec_vec) >= 6:
                riasec_values = np.array(riasec_vec[:6])
                if np.sum(riasec_values) > 0:
                    dominant_idx = int(np.argmax(riasec_values))
                    labels.append(dominant_idx)
                    valid_count += 1
                    continue
        
        # PRIORITY 3: riasec_profile (dict format)
        riasec = None
        if 'riasec_profile' in student:
            riasec = student['riasec_profile']
        elif 'profile' in student and isinstance(student['profile'], dict):
            riasec = student['profile'].get('riasec_profile')
        
        if riasec is not None:
            if isinstance(riasec, dict):
                riasec_values = np.array([
                    float(riasec.get('R', riasec.get('r', 0))),
                    float(riasec.get('I', riasec.get('i', 0))),
                    float(riasec.get('A', riasec.get('a', 0))),
                    float(riasec.get('S', riasec.get('s', 0))),
                    float(riasec.get('E', riasec.get('e', 0))),
                    float(riasec.get('C', riasec.get('c', 0)))
                ])
                if np.sum(riasec_values) > 0:
                    dominant_idx = int(np.argmax(riasec_values))
                    labels.append(dominant_idx)
                    valid_count += 1
                    continue
            elif isinstance(riasec, (list, np.ndarray)) and len(riasec) >= 6:
                riasec_values = np.array(riasec[:6])
                if np.sum(riasec_values) > 0:
                    dominant_idx = int(np.argmax(riasec_values))
                    labels.append(dominant_idx)
                    valid_count += 1
                    continue
        
        # If we get here, couldn't extract RIASEC
        skipped_count += 1
        if idx < 3:  # Only log first 3 for debugging
            print(f"[METRICS] Student {idx} missing RIASEC. Keys: {list(student.keys())[:10]}")
    
    if valid_count == 0:
        print(f"[METRICS] ❌ No valid RIASEC data found in {len(students_data)} students")
        print(f"[METRICS] Skipped: {skipped_count}, Valid: {valid_count}")
        return None
    
    print(f"[METRICS] ✅ Created ground truth from {valid_count}/{len(students_data)} students (skipped {skipped_count})")
    return np.array(labels)


def calculate_external_metrics(
    predicted_labels: np.ndarray,
    ground_truth_labels: np.ndarray
) -> dict:
    """
    Calculate external validation metrics: ARI, NMI, FMI.
    
    Args:
        predicted_labels: Cluster assignments from model
        ground_truth_labels: Ground truth labels (pseudo or real)
    
    Returns:
        Dictionary with ARI, NMI, FMI scores
    """
    try:
        ari = adjusted_rand_score(ground_truth_labels, predicted_labels)
        nmi = normalized_mutual_info_score(ground_truth_labels, predicted_labels)
        fmi = fowlkes_mallows_score(ground_truth_labels, predicted_labels)
        
        return {
            'adjusted_rand_index': float(ari),
            'normalized_mutual_info': float(nmi),
            'fowlkes_mallows_index': float(fmi)
        }
    except Exception as e:
        print(f"Error calculating external metrics: {e}")
        return {
            'adjusted_rand_index': None,
            'normalized_mutual_info': None,
            'fowlkes_mallows_index': None
        }

