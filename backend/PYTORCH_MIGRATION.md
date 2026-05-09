# PyTorch Model Migration - Complete

## Overview
Successfully migrated the backend from TensorFlow/Keras to PyTorch for the tea leaf disease detection model.

## Files Updated

### 1. `requirements.txt`
**Changed from:**
```
tensorflow>=2.15.0
keras>=2.15.0
```

**Changed to:**
```
torch>=2.0.0
torchvision>=0.15.0
```

### 2. `app/config.py` (Line 12)
**Model path default:**
```python
MODEL_PATH = _model_path if _model_path and os.path.exists(_model_path) else "best.pt"
```

### 3. `app/services/model_service.py` (Complete Rewrite)
**Key Changes:**
- Replaced TensorFlow/Keras imports with PyTorch
- Model loading: `torch.load(MODEL_PATH, map_location=device)`
- Device detection: GPU if available, otherwise CPU
- Model evaluation mode: `cls.model.eval()`
- Image preprocessing: Returns `torch.Tensor` instead of numpy array
- Tensor shape handling:
  - Input from PIL: (H, W, C) format
  - Transpose to PyTorch: (C, H, W) format using `permute(2, 0, 1)`
  - Add batch dimension: (1, C, H, W) using `unsqueeze(0)`
- Inference: Wrapped in `torch.no_grad()` context
- Probability computation: `torch.softmax(predictions, dim=1)`
- Return dict includes `"device"` and `"model": "PyTorch-CNN"`

### 4. `app/main.py` (Startup Logging)
**Updated from TensorFlow logging to PyTorch:**
```python
import torch
logger.info(f"CUDA available: {torch.cuda.is_available()}")
logger.info(f"Device: {torch.device('cuda' if torch.cuda.is_available() else 'cpu')}")
```

## Model File
- **Location:** `backend/best.pt`
- **Format:** PyTorch model (.pt file)
- **Input:** 224x224 RGB image tensor
- **Output:** 6-class logits (softmax applied in model_service)

## Testing

### Quick Test
Run the test script to verify model loads:
```bash
cd backend
python test_model.py
```

Expected output:
```
Testing model load from: best.pt
Using device: cpu
✓ Model loaded successfully
✓ Model set to evaluation mode
✓ Inference test passed
  Output shape: torch.Size([1, 6])
✓ Softmax computed
  Probabilities shape: torch.Size([1, 6])
  Sum of probabilities: 1.0000 (should be ~1.0)
```

### Full Backend Test
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the backend:
   ```bash
   uvicorn main:app --reload --port 8001
   # or: python main.py
   ```

3. Check logs for:
   - "PyTorch backend" message
   - "CUDA available: True/False"
   - "Model loaded successfully"

4. Test the `/predict` endpoint with an image file

## API Compatibility
- All API endpoints remain unchanged
- The `/predict` and `/predict-and-save` endpoints automatically use PyTorch model
- Response format is identical to TensorFlow version

## Performance Notes
- **GPU Support:** Automatically detects and uses CUDA if available
- **CPU Fallback:** Seamlessly falls back to CPU if CUDA not available
- **Memory:** PyTorch models typically require less memory than TensorFlow

## Troubleshooting

### Model Load Fails
- Verify `best.pt` exists in backend directory
- Check file is a valid PyTorch model (created with `torch.save()`)
- Check file permissions

### CUDA Errors
- If CUDA not available, model automatically uses CPU
- Check `torch.cuda.is_available()` returns True if GPU support expected

### Inference Errors
- Verify image is valid (check console logs for "Image preprocessed" message)
- Check tensor shape in logs (should be `torch.Size([1, 3, 224, 224])`)
