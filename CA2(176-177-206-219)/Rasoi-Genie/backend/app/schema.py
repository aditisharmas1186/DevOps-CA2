# schema.py - CORRECTED VERSION
from pydantic import BaseModel, EmailStr
from typing import Any, Dict, List, Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class PreferenceCreate(BaseModel):  # Renamed from PreferencesBase/Create
    diet_type: str
    cuisine: List[str]
    meals: List[str]
    cooking_time: str  # Changed from cook_time to cooking_time
    health_conditions: List[str]

class PreferenceResponse(PreferenceCreate):  # Renamed from PreferencesResponse
    class Config:
        from_attributes = True  # Updated for Pydantic v2

class MenuGenerateRequest(BaseModel):
    regenerate_meal: Optional[str] = None  # Optional: specific meal to regenerate like "Monday-lunch"

class MenuResponse(BaseModel):
    menu: Dict[str, Dict[str, str]]
    preferences_used: Dict[str, Any]
    generated_at: str
    menu_id: Optional[int] = None
    
class MenuRegenerateRequest(BaseModel):
    menu_id: int
    day: str  # e.g., "Monday"
    meal: str  # e.g., "lunch"

class MenuHistoryItem(BaseModel):
    id: int
    generated_at: str
    is_active: bool
    menu_preview: Dict[str, List[str]]

class MenuHistoryResponse(BaseModel):
    menus: List[MenuHistoryItem]