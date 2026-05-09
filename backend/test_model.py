#!/usr/bin/env python3
"""Quick test to verify PyTorch model loads successfully."""

import os
import torch
from app.config import MODEL_PATH

def test_model_load():
    print(f"Testing model load from: {MODEL_PATH}")

    if not os.path.exists(MODEL_PATH):
        print(f"ERROR: Model file not found at {MODEL_PATH}")
        return False

    try:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {device}")

        model = torch.load(MODEL_PATH, map_location=device)
        print(f"✓ Model loaded successfully")

        model.eval()
        print(f"✓ Model set to evaluation mode")

        # Test with dummy input
        dummy_input = torch.randn(1, 3, 224, 224).to(device)
        with torch.no_grad():
            output = model(dummy_input)

        print(f"✓ Inference test passed")
        print(f"  Output shape: {output.shape}")

        # Check softmax
        probabilities = torch.softmax(output, dim=1)
        print(f"✓ Softmax computed")
        print(f"  Probabilities shape: {probabilities.shape}")
        print(f"  Sum of probabilities: {probabilities.sum().item():.4f} (should be ~1.0)")

        return True

    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_model_load()
    exit(0 if success else 1)
