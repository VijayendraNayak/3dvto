import os
import shutil
import subprocess
from PIL import Image

# Define paths inside VITON-HD structure
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PROJECT_DIR = os.path.join(BASE_DIR, "..", "VITON-HD")
TEST_DIR = os.path.join(PROJECT_DIR, "test")
DATA_DIR = os.path.join(TEST_DIR, "test_pairs")

os.makedirs(DATA_DIR, exist_ok=True)

def run_viton_pipeline(person_img_path, cloth_img_path):
    # Prepare file names
    person_img = os.path.basename(person_img_path)
    cloth_img = os.path.basename(cloth_img_path)

    person_dest = os.path.join(DATA_DIR, "image", person_img)
    cloth_dest = os.path.join(DATA_DIR, "cloth", cloth_img)

    os.makedirs(os.path.dirname(person_dest), exist_ok=True)
    os.makedirs(os.path.dirname(cloth_dest), exist_ok=True)

    # Copy images to VITON-HD expected folders
    shutil.copy(person_img_path, person_dest)
    shutil.copy(cloth_img_path, cloth_dest)

    # Create test_pairs.txt
    with open(os.path.join(TEST_DIR, "test_pairs.txt"), "w") as f:
        f.write(f"{person_img} {cloth_img}\n")

    # Run inference
    subprocess.run([
        "python", "test.py",
        "--name", "viton_hd",
        "--datasetting", "test",
        "--data_list", "test_pairs.txt",
        "--stage", "GMM"
    ], cwd=PROJECT_DIR)

    subprocess.run([
        "python", "test.py",
        "--name", "viton_hd",
        "--datasetting", "test",
        "--data_list", "test_pairs.txt",
        "--stage", "TOM"
    ], cwd=PROJECT_DIR)

    # Path to result
    result_path = os.path.join(PROJECT_DIR, "results", "viton_hd", "try-on", person_img)
    if not os.path.exists(result_path):
        raise FileNotFoundError("Try-on image not generated")

    return result_path
