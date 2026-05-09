"""
Tea Leaf Disease Detection API Entry Point
Run with: uvicorn main:app --reload --port 8001
"""

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
