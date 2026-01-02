"""
Test script to verify skill gap calculation is working correctly.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from similarity import SimilarityEngine

# Test case 1: User with varying skill levels
user_skills_test = {
    'programming': 0.5,      # 3/5 rating = 0.5 normalized
    'problem_solving': 0.75,  # 4/5 rating = 0.75 normalized
    'communication': 0.25,   # 2/5 rating = 0.25 normalized
    'creativity': 0.0,       # 1/5 rating = 0.0 normalized
    'leadership': 0.5,        # 3/5 rating = 0.5 normalized
    'analytical': 0.75,      # 4/5 rating = 0.75 normalized
    'mathematics': 0.5,      # 3/5 rating = 0.5 normalized
    'design': 0.25,          # 2/5 rating = 0.25 normalized
    'research': 0.5,         # 3/5 rating = 0.5 normalized
    'teamwork': 0.75         # 4/5 rating = 0.75 normalized
}

# Test required skills for a career
required_skills_test = {
    'Communication': 0.8,
    'Patience': 0.8,
    'Teaching': 0.8,
    'Subject Knowledge': 0.8
}

engine = SimilarityEngine()
gaps = engine.compute_skill_gap(user_skills_test, required_skills_test)

print("\n" + "="*60)
print("Skill Gap Calculation Test")
print("="*60)
print(f"\nUser Skills (0-1 scale):")
for skill, level in user_skills_test.items():
    print(f"  {skill}: {level:.2f}")

print(f"\nRequired Skills (0-1 scale):")
for skill, level in required_skills_test.items():
    print(f"  {skill}: {level:.2f}")

print(f"\nCalculated Gaps:")
if gaps:
    for skill, gap in gaps.items():
        print(f"  {skill}: {gap:.2f} ({gap*100:.0f}% gap)")
else:
    print("  No gaps calculated (empty result)")

print("\n" + "="*60)
print("Expected Results:")
print("  Communication: Should map to 'communication' (0.25)")
print("    Gap = 0.8 - 0.25 = 0.55 (55%)")
print("  Patience: Should map to 'communication' (0.25)")
print("    Gap = 0.8 - 0.25 = 0.55 (55%)")
print("  Teaching: Should map to 'communication' (0.25)")
print("    Gap = 0.8 - 0.25 = 0.55 (55%)")
print("  Subject Knowledge: Should map to 'communication' (0.25)")
print("    Gap = 0.8 - 0.25 = 0.55 (55%)")
print("="*60 + "\n")

