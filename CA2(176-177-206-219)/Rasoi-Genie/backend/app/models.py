# models.py - CORRECTED VERSION
from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = 'users'
        
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True)
    hashed_password = Column(String(255))

    preference = relationship("Preference", back_populates="user", uselist=False)

class Preference(Base):  # Changed from UserPreferences to match main.py
    __tablename__ = 'preferences'  # Changed table name

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    diet_type = Column(String(50))  # veg/non-veg/vegan
    cuisine = Column(String(200))  # comma-separated values
    meals = Column(String(100))  # breakfast,lunch,snacks,dinner
    cooking_time = Column(String(20))  # Changed from cook_time to cooking_time
    health_conditions = Column(String(100))  # comma-separated: diabetes,etc

    user = relationship("User", back_populates="preference")  # Changed from preferences

class WeeklyMenu(Base):
    __tablename__ = 'weekly_menus'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    menu_data = Column(Text)  # JSON string of the menu
    generation_prompt = Column(Text)  # JSON string of preferences used
    created_at = Column(String(50))  # ISO format datetime
    is_active = Column(Integer, default=1)  # Using Integer instead of Boolean for MySQL compatibility
    
    user = relationship("User")