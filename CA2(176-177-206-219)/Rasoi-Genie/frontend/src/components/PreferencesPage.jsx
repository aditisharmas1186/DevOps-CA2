import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, Heart, Utensils, Leaf, Users, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

const PreferencesPage = ({ onNavigate, user, isUpdate = false }) => {
  const [selectedPrefs, setSelectedPrefs] = useState({
    diet: [],
    cuisine: [],
    meals: [],
    time: [],
    health: []
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isUpdate);

  const categories = [
    {
      id: 'diet',
      title: 'Dietary Preferences',
      icon: <Leaf className="w-6 h-6" />,
      description: 'What suits your lifestyle?',
      options: [
        { id: 'veg', label: 'Vegetarian', emoji: '🥬', color: 'bg-green-500' },
        { id: 'non-veg', label: 'Non-Vegetarian', emoji: '🍗', color: 'bg-red-500' },
        { id: 'vegan', label: 'Vegan', emoji: '🌱', color: 'bg-emerald-500' }
      ]
    },
    {
      id: 'cuisine',
      title: 'Favorite Cuisines',
      icon: <Utensils className="w-6 h-6" />,
      description: 'Which flavors call to you?',
      options: [
        { id: 'north-indian', label: 'North Indian', emoji: '🫓', color: 'bg-orange-500' },
        { id: 'south-indian', label: 'South Indian', emoji: '🍛', color: 'bg-yellow-500' },
        { id: 'marathi', label: 'Marathi', emoji: '🥘', color: 'bg-amber-500' },
        { id: 'bengali', label: 'Bengali', emoji: '🍚', color: 'bg-pink-500' },
        { id: 'gujarati', label: 'Gujarati', emoji: '🥞', color: 'bg-purple-500' },
        { id: 'punjabi', label: 'Punjabi', emoji: '🫓', color: 'bg-indigo-500' },
        { id: 'rajasthani', label: 'Rajasthani', emoji: '🍖', color: 'bg-red-600' },
        { id: 'chinese', label: 'Chinese', emoji: '🥢', color: 'bg-blue-500' }
      ]
    },
    {
      id: 'meals',
      title: 'Meal Times',
      icon: <ChefHat className="w-6 h-6" />,
      description: 'When do you love to cook?',
      options: [
        { id: 'breakfast', label: 'Breakfast', emoji: '🌅', color: 'bg-yellow-400' },
        { id: 'lunch', label: 'Lunch', emoji: '☀️', color: 'bg-orange-400' },
        { id: 'snacks', label: 'Snacks', emoji: '🍿', color: 'bg-purple-400' },
        { id: 'dinner', label: 'Dinner', emoji: '🌙', color: 'bg-indigo-500' }
      ]
    },
    {
      id: 'time',
      title: 'Cooking Time',
      icon: <Clock className="w-6 h-6" />,
      description: 'How much time do you have?',
      options: [
        { id: 'quick', label: '< 15 minutes', emoji: '⚡', color: 'bg-green-400', value: '<15min' },
        { id: 'medium', label: '< 30 minutes', emoji: '⏰', color: 'bg-blue-400', value: '<30min' },
        { id: 'slow', label: '< 45 minutes', emoji: '🕐', color: 'bg-purple-400', value: '<45min' }
      ]
    },
    {
      id: 'health',
      title: 'Health Considerations',
      icon: <Heart className="w-6 h-6" />,
      description: 'Any dietary restrictions?',
      options: [
        { id: 'diabetes', label: 'Diabetes Friendly', emoji: '🩺', color: 'bg-blue-500' },
        { id: 'bp', label: 'Blood Pressure', emoji: '❤️', color: 'bg-red-500' },
        { id: 'cholesterol', label: 'Cholesterol', emoji: '💚', color: 'bg-green-500' }
      ]
    }
  ];

  // Load existing preferences if updating
  useEffect(() => {
    const loadPreferences = async () => {
      if (!isUpdate) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:8000/preferences', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const prefs = await response.json();
          setSelectedPrefs({
            diet: prefs.diet_type ? [prefs.diet_type.replace('-', '-')] : [],
            cuisine: prefs.cuisine || [],
            meals: prefs.meals || [],
            time: prefs.cooking_time ? [prefs.cooking_time.replace(' ', '').toLowerCase()] : [],
            health: prefs.health_conditions || []
          });
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadPreferences();
  }, [isUpdate]);

  const togglePreference = (category, optionId) => {
    setSelectedPrefs(prev => ({
      ...prev,
      [category]: category === 'diet' || category === 'time' 
        ? [optionId] // Single selection for diet and time
        : prev[category].includes(optionId)
          ? prev[category].filter(id => id !== optionId)
          : [...prev[category], optionId]
    }));
  };

  const nextStep = () => {
    if (currentStep < categories.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Map frontend selections to backend format
      const preferences = {
        diet_type: selectedPrefs.diet[0] || '',
        cuisine: selectedPrefs.cuisine,
        meals: selectedPrefs.meals,
        cooking_time: selectedPrefs.time.length > 0 
          ? categories.find(c => c.id === 'time')?.options.find(o => o.id === selectedPrefs.time[0])?.value || ''
          : '',
        health_conditions: selectedPrefs.health
      };

      const response = await fetch('http://localhost:8000/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      // Navigate based on context
      if (isUpdate) {
        onNavigate('dashboard');
      } else {
        onNavigate('dashboard'); // or to a success page
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getSelectedCount = () => {
    return Object.values(selectedPrefs).flat().length;
  };

  const currentCategory = categories[currentStep];

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-300 animate-spin mx-auto mb-4" />
          <p className="text-purple-200">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-3xl"></div>
        <div className="relative px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {isUpdate && (
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="p-2 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6 text-purple-300" />
                  </button>
                )}
                <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                  <ChefHat className="w-8 h-8 text-purple-300" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  {isUpdate ? 'Update Preferences' : 'FlavorFlow'}
                </h1>
              </div>
              {user && (
                <span className="text-purple-200">Welcome, {user}!</span>
              )}
            </div>
            <p className="text-purple-200 text-lg">Discover recipes tailored just for you</p>
            
            {/* Progress Bar */}
            <div className="mt-8 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-purple-300">Step {currentStep + 1} of {categories.length}</span>
                <span className="text-sm text-purple-300">{getSelectedCount()} preferences selected</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep + 1) / categories.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 pb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          {/* Category Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 p-4 bg-white/10 rounded-2xl mb-4">
              <div className="text-purple-300">
                {currentCategory.icon}
              </div>
              <h2 className="text-2xl font-bold">{currentCategory.title}</h2>
            </div>
            <p className="text-purple-200 text-lg">{currentCategory.description}</p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {currentCategory.options.map((option) => {
              const isSelected = selectedPrefs[currentCategory.id].includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => togglePreference(currentCategory.id, option.id)}
                  className={`
                    relative group p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105
                    ${isSelected 
                      ? 'border-white bg-white/20 shadow-xl shadow-purple-500/20' 
                      : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">{option.emoji}</div>
                    <div className="font-semibold text-sm">{option.label}</div>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                  
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${option.color}/10`}></div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`
                px-6 py-3 rounded-xl font-semibold transition-all duration-300
                ${currentStep === 0 
                  ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }
              `}
            >
              Previous
            </button>

            <div className="flex gap-2">
              {categories.map((_, index) => (
                <div
                  key={index}
                  className={`
                    w-3 h-3 rounded-full transition-all duration-300
                    ${index === currentStep 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                      : index < currentStep 
                        ? 'bg-purple-400' 
                        : 'bg-white/20'
                    }
                  `}
                ></div>
              ))}
            </div>

            {currentStep === categories.length - 1 ? (
              <button 
                onClick={handleFinish}
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>{isUpdate ? 'Update Preferences' : 'Get My Recipes'}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Selected Preferences Summary */}
        {getSelectedCount() > 0 && (
          <div className="mt-6 p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <h3 className="text-lg font-semibold mb-4 text-purple-200">Your Selections</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(selectedPrefs).map(([categoryId, selections]) =>
                selections.map(selectionId => {
                  const category = categories.find(c => c.id === categoryId);
                  const option = category?.options.find(o => o.id === selectionId);
                  if (!option) return null;
                  return (
                    <span
                      key={`${categoryId}-${selectionId}`}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full text-sm border border-purple-400/30"
                    >
                      <span>{option.emoji}</span>
                      <span>{option.label}</span>
                    </span>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreferencesPage;