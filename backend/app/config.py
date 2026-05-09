import os
from dotenv import load_dotenv

load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# Model Configuration
_model_path = os.getenv("MODEL_PATH")
MODEL_PATH = _model_path if _model_path and os.path.exists(_model_path) else "best.pt"

# CORS Configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# API Configuration
API_TITLE = "Tea Leaf Disease Detection API"
API_VERSION = "1.0.0"
