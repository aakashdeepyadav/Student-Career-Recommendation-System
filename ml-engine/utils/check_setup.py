"""
Check if all required components are set up correctly.
Run this script to verify your setup.
"""

import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def check_file_exists(filepath, description):
    """Check if a file exists."""
    if os.path.exists(filepath):
        print(f"[OK] {description}: {filepath}")
        return True
    else:
        print(f"[FAIL] {description}: {filepath} - NOT FOUND")
        return False

def check_directory_exists(dirpath, description):
    """Check if a directory exists."""
    if os.path.exists(dirpath):
        print(f"[OK] {description}: {dirpath}")
        return True
    else:
        print(f"[FAIL] {description}: {dirpath} - NOT FOUND")
        return False

def main():
    print("=" * 60)
    print("SCRS Setup Verification")
    print("=" * 60)
    print()
    
    all_ok = True
    
    # Check data files
    print("Data Files:")
    all_ok &= check_file_exists("data/careers.json", "Careers dataset")
    all_ok &= check_file_exists("data/students.json", "Students dataset")
    print()
    
    # Check model files
    print("Model Files:")
    all_ok &= check_file_exists("model/kmeans_model.joblib", "KMeans model")
    all_ok &= check_file_exists("model/pca_2d.joblib", "PCA 2D model")
    all_ok &= check_file_exists("model/umap_3d.joblib", "UMAP 3D model")
    print()
    
    # Check Python modules
    print("Python Modules:")
    try:
        import numpy
        print("[OK] numpy")
    except ImportError:
        print("[FAIL] numpy - NOT INSTALLED")
        all_ok = False
    
    try:
        import sklearn
        print("[OK] scikit-learn")
    except ImportError:
        print("[FAIL] scikit-learn - NOT INSTALLED")
        all_ok = False
    
    try:
        import umap
        print("[OK] umap-learn")
    except ImportError:
        print("[FAIL] umap-learn - NOT INSTALLED")
        all_ok = False
    
    try:
        import sentence_transformers
        print("[OK] sentence-transformers")
    except ImportError:
        print("[FAIL] sentence-transformers - NOT INSTALLED")
        all_ok = False
    
    try:
        import fastapi
        print("[OK] fastapi")
    except ImportError:
        print("[FAIL] fastapi - NOT INSTALLED")
        all_ok = False
    
    print()
    print("=" * 60)
    if all_ok:
        print("[OK] All checks passed! Setup is complete.")
        print()
        print("Next steps:")
        print("1. Start ML engine: python app.py")
        print("2. Start API server: cd ../api-server && npm start")
        print("3. Start frontend: cd ../frontend && npm run dev")
    else:
        print("[FAIL] Some checks failed. Please fix the issues above.")
        print()
        print("To fix:")
        print("1. Run: python init_data.py (creates data files)")
        print("2. Run: python train_models.py (trains models)")
        print("3. Install missing packages: pip install -r requirements.txt")
    print("=" * 60)

if __name__ == "__main__":
    main()

