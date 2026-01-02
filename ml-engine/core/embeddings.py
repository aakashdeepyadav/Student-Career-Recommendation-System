"""
Embedding Module
Handles dimensionality reduction (PCA, UMAP) and career embeddings.
"""

import numpy as np
import joblib
from sklearn.decomposition import PCA
from umap import UMAP
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Tuple, Optional
import os


class EmbeddingReducer:
    """
    Reduces high-dimensional vectors to 2D (PCA) and 3D (UMAP) for visualization.
    """
    
    def __init__(self, model_dir: str = "model"):
        self.model_dir = model_dir
        os.makedirs(model_dir, exist_ok=True)
        
        self.pca_2d = None
        self.umap_3d = None
        self.pca_path = os.path.join(model_dir, "pca_2d.joblib")
        self.umap_path = os.path.join(model_dir, "umap_3d.joblib")
        
        # Load existing models if available
        if os.path.exists(self.pca_path):
            self.pca_2d = joblib.load(self.pca_path)
        if os.path.exists(self.umap_path):
            self.umap_3d = joblib.load(self.umap_path)
    
    def fit_pca_2d(self, vectors: np.ndarray):
        """Fit PCA for 2D reduction."""
        self.pca_2d = PCA(n_components=2, random_state=42)
        self.pca_2d.fit(vectors)
        joblib.dump(self.pca_2d, self.pca_path)
    
    def fit_umap_3d(self, vectors: np.ndarray):
        """Fit UMAP for 3D reduction."""
        # n_jobs=1 is required when random_state is set for reproducibility
        self.umap_3d = UMAP(n_components=3, random_state=42, n_neighbors=15, min_dist=0.1, n_jobs=1)
        self.umap_3d.fit(vectors)
        joblib.dump(self.umap_3d, self.umap_path)
    
    def transform_2d(self, vectors: np.ndarray) -> np.ndarray:
        """Transform vectors to 2D using PCA."""
        if self.pca_2d is None:
            raise ValueError("PCA model not fitted. Call fit_pca_2d() first.")
        return self.pca_2d.transform(vectors)
    
    def transform_3d(self, vectors: np.ndarray) -> np.ndarray:
        """Transform vectors to 3D using UMAP."""
        if self.umap_3d is None:
            raise ValueError("UMAP model not fitted. Call fit_umap_3d() first.")
        return self.umap_3d.transform(vectors)


class CareerEmbedder:
    """
    Creates embeddings for careers using sentence transformers.
    """
    
    def __init__(self):
        # Use a lightweight model for faster inference
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.embedding_dim = 384  # MiniLM output dimension
    
    def embed_career(self, career_data: Dict) -> np.ndarray:
        """
        Create embedding for a career.
        
        Args:
            career_data: Dictionary with 'title', 'description', 'riasec', 'skills'
        
        Returns:
            Combined embedding vector
        """
        # Combine text description
        text = f"{career_data.get('title', '')} {career_data.get('description', '')}"
        
        # Get text embedding
        text_embedding = self.model.encode(text, convert_to_numpy=True)
        
        # Combine with RIASEC scores (6D) and skills (normalized)
        riasec = np.array(career_data.get('riasec', [0, 0, 0, 0, 0, 0]))
        skills = np.array(career_data.get('skills_vector', [0] * 10))  # 10 skill dimensions
        
        # Normalize and combine
        combined = np.concatenate([
            text_embedding,  # 384D
            riasec,          # 6D
            skills           # 10D
        ])
        
        return combined
    
    def embed_batch(self, careers: List[Dict]) -> np.ndarray:
        """Embed multiple careers."""
        embeddings = [self.embed_career(career) for career in careers]
        return np.array(embeddings)

