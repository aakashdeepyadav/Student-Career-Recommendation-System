"""
Generate 100 synthetic student profiles for training the clustering model.
Students are generated with realistic distributions across 5 cluster types:
1. Tech/Analytical
2. Creative
3. Business/Leadership
4. Social/People
5. Practical/Realistic

Saves to both JSON (for the app) and CSV (for analysis).

Usage: python generate_students.py
"""

import numpy as np
import pandas as pd
import json
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.data_loader import DataLoader

# Cluster profiles with typical RIASEC patterns
# RIASEC: [Realistic, Investigative, Artistic, Social, Enterprising, Conventional]
CLUSTER_PROFILES = {
    "Tech/Analytical": {
        "riasec_base": [0.25, 0.85, 0.25, 0.30, 0.40, 0.60],  # High I (Investigative)
        "skills_base": [0.90, 0.88, 0.50, 0.35, 0.45, 0.85, 0.82, 0.35, 0.75, 0.55],
        "subjects_base": [0.90, 0.85, 0.25, 0.40],  # High math, science
        "weight": 0.22  # 22% of students
    },
    "Creative": {
        "riasec_base": [0.20, 0.40, 0.90, 0.50, 0.45, 0.30],  # High A (Artistic)
        "skills_base": [0.35, 0.55, 0.70, 0.92, 0.50, 0.45, 0.35, 0.90, 0.60, 0.55],
        "subjects_base": [0.30, 0.35, 0.92, 0.65],  # High arts
        "weight": 0.18  # 18% of students
    },
    "Business/Leadership": {
        "riasec_base": [0.30, 0.50, 0.35, 0.55, 0.88, 0.75],  # High E, C
        "skills_base": [0.45, 0.70, 0.85, 0.55, 0.90, 0.72, 0.60, 0.45, 0.55, 0.80],
        "subjects_base": [0.65, 0.50, 0.40, 0.75],  # Balanced with language
        "weight": 0.22  # 22% of students
    },
    "Social/People": {
        "riasec_base": [0.20, 0.45, 0.50, 0.90, 0.50, 0.50],  # High S (Social)
        "skills_base": [0.30, 0.50, 0.92, 0.60, 0.70, 0.40, 0.35, 0.50, 0.55, 0.90],
        "subjects_base": [0.40, 0.50, 0.70, 0.85],  # High arts, languages
        "weight": 0.20  # 20% of students
    },
    "Practical/Realistic": {
        "riasec_base": [0.90, 0.65, 0.25, 0.30, 0.45, 0.60],  # High R (Realistic)
        "skills_base": [0.70, 0.85, 0.50, 0.35, 0.55, 0.75, 0.85, 0.35, 0.55, 0.60],
        "subjects_base": [0.85, 0.80, 0.25, 0.40],  # High math, science
        "weight": 0.18  # 18% of students
    }
}

# Skill names
SKILL_NAMES = ['programming', 'problem_solving', 'communication', 'creativity', 
               'leadership', 'analytical', 'mathematics', 'design', 'research', 'teamwork']

# Subject names
SUBJECT_NAMES = ['mathematics', 'science', 'arts', 'languages']

# RIASEC names
RIASEC_NAMES = ['R', 'I', 'A', 'S', 'E', 'C']

def add_noise(arr, noise_level=0.12, cluster_strength=0.7):
    """
    Add Gaussian noise to array with cluster strength control.
    Higher cluster_strength keeps values closer to cluster center.
    """
    noise = np.random.normal(0, noise_level * (1 - cluster_strength), size=len(arr))
    result = np.clip(np.array(arr) + noise, 0.05, 0.98)
    return result.tolist()

def generate_student(student_id, cluster_name, cluster_profile, noise_level=0.12, cluster_strength=0.7):
    """
    Generate a single student profile for a given cluster.
    cluster_strength: 0.0-1.0, higher = more distinct clusters (default: 0.7)
    """
    # Add noise to base profiles with cluster strength
    riasec = add_noise(cluster_profile["riasec_base"], noise_level=noise_level, cluster_strength=cluster_strength)
    skills = add_noise(cluster_profile["skills_base"], noise_level=noise_level, cluster_strength=cluster_strength)
    subjects = add_noise(cluster_profile["subjects_base"], noise_level=noise_level, cluster_strength=cluster_strength)
    
    # Combine into 20D vector
    combined_vector = riasec + skills + subjects
    
    # Create RIASEC profile dictionary
    riasec_profile = {name: round(riasec[i], 4) for i, name in enumerate(RIASEC_NAMES)}
    
    # Create skills dictionary
    skills_dict = {name: round(skills[i], 4) for i, name in enumerate(SKILL_NAMES)}
    
    # Create subjects dictionary
    subjects_dict = {name: round(subjects[i], 4) for i, name in enumerate(SUBJECT_NAMES)}
    
    return {
        'id': student_id,
        'cluster_hint': cluster_name,
        'riasec_profile': riasec_profile,
        'skills': skills_dict,
        'subjects': subjects_dict,
        'combined_vector': [round(v, 4) for v in combined_vector]
    }

def generate_students(n_students=100, cluster_strength=0.75):
    """
    Generate n synthetic students distributed across clusters based on weights.
    cluster_strength: 0.0-1.0, higher = more distinct clusters (default: 0.75 for better separation)
    """
    students = []
    cluster_names = list(CLUSTER_PROFILES.keys())
    
    # Calculate students per cluster based on weights
    weights = [CLUSTER_PROFILES[name]["weight"] for name in cluster_names]
    counts = np.random.multinomial(n_students, weights)
    
    student_id = 1
    for cluster_name, count in zip(cluster_names, counts):
        cluster_profile = CLUSTER_PROFILES[cluster_name]
        
        for _ in range(count):
            # Vary noise level and cluster strength for more natural but distinct distribution
            noise = np.random.uniform(0.08, 0.12)  # Reduced noise for better separation
            strength = np.random.uniform(cluster_strength - 0.05, cluster_strength + 0.05)
            strength = np.clip(strength, 0.6, 0.9)  # Keep within reasonable bounds
            student = generate_student(f"student_{student_id}", cluster_name, cluster_profile, noise, strength)
            students.append(student)
            student_id += 1
    
    # Shuffle to mix clusters
    np.random.shuffle(students)
    
    # Re-assign sequential IDs after shuffling
    for i, student in enumerate(students):
        student['id'] = f"student_{i+1}"
    
    return students

def students_to_dataframe(students):
    """Convert students list to a pandas DataFrame for CSV export."""
    rows = []
    for student in students:
        row = {
            'id': student['id'],
            'cluster_hint': student['cluster_hint'],
        }
        # Add RIASEC scores
        for name in RIASEC_NAMES:
            row[f'riasec_{name}'] = student['riasec_profile'][name]
        # Add skills
        for name in SKILL_NAMES:
            row[f'skill_{name}'] = student['skills'][name]
        # Add subjects
        for name in SUBJECT_NAMES:
            row[f'subject_{name}'] = student['subjects'][name]
        
        rows.append(row)
    
    return pd.DataFrame(rows)

def main():
    np.random.seed(42)  # For reproducibility
    
    print("=" * 70)
    print("  Generating 100 Synthetic Student Profiles for Clustering")
    print("  Using reduced cluster separation (cluster_strength=0.58) to show algorithm differences")
    print("=" * 70)
    
    # Generate with reduced cluster separation to allow algorithm differences to show
    # Lower separation = more overlap = random init may find different solutions
    students = generate_students(100, cluster_strength=0.58)
    
    # Print summary
    print(f"\nGenerated {len(students)} students:")
    cluster_counts = {}
    for student in students:
        cluster = student['cluster_hint']
        cluster_counts[cluster] = cluster_counts.get(cluster, 0) + 1
    
    print("\n  Cluster Distribution:")
    print("  " + "-" * 40)
    for cluster, count in sorted(cluster_counts.items(), key=lambda x: -x[1]):
        pct = count / len(students) * 100
        bar = "#" * int(pct / 2)
        print(f"  {cluster:20s} | {count:3d} ({pct:5.1f}%) {bar}")
    
    # Save to JSON (for the application)
    data_loader = DataLoader()
    data_loader.save_students(students)
    print(f"\n[OK] Saved {len(students)} students to data/students.json")
    
    # Save to CSV (for analysis)
    df = students_to_dataframe(students)
    csv_path = os.path.join("data", "students.csv")
    df.to_csv(csv_path, index=False)
    print(f"[OK] Saved {len(students)} students to data/students.csv")
    
    # Print CSV column info
    print(f"\n  CSV Columns ({len(df.columns)} total):")
    print(f"  - id, cluster_hint")
    print(f"  - riasec_R, riasec_I, riasec_A, riasec_S, riasec_E, riasec_C")
    print(f"  - skill_programming, skill_problem_solving, ... ({len(SKILL_NAMES)} skills)")
    print(f"  - subject_mathematics, subject_science, ... ({len(SUBJECT_NAMES)} subjects)")
    
    # Print sample statistics
    print("\n" + "-" * 70)
    print("  Sample Statistics (from CSV):")
    print("-" * 70)
    
    # RIASEC summary by cluster
    riasec_cols = [f'riasec_{name}' for name in RIASEC_NAMES]
    print("\n  Average RIASEC scores by cluster:")
    print("  " + "-" * 60)
    print(f"  {'Cluster':20s} |  R     I     A     S     E     C")
    print("  " + "-" * 60)
    for cluster in sorted(cluster_counts.keys()):
        cluster_df = df[df['cluster_hint'] == cluster]
        means = cluster_df[riasec_cols].mean()
        print(f"  {cluster:20s} | {means['riasec_R']:.2f}  {means['riasec_I']:.2f}  {means['riasec_A']:.2f}  {means['riasec_S']:.2f}  {means['riasec_E']:.2f}  {means['riasec_C']:.2f}")
    
    # Overall statistics
    print("\n  Overall Feature Statistics:")
    print("  " + "-" * 60)
    print(f"  {'Feature Type':15s} | {'Mean':>8s} | {'Std':>8s} | {'Min':>8s} | {'Max':>8s}")
    print("  " + "-" * 60)
    
    riasec_stats = df[riasec_cols].values.flatten()
    skill_cols = [f'skill_{name}' for name in SKILL_NAMES]
    skill_stats = df[skill_cols].values.flatten()
    subject_cols = [f'subject_{name}' for name in SUBJECT_NAMES]
    subject_stats = df[subject_cols].values.flatten()
    
    for name, stats in [('RIASEC', riasec_stats), ('Skills', skill_stats), ('Subjects', subject_stats)]:
        print(f"  {name:15s} | {np.mean(stats):8.3f} | {np.std(stats):8.3f} | {np.min(stats):8.3f} | {np.max(stats):8.3f}")
    
    print("\n" + "=" * 70)
    print("  Next Steps:")
    print("  1. Run 'python train_models.py' to retrain clustering model")
    print("  2. Start the servers and check Model Statistics in the UI")
    print("  3. View data/students.csv in Excel or any spreadsheet app")
    print("=" * 70)

if __name__ == "__main__":
    main()
