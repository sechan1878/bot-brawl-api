import json
import os
from pathlib import Path
from threading import Lock
from typing import Any
from urllib.parse import quote

import httpx
from fastapi import FastAPI, HTTPException, Query


API_TIMEOUT_SECONDS = float(os.getenv("BRAWL_API_TIMEOUT", "10"))
API_BASE = os.getenv("BRAWL_API_BASE", "https://api.brawlstars.com/v1").rstrip("/")
KEYS_FILE = Path(os.getenv("BRAWL_API_KEYS_FILE", "./db/api_keys.json"))
KEY_STATE_FILE = Path(os.getenv("BRAWL_API_KEY_STATE_FILE", "./db/api_key_state.json"))
KEY_ROTATION_LOCK = Lock()


app = FastAPI(title="Brawl Proxy", version="0.1.0")


def normalize_tag(tag: str) -> str:
    cleaned = (tag or "").strip().upper().replace("#", "")
    cleaned = "".join(ch for ch in cleaned if ch.isalnum())
    if not cleaned:
        raise HTTPException(status_code=400, detail="tag is required")
    return cleaned


def encode_tag(tag: str) -> str:
    return quote(f"#{normalize_tag(tag)}", safe="")


def normalize_location(location: str) -> str:
    cleaned = (location or "global").strip()
    return cleaned or "global"


async def resolve_location_id(location: str) -> str:
    normalized = normalize_location(location)
    lowered = normalized.lower()

    if lowered in {"global", "world", "세계"}:
        return "global"

    if normalized.isdigit():
        return normalized

    alias_groups = {
        "south korea": {"south korea", "korea", "kr", "kor", "한국"},
    }

    locations = await fetch_json(API_BASE, "/locations")
    items = locations.get("items", []) if isinstance(locations, dict) else []

    for item in items:
        name = str(item.get("name", "")).strip()
        country_code = str(item.get("countryCode", "")).strip().lower()
        candidate = name.lower()

        for canonical, aliases in alias_groups.items():
            if lowered in aliases and (candidate == canonical or country_code == "kr"):
                return str(item.get("id"))

        if lowered == candidate or lowered == country_code:
            return str(item.get("id"))

    raise HTTPException(status_code=400, detail=f"unknown location: {location}")


def read_json_file(path: Path, default: Any) -> Any:
    try:
        if not path.exists():
            return default
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return default


def write_json_file(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def load_enabled_tokens() -> list[str]:
    raw = read_json_file(KEYS_FILE, {"keys": []})
    items = raw.get("keys", []) if isinstance(raw, dict) else raw
    tokens: list[str] = []

    for item in items:
        if isinstance(item, str):
            token = item.strip()
            if token:
                tokens.append(token)
            continue

        if isinstance(item, dict):
            token = str(item.get("token", "")).strip()
            enabled = bool(item.get("enabled", True))
            if token and enabled:
                tokens.append(token)

    return tokens


def require_token() -> str:
    with KEY_ROTATION_LOCK:
        tokens = load_enabled_tokens()
        if not tokens:
            raise HTTPException(status_code=500, detail="no enabled API keys in db/api_keys.json")

        state = read_json_file(KEY_STATE_FILE, {"next_index": 0})
        next_index = int(state.get("next_index", 0)) if isinstance(state, dict) else 0
        token = tokens[next_index % len(tokens)]
        write_json_file(KEY_STATE_FILE, {"next_index": (next_index + 1) % len(tokens)})
        return token


async def fetch_json(base_url: str, path: str, **params: Any) -> Any:
    token = require_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "User-Agent": "brawl-render-proxy/0.1",
    }

    async with httpx.AsyncClient(timeout=API_TIMEOUT_SECONDS) as client:
        try:
            response = await client.get(f"{base_url}{path}", params=params, headers=headers)
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"upstream request failed: {exc}") from exc

    if response.status_code >= 400:
        detail = response.text
        try:
            detail = response.json()
        except ValueError:
            pass
        raise HTTPException(status_code=response.status_code, detail=detail)

    try:
        return response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="upstream returned non-json response") from exc


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "name": "brawl-render-proxy",
        "status": "ok",
        "docs": "/docs",
    }


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/player")
async def get_player(tag: str = Query(..., description="Brawl player tag")) -> Any:
    return await fetch_json(API_BASE, f"/players/{encode_tag(tag)}")


@app.get("/api/player/battlelog")
async def get_player_battlelog(tag: str = Query(..., description="Brawl player tag")) -> Any:
    return await fetch_json(API_BASE, f"/players/{encode_tag(tag)}/battlelog")


@app.get("/api/club")
async def get_club(tag: str = Query(..., description="Brawl club tag")) -> Any:
    return await fetch_json(API_BASE, f"/clubs/{encode_tag(tag)}")


@app.get("/api/club/search")
async def search_club(name: str = Query(..., min_length=1, description="Club name")) -> Any:
    return await fetch_json(API_BASE, "/clubs", name=name.strip())


@app.get("/api/club/members")
async def get_club_members(tag: str = Query(..., description="Brawl club tag")) -> Any:
    return await fetch_json(API_BASE, f"/clubs/{encode_tag(tag)}/members")


@app.get("/api/locations")
async def get_locations() -> Any:
    return await fetch_json(API_BASE, "/locations")


@app.get("/api/rankings/players")
async def get_player_rankings(
    location: str = Query("global", description="Location id or global"),
    limit: int = Query(20, ge=1, le=200, description="Number of items to return"),
) -> Any:
    resolved_location = await resolve_location_id(location)
    return await fetch_json(
        API_BASE,
        f"/locations/{resolved_location}/rankings/players",
        limit=limit,
    )


@app.get("/api/rankings/clubs")
async def get_club_rankings(
    location: str = Query("global", description="Location id or global"),
    limit: int = Query(20, ge=1, le=200, description="Number of items to return"),
) -> Any:
    resolved_location = await resolve_location_id(location)
    return await fetch_json(
        API_BASE,
        f"/locations/{resolved_location}/rankings/clubs",
        limit=limit,
    )


@app.get("/api/rankings/brawlers")
async def get_brawler_rankings(
    brawler_id: int = Query(..., ge=16000000, description="Official brawler id"),
    location: str = Query("global", description="Location id or global"),
    limit: int = Query(20, ge=1, le=200, description="Number of items to return"),
) -> Any:
    resolved_location = await resolve_location_id(location)
    return await fetch_json(
        API_BASE,
        f"/locations/{resolved_location}/rankings/brawlers/{brawler_id}",
        limit=limit,
    )


@app.get("/api/brawlers")
async def get_brawlers() -> Any:
    return await fetch_json(API_BASE, "/brawlers")


@app.get("/api/events")
async def get_events() -> Any:
    return await fetch_json(API_BASE, "/events/rotation")
