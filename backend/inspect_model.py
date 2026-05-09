#!/usr/bin/env python3
"""Inspect the PyTorch model to determine its type and architecture."""

import os
import torch

MODEL_PATH = "best.pt"

def inspect_model():
    print("=" * 70)
    print("MODEL INSPECTION: best.pt")
    print("=" * 70)

    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model file not found: {MODEL_PATH}")
        return

    try:
        # Load model
        print(f"\n📁 Loading model from: {MODEL_PATH}")
        device = torch.device("cpu")
        model = torch.load(MODEL_PATH, map_location=device)

        print(f"✓ Model loaded successfully\n")

        # Check model type
        print(f"📊 Model Type: {type(model)}")
        print(f"Model Class: {model.__class__.__name__}")

        # Print model architecture
        print(f"\n🏗️ Model Architecture:")
        print("-" * 70)
        print(model)
        print("-" * 70)

        # Check if it's YOLO
        model_str = str(model)
        is_yolo = "yolo" in model_str.lower() or "detect" in model_str.lower()

        # Count output neurons/layers
        print(f"\n📈 Model Analysis:")

        # Try to identify model type
        if hasattr(model, 'fc'):
            print(f"  - Has fully connected layer (fc) - likely classifier")

        if hasattr(model, 'classifier'):
            print(f"  - Has classifier module")

        # Try inference with dummy input
        print(f"\n🧪 Testing Inference:")
        dummy_input = torch.randn(1, 3, 224, 224)

        with torch.no_grad():
            output = model(dummy_input)

        print(f"  - Input shape: {dummy_input.shape}")
        print(f"  - Output shape: {output.shape}")
        print(f"  - Output type: {type(output)}")

        # Determine model type based on output
        if isinstance(output, torch.Tensor):
            if len(output.shape) == 2 and output.shape[1] == 6:
                print(f"\n✅ MODEL TYPE: CNN CLASSIFIER (6-class disease classification)")
                print(f"   Output: 6 disease class logits → softmax → probabilities")
            elif len(output.shape) == 4 or (len(output.shape) == 2 and output.shape[1] > 100):
                print(f"\n✅ MODEL TYPE: LIKELY YOLO or OBJECT DETECTOR")
                print(f"   Output has detection/localization format")
            else:
                print(f"\n⚠️ MODEL TYPE: UNCLEAR")
                print(f"   Output shape: {output.shape}")

        # Final diagnosis
        print("\n" + "=" * 70)
        if is_yolo or "detect" in model_str.lower():
            print("❓ VERDICT: This appears to be a YOLO or object detection model")
        else:
            print("✅ VERDICT: This is a CNN CLASSIFIER (NOT YOLO)")
            print("   Purpose: Classify tea leaf images into 6 disease categories")
        print("=" * 70)

    except Exception as e:
        print(f"❌ Error inspecting model: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    inspect_model()
