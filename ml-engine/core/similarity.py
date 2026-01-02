"""
Similarity Module
Computes cosine similarity between user and career vectors.
"""

import numpy as np
from typing import List, Dict, Tuple
from sklearn.metrics.pairwise import cosine_similarity


class SimilarityEngine:
    """
    Computes similarity scores between user profiles and careers.
    """
    
    def __init__(self):
        pass
    
    def compute_similarity(self, user_vector: np.ndarray, career_vector: np.ndarray) -> float:
        """
        Compute cosine similarity between user and career vectors.
        
        Args:
            user_vector: User profile vector (1D array)
            career_vector: Career embedding vector (1D array)
        
        Returns:
            Similarity score (0-1)
        """
        # Ensure vectors are 2D for sklearn
        user_2d = user_vector.reshape(1, -1)
        career_2d = career_vector.reshape(1, -1)
        
        # Handle dimension mismatch by padding or truncating
        min_dim = min(user_vector.shape[0], career_vector.shape[0])
        user_trimmed = user_vector[:min_dim].reshape(1, -1)
        career_trimmed = career_vector[:min_dim].reshape(1, -1)
        
        similarity = cosine_similarity(user_trimmed, career_trimmed)[0][0]
        return float(similarity)
    
    def recommend_careers(
        self,
        user_vector: np.ndarray,
        careers: List[Dict],
        top_k: int = 5
    ) -> List[Dict]:
        """
        Recommend top-k careers based on similarity.
        
        Args:
            user_vector: User profile vector
            careers: List of career dictionaries with 'embedding' key
            top_k: Number of recommendations
        
        Returns:
            List of career dictionaries with 'similarity_score' added
        """
        recommendations = []
        
        for career in careers:
            career_vector = np.array(career.get('embedding', []))
            if len(career_vector) == 0:
                continue
            
            similarity = self.compute_similarity(user_vector, career_vector)
            
            career_copy = career.copy()
            career_copy['similarity_score'] = similarity
            recommendations.append(career_copy)
        
        # Sort by similarity (descending)
        recommendations.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return recommendations[:top_k]
    
    def compute_skill_gap(
        self,
        user_skills: Dict[str, float],
        required_skills: Dict[str, float]
    ) -> Dict[str, float]:
        """
        Compute skill gap between user and required skills.
        
        Args:
            user_skills: Dictionary of user skill levels (0-1 scale)
            required_skills: Dictionary mapping skill names to required levels (0-1 scale)
        
        Returns:
            Dictionary of skill gaps (positive = need improvement, normalized 0-1)
            Keys are the original skill names from required_skills for display
        """
        gaps = {}
        
        # Validate inputs
        if not user_skills or len(user_skills) == 0:
            print(f"  [GAP_CALC ERROR] user_skills is empty! Cannot calculate gaps.")
            return {}
        
        # Comprehensive skill name mapping for matching career skills to user skills
        skill_name_mapping = {
            'programming': ['programming', 'coding', 'python', 'java', 'javascript', 'software development', 'development'],
            'problem_solving': ['problem_solving', 'problem solving', 'algorithms', 'data structures', 'logical thinking', 'critical thinking'],
            'communication': ['communication', 'writing', 'verbal communication', 'presentation', 'interpersonal', 'people skills', 'patience', 'teaching', 'subject knowledge', 'people'],
            'creativity': ['creativity', 'creative', 'innovation', 'creative thinking', 'content creation', 'content'],
            'leadership': ['leadership', 'management', 'team management', 'organization', 'organizational', 'strategy', 'strategic', 'organizing'],
            'analytical': ['analytical', 'analytical thinking', 'data analysis', 'machine learning', 'analytics', 'statistical analysis', 'marketing', 'market'],
            'mathematics': ['mathematics', 'math', 'statistics', 'quantitative'],
            'design': ['design', 'prototyping', 'ui/ux', 'user experience', 'ux'],
            'research': ['research', 'user research', 'data research', 'psychology', 'empathy', 'psychological'],
            'teamwork': ['teamwork', 'team work', 'collaboration', 'working in teams', 'collaborative']
        }
        
        # Reverse mapping: from career skill name to user skill key
        def find_user_skill_key(career_skill_name):
            """Find the matching user skill key for a career skill name."""
            normalized = career_skill_name.lower().strip().replace(' ', '_').replace('-', '_').replace('/', '_')
            
            # Direct match first
            if normalized in user_skills:
                return normalized
            
            # Check mapping - look for exact matches in variations
            for user_key, variations in skill_name_mapping.items():
                # Check if normalized name matches any variation exactly
                for variation in variations:
                    var_normalized = variation.lower().replace(' ', '_').replace('-', '_').replace('/', '_')
                    if normalized == var_normalized:
                        if user_key in user_skills:
                            return user_key
                
                # Check if normalized name contains or is contained in any variation
                for variation in variations:
                    var_normalized = variation.lower().replace(' ', '_').replace('-', '_').replace('/', '_')
                    if normalized in var_normalized or var_normalized in normalized:
                        if user_key in user_skills:
                            return user_key
                
                # Check if any variation word is in the normalized name
                normalized_words = normalized.split('_')
                for variation in variations:
                    var_words = variation.lower().split()
                    if any(word in normalized for word in var_words) or any(word in variation.lower() for word in normalized_words):
                        if user_key in user_skills:
                            return user_key
            
            # Try partial match with user skill keys
            for user_key in user_skills.keys():
                if normalized in user_key or user_key in normalized:
                    return user_key
            
            return None
        
        # Compute gaps for each required skill
        print(f"  [GAP_CALC] Computing gaps for {len(required_skills)} required skills")
        for skill_name, required_level in required_skills.items():
            user_skill_key = find_user_skill_key(skill_name)
            
            if user_skill_key and user_skill_key in user_skills:
                user_level = user_skills[user_skill_key]
                # Calculate gap (required - user, clamped to 0-1)
                gap = max(0.0, min(1.0, required_level - user_level))
                
                print(f"  [GAP_CALC] {skill_name} -> {user_skill_key}: required={required_level:.2f}, user={user_level:.2f}, gap={gap:.2f}")
                
                # Only include skills with significant gaps (> 0.1 = 10%)
                if gap > 0.1:
                    gaps[skill_name] = round(gap, 2)  # Round to 2 decimal places
                    print(f"  [GAP_CALC]   ✓ Added gap: {skill_name} = {gap:.2f}")
                else:
                    print(f"  [GAP_CALC]   ✗ Skipped (gap {gap:.2f} <= 0.1)")
            else:
                if user_skill_key:
                    print(f"  [GAP_CALC] {skill_name} -> {user_skill_key}: NOT FOUND in user_skills")
                else:
                    print(f"  [GAP_CALC] {skill_name}: Could not map to user skill key")
            # If skill doesn't map to user skills, don't show it (not assessed)
        
        print(f"  [GAP_CALC] Final gaps: {gaps}")
        return gaps
