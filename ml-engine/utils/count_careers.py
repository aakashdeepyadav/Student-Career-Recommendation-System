"""
Utility script to count and list all careers in the system.
Usage: python utils/count_careers.py
"""
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from core.data_loader import DataLoader

loader = DataLoader()
careers = loader.load_careers()

print(f"\n{'='*60}")
print(f"Total Careers in System: {len(careers)}")
print(f"{'='*60}\n")

print("Career List:")
print("-" * 60)
for i, career in enumerate(careers, 1):
    print(f"{i:2d}. {career['title']:30s} | Domain: {career.get('domain', 'N/A'):20s} | Salary: {career.get('salary_range', 'N/A')}")

print(f"\n{'='*60}")
print(f"Total: {len(careers)} careers")
print(f"{'='*60}\n")
