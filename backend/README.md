---
title: Tea Disease Detector
emoji: 🍃
colorFrom: green
colorTo: teal
sdk: docker
pinned: false
license: mit
---

# Tea Leaf Disease Detection API

FastAPI backend serving a ResNet50 model for detecting tea leaf diseases.

## API Endpoints

- `POST /predict?lang=en` — Upload a leaf image, get disease prediction
- `GET /health` — Health check

## Supported Languages
- `en` — English
- `si` — Sinhala (සිංහල)  
- `ta` — Tamil (தமிழ்)

## Disease Classes
1. Algal Leaf Spot
2. Bird's Eye Spot
3. Brown Blight
4. Gray Blight
5. Healthy
6. Red Leaf Spot
7. White Spot
