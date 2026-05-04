# backend/app/api/draft.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agents.draft import feedback_agent

router = APIRouter(prefix="/api", tags=["draft"])

class FeedbackRequest(BaseModel):
    company: str
    role: str
    jasoseo_item: str                # 단일 항목
    user_draft: str                  # 사용자 초안
    experience_tags: list[str] = []
    appeal_points: list[str] = []
    jasoseo_strategy: dict = {}
    char_limit: int = 700

@router.post("/draft/feedback")
async def create_feedback(req: FeedbackRequest):
    try:
        result = await feedback_agent(
            company=req.company,
            role=req.role,
            jasoseo_item=req.jasoseo_item,
            user_draft=req.user_draft,
            experience_tags=req.experience_tags,
            appeal_points=req.appeal_points,
            jasoseo_strategy=req.jasoseo_strategy,
            char_limit=req.char_limit,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))