"""
Initialize data: Create career embeddings and save to JSON.
Run this script once to generate career embeddings.

Usage: python scripts/init_data.py
"""
import json
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.data_loader import DataLoader
from core.embeddings import CareerEmbedder

def main():
    data_loader = DataLoader()
    career_embedder = CareerEmbedder()
    
    # Load careers
    careers = data_loader.load_careers()
    
    # Generate embeddings
    print("Generating embeddings for careers...")
    for career in careers:
        if 'embedding' not in career:
            embedding = career_embedder.embed_career(career)
            career['embedding'] = embedding.tolist()
            print(f"Generated embedding for: {career['title']}")
    
    # Save careers with embeddings
    data_loader.save_careers(careers)
    print(f"\nSaved {len(careers)} careers with embeddings to data/careers.json")
    
    # Generate some synthetic student data for initial clustering
    import numpy as np
    students = []
    np.random.seed(42)
    
    print("\nGenerating synthetic student data for initial clustering...")
    for i in range(50):
        # Generate random profile vectors
        riasec = np.random.rand(6)
        skills = np.random.rand(10)
        subjects = np.random.rand(4)
        combined = np.concatenate([riasec, skills, subjects]).tolist()
        
        students.append({
            'id': f'student_{i+1}',
            'combined_vector': combined
        })
    
    data_loader.save_students(students)
    print(f"Saved {len(students)} synthetic students to data/students.json")
    print("\nData initialization complete!")

if __name__ == "__main__":
    main()

