from fastapi import APIRouter, Depends
from typing import Any, Dict
from app.utils import get_current_user, create_user_client

router = APIRouter()


@router.get("/stats")
async def admin_stats(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get admin statistics (admin only, RLS enforced)."""
    user_client = create_user_client(current_user["token"])

    try:
        result = user_client.table("admin_stats").select("*").execute()
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail=f"Cannot load admin stats: {str(e)}")

    return result.data[0] if result.data else {}
