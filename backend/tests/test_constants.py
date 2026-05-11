"""Unit tests for constants — disease classes and treatment data."""
import pytest
from app.constants import DISEASE_CLASSES, TREATMENTS


class TestDiseaseClasses:
    def test_has_six_classes(self):
        assert len(DISEASE_CLASSES) == 6

    def test_contains_expected_diseases(self):
        expected = {"Algal Leaf Spot", "Brown Blight", "Gray Blight",
                    "Healthy", "Helopeltis", "Red Leaf Spot"}
        assert set(DISEASE_CLASSES) == expected

    def test_healthy_is_present(self):
        assert "Healthy" in DISEASE_CLASSES

    def test_all_entries_are_strings(self):
        for cls in DISEASE_CLASSES:
            assert isinstance(cls, str)

    def test_no_duplicates(self):
        assert len(DISEASE_CLASSES) == len(set(DISEASE_CLASSES))

    def test_order_algal_first(self):
        assert DISEASE_CLASSES[0] == "Algal Leaf Spot"

    def test_order_red_leaf_spot_last(self):
        assert DISEASE_CLASSES[-1] == "Red Leaf Spot"


class TestTreatments:
    def test_all_disease_classes_have_treatment(self):
        for disease in DISEASE_CLASSES:
            assert disease in TREATMENTS, f"Missing treatment for {disease}"

    def test_each_treatment_has_english(self):
        for disease, treatment in TREATMENTS.items():
            assert "en" in treatment, f"Missing English treatment for {disease}"

    def test_english_treatment_has_required_keys(self):
        required_keys = {"cause", "immediate", "chemical", "organic", "preventive"}
        for disease, treatment in TREATMENTS.items():
            en = treatment["en"]
            for key in required_keys:
                assert key in en, f"Missing '{key}' in treatment for {disease}"

    def test_treatment_lists_are_not_empty(self):
        for disease, treatment in TREATMENTS.items():
            en = treatment["en"]
            assert len(en["immediate"]) > 0
            assert len(en["chemical"]) > 0
            assert len(en["organic"]) > 0

    def test_healthy_treatment_no_action(self):
        healthy_en = TREATMENTS["Healthy"]["en"]
        assert "No immediate action needed" in healthy_en["immediate"][0]

    def test_cause_is_string(self):
        for disease, treatment in TREATMENTS.items():
            assert isinstance(treatment["en"]["cause"], str)
