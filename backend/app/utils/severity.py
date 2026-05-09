from typing import Any, Dict


def get_severity(confidence: float, disease: str) -> Dict[str, Any]:
    """Calculate severity level based on confidence and disease type."""
    if disease == "Healthy":
        return {"level": "None", "score": 0, "color": "green"}
    if confidence >= 0.85:
        return {"level": "Severe", "score": 3, "color": "red"}
    if confidence >= 0.65:
        return {"level": "Moderate", "score": 2, "color": "orange"}
    return {"level": "Mild", "score": 1, "color": "yellow"}
