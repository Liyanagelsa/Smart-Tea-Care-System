"""Unit tests for severity calculation logic."""
import pytest
from app.utils.severity import get_severity


class TestGetSeverity:
    # --- Healthy disease ---
    def test_healthy_disease_returns_none_severity(self):
        result = get_severity(0.99, "Healthy")
        assert result["level"] == "None"
        assert result["score"] == 0
        assert result["color"] == "green"

    def test_healthy_low_confidence_still_none(self):
        result = get_severity(0.50, "Healthy")
        assert result["level"] == "None"
        assert result["score"] == 0

    # --- Severe (confidence >= 85%) ---
    def test_severe_at_exact_threshold(self):
        result = get_severity(0.85, "Brown Blight")
        assert result["level"] == "Severe"
        assert result["score"] == 3
        assert result["color"] == "red"

    def test_severe_above_threshold(self):
        result = get_severity(0.99, "Brown Blight")
        assert result["level"] == "Severe"
        assert result["score"] == 3

    def test_severe_for_all_diseases(self):
        diseases = ["Algal Leaf Spot", "Brown Blight", "Gray Blight", "Helopeltis", "Red Leaf Spot"]
        for disease in diseases:
            result = get_severity(0.90, disease)
            assert result["level"] == "Severe", f"Failed for {disease}"

    # --- Moderate (confidence 65-85%) ---
    def test_moderate_at_lower_threshold(self):
        result = get_severity(0.65, "Brown Blight")
        assert result["level"] == "Moderate"
        assert result["score"] == 2
        assert result["color"] == "orange"

    def test_moderate_below_severe_threshold(self):
        result = get_severity(0.84, "Gray Blight")
        assert result["level"] == "Moderate"
        assert result["score"] == 2

    def test_moderate_mid_range(self):
        result = get_severity(0.75, "Red Leaf Spot")
        assert result["level"] == "Moderate"

    # --- Mild (confidence < 65%) ---
    def test_mild_below_moderate_threshold(self):
        result = get_severity(0.64, "Helopeltis")
        assert result["level"] == "Mild"
        assert result["score"] == 1
        assert result["color"] == "yellow"

    def test_mild_very_low_confidence(self):
        result = get_severity(0.10, "Brown Blight")
        assert result["level"] == "Mild"
        assert result["score"] == 1

    def test_mild_at_zero_confidence(self):
        result = get_severity(0.0, "Algal Leaf Spot")
        assert result["level"] == "Mild"

    # --- Return structure ---
    def test_returns_dict_with_required_keys(self):
        result = get_severity(0.90, "Brown Blight")
        assert "level" in result
        assert "score" in result
        assert "color" in result

    # --- Boundary values ---
    def test_boundary_just_below_severe(self):
        result = get_severity(0.8499, "Brown Blight")
        assert result["level"] == "Moderate"

    def test_boundary_just_below_moderate(self):
        result = get_severity(0.6499, "Brown Blight")
        assert result["level"] == "Mild"
