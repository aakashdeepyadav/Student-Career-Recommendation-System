"""
RIASEC Profile Scorer
Computes 6-dimensional RIASEC profile from questionnaire responses.
"""

import numpy as np
from typing import List, Dict


class RIASECScorer:
    """
    RIASEC Model:
    R - Realistic (practical, hands-on)
    I - Investigative (analytical, scientific)
    A - Artistic (creative, expressive)
    S - Social (helping, teaching)
    E - Enterprising (leading, persuading)
    C - Conventional (organized, detail-oriented)
    """
    
    # Question mapping: question_id -> RIASEC dimension
    RIASEC_MAPPING = {
        # Realistic (R) - 8 questions
        'r1': 'R', 'r2': 'R', 'r3': 'R', 'r4': 'R', 'r5': 'R', 'r6': 'R', 'r7': 'R', 'r8': 'R',
        # Investigative (I) - 8 questions
        'i1': 'I', 'i2': 'I', 'i3': 'I', 'i4': 'I', 'i5': 'I', 'i6': 'I', 'i7': 'I', 'i8': 'I',
        # Artistic (A) - 8 questions
        'a1': 'A', 'a2': 'A', 'a3': 'A', 'a4': 'A', 'a5': 'A', 'a6': 'A', 'a7': 'A', 'a8': 'A',
        # Social (S) - 8 questions
        's1': 'S', 's2': 'S', 's3': 'S', 's4': 'S', 's5': 'S', 's6': 'S', 's7': 'S', 's8': 'S',
        # Enterprising (E) - 8 questions
        'e1': 'E', 'e2': 'E', 'e3': 'E', 'e4': 'E', 'e5': 'E', 'e6': 'E', 'e7': 'E', 'e8': 'E',
        # Conventional (C) - 8 questions
        'c1': 'C', 'c2': 'C', 'c3': 'C', 'c4': 'C', 'c5': 'C', 'c6': 'C', 'c7': 'C', 'c8': 'C',
    }
    
    def __init__(self):
        self.dimensions = ['R', 'I', 'A', 'S', 'E', 'C']
    
    def compute_profile(self, responses: Dict[str, int]) -> Dict[str, float]:
        """
        Compute RIASEC profile from questionnaire responses.
        
        Args:
            responses: Dictionary mapping question_id to response (1-5 scale)
        
        Returns:
            Dictionary with RIASEC scores (0-1 normalized)
        """
        scores = {dim: 0.0 for dim in self.dimensions}
        counts = {dim: 0 for dim in self.dimensions}
        
        for question_id, response in responses.items():
            if question_id in self.RIASEC_MAPPING:
                dimension = self.RIASEC_MAPPING[question_id]
                # Normalize response (1-5) to (0-1)
                normalized = (response - 1) / 4.0
                scores[dimension] += normalized
                counts[dimension] += 1
        
        # Average scores per dimension
        for dim in self.dimensions:
            if counts[dim] > 0:
                scores[dim] = scores[dim] / counts[dim]
            else:
                scores[dim] = 0.0
        
        return scores
    
    def get_vector(self, responses: Dict[str, int]) -> np.ndarray:
        """
        Get RIASEC vector as numpy array.
        
        Args:
            responses: Dictionary mapping question_id to response
        
        Returns:
            6D numpy array [R, I, A, S, E, C]
        """
        profile = self.compute_profile(responses)
        return np.array([profile[dim] for dim in self.dimensions])


if __name__ == "__main__":
    # Test
    scorer = RIASECScorer()
    test_responses = {
        'r1': 4, 'r2': 5, 'r3': 3, 'r4': 4,
        'i1': 5, 'i2': 5, 'i3': 4, 'i4': 5,
        'a1': 2, 'a2': 2, 'a3': 3, 'a4': 2,
        's1': 3, 's2': 3, 's3': 2, 's4': 3,
        'e1': 2, 'e2': 2, 'e3': 1, 'e4': 2,
        'c1': 3, 'c2': 3, 'c3': 4, 'c3': 3,
    }
    profile = scorer.compute_profile(test_responses)
    print("RIASEC Profile:", profile)
    vector = scorer.get_vector(test_responses)
    print("RIASEC Vector:", vector)

