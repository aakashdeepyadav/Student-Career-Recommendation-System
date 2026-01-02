"""
Profile Processor
Combines RIASEC, skills, and preferences into a unified profile vector.
"""

import numpy as np
from typing import Dict, List
from .riasec_scorer import RIASECScorer


class ProfileProcessor:
    """
    Processes user questionnaire responses into a unified profile vector.
    """
    
    def __init__(self):
        self.riasec_scorer = RIASECScorer()
        self.skill_dimensions = 10
        self.subject_dimensions = 4
    
    def process_profile(
        self,
        riasec_responses: Dict[str, int],
        skill_responses: Dict[str, int],
        subject_preferences: Dict[str, int]
    ) -> Dict:
        """
        Process user responses into a complete profile.
        
        Args:
            riasec_responses: RIASEC questionnaire responses
            skill_responses: Skill assessment responses
            subject_preferences: Subject preference responses
        
        Returns:
            Dictionary with profile data including vector
        """
        # Compute RIASEC profile
        riasec_profile = self.riasec_scorer.compute_profile(riasec_responses)
        riasec_vector = self.riasec_scorer.get_vector(riasec_responses)
        
        # Process skills (normalize to 0-1)
        skill_vector = self._process_skills(skill_responses)
        
        # Process subject preferences
        subject_vector = self._process_subjects(subject_preferences)
        
        # Combine into unified vector
        combined_vector = np.concatenate([
            riasec_vector,      # 6D
            skill_vector,       # 10D
            subject_vector      # 4D
        ])  # Total: 20D
        
        return {
            'riasec_profile': riasec_profile,
            'riasec_vector': riasec_vector.tolist(),
            'skill_vector': skill_vector.tolist(),
            'subject_vector': subject_vector.tolist(),
            'combined_vector': combined_vector.tolist(),
            'skills': skill_responses
        }
    
    def _process_skills(self, skill_responses: Dict[str, int]) -> np.ndarray:
        """Process skill responses into vector."""
        # Map skills to dimensions
        skill_mapping = {
            'programming': 0, 'problem_solving': 1, 'communication': 2,
            'creativity': 3, 'leadership': 4, 'analytical': 5,
            'mathematics': 6, 'design': 7, 'research': 8, 'teamwork': 9
        }
        
        vector = np.zeros(self.skill_dimensions)
        counts = np.zeros(self.skill_dimensions)
        
        for skill, response in skill_responses.items():
            if skill in skill_mapping:
                idx = skill_mapping[skill]
                normalized = (response - 1) / 4.0  # 1-5 scale to 0-1
                vector[idx] += normalized
                counts[idx] += 1
        
        # Average
        for i in range(self.skill_dimensions):
            if counts[i] > 0:
                vector[i] = vector[i] / counts[i]
        
        return vector
    
    def _process_subjects(self, subject_preferences: Dict[str, int]) -> np.ndarray:
        """Process subject preferences into vector."""
        # Map subjects to dimensions
        subject_mapping = {
            'stem': 0, 'arts': 1, 'business': 2, 'social_sciences': 3
        }
        
        vector = np.zeros(self.subject_dimensions)
        counts = np.zeros(self.subject_dimensions)
        
        for subject, response in subject_preferences.items():
            if subject in subject_mapping:
                idx = subject_mapping[subject]
                normalized = (response - 1) / 4.0
                vector[idx] += normalized
                counts[idx] += 1
        
        # Average
        for i in range(self.subject_dimensions):
            if counts[i] > 0:
                vector[i] = vector[i] / counts[i]
        
        return vector

