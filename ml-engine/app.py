"""
FastAPI ML Engine
Main API server for ML operations.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import numpy as np
import os
from dotenv import load_dotenv
from sklearn.metrics import (
    silhouette_score, 
    calinski_harabasz_score, 
    davies_bouldin_score,
    adjusted_rand_score,
    normalized_mutual_info_score,
    fowlkes_mallows_score
)

from core.riasec_scorer import RIASECScorer
from core.profile_processor import ProfileProcessor
from core.clustering import StudentClusterer
from core.embeddings import EmbeddingReducer
from core.similarity import SimilarityEngine
from core.data_loader import DataLoader
from core.metrics import calculate_dunn_index, create_riasec_ground_truth, calculate_external_metrics

load_dotenv()

app = FastAPI(title="SCRS ML Engine", version="1.0.0")

# CORS - Allow multiple origins
cors_origins = os.getenv("CORS_ORIGIN", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
data_loader = DataLoader()
profile_processor = ProfileProcessor()
# Use fixed KMeans++ for deterministic model selection.
clusterer = StudentClusterer(algorithm='kmeans_plus')
embedding_reducer = EmbeddingReducer()
similarity_engine = SimilarityEngine()

visualization_cache: Dict[str, Any] = {
    "ready": False,
    "careers_2d": [],
    "careers_3d": [],
    "career_titles": [],
    "career_ids": [],
    "clusters_2d": None,
    "clusters_3d": None,
    "students_2d": None,
    "students_3d": None,
    "student_clusters": None,
}

# Load careers
careers_data = data_loader.load_careers()
# Avoid heavyweight runtime embedding generation at startup so the web service
# binds to $PORT quickly on platforms like Render.
for career in careers_data:
    if 'embedding' not in career:
        riasec = np.array(career.get('riasec', [0, 0, 0, 0, 0, 0]), dtype=float)
        skills = np.array(career.get('skills_vector', [0] * 10), dtype=float)
        subjects = np.array([0.0, 0.0, 0.0, 0.0], dtype=float)
        career['embedding'] = np.concatenate([riasec, skills, subjects]).tolist()

# Load students and fit models if available
students_data = data_loader.load_students()
if len(students_data) > 0:
    student_vectors = np.array([s.get('combined_vector', []) for s in students_data if 'combined_vector' in s])
    if len(student_vectors) > 0 and student_vectors.shape[1] > 0:
        try:
            # Check if model exists and has metrics
            model_path = clusterer.model_path
            if os.path.exists(model_path):
                # Try to load existing model first
                try:
                    clusterer.load_model()
                    print("[OK] Loaded existing clustering model from disk")
                    # Ensure KMeans++ model exists for fixed selection mode.
                    if clusterer.kmeans_plus is None:
                        print("[WARNING] Saved model missing KMeans++ - retraining")
                        clusterer.fit(student_vectors)
                except Exception as load_error:
                    print(f"[WARNING] Could not load model: {load_error}")
                    print("[INFO] Training new model...")
                    clusterer.fit(student_vectors)
            else:
                print("[INFO] No existing model found - training new model...")
                clusterer.fit(student_vectors)

            # Do not refit reducers on every boot; load existing reducers when available.
            if embedding_reducer.pca_2d is None:
                print("[INFO] PCA model missing - fitting PCA 2D")
                embedding_reducer.fit_pca_2d(student_vectors)
            if embedding_reducer.umap_3d is None:
                print("[INFO] UMAP model missing - fitting UMAP 3D")
                embedding_reducer.fit_umap_3d(student_vectors)
            print("[OK] All models loaded and ready")
        except Exception as e:
            print(f"⚠ Warning: Could not fit models: {e}")
            print("   Run 'python train_models.py' to train models")


def to_model_vector(career_embedding: np.ndarray, target_dim: int) -> np.ndarray:
    """Convert career embedding to the same dimensionality as user vectors."""
    if len(career_embedding) >= 16:
        riasec_skills = career_embedding[-16:]
        subjects = np.array([0.0, 0.0, 0.0, 0.0], dtype=float)
        return np.concatenate([riasec_skills, subjects]).reshape(1, -1)

    if len(career_embedding) == target_dim:
        return career_embedding.reshape(1, -1)

    if len(career_embedding) < target_dim:
        return np.pad(career_embedding, (0, target_dim - len(career_embedding)), 'constant').reshape(1, -1)

    return career_embedding[:target_dim].reshape(1, -1)


def get_active_cluster_model():
    algo = clusterer.get_active_algorithm()
    if algo == 'kmeans_plus' or algo == 'kmeans':
        return clusterer.kmeans_plus, algo
    if algo == 'kmeans_random':
        return clusterer.kmeans_random, algo
    return None, algo


def build_visualization_cache() -> None:
    """Precompute static visualization data so request-time work stays minimal."""
    if embedding_reducer.pca_2d is None or embedding_reducer.umap_3d is None:
        print("[CACHE] Visualization cache skipped: reducers unavailable")
        return

    target_dim = 20
    if len(students_data) > 0:
        student_vectors = np.array([s.get('combined_vector', []) for s in students_data if 'combined_vector' in s])
        if len(student_vectors) > 0 and student_vectors.shape[1] > 0:
            target_dim = int(student_vectors.shape[1])

    careers_2d = []
    careers_3d = []
    career_titles = []
    career_ids = []

    for i, career in enumerate(careers_data):
        career_embedding = np.array(career.get('embedding', []))
        if len(career_embedding) == 0:
            continue

        try:
            career_vector = to_model_vector(career_embedding, target_dim)
            career_2d = embedding_reducer.transform_2d(career_vector)[0].tolist()
            career_3d = embedding_reducer.transform_3d(career_vector)[0].tolist()
        except Exception as e:
            print(f"[CACHE] Skipping career transform at index {i}: {e}")
            continue

        careers_2d.append(career_2d)
        careers_3d.append(career_3d)
        career_titles.append(career.get('title', f'Career {i + 1}'))
        career_ids.append(str(career.get('id')) if career.get('id') is not None else None)

    clusters_2d = None
    clusters_3d = None
    students_2d = None
    students_3d = None
    student_clusters = None
    active_model, active_algo = get_active_cluster_model()

    try:
        if active_model is not None:
            cluster_centers = clusterer.get_cluster_centers()
            clusters_2d = embedding_reducer.transform_2d(cluster_centers).tolist()
            clusters_3d = embedding_reducer.transform_3d(cluster_centers).tolist()
    except Exception as e:
        print(f"[CACHE] Cluster center transform warning: {e}")

    try:
        if len(students_data) > 0 and active_model is not None:
            student_vectors = np.array([s.get('combined_vector', []) for s in students_data if 'combined_vector' in s])
            if len(student_vectors) > 0:
                students_2d = embedding_reducer.transform_2d(student_vectors).tolist()
                students_3d = embedding_reducer.transform_3d(student_vectors).tolist()
                if active_algo == 'kmeans_plus' or active_algo == 'kmeans':
                    student_clusters = clusterer.kmeans_plus.predict(student_vectors).tolist()
                elif active_algo == 'kmeans_random':
                    student_clusters = clusterer.kmeans_random.predict(student_vectors).tolist()
    except Exception as e:
        print(f"[CACHE] Student transform warning: {e}")

    visualization_cache["ready"] = True
    visualization_cache["careers_2d"] = careers_2d
    visualization_cache["careers_3d"] = careers_3d
    visualization_cache["career_titles"] = career_titles
    visualization_cache["career_ids"] = career_ids
    visualization_cache["clusters_2d"] = clusters_2d
    visualization_cache["clusters_3d"] = clusters_3d
    visualization_cache["students_2d"] = students_2d
    visualization_cache["students_3d"] = students_3d
    visualization_cache["student_clusters"] = student_clusters
    print(f"[CACHE] Visualization cache ready: careers={len(careers_2d)}, students={len(students_2d) if students_2d else 0}")


build_visualization_cache()


# Request/Response Models
class QuestionnaireRequest(BaseModel):
    riasec_responses: Dict[str, int]
    skill_responses: Dict[str, int]
    subject_preferences: Dict[str, int]


class ProfileResponse(BaseModel):
    riasec_profile: Dict[str, float]
    riasec_vector: List[float]
    skill_vector: List[float]
    subject_vector: List[float]
    combined_vector: List[float]
    skills: Dict[str, int]


class RecommendationResponse(BaseModel):
    career_id: str
    title: str
    description: str
    similarity_score: float
    domain: str
    salary_range: str
    required_skills: List[str]
    skill_gaps: Dict[str, float]


class AssessRequest(QuestionnaireRequest):
    top_k: int = 5


class AssessResponse(BaseModel):
    profile: ProfileResponse
    cluster: Dict[str, Any]
    recommendations: List[RecommendationResponse]


class ClusterRequest(BaseModel):
    combined_vector: List[float]

class VisualizationRequest(BaseModel):
    combined_vector: List[float]
    recommended_career_ids: Optional[List[str]] = None

class RecommendRequest(BaseModel):
    combined_vector: List[float]
    user_skills: Optional[Dict[str, float]] = None
    top_k: int = 5

class VisualizationResponse(BaseModel):
    user_2d: List[float]
    user_3d: List[float]
    careers_2d: List[List[float]]
    careers_3d: List[List[float]]
    clusters_2d: Optional[List[List[float]]] = None
    clusters_3d: Optional[List[List[float]]] = None
    students_2d: Optional[List[List[float]]] = None
    students_3d: Optional[List[List[float]]] = None
    student_clusters: Optional[List[int]] = None
    career_titles: Optional[List[str]] = None
    recommended_career_indices: Optional[List[int]] = None


SKILL_NAMES = [
    'programming', 'problem_solving', 'communication', 'creativity',
    'leadership', 'analytical', 'mathematics', 'design', 'research', 'teamwork'
]


def normalize_user_skills(raw_skills: Optional[Dict[str, float]]) -> Dict[str, float]:
    """Normalize skill values to 0-1 regardless of incoming format."""
    normalized: Dict[str, float] = {}
    for skill_name, value in (raw_skills or {}).items():
        try:
            num_value = float(value)
        except (TypeError, ValueError):
            continue

        if num_value > 1.0:
            num_value = (num_value - 1.0) / 4.0

        normalized[skill_name] = max(0.0, min(1.0, num_value))
    return normalized


def extract_user_skills_for_recommendation(
    user_vector: np.ndarray,
    provided_skills: Optional[Dict[str, float]],
) -> Dict[str, float]:
    user_skills_dict = normalize_user_skills(provided_skills)

    if user_skills_dict and len(user_skills_dict) > 0:
        print(f"[SKILL_GAP] Using provided user_skills: {user_skills_dict}")
        print(f"[SKILL_GAP] Number of user skills: {len(user_skills_dict)}")
        print(f"[SKILL_GAP] User skill values: {[(k, f'{v:.2f}') for k, v in user_skills_dict.items()]}")
        return user_skills_dict

    # Extract from combined_vector (skills are at indices 6-15)
    skill_vector = user_vector[6:16] if len(user_vector) >= 16 else np.zeros(10)
    for idx, skill_name in enumerate(SKILL_NAMES):
        if idx < len(skill_vector):
            user_skills_dict[skill_name] = float(skill_vector[idx])

    print(f"[SKILL_GAP] Extracted from vector (fallback): {user_skills_dict}")
    print(f"[SKILL_GAP] WARNING: Using fallback extraction - user_skills from request was: {provided_skills}")
    return user_skills_dict


def build_recommendation_response(
    user_vector: np.ndarray,
    user_skills: Optional[Dict[str, float]],
    top_k: int = 5,
) -> List[RecommendationResponse]:
    recommendations = similarity_engine.recommend_careers(
        user_vector,
        careers_data,
        top_k
    )

    user_skills_dict = extract_user_skills_for_recommendation(user_vector, user_skills)

    if len(user_skills_dict) == 0:
        print(f"[SKILL_GAP ERROR] user_skills_dict is EMPTY! Cannot calculate gaps.")
        print(f"[SKILL_GAP ERROR] user_skills input was: {user_skills}")
        print(f"[SKILL_GAP ERROR] user_skills type: {type(user_skills)}")
        print(f"[SKILL_GAP ERROR] This will cause all skill gaps to be 0.8 (required - 0)")

    result: List[RecommendationResponse] = []
    for rec in recommendations:
        career_skills_list = rec.get('skills', [])

        required_skills = {}
        for skill_name in career_skills_list:
            required_skills[skill_name] = 0.8

        print(f"[SKILL_GAP] Computing gaps for {rec['title']}")
        print(f"[SKILL_GAP] Required skills: {required_skills}")
        skill_gaps = similarity_engine.compute_skill_gap(user_skills_dict, required_skills)

        if len(skill_gaps) > 0:
            print(f"[SKILL_GAP] {rec['title']}: {len(skill_gaps)} gaps calculated")
            for skill, gap in skill_gaps.items():
                print(f"[SKILL_GAP]   - {skill}: {gap:.2f} ({int(gap*100)}%)")
        else:
            print(f"[SKILL_GAP] {rec['title']}: No gaps (all skills matched or below threshold)")
            print(f"[SKILL_GAP]   Required: {list(required_skills.keys())}")
            print(f"[SKILL_GAP]   User has: {list(user_skills_dict.keys())}")

        result.append(RecommendationResponse(
            career_id=rec['id'],
            title=rec['title'],
            description=rec['description'],
            similarity_score=rec['similarity_score'],
            domain=rec.get('domain', 'Unknown'),
            salary_range=rec.get('salary_range', 'N/A'),
            required_skills=career_skills_list,
            skill_gaps=skill_gaps
        ))

    return result


@app.get("/")
async def root():
    return {"message": "SCRS ML Engine API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "models_ready": embedding_reducer.pca_2d is not None and embedding_reducer.umap_3d is not None,
        "cache_ready": visualization_cache.get("ready", False),
    }


@app.post("/profile", response_model=ProfileResponse)
async def create_profile(request: QuestionnaireRequest):
    """Process questionnaire and create user profile."""
    try:
        profile = profile_processor.process_profile(
            request.riasec_responses,
            request.skill_responses,
            request.subject_preferences
        )
        return ProfileResponse(**profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/cluster")
async def get_cluster(request: ClusterRequest):
    """Get cluster assignment for user profile."""
    try:
        vector = np.array(request.combined_vector)
        # Check if model is trained
        active_algorithm = clusterer.get_active_algorithm()
        if active_algorithm == 'kmeans_plus' or active_algorithm == 'kmeans':
            active_model = clusterer.kmeans_plus
        elif active_algorithm == 'kmeans_random':
            active_model = clusterer.kmeans_random
        else:
            active_model = None
            
        if active_model is None:
            # Return default cluster if model not trained
            return {
                "cluster_id": 0,
                "cluster_name": "Not Classified (Model not trained)",
                "algorithm_used": None
            }
        cluster_id, cluster_name = clusterer.predict(vector)
        
        # Get probability distribution (hard assignment for KMeans)
        cluster_probs = None
        probs = clusterer.predict_proba(vector)
        if probs is not None:
            cluster_probs = {
                clusterer.cluster_names[i]: float(prob) 
                for i, prob in enumerate(probs)
            }
        
        result = {
            "cluster_id": int(cluster_id),
            "cluster_name": cluster_name,
            "algorithm_used": active_algorithm
        }
        
        if cluster_probs:
            result["cluster_probabilities"] = cluster_probs
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommend", response_model=List[RecommendationResponse])
async def recommend_careers(request: RecommendRequest):
    """Get career recommendations based on similarity."""
    try:
        user_vector = np.array(request.combined_vector)
        return build_recommendation_response(user_vector, request.user_skills, request.top_k)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/assess", response_model=AssessResponse)
async def assess_profile(request: AssessRequest):
    """Process questionnaire, assign cluster, and return recommendations in one call."""
    try:
        profile = profile_processor.process_profile(
            request.riasec_responses,
            request.skill_responses,
            request.subject_preferences
        )

        vector = np.array(profile.get("combined_vector", []), dtype=float)
        if vector.size == 0:
            raise HTTPException(status_code=400, detail="Profile generation failed: combined_vector is empty")

        active_model, active_algorithm = get_active_cluster_model()
        if active_model is None:
            cluster_payload = {
                "cluster_id": 0,
                "cluster_name": "Not Classified (Model not trained)",
                "algorithm_used": None
            }
        else:
            cluster_id, cluster_name = clusterer.predict(vector)
            cluster_payload = {
                "cluster_id": int(cluster_id),
                "cluster_name": cluster_name,
                "algorithm_used": active_algorithm
            }

            probs = clusterer.predict_proba(vector)
            if probs is not None:
                cluster_payload["cluster_probabilities"] = {
                    clusterer.cluster_names[i]: float(prob)
                    for i, prob in enumerate(probs)
                }

        recommendations = build_recommendation_response(
            vector,
            profile.get("skills") or request.skill_responses,
            request.top_k
        )

        return AssessResponse(
            profile=ProfileResponse(**profile),
            cluster=cluster_payload,
            recommendations=recommendations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/visualize", response_model=VisualizationResponse)
async def get_visualization_data(request: VisualizationRequest):
    """Get 2D and 3D coordinates for visualization."""
    try:
        user_vector = np.array(request.combined_vector).reshape(1, -1)
        
        # Check if models are trained
        if embedding_reducer.pca_2d is None or embedding_reducer.umap_3d is None:
            raise HTTPException(
                status_code=503,
                detail="Visualization models not trained. Please run train_models.py first."
            )

        if not visualization_cache.get("ready"):
            build_visualization_cache()
        
        # Get user coordinates (user vector is 20D, models expect 20D)
        user_2d = embedding_reducer.transform_2d(user_vector)[0].tolist()
        user_3d = embedding_reducer.transform_3d(user_vector)[0].tolist()

        careers_2d = visualization_cache.get("careers_2d", [])
        careers_3d = visualization_cache.get("careers_3d", [])
        clusters_2d = visualization_cache.get("clusters_2d")
        clusters_3d = visualization_cache.get("clusters_3d")
        students_2d = visualization_cache.get("students_2d")
        students_3d = visualization_cache.get("students_3d")
        student_clusters = visualization_cache.get("student_clusters")
        career_titles = visualization_cache.get("career_titles", [])
        career_ids = visualization_cache.get("career_ids", [])

        recommended_career_indices = None
        if request.recommended_career_ids:
            print(f"[VISUALIZE] Looking for {len(request.recommended_career_ids)} recommended career IDs: {request.recommended_career_ids}")
            print(f"[VISUALIZE] Cached career data has {len(career_ids)} careers")
            
            requested_ids = set(str(req_id) for req_id in request.recommended_career_ids)
            recommended_career_indices = []
            for i, career_id_str in enumerate(career_ids):
                if career_id_str is not None and career_id_str in requested_ids:
                    recommended_career_indices.append(i)
                    print(f"[VISUALIZE] Matched career '{career_titles[i]}' (index {i}) with ID {career_id_str}")
            
            if len(recommended_career_indices) == 0:
                print(f"[VISUALIZE] WARNING: No career IDs matched! Available career IDs: {career_ids[:5]}")
            else:
                print(f"[VISUALIZE] ✓ Found {len(recommended_career_indices)} matching careers at indices: {recommended_career_indices}")
        
        return VisualizationResponse(
            user_2d=user_2d,
            user_3d=user_3d,
            careers_2d=careers_2d,
            careers_3d=careers_3d,
            clusters_2d=clusters_2d,
            clusters_3d=clusters_3d,
            students_2d=students_2d,
            students_3d=students_3d,
            student_clusters=student_clusters,
            career_titles=career_titles,
            recommended_career_indices=recommended_career_indices
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)


@app.get("/careers")
async def get_all_careers():
    """Get all available careers."""
    return careers_data


@app.get("/model-statistics")
async def get_model_statistics():
    """Get comprehensive model statistics and metrics for unsupervised learning evaluation."""
    print(f"[STATS] ========== MODEL STATISTICS REQUEST ==========")
    print(f"[STATS] Students data count: {len(students_data)}")
    print(f"[STATS] Active algorithm: {clusterer.get_active_algorithm()}")
    try:
        stats = {
            "model_info": {
                "algorithm": clusterer.get_active_algorithm().upper(),
                "algorithm_type": "KMeans++" if (clusterer.get_active_algorithm() == 'kmeans_plus' or clusterer.get_active_algorithm() == 'kmeans') else "KMeans (Random)",
                "n_clusters": clusterer.n_clusters,
                "model_trained": (clusterer.kmeans_plus is not None) or (clusterer.kmeans_random is not None),
                "kmeans_plus_available": clusterer.kmeans_plus is not None,
                "kmeans_random_available": clusterer.kmeans_random is not None,
                "comparison_metrics": clusterer.get_metrics(),
                "dimensionality_reduction": {
                    "pca_2d": embedding_reducer.pca_2d is not None,
                    "umap_3d": embedding_reducer.umap_3d is not None
                }
            },
            "cluster_info": {
                "cluster_names": clusterer.cluster_names,
                "cluster_centers": None,
                "cluster_sizes": None,
                "cluster_percentages": None
            },
            "metrics": {
                "silhouette_score": None,
                "calinski_harabasz_score": None,
                "davies_bouldin_score": None,
                "dunn_index": None,
                "inertia": None
            },
            "external_metrics": {
                "adjusted_rand_index": None,
                "normalized_mutual_info": None,
                "fowlkes_mallows_index": None,
                "ground_truth_type": None
            },
            "pca_info": {
                "explained_variance_ratio": None,
                "cumulative_variance": None,
                "n_components": None
            },
            "data_info": {
                "n_students": len(students_data),
                "n_careers": len(careers_data),
                "feature_dimension": None
            }
        }
        
        # Get student vectors if available
        student_vectors = None
        if len(students_data) > 0:
            vectors = [s.get('combined_vector', []) for s in students_data if 'combined_vector' in s]
            if vectors and len(vectors[0]) > 0:
                student_vectors = np.array(vectors)
                stats["data_info"]["feature_dimension"] = student_vectors.shape[1]
        
        # Calculate clustering metrics if model is trained
        # Use active algorithm (could be kmeans_plus or kmeans_random)
        active_algorithm = clusterer.get_active_algorithm()
        if active_algorithm == 'kmeans_plus' or active_algorithm == 'kmeans':
            active_model = clusterer.kmeans_plus
        elif active_algorithm == 'kmeans_random':
            active_model = clusterer.kmeans_random
        else:
            active_model = None
        
        cluster_labels = None  # Initialize outside the if block
        if active_model is not None and student_vectors is not None and len(student_vectors) > clusterer.n_clusters:
            print(f"[STATS] ✅ Calculating metrics for {len(student_vectors)} student vectors with {clusterer.n_clusters} clusters")
            # Get cluster assignments using active algorithm
            if active_algorithm == 'kmeans_plus' or active_algorithm == 'kmeans':
                cluster_labels = clusterer.kmeans_plus.predict(student_vectors)
            elif active_algorithm == 'kmeans_random':
                cluster_labels = clusterer.kmeans_random.predict(student_vectors)
            else:
                cluster_labels = None
            
            print(f"[STATS] ✅ Cluster labels generated: {len(cluster_labels) if cluster_labels is not None else 0} labels")
            
            # Cluster sizes
            if cluster_labels is not None:
                unique, counts = np.unique(cluster_labels, return_counts=True)
                cluster_sizes = {int(k): int(v) for k, v in zip(unique, counts)}
                cluster_percentages = {int(k): round(v / len(cluster_labels) * 100, 1) for k, v in zip(unique, counts)}
            
                stats["cluster_info"]["cluster_sizes"] = cluster_sizes
                stats["cluster_info"]["cluster_percentages"] = cluster_percentages
            
            # Cluster centers (summarized + actual coordinates)
            centers = clusterer.get_cluster_centers()
            stats["cluster_info"]["cluster_centers"] = [
                {
                    "cluster_id": i,
                    "name": clusterer.cluster_names[i] if i < len(clusterer.cluster_names) else f"Cluster {i}",
                    "center": centers[i].tolist() if hasattr(centers[i], 'tolist') else list(centers[i]),  # Actual center coordinates
                    "center_norm": float(np.linalg.norm(centers[i])),
                    "center_mean": float(np.mean(centers[i])),
                    "center_std": float(np.std(centers[i]))
                }
                for i in range(len(centers))
            ]
            
            # Inertia (within-cluster sum of squares) - for both KMeans variants
            if active_algorithm == 'kmeans_plus' or active_algorithm == 'kmeans':
                if clusterer.kmeans_plus is not None:
                    stats["metrics"]["inertia"] = float(clusterer.kmeans_plus.inertia_)
                else:
                    stats["metrics"]["inertia"] = None
            elif active_algorithm == 'kmeans_random':
                if clusterer.kmeans_random is not None:
                    stats["metrics"]["inertia"] = float(clusterer.kmeans_random.inertia_)
                else:
                    stats["metrics"]["inertia"] = None
            else:
                stats["metrics"]["inertia"] = None
            
            # Add deployment-level metrics from comprehensive evaluation
            # First try to get from saved model, if not available, recalculate
            deployment_metrics = clusterer.get_metrics()
            
            # If metrics don't have both algorithms, we need to retrain or they're from old model
            if not deployment_metrics or 'kmeans_plus' not in deployment_metrics or 'kmeans_random' not in deployment_metrics:
                print("[WARNING] Deployment metrics not found in saved model. Models may need retraining.")
                print("[INFO] Run 'python scripts/train_models.py' to generate deployment metrics.")
            
            if deployment_metrics and 'kmeans_plus' in deployment_metrics and 'kmeans_random' in deployment_metrics:
                selected_algo = deployment_metrics.get('selected', active_algorithm)
                selected_algo_display = "KMeans++" if selected_algo == 'kmeans_plus' or selected_algo == 'kmeans' else "KMeans (Random)"
                stats["deployment_metrics"] = {
                    "selected_algorithm": selected_algo_display,
                    "kmeans_plus": {
                        "clustering_quality": {
                            "silhouette": round(deployment_metrics['kmeans_plus'].get('silhouette', 0), 4),
                            "calinski_harabasz": round(deployment_metrics['kmeans_plus'].get('calinski_harabasz', 0), 2),
                            "davies_bouldin": round(deployment_metrics['kmeans_plus'].get('davies_bouldin', float('inf')), 4),
                            "dunn_index": round(deployment_metrics['kmeans_plus'].get('dunn_index', 0), 4)
                        },
                        "performance": {
                            "training_time_seconds": round(deployment_metrics['kmeans_plus'].get('training_time', 0), 3),
                            "prediction_time_ms": round(deployment_metrics['kmeans_plus'].get('prediction_time_ms', 0), 3),
                            "cluster_stability": round(deployment_metrics['kmeans_plus'].get('cluster_stability', 0), 4),
                            "inter_cluster_distance": round(deployment_metrics['kmeans_plus'].get('inter_cluster_distance', 0), 4),
                            "intra_cluster_variance": round(deployment_metrics['kmeans_plus'].get('intra_cluster_variance', 0), 4)
                        },
                        "model_complexity": {
                            "inertia": round(deployment_metrics['kmeans_plus'].get('inertia', 0), 2) if 'inertia' in deployment_metrics['kmeans_plus'] else None
                        }
                    },
                    "kmeans_random": {
                        "clustering_quality": {
                            "silhouette": round(deployment_metrics['kmeans_random'].get('silhouette', 0), 4),
                            "calinski_harabasz": round(deployment_metrics['kmeans_random'].get('calinski_harabasz', 0), 2),
                            "davies_bouldin": round(deployment_metrics['kmeans_random'].get('davies_bouldin', float('inf')), 4),
                            "dunn_index": round(deployment_metrics['kmeans_random'].get('dunn_index', 0), 4)
                        },
                        "performance": {
                            "training_time_seconds": round(deployment_metrics['kmeans_random'].get('training_time', 0), 3),
                            "prediction_time_ms": round(deployment_metrics['kmeans_random'].get('prediction_time_ms', 0), 3),
                            "cluster_stability": round(deployment_metrics['kmeans_random'].get('cluster_stability', 0), 4),
                            "inter_cluster_distance": round(deployment_metrics['kmeans_random'].get('inter_cluster_distance', 0), 4),
                            "intra_cluster_variance": round(deployment_metrics['kmeans_random'].get('intra_cluster_variance', 0), 4)
                        },
                        "model_complexity": {
                            "inertia": round(deployment_metrics['kmeans_random'].get('inertia', 0), 2) if 'inertia' in deployment_metrics['kmeans_random'] else None
                        }
                    },
                    "comparison": {
                        "winner": "KMeans++" if deployment_metrics.get('selected', active_algorithm) == 'kmeans_plus' else "KMeans (Random)",
                        "quality_difference": round(
                            abs(deployment_metrics['kmeans_plus'].get('silhouette', 0) - deployment_metrics['kmeans_random'].get('silhouette', 0)), 4
                        ),
                        "speed_advantage": "KMeans++" if deployment_metrics['kmeans_plus'].get('training_time', 0) < deployment_metrics['kmeans_random'].get('training_time', 0) else "KMeans (Random)",
                        "speed_difference_seconds": round(
                            abs(deployment_metrics['kmeans_plus'].get('training_time', 0) - deployment_metrics['kmeans_random'].get('training_time', 0)), 3
                        )
                    }
                }
            
            # Legacy metrics - use deployment_metrics if available, otherwise calculate fresh
            # This ensures legacy section shows correct values from deployment_metrics
            if deployment_metrics and 'kmeans_plus' in deployment_metrics and 'kmeans_random' in deployment_metrics:
                # Use values from selected algorithm in deployment_metrics
                selected_algo = deployment_metrics.get('selected', active_algorithm)
                algo_metrics = deployment_metrics.get(selected_algo, {})
                
                if algo_metrics:
                    sil_score = algo_metrics.get('silhouette', 0)
                    ch_score = algo_metrics.get('calinski_harabasz', 0)
                    db_score = algo_metrics.get('davies_bouldin', float('inf'))
                    
                    stats["metrics"]["silhouette_score"] = {
                        "value": round(float(sil_score), 4),
                        "interpretation": "Excellent" if sil_score > 0.7 else "Good" if sil_score > 0.5 else "Fair" if sil_score > 0.25 else "Poor"
                    }
                    stats["metrics"]["calinski_harabasz_score"] = {
                        "value": round(float(ch_score), 2),
                        "interpretation": "Higher values indicate better-defined clusters"
                    }
                    stats["metrics"]["davies_bouldin_score"] = {
                        "value": round(float(db_score), 4),
                        "interpretation": "Good" if db_score < 1 else "Fair" if db_score < 2 else "Poor"
                    }
            else:
                # Fallback: Calculate from active algorithm if deployment_metrics not available
                # Silhouette Score (-1 to 1, higher is better)
                try:
                    sil_score = silhouette_score(student_vectors, cluster_labels)
                    stats["metrics"]["silhouette_score"] = {
                        "value": round(float(sil_score), 4),
                        "interpretation": "Excellent" if sil_score > 0.7 else "Good" if sil_score > 0.5 else "Fair" if sil_score > 0.25 else "Poor"
                    }
                except Exception as e:
                    print(f"Could not calculate silhouette score: {e}")
                
                # Calinski-Harabasz Index (higher is better)
                try:
                    ch_score = calinski_harabasz_score(student_vectors, cluster_labels)
                    stats["metrics"]["calinski_harabasz_score"] = {
                        "value": round(float(ch_score), 2),
                        "interpretation": "Higher values indicate better-defined clusters"
                    }
                except Exception as e:
                    print(f"Could not calculate Calinski-Harabasz score: {e}")
                
                # Davies-Bouldin Index (lower is better)
                try:
                    db_score = davies_bouldin_score(student_vectors, cluster_labels)
                    stats["metrics"]["davies_bouldin_score"] = {
                        "value": round(float(db_score), 4),
                        "interpretation": "Good" if db_score < 1 else "Fair" if db_score < 2 else "Poor"
                    }
                except Exception as e:
                    print(f"Could not calculate Davies-Bouldin score: {e}")
                
                # Dunn Index (higher is better)
                try:
                    dunn_score = calculate_dunn_index(student_vectors, cluster_labels)
                    stats["metrics"]["dunn_index"] = {
                        "value": round(float(dunn_score), 4),
                        "interpretation": "Excellent" if dunn_score > 1.0 else "Good" if dunn_score > 0.5 else "Fair" if dunn_score > 0.2 else "Poor"
                    }
                except Exception as e:
                    print(f"Could not calculate Dunn Index: {e}")
        
        # External Validation Metrics (using RIASEC-based pseudo-ground truth)
        # IMPORTANT: Calculate this OUTSIDE the deployment_metrics conditional so it ALWAYS runs
        # Only use students that have combined_vector (for clustering) - first 6 elements are RIASEC
        if cluster_labels is not None and len(cluster_labels) > 0:
            print(f"[STATS] ========== EXTERNAL METRICS CALCULATION START ==========")
            try:
                # Filter students to only those used in clustering (have combined_vector)
                students_with_vectors = [s for s in students_data if 'combined_vector' in s and s.get('combined_vector')]
                print(f"[METRICS] Attempting to create ground truth from {len(students_with_vectors)} students (those with combined_vector)")
                
                if len(students_with_vectors) == 0:
                    print(f"[METRICS] No students with combined_vector found")
                else:
                    # Show sample student structure for debugging
                    sample_student = students_with_vectors[0]
                    print(f"[METRICS] Sample student keys: {list(sample_student.keys())[:15]}")
                    if 'riasec_profile' in sample_student:
                        print(f"[METRICS] Sample student has riasec_profile: {type(sample_student['riasec_profile'])}")
                    elif 'profile' in sample_student:
                        print(f"[METRICS] Sample student has profile: {type(sample_student['profile'])}")
                        if isinstance(sample_student['profile'], dict):
                            print(f"[METRICS] Profile keys: {list(sample_student['profile'].keys())[:10]}")
                
                ground_truth_labels = create_riasec_ground_truth(students_with_vectors)
                print(f"[METRICS] Ground truth labels created: {ground_truth_labels is not None}, length: {len(ground_truth_labels) if ground_truth_labels is not None else 0}")
                print(f"[METRICS] Cluster labels length: {len(cluster_labels)}")
                
                if ground_truth_labels is not None and len(ground_truth_labels) == len(cluster_labels):
                    print(f"[METRICS] Calculating external metrics...")
                    external_metrics = calculate_external_metrics(cluster_labels, ground_truth_labels)
                    print(f"[METRICS] External metrics calculated: ARI={external_metrics.get('adjusted_rand_index')}, NMI={external_metrics.get('normalized_mutual_info')}, FMI={external_metrics.get('fowlkes_mallows_index')}")
                    
                    stats["external_metrics"] = {
                        "adjusted_rand_index": {
                            "value": round(external_metrics['adjusted_rand_index'], 4) if external_metrics['adjusted_rand_index'] is not None else None,
                            "interpretation": "Excellent" if external_metrics['adjusted_rand_index'] and external_metrics['adjusted_rand_index'] > 0.7 else 
                                             "Good" if external_metrics['adjusted_rand_index'] and external_metrics['adjusted_rand_index'] > 0.5 else
                                             "Fair" if external_metrics['adjusted_rand_index'] and external_metrics['adjusted_rand_index'] > 0.3 else
                                             "Poor" if external_metrics['adjusted_rand_index'] is not None else None,
                            "range": "[-1, 1]",
                            "description": "Measures similarity between predicted clusters and RIASEC-based ground truth"
                        },
                        "normalized_mutual_info": {
                            "value": round(external_metrics['normalized_mutual_info'], 4) if external_metrics['normalized_mutual_info'] is not None else None,
                            "interpretation": "Excellent" if external_metrics['normalized_mutual_info'] and external_metrics['normalized_mutual_info'] > 0.7 else
                                             "Good" if external_metrics['normalized_mutual_info'] and external_metrics['normalized_mutual_info'] > 0.5 else
                                             "Fair" if external_metrics['normalized_mutual_info'] and external_metrics['normalized_mutual_info'] > 0.3 else
                                             "Poor" if external_metrics['normalized_mutual_info'] is not None else None,
                            "range": "[0, 1]",
                            "description": "Normalized mutual information between predicted and ground truth labels"
                        },
                        "fowlkes_mallows_index": {
                            "value": round(external_metrics['fowlkes_mallows_index'], 4) if external_metrics['fowlkes_mallows_index'] is not None else None,
                            "interpretation": "Excellent" if external_metrics['fowlkes_mallows_index'] and external_metrics['fowlkes_mallows_index'] > 0.7 else
                                             "Good" if external_metrics['fowlkes_mallows_index'] and external_metrics['fowlkes_mallows_index'] > 0.5 else
                                             "Fair" if external_metrics['fowlkes_mallows_index'] and external_metrics['fowlkes_mallows_index'] > 0.3 else
                                             "Poor" if external_metrics['fowlkes_mallows_index'] is not None else None,
                            "range": "[0, 1]",
                            "description": "Geometric mean of precision and recall for cluster pairs"
                        },
                        "ground_truth_type": "RIASEC Dominant Dimension"
                    }
                else:
                    print(f"[METRICS] ❌ Cannot calculate external metrics:")
                    print(f"  - Ground truth exists: {ground_truth_labels is not None}")
                    print(f"  - Ground truth length: {len(ground_truth_labels) if ground_truth_labels is not None else 0}")
                    print(f"  - Cluster labels length: {len(cluster_labels)}")
                    print(f"  - Students with vectors: {len(students_with_vectors)}")
                    if ground_truth_labels is None:
                        print(f"  - Reason: Ground truth creation failed")
                        print(f"  - Solution: Ensure students have combined_vector (first 6 elements are RIASEC)")
                    elif len(ground_truth_labels) != len(cluster_labels):
                        print(f"  - Reason: Length mismatch - need to filter students_with_vectors to match cluster_labels")
                        # Try to match by filtering students_with_vectors to only those that were actually clustered
                        # This happens if some students don't have valid combined_vector
                        try:
                            # Re-filter to match exactly
                            filtered_students = []
                            for s in students_with_vectors:
                                if 'combined_vector' in s and s.get('combined_vector'):
                                    filtered_students.append(s)
                            
                            if len(filtered_students) == len(cluster_labels):
                                print(f"[METRICS] Retrying with filtered students ({len(filtered_students)})...")
                                ground_truth_labels = create_riasec_ground_truth(filtered_students)
                                if ground_truth_labels is not None and len(ground_truth_labels) == len(cluster_labels):
                                    external_metrics = calculate_external_metrics(cluster_labels, ground_truth_labels)
                                    print(f"[METRICS] ✅ External metrics calculated on retry!")
                                    stats["external_metrics"] = {
                                        "adjusted_rand_index": {
                                            "value": round(external_metrics['adjusted_rand_index'], 4) if external_metrics['adjusted_rand_index'] is not None else None,
                                            "interpretation": "Excellent" if external_metrics['adjusted_rand_index'] and external_metrics['adjusted_rand_index'] > 0.7 else 
                                                             "Good" if external_metrics['adjusted_rand_index'] and external_metrics['adjusted_rand_index'] > 0.5 else
                                                             "Fair" if external_metrics['adjusted_rand_index'] and external_metrics['adjusted_rand_index'] > 0.3 else
                                                             "Poor" if external_metrics['adjusted_rand_index'] is not None else None,
                                            "range": "[-1, 1]",
                                            "description": "Measures similarity between predicted clusters and RIASEC-based ground truth"
                                        },
                                        "normalized_mutual_info": {
                                            "value": round(external_metrics['normalized_mutual_info'], 4) if external_metrics['normalized_mutual_info'] is not None else None,
                                            "interpretation": "Excellent" if external_metrics['normalized_mutual_info'] and external_metrics['normalized_mutual_info'] > 0.7 else
                                                             "Good" if external_metrics['normalized_mutual_info'] and external_metrics['normalized_mutual_info'] > 0.5 else
                                                             "Fair" if external_metrics['normalized_mutual_info'] and external_metrics['normalized_mutual_info'] > 0.3 else
                                                             "Poor" if external_metrics['normalized_mutual_info'] is not None else None,
                                            "range": "[0, 1]",
                                            "description": "Normalized mutual information between predicted and ground truth labels"
                                        },
                                        "fowlkes_mallows_index": {
                                            "value": round(external_metrics['fowlkes_mallows_index'], 4) if external_metrics['fowlkes_mallows_index'] is not None else None,
                                            "interpretation": "Excellent" if external_metrics['fowlkes_mallows_index'] and external_metrics['fowlkes_mallows_index'] > 0.7 else
                                                             "Good" if external_metrics['fowlkes_mallows_index'] and external_metrics['fowlkes_mallows_index'] > 0.5 else
                                                             "Fair" if external_metrics['fowlkes_mallows_index'] and external_metrics['fowlkes_mallows_index'] > 0.3 else
                                                             "Poor" if external_metrics['fowlkes_mallows_index'] is not None else None,
                                            "range": "[0, 1]",
                                            "description": "Geometric mean of precision and recall for cluster pairs"
                                        },
                                        "ground_truth_type": "RIASEC Dominant Dimension"
                                    }
                        except Exception as retry_err:
                            print(f"[METRICS] Retry also failed: {retry_err}")
            except Exception as e:
                print(f"[METRICS] ❌ Error calculating external metrics: {e}")
                import traceback
                traceback.print_exc()
            print(f"[STATS] ========== EXTERNAL METRICS CALCULATION END ==========")
        else:
            print(f"[STATS] ⚠️ Skipping external metrics: cluster_labels={cluster_labels is not None}, len={len(cluster_labels) if cluster_labels is not None else 0}")
        
        # PCA explained variance
        if embedding_reducer.pca_2d is not None:
            try:
                explained_var = embedding_reducer.pca_2d.explained_variance_ratio_
                cumulative_var = np.cumsum(explained_var)
                stats["pca_info"]["explained_variance_ratio"] = [round(float(v), 4) for v in explained_var]
                stats["pca_info"]["cumulative_variance"] = [round(float(v), 4) for v in cumulative_var]
                stats["pca_info"]["n_components"] = len(explained_var)
                stats["pca_info"]["total_variance_explained"] = round(float(cumulative_var[-1]), 4)
            except Exception as e:
                print(f"Could not get PCA variance info: {e}")
        
        # Calculate elbow data for different k values (if we have enough students)
        if student_vectors is not None and len(student_vectors) > 10:
            try:
                from sklearn.cluster import KMeans
                elbow_data = []
                k_range = range(2, min(11, len(student_vectors)))
                for k in k_range:
                    km = KMeans(n_clusters=k, random_state=42, n_init=10)
                    km.fit(student_vectors)
                    elbow_data.append({
                        "k": k,
                        "inertia": float(km.inertia_),
                        "silhouette": float(silhouette_score(student_vectors, km.labels_)) if k > 1 else 0
                    })
                stats["elbow_data"] = elbow_data
            except Exception as e:
                print(f"Could not calculate elbow data: {e}")
                stats["elbow_data"] = None
        
        return stats
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=f"{str(e)}\n{traceback.format_exc()}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)

