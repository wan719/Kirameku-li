from datetime import date

from fastapi import APIRouter, Depends, Query, Request
from sqlmodel import Session

from app.deps import get_current_user, get_session
from app.services import visitor_service
from app.public_site import PublicSiteSettings, get_public_site_settings
from app.schemas.public_site import PublicVisitorStatsOut

router = APIRouter(prefix="/api/visitors", tags=["访客记录"])


@router.get("")
def list_recent_visitors(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    _: dict = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """获取最近访客列表"""
    visitors = visitor_service.get_recent_visitors(session, page, size)
    return {"code": 0, "data": visitors}


@router.get("/count", response_model=PublicVisitorStatsOut)
def visitor_count(
    session: Session = Depends(get_session),
    settings: PublicSiteSettings = Depends(get_public_site_settings),
):
    """获取当前公共站点命名空间的访客数。"""
    launch_date = settings.site_launch_date
    running_days = None
    if launch_date is not None:
        running_days = max((date.today() - launch_date).days, 0)
    return {
        "code": 0,
        "count": visitor_service.get_public_visitor_count(
            session, settings.public_stats_namespace
        ),
        "launchDate": launch_date.isoformat() if launch_date else None,
        "runningDays": running_days,
    }


@router.get("/location")
def get_visitor_location(
    request: Request,
):
    """获取当前访问者的地理位置"""
    ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
    if not ip:
        ip = request.headers.get("x-real-ip", "")
    if not ip:
        ip = request.client.host if request.client else ""

    geo = visitor_service._fetch_geo(ip)
    return {"code": 0, "data": geo}


@router.post("/record")
def record_visitor(
    request: Request,
    session: Session = Depends(get_session),
    settings: PublicSiteSettings = Depends(get_public_site_settings),
):
    """记录当前访问（前端调用）"""
    ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
    if not ip:
        ip = request.headers.get("x-real-ip", "")
    if not ip:
        ip = request.client.host if request.client else ""

    path = request.headers.get("x-path", "")
    ua = request.headers.get("user-agent", "")

    visitor_service.record_visit(
        session,
        ip,
        path,
        ua,
        public_stats_namespace=settings.public_stats_namespace,
    )
    return {"code": 0, "message": "ok"}


@router.delete("/{visitor_id}")
def delete_visitor(
    visitor_id: int,
    _: dict = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """删除单条访客记录"""
    visitor_service.delete_visitor(session, visitor_id)
    return {"code": 0, "message": "ok"}


@router.delete("")
def clear_visitors(
    _: dict = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """清空所有访客记录"""
    visitor_service.clear_visitors(session)
    return {"code": 0, "message": "ok"}
