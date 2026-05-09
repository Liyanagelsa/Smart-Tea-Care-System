# YOLOv8 Model Integration - Complete

## Overview
Successfully integrated the YOLOv8 detection model (best.pt) with the backend. The model detects and localizes tea leaf diseases with bounding boxes.

## What Changed

### 1. `requirements.txt`
Added Ultralytics library:
```
ultralytics>=8.0.0
```

### 2. `app/services/model_service.py` (Complete Rewrite)
**Changed from:** PyTorch CNN classifier to **YOLOv8 object detector**

**Key Changes:**
- Uses `YOLO(MODEL_PATH)` from Ultralytics to load the model
- `model.predict(source=img_array)` returns detection results
- Parses YOLO bounding boxes and confidence scores
- Handles multiple detections in a single image
- Returns bounding boxes with coordinates (x1, y1, x2, y2)
- Calculates normalized probabilities across all disease classes

**New Response Format:**
```json
{
  "disease": "Brown Blight",
  "confidence": 87.5,
  "severity": {
    "level": "Severe",
    "score": 3
  },
  "treatment": "Apply fungicide...",
  "detections": [
    {
      "class_id": 1,
      "class_name": "Brown Blight",
      "confidence": 87.5,
      "bbox": {
        "x1": 150.2,
        "y1": 100.5,
        "x2": 400.8,
        "y2": 350.3
      }
    }
  ],
  "all_probabilities": {
    "Algal Leaf Spot": 2.3,
    "Brown Blight": 87.5,
    ...
  },
  "model": "YOLOv8"
}
```

### 3. `app/main.py` (Startup Logging)
Updated logging to show "YOLOv8 backend" instead of PyTorch

## Model Details

- **Type:** YOLOv8 Object Detection
- **Input:** RGB image (any size, auto-resized by YOLO)
- **Output:** Bounding boxes + class labels + confidence scores
- **Classes:** 6 disease types
- **Features:**
  - Detects multiple disease instances per image
  - Provides precise bounding box coordinates
  - Confidence threshold: 0.25 (configurable)

## Key Features

### Multiple Detections
If an image has multiple disease areas, all are detected:
```json
"detections": [
  { "class_name": "Brown Blight", "confidence": 92.3, "bbox": {...} },
  { "class_name": "Red Leaf Spot", "confidence": 78.5, "bbox": {...} }
]
```

### No Detections Handling
If no diseases detected, model returns:
```json
{
  "disease": "Healthy",
  "confidence": 100.0,
  "detections": [],
  "severity": { "level": "None", "score": 0 }
}
```

### Bounding Box Format
Each detection includes pixel coordinates:
```python
"bbox": {
  "x1": 150.2,  # Top-left X
  "y1": 100.5,  # Top-left Y
  "x2": 400.8,  # Bottom-right X
  "y2": 350.3   # Bottom-right Y
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Start Backend
```bash
uvicorn main:app --reload --port 8001
```

### 3. Check Logs
Look for:
```
YOLOv8 backend
Model loaded successfully
Disease classes: [...]
```

## API Changes

### `/predict` Endpoint
**Request:** Image file (same as before)

**Response:** Now includes bounding box detections
```json
{
  "disease": "Brown Blight",
  "confidence": 87.5,
  "detections": [...],  // NEW: bounding boxes
  "model": "YOLOv8"     // CHANGED from "PyTorch-CNN"
}
```

### `/predict-and-save` Endpoint
Saves detection results to database with bounding box information.

## Frontend Compatibility

The response format changed - **frontend needs updates to:**
1. Display bounding boxes on the image
2. Show multiple detections if present
3. Handle "detections" array in response

Frontend can visualize boxes:
```javascript
detections.forEach(det => {
  const { x1, y1, x2, y2 } = det.bbox;
  // Draw rectangle from (x1, y1) to (x2, y2) on image canvas
});
```

## Testing

### Test with Frontend
1. Start backend: `uvicorn main:app --reload --port 8001`
2. Start frontend: `npm run dev`
3. Go to `/detect`
4. Upload an image with disease symptoms
5. Check response includes bounding boxes

### Test with cURL
```bash
curl -X POST "http://localhost:8001/predict" \
  -F "file=@tea_leaf.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Model Won't Load
```
ERROR: Unsupported global: ultralytics.nn.tasks.DetectionModel
```
- This is expected for YOLO models
- Make sure `best.pt` is from Ultralytics YOLOv8
- Install ultralytics: `pip install ultralytics`

### No Detections Found
- Check image quality and lighting
- Ensure model was trained on similar data
- Lower confidence threshold in model_service.py: `conf=0.1`

### Performance Issues
- Use GPU if available (CUDA)
- Reduce image size before sending
- Use confidence threshold to filter weak detections

## Files Modified

| File | Status |
|------|--------|
| `requirements.txt` | ✅ Updated |
| `app/services/model_service.py` | ✅ Rewritten for YOLO |
| `app/main.py` | ✅ Updated logging |
| `app/routes/predict.py` | ✅ No changes needed |
| Frontend (detect page) | ⚠️ Needs updates for bbox visualization |
