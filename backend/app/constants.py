# Disease Classes
# IMPORTANT: must match model training order exactly
DISEASE_CLASSES = [
    "Algal Leaf Spot",
    "Brown Blight",
    "Gray Blight",
    "Healthy",
    "Helopeltis",
    "Red Leaf Spot"
]

# Treatment Recommendations
# Keys must match DISEASE_CLASSES exactly
TREATMENTS = {
    "Algal Leaf Spot": {
        "en": {
            "cause": "Algal infection affecting leaf surfaces",
            "immediate": ["Remove infected leaves", "Reduce excess moisture"],
            "chemical": ["Copper-based fungicide if recommended locally"],
            "organic": ["Neem-based spray", "Improve field sanitation"],
            "preventive": ["Improve air circulation", "Avoid prolonged leaf wetness"]
        }
    },
    "Brown Blight": {
        "en": {
            "cause": "Fungal infection causing brown lesions",
            "immediate": ["Remove infected leaves", "Inspect nearby plants"],
            "chemical": ["Recommended fungicide for blight control"],
            "organic": ["Neem oil spray"],
            "preventive": ["Avoid overcrowding", "Regular monitoring"]
        }
    },
    "Gray Blight": {
        "en": {
            "cause": "Fungal leaf blight infection",
            "immediate": ["Prune infected leaves", "Keep foliage dry"],
            "chemical": ["Suitable fungicide for gray blight"],
            "organic": ["Neem oil spray"],
            "preventive": ["Improve drainage", "Regular field monitoring"]
        }
    },
    "Healthy": {
        "en": {
            "cause": "No disease detected",
            "immediate": ["No immediate action needed"],
            "chemical": ["None"],
            "organic": ["Continue regular care"],
            "preventive": ["Maintain good agronomic practices"]
        }
    },
    "Helopeltis": {
        "en": {
            "cause": "Tea mosquito bug attack",
            "immediate": ["Remove heavily damaged shoots", "Inspect nearby plants"],
            "chemical": ["Imidacloprid", "Thiamethoxam"],
            "organic": ["Neem oil spray"],
            "preventive": ["Regular monitoring", "Timely pest control"]
        }
    },
    "Red Leaf Spot": {
        "en": {
            "cause": "Leaf spot infection causing reddish lesions",
            "immediate": ["Remove infected leaves", "Improve sanitation"],
            "chemical": ["Appropriate fungicide if advised locally"],
            "organic": ["Neem oil spray"],
            "preventive": ["Improve airflow", "Avoid excess moisture"]
        }
    }
}
