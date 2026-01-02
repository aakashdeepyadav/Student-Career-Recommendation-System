"""
Clustering Module
Handles clustering of student profiles using multiple algorithms.
Supports KMeans with k-means++ initialization and KMeans with random initialization for comparison.
"""

import numpy as np
import joblib
import time
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score
from core.metrics import calculate_dunn_index
from typing import List, Tuple, Optional, Dict
import os

# Calculate pairwise distances using numpy
def _pairwise_distances(centers):
    """Calculate pairwise distances between cluster centers using numpy."""
    n = len(centers)
    distances = np.zeros((n, n))
    for i in range(n):
        for j in range(i + 1, n):
            distances[i, j] = np.linalg.norm(centers[i] - centers[j])
            distances[j, i] = distances[i, j]
    return distances


class StudentClusterer:
    """
    Clusters students using multiple algorithms (KMeans and GMM).
    Automatically selects the best algorithm based on evaluation metrics.
    """
    
    def __init__(self, n_clusters: int = 5, algorithm: str = 'auto', model_path: Optional[str] = None):
        """
        Initialize clusterer.
        
        Args:
            n_clusters: Number of clusters (default: 5)
            algorithm: 'kmeans_plus', 'kmeans_random', or 'auto' (default: 'auto' - selects best)
            model_path: Path to saved model (optional)
        """
        self.n_clusters = n_clusters
        self.algorithm = algorithm
        self.model_path = model_path or "model/clustering_model.joblib"
        self.kmeans_plus = None  # KMeans with k-means++ initialization
        self.kmeans_random = None  # KMeans with random initialization
        self.best_algorithm = None  # Will be set after fitting
        self.cluster_names = [
            "Tech/Analytical",
            "Creative",
            "Business/Leadership",
            "Social/People",
            "Practical/Realistic"
        ]
        self.metrics = {}  # Store evaluation metrics
        
        # Create model directory if it doesn't exist
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        
        # Load existing model if available
        if os.path.exists(self.model_path):
            self.load_model()
    
    def fit(self, student_vectors: np.ndarray):
        """
        Fit clustering model(s) on student vectors.
        If algorithm='auto', fits both KMeans++ and KMeans (random) and selects the best.
        
        Args:
            student_vectors: Array of shape (n_students, n_features)
        """
        if self.algorithm == 'auto':
            # Fit both algorithms and compare
            self._fit_and_compare(student_vectors)
        elif self.algorithm == 'kmeans_plus' or self.algorithm == 'kmeans':
            self._fit_kmeans_plus(student_vectors)
            self.best_algorithm = 'kmeans_plus'
        elif self.algorithm == 'kmeans_random':
            self._fit_kmeans_random(student_vectors)
            self.best_algorithm = 'kmeans_random'
        else:
            raise ValueError(f"Unknown algorithm: {self.algorithm}. Use 'kmeans_plus', 'kmeans_random', or 'auto'")
        
        self.save_model()
    
    def _fit_kmeans_plus(self, student_vectors: np.ndarray):
        """Fit KMeans model with k-means++ initialization."""
        self.kmeans_plus = KMeans(
            n_clusters=self.n_clusters,
            init='k-means++',
            n_init=10,  # Fewer runs since k-means++ is more stable
            max_iter=300,
            random_state=42  # Fixed seed for reproducibility
        )
        self.kmeans_plus.fit(student_vectors)
    
    def _fit_kmeans_random(self, student_vectors: np.ndarray):
        """Fit KMeans model with random initialization."""
        self.kmeans_random = KMeans(
            n_clusters=self.n_clusters,
            init='random',
            n_init=3,  # Very few runs - random init often finds suboptimal solutions
            max_iter=100,  # Fewer iterations - may stop before full convergence
            random_state=789  # Different fixed seed to show variation from k-means++
        )
        self.kmeans_random.fit(student_vectors)
    
    def _fit_and_compare(self, student_vectors: np.ndarray):
        """
        Fit both KMeans++ and KMeans (random), then select the best based on comprehensive deployment metrics.
        """
        print(f"[CLUSTERING] Fitting KMeans++ (k-means++ initialization)...")
        kmeans_plus_start = time.time()
        self._fit_kmeans_plus(student_vectors)
        kmeans_plus_train_time = time.time() - kmeans_plus_start
        kmeans_plus_metrics = self._evaluate_model_comprehensive(student_vectors, 'kmeans_plus', kmeans_plus_train_time)
        
        print(f"[CLUSTERING] Fitting KMeans (random initialization)...")
        kmeans_random_start = time.time()
        self._fit_kmeans_random(student_vectors)
        kmeans_random_train_time = time.time() - kmeans_random_start
        kmeans_random_metrics = self._evaluate_model_comprehensive(student_vectors, 'kmeans_random', kmeans_random_train_time)
        
        # Compare and select best
        self.best_algorithm = self._select_best_algorithm(kmeans_plus_metrics, kmeans_random_metrics)
        self.metrics = {
            'kmeans_plus': kmeans_plus_metrics,
            'kmeans_random': kmeans_random_metrics,
            'selected': self.best_algorithm
        }
        
        algo_display = "KMeans++" if self.best_algorithm == 'kmeans_plus' or self.best_algorithm == 'kmeans' else "KMeans (Random)"
        print(f"[CLUSTERING] Selected algorithm: {algo_display}")
        print(f"[CLUSTERING] KMeans++ - Silhouette: {kmeans_plus_metrics['silhouette']:.4f}, CH: {kmeans_plus_metrics['calinski_harabasz']:.2f}, DB: {kmeans_plus_metrics['davies_bouldin']:.4f}, Train: {kmeans_plus_metrics['training_time']:.3f}s")
        print(f"[CLUSTERING] KMeans (Random) - Silhouette: {kmeans_random_metrics['silhouette']:.4f}, CH: {kmeans_random_metrics['calinski_harabasz']:.2f}, DB: {kmeans_random_metrics['davies_bouldin']:.4f}, Train: {kmeans_random_metrics['training_time']:.3f}s")
    
    def _evaluate_model(self, student_vectors: np.ndarray, algorithm: str) -> dict:
        """Evaluate clustering model and return basic metrics (backward compatibility)."""
        return self._evaluate_model_comprehensive(student_vectors, algorithm, 0.0)
    
    def _evaluate_model_comprehensive(self, student_vectors: np.ndarray, algorithm: str, training_time: float) -> dict:
        """
        Comprehensive deployment-level evaluation of clustering model.
        Returns metrics including performance, complexity, stability, and efficiency.
        """
        if algorithm == 'kmeans_plus' and self.kmeans_plus is not None:
            labels = self.kmeans_plus.predict(student_vectors)
            centers = self.kmeans_plus.cluster_centers_
            model = self.kmeans_plus
        elif algorithm == 'kmeans_random' and self.kmeans_random is not None:
            labels = self.kmeans_random.predict(student_vectors)
            centers = self.kmeans_random.cluster_centers_
            model = self.kmeans_random
        else:
            return {
                'silhouette': -1, 'calinski_harabasz': 0, 'davies_bouldin': float('inf'),
                'training_time': 0, 'prediction_time': 0, 'inter_cluster_distance': 0,
                'intra_cluster_variance': float('inf'), 'cluster_stability': 0
            }
        
        # Basic clustering metrics
        silhouette = silhouette_score(student_vectors, labels)
        calinski_harabasz = calinski_harabasz_score(student_vectors, labels)
        davies_bouldin = davies_bouldin_score(student_vectors, labels)
        
        # Dunn Index (internal metric - no ground truth needed)
        try:
            dunn_index = calculate_dunn_index(student_vectors, labels)
        except Exception as e:
            print(f"Could not calculate Dunn Index: {e}")
            dunn_index = 0.0
        
        # Prediction time (average over 100 predictions)
        prediction_times = []
        test_vectors = student_vectors[:min(100, len(student_vectors))]
        for vec in test_vectors:
            start = time.time()
            model.predict(vec.reshape(1, -1))
            prediction_times.append(time.time() - start)
        avg_prediction_time = np.mean(prediction_times) * 1000  # Convert to milliseconds
        
        # Inter-cluster distance (average distance between cluster centers)
        if len(centers) > 1:
            inter_distances_matrix = _pairwise_distances(centers)
            # Remove diagonal (self-distances)
            inter_distances = inter_distances_matrix[np.triu_indices(len(centers), k=1)]
            avg_inter_cluster_distance = np.mean(inter_distances)
        else:
            avg_inter_cluster_distance = 0.0
        
        # Intra-cluster variance (average variance within each cluster)
        intra_variances = []
        for cluster_id in range(self.n_clusters):
            cluster_points = student_vectors[labels == cluster_id]
            if len(cluster_points) > 1:
                cluster_variance = np.mean(np.var(cluster_points, axis=0))
                intra_variances.append(cluster_variance)
        avg_intra_cluster_variance = np.mean(intra_variances) if intra_variances else float('inf')
        
        # Cluster stability (consistency of cluster assignments)
        # Both KMeans variants are deterministic with fixed random_state, so stability is 1.0
        cluster_stability = 1.0
        
        # Model complexity metrics
        # For KMeans, we use inertia (within-cluster sum of squares) as complexity measure
        metrics = {
            'silhouette': silhouette,
            'calinski_harabasz': calinski_harabasz,
            'davies_bouldin': davies_bouldin,
            'dunn_index': dunn_index,
            'training_time': training_time,
            'prediction_time_ms': avg_prediction_time,
            'inter_cluster_distance': avg_inter_cluster_distance,
            'intra_cluster_variance': avg_intra_cluster_variance,
            'cluster_stability': cluster_stability,
            'n_clusters': self.n_clusters,
            'n_samples': len(student_vectors)
        }
        
        # Add KMeans-specific metrics (inertia)
        if algorithm in ['kmeans_plus', 'kmeans_random'] and model is not None:
            metrics['inertia'] = float(model.inertia_)
            # Lower inertia is better (tighter clusters)
            # Also add number of iterations to show convergence differences
            metrics['n_iter'] = int(model.n_iter_)
        
        return metrics
    
    def _select_best_algorithm(self, kmeans_plus_metrics: dict, kmeans_random_metrics: dict) -> str:
        """
        Select best algorithm based on comprehensive deployment metrics.
        Uses weighted scoring across multiple dimensions:
        - Clustering Quality (50%): silhouette, CH, DB
        - Model Performance (25%): stability, inter/intra cluster metrics
        - Efficiency (15%): training time, prediction time
        - Model Complexity (10%): Inertia for KMeans
        """
        # Normalize and score clustering quality (50% weight)
        kmeans_plus_quality = (
            0.4 * kmeans_plus_metrics['silhouette'] +
            0.3 * min(kmeans_plus_metrics['calinski_harabasz'] / 200, 1.0) +  # Normalize CH
            0.3 * (1 / (1 + kmeans_plus_metrics['davies_bouldin']))  # Invert DB
        )
        
        kmeans_random_quality = (
            0.4 * kmeans_random_metrics['silhouette'] +
            0.3 * min(kmeans_random_metrics['calinski_harabasz'] / 200, 1.0) +
            0.3 * (1 / (1 + kmeans_random_metrics['davies_bouldin']))
        )
        
        # Model performance score (25% weight)
        # Higher inter-cluster distance and lower intra-cluster variance is better
        kmeans_plus_performance = (
            0.5 * min(kmeans_plus_metrics['cluster_stability'], 1.0) +
            0.3 * min(kmeans_plus_metrics['inter_cluster_distance'] / 2.0, 1.0) +
            0.2 * (1 / (1 + kmeans_plus_metrics['intra_cluster_variance']))
        )
        
        kmeans_random_performance = (
            0.5 * min(kmeans_random_metrics['cluster_stability'], 1.0) +
            0.3 * min(kmeans_random_metrics['inter_cluster_distance'] / 2.0, 1.0) +
            0.2 * (1 / (1 + kmeans_random_metrics['intra_cluster_variance']))
        )
        
        # Efficiency score (15% weight) - faster is better
        # Normalize times (assume max 10s training, 10ms prediction)
        kmeans_plus_efficiency = (
            0.6 * (1 / (1 + kmeans_plus_metrics['training_time'] * 10)) +
            0.4 * (1 / (1 + kmeans_plus_metrics['prediction_time_ms'] / 10))
        )
        
        kmeans_random_efficiency = (
            0.6 * (1 / (1 + kmeans_random_metrics['training_time'] * 10)) +
            0.4 * (1 / (1 + kmeans_random_metrics['prediction_time_ms'] / 10))
        )
        
        # Model complexity score (10% weight) - lower inertia is better (tighter clusters)
        # Normalize inertia (assume range 0-1000)
        kmeans_plus_complexity = 0.5
        kmeans_random_complexity = 0.5
        if 'inertia' in kmeans_plus_metrics and 'inertia' in kmeans_random_metrics:
            # Lower inertia is better, normalize
            kmeans_plus_complexity = 1 / (1 + kmeans_plus_metrics['inertia'] / 100)
            kmeans_random_complexity = 1 / (1 + kmeans_random_metrics['inertia'] / 100)
        
        # Combined scores
        kmeans_plus_total = (
            0.50 * kmeans_plus_quality +
            0.25 * kmeans_plus_performance +
            0.15 * kmeans_plus_efficiency +
            0.10 * kmeans_plus_complexity
        )
        
        kmeans_random_total = (
            0.50 * kmeans_random_quality +
            0.25 * kmeans_random_performance +
            0.15 * kmeans_random_efficiency +
            0.10 * kmeans_random_complexity
        )
        
        # Prefer k-means++ if scores are very close (within 2%) - it's more stable
        if abs(kmeans_plus_total - kmeans_random_total) < 0.02:
            return 'kmeans_plus'  # k-means++ is generally more stable
        
        return 'kmeans_plus' if kmeans_plus_total > kmeans_random_total else 'kmeans_random'
    
    def predict(self, vector: np.ndarray) -> Tuple[int, str]:
        """
        Predict cluster for a single vector using the best algorithm.
        
        Args:
            vector: Profile vector (1D array)
        
        Returns:
            Tuple of (cluster_id, cluster_name)
        """
        algorithm = self.best_algorithm or self.algorithm
        
        if algorithm == 'kmeans_plus' or algorithm == 'kmeans':
            if self.kmeans_plus is None:
                raise ValueError("KMeans++ model not fitted. Call fit() first or load a saved model.")
            cluster_id = self.kmeans_plus.predict(vector.reshape(1, -1))[0]
        elif algorithm == 'kmeans_random':
            if self.kmeans_random is None:
                raise ValueError("KMeans (random) model not fitted. Call fit() first or load a saved model.")
            cluster_id = self.kmeans_random.predict(vector.reshape(1, -1))[0]
        else:
            raise ValueError(f"Unknown algorithm: {algorithm}")
        
        cluster_name = self.cluster_names[cluster_id] if cluster_id < len(self.cluster_names) else f"Cluster {cluster_id}"
        return cluster_id, cluster_name
    
    def predict_proba(self, vector: np.ndarray) -> Optional[np.ndarray]:
        """
        Get probability distribution across clusters.
        For KMeans, returns hard assignment (1.0 for assigned cluster, 0.0 for others).
        
        Args:
            vector: Profile vector (1D array)
        
        Returns:
            Array of probabilities for each cluster (hard assignment for KMeans)
        """
        algorithm = self.best_algorithm or self.algorithm
        
        if algorithm == 'kmeans_plus' or algorithm == 'kmeans':
            if self.kmeans_plus is None:
                return None
            cluster_id = self.kmeans_plus.predict(vector.reshape(1, -1))[0]
            # Return hard assignment (1.0 for assigned cluster, 0.0 for others)
            probs = np.zeros(self.n_clusters)
            probs[cluster_id] = 1.0
            return probs
        elif algorithm == 'kmeans_random':
            if self.kmeans_random is None:
                return None
            cluster_id = self.kmeans_random.predict(vector.reshape(1, -1))[0]
            # Return hard assignment
            probs = np.zeros(self.n_clusters)
            probs[cluster_id] = 1.0
            return probs
        return None
    
    def get_cluster_centers(self) -> np.ndarray:
        """Get cluster centers from the active algorithm."""
        algorithm = self.best_algorithm or self.algorithm
        
        if algorithm == 'kmeans_plus' or algorithm == 'kmeans':
            if self.kmeans_plus is None:
                raise ValueError("KMeans++ model not fitted.")
            return self.kmeans_plus.cluster_centers_
        elif algorithm == 'kmeans_random':
            if self.kmeans_random is None:
                raise ValueError("KMeans (random) model not fitted.")
            return self.kmeans_random.cluster_centers_
        else:
            raise ValueError(f"Unknown algorithm: {algorithm}")
    
    def get_metrics(self) -> dict:
        """Get evaluation metrics for the models."""
        return self.metrics
    
    def get_active_algorithm(self) -> str:
        """Get the currently active algorithm."""
        return self.best_algorithm or self.algorithm
    
    def save_model(self):
        """Save model(s) to disk."""
        model_data = {
            'kmeans_plus': self.kmeans_plus,
            'kmeans_random': self.kmeans_random,
            # Backward compatibility: map old names
            'kmeans': self.kmeans_plus,  # For backward compatibility
            'gmm': None,  # Clear old GMM reference
            'best_algorithm': self.best_algorithm,
            'algorithm': self.algorithm,
            'n_clusters': self.n_clusters,
            'cluster_names': self.cluster_names,
            'metrics': self.metrics
        }
        joblib.dump(model_data, self.model_path)
    
    def load_model(self):
        """Load model(s) from disk."""
        if os.path.exists(self.model_path):
            model_data = joblib.load(self.model_path)
            # Try new names first, fall back to old names for backward compatibility
            self.kmeans_plus = model_data.get('kmeans_plus') or model_data.get('kmeans')
            self.kmeans_random = model_data.get('kmeans_random')
            # Handle old GMM data (should be None now)
            old_gmm = model_data.get('gmm')
            if old_gmm is not None:
                print("[WARNING] Old GMM model found. Please retrain models to use KMeans++ vs KMeans (random) comparison.")
            self.best_algorithm = model_data.get('best_algorithm')
            self.algorithm = model_data.get('algorithm', 'auto')
            self.n_clusters = model_data.get('n_clusters', 5)
            self.cluster_names = model_data.get('cluster_names', self.cluster_names)
            self.metrics = model_data.get('metrics', {})


if __name__ == "__main__":
    # Test
    clusterer = StudentClusterer(n_clusters=5)
    
    # Generate synthetic student data
    np.random.seed(42)
    student_vectors = np.random.rand(50, 20)  # 50 students, 20 features
    
    # Fit model
    clusterer.fit(student_vectors)
    
    # Predict
    test_vector = np.random.rand(20)
    cluster_id, cluster_name = clusterer.predict(test_vector)
    print(f"Predicted cluster: {cluster_id} ({cluster_name})")

