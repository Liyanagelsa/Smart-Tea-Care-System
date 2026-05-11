from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
from app.utils import get_current_user, create_user_client, create_admin_client
from app.services import SupabaseService
from app.utils.logger import logger


class RoleUpdate(BaseModel):
    new_role: str

router = APIRouter()


def check_admin(current_user: Dict[str, Any]) -> Dict[str, Any]:
    """Verify user is admin."""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/stats")
async def get_admin_stats(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get overall admin dashboard statistics.
    Returns: total users, detections, avg confidence, accuracy rate, etc.
    """
    admin_user = check_admin(current_user)
    logger.info(f"Admin stats requested by {admin_user['email']}")

    try:
        admin_client = create_admin_client()

        # Get all data (bypasses RLS via service key)
        users_data = admin_client.table("profiles").select("*").execute()
        detections_data = admin_client.table("detection_history").select("*").execute()

        users = users_data.data if users_data.data else []
        detections = detections_data.data if detections_data.data else []

        # Calculate statistics (all UTC-aware)
        now = datetime.now(timezone.utc)
        month_start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
        year_start = datetime(now.year, 1, 1, tzinfo=timezone.utc)

        def parse_dt(ts: str) -> datetime:
            return datetime.fromisoformat(ts.replace("Z", "+00:00"))

        # Active users this month
        active_users_month = len(set(
            d["user_id"] for d in detections
            if parse_dt(d["created_at"]) >= month_start
        ))

        # Detections this month
        detections_month = len([
            d for d in detections
            if parse_dt(d["created_at"]) >= month_start
        ])

        # Average confidence
        avg_confidence = (
            sum(d.get("confidence", 0) for d in detections) / len(detections)
            if detections else 0
        )

        # Accuracy rate (YTD) - confidence >= 85%
        detections_ytd = [
            d for d in detections
            if parse_dt(d["created_at"]) >= year_start
        ]
        accurate_count = len([
            d for d in detections_ytd
            if d.get("confidence", 0) >= 85
        ])
        accuracy_rate = (accurate_count / len(detections_ytd) * 100) if detections_ytd else 0

        # Top disease
        disease_count = {}
        for d in detections:
            disease = d.get("disease", "Unknown")
            if disease != "Healthy":
                disease_count[disease] = disease_count.get(disease, 0) + 1
        top_disease = max(disease_count, key=disease_count.get) if disease_count else "None"

        return {
            "totalUsers": len(users),
            "totalDetections": len(detections),
            "avgConfidence": round(avg_confidence, 2),
            "activeUsersMonth": active_users_month,
            "diseaseDetectedMonth": detections_month,
            "accuracyRate": round(accuracy_rate, 2),
            "topDisease": top_disease,
            "lastUpdated": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Admin stats error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")


@router.get("/users")
async def get_all_users(
    current_user: Dict[str, Any] = Depends(get_current_user),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    role: Optional[str] = Query(None)
):
    """
    Get all users with optional filtering by role.
    Requires admin access.
    """
    admin_user = check_admin(current_user)
    logger.info(f"Get users requested by {admin_user['email']}")

    try:
        admin_client = create_admin_client()

        query = admin_client.table("profiles").select("*")

        if role:
            query = query.eq("role", role)

        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()

        return {
            "users": result.data if result.data else [],
            "total": len(result.data) if result.data else 0,
            "limit": limit,
            "offset": offset
        }

    except Exception as e:
        logger.error(f"Get users error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")


@router.get("/detections")
async def get_all_detections(
    current_user: Dict[str, Any] = Depends(get_current_user),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    disease: Optional[str] = Query(None),
    min_confidence: Optional[float] = Query(None),
    max_confidence: Optional[float] = Query(None)
):
    """
    Get all detections with optional filtering.
    Requires admin access.
    """
    admin_user = check_admin(current_user)
    logger.info(f"Get detections requested by {admin_user['email']}")

    try:
        admin_client = create_admin_client()

        query = admin_client.table("detection_history").select("*")

        if disease:
            query = query.eq("disease", disease)

        if min_confidence is not None:
            query = query.gte("confidence", min_confidence)

        if max_confidence is not None:
            query = query.lte("confidence", max_confidence)

        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()

        return {
            "detections": result.data if result.data else [],
            "total": len(result.data) if result.data else 0,
            "limit": limit,
            "offset": offset
        }

    except Exception as e:
        logger.error(f"Get detections error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching detections: {str(e)}")


@router.get("/disease-stats")
async def get_disease_statistics(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get disease distribution statistics.
    Requires admin access.
    """
    admin_user = check_admin(current_user)
    logger.info(f"Disease stats requested by {admin_user['email']}")

    try:
        admin_client = create_admin_client()
        detections_data = admin_client.table("detection_history").select("disease, confidence").execute()
        detections = detections_data.data if detections_data.data else []

        disease_stats = {}
        for detection in detections:
            disease = detection.get("disease", "Unknown")
            confidence = detection.get("confidence", 0)

            if disease not in disease_stats:
                disease_stats[disease] = {
                    "count": 0,
                    "avgConfidence": 0,
                    "totalConfidence": 0
                }

            disease_stats[disease]["count"] += 1
            disease_stats[disease]["totalConfidence"] += confidence

        # Calculate averages
        for disease in disease_stats:
            count = disease_stats[disease]["count"]
            disease_stats[disease]["avgConfidence"] = round(
                disease_stats[disease]["totalConfidence"] / count, 2
            )
            del disease_stats[disease]["totalConfidence"]

        return {
            "diseases": disease_stats,
            "total": sum(d["count"] for d in disease_stats.values())
        }

    except Exception as e:
        logger.error(f"Disease stats error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching disease stats: {str(e)}")


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    body: RoleUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update a user's role (admin/user).
    Requires admin access.
    """
    admin_user = check_admin(current_user)
    new_role = body.new_role
    logger.info(f"Role update requested by {admin_user['email']} for user {user_id}")

    if new_role not in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'admin' or 'user'")

    try:
        admin_client = create_admin_client()

        result = admin_client.table("profiles").update({
            "role": new_role
        }).eq("id", user_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")

        logger.info(f"Role updated for user {user_id} to {new_role}")

        return {
            "success": True,
            "user_id": user_id,
            "new_role": new_role
        }

    except Exception as e:
        logger.error(f"Update role error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating user role: {str(e)}")


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a user profile. Requires admin access."""
    admin_user = check_admin(current_user)

    if user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    logger.info(f"User delete requested by {admin_user['email']} for user {user_id}")

    try:
        admin_client = create_admin_client()
        result = admin_client.table("profiles").delete().eq("id", user_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")

        logger.info(f"User {user_id} deleted")
        return {"success": True, "deleted_id": user_id}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete user error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting user: {str(e)}")


@router.delete("/detections/{detection_id}")
async def delete_detection(
    detection_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Delete a detection record.
    Requires admin access.
    """
    admin_user = check_admin(current_user)
    logger.info(f"Detection delete requested by {admin_user['email']} for {detection_id}")

    try:
        admin_client = create_admin_client()

        result = admin_client.table("detection_history").delete().eq("id", detection_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Detection not found")

        logger.info(f"Detection {detection_id} deleted")

        return {
            "success": True,
            "deleted_id": detection_id
        }

    except Exception as e:
        logger.error(f"Delete detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting detection: {str(e)}")


@router.get("/system-health")
async def get_system_health(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get system health status.
    Requires admin access.
    """
    admin_user = check_admin(current_user)

    try:
        # Check backend is running (this endpoint is already responding)
        backend_status = "healthy"

        # Check database connectivity
        try:
            create_admin_client().table("profiles").select("id").limit(1).execute()
            database_status = "healthy"
        except:
            database_status = "unhealthy"

        return {
            "status": "operational",
            "components": {
                "backend": backend_status,
                "database": database_status,
                "timestamp": datetime.now().isoformat()
            }
        }

    except Exception as e:
        logger.error(f"System health check error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error checking system health: {str(e)}")


@router.get("/activity-log")
async def get_activity_log(
    current_user: Dict[str, Any] = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=500),
    hours: int = Query(24, ge=1, le=720)
):
    """
    Get recent activity log (detections and user actions).
    Requires admin access.
    """
    admin_user = check_admin(current_user)

    try:
        admin_client = create_admin_client()

        # Get recent detections
        time_ago = datetime.now(timezone.utc) - timedelta(hours=hours)

        detections_data = admin_client.table("detection_history")\
            .select("*")\
            .gte("created_at", time_ago.isoformat())\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()

        activities = []
        for detection in (detections_data.data or []):
            activities.append({
                "type": "detection",
                "user_id": detection.get("user_id"),
                "disease": detection.get("disease"),
                "confidence": detection.get("confidence"),
                "timestamp": detection.get("created_at")
            })

        return {
            "activities": sorted(activities, key=lambda x: x["timestamp"], reverse=True),
            "total": len(activities),
            "hours": hours
        }

    except Exception as e:
        logger.error(f"Activity log error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching activity log: {str(e)}")
