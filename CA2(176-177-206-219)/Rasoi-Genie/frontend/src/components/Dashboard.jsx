import { useState, useEffect } from 'react';
import {
  ChefHat,
  Calendar,
  Utensils,
  ShoppingCart,
  Star,
  CheckCircle,
  Loader2,
  Settings,
  RefreshCw,
  Clock,
  Users,
  Heart,
  AlertCircle,
  Download,
  Eye,
  Sparkles
} from 'lucide-react';
import { apiService } from '../services/api';
import { authUtils } from '../utils/auth';

function DashboardPage({ onNavigate, user, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [protectedData, setProtectedData] = useState(null);
  const [hasPreferences, setHasPreferences] = useState(false);
  const [currentMenu, setCurrentMenu] = useState(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [menuHistory, setMenuHistory] = useState([]);
  const [showMenuPreview, setShowMenuPreview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = authUtils.getToken();
        if (token) {
          try {
            const data = await apiService.getProtectedData(token);
            setProtectedData(data);
          } catch (err) {
            console.log('Protected endpoint not available yet');
          }

          try {
            const preferencesData = await apiService.getPreferences(token);
            setHasPreferences(!!preferencesData);
            setPreferences(preferencesData);
          } catch (err) {
            setHasPreferences(false);
          }

          // Try to fetch current menu
          try {
            const menuData = await apiService.getCurrentMenu(token);
            setCurrentMenu(menuData);
          } catch (err) {
            console.log('No current menu found');
          }

          // Fetch menu history
          try {
            const historyData = await apiService.getMenuHistory(token);
            setMenuHistory(historyData);
          } catch (err) {
            console.log('Failed to fetch menu history');
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    authUtils.clearAuth();
    onLogout();
    onNavigate('landing');
  };

  const handleSetupPreferences = () => {
    onNavigate('preferences');
  };

  const handleUpdatePreferences = () => {
    onNavigate('preferences', { isUpdate: true });
  };

  const handleGenerateMenu = async () => {
    if (!hasPreferences) {
      alert('Please set up your preferences first!');
      handleSetupPreferences();
      return;
    }

    setMenuLoading(true);
    try {
      const token = authUtils.getToken();
      const menuData = await apiService.generateMenu(token);
      setCurrentMenu(menuData);
      
      // Refresh menu history
      const historyData = await apiService.getMenuHistory(token);
      setMenuHistory(historyData);
      
      alert('Menu generated successfully!');
    } catch (err) {
      console.error('Failed to generate menu:', err);
      alert('Failed to generate menu. Please try again.');
    } finally {
      setMenuLoading(false);
    }
  };

  const handleRegenerateMenu = async () => {
    if (!currentMenu) return;
    
    setMenuLoading(true);
    try {
      const token = authUtils.getToken();
      const menuData = await apiService.generateMenu(token);
      setCurrentMenu(menuData);
      alert('Menu regenerated successfully!');
    } catch (err) {
      console.error('Failed to regenerate menu:', err);
      alert('Failed to regenerate menu. Please try again.');
    } finally {
      setMenuLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysOfWeek = () => {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  };

  const getPreferencesSummary = () => {
    if (!preferences) return 'Not set';
    
    return `${preferences.diet_type || 'Mixed'} • ${preferences.cuisine?.slice(0, 2).join(', ') || 'Various cuisines'}${preferences.cuisine?.length > 2 ? '...' : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-800">MealPlanner</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user}!</span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome back, {user}!</h1>
              <p className="text-xl text-gray-600">Ready to plan some delicious meals?</p>
            </div>
            <div className="mt-4 lg:mt-0 text-sm text-gray-500">
              <p>Preferences: {getPreferencesSummary()}</p>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {/* Preferences Status */}
            <div className={`border rounded-lg p-4 ${hasPreferences ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center space-x-2">
                {hasPreferences ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <span className={`font-medium ${hasPreferences ? 'text-green-800' : 'text-yellow-800'}`}>
                  {hasPreferences ? 'Preferences configured!' : 'Set up your preferences to get started'}
                </span>
              </div>
            </div>

            {/* Menu Status */}
            <div className={`border rounded-lg p-4 ${currentMenu ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <Calendar className={`h-5 w-5 ${currentMenu ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className={`font-medium ${currentMenu ? 'text-blue-800' : 'text-gray-800'}`}>
                  {currentMenu ? `Menu ready! Generated ${formatDate(currentMenu.generated_at)}` : 'No active menu'}
                </span>
              </div>
            </div>
          </div>

          {/* Current Menu Preview */}
          {currentMenu && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Your Current Menu</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowMenuPreview(!showMenuPreview)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{showMenuPreview ? 'Hide' : 'Preview'}</span>
                  </button>
                  <button
                    onClick={handleRegenerateMenu}
                    disabled={menuLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {menuLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>

              {showMenuPreview && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                  {getDaysOfWeek().map(day => (
                    <div key={day} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">{day}</h3>
                      <div className="space-y-1">
                        {Object.entries(currentMenu.menu[day] || {}).map(([meal, dish]) => (
                          <div key={meal} className="text-sm">
                            <span className="font-medium text-gray-600 capitalize">{meal}:</span>
                            <p className="text-gray-800 truncate" title={dish}>{dish}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Generate Menu Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <Sparkles className="h-12 w-12 text-orange-600" />
                {currentMenu && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {currentMenu ? 'Regenerate Menu' : 'Generate Menu'}
              </h3>
              <p className="text-gray-600 mb-4">
                {currentMenu 
                  ? 'Create a new personalized weekly meal plan'
                  : 'Create your first AI-powered meal plan'
                }
              </p>
              <button
                onClick={handleGenerateMenu}
                disabled={menuLoading}
                className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {menuLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    <span>{currentMenu ? 'Regenerate' : 'Generate'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Preferences Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <Utensils className="h-12 w-12 text-green-600" />
                {hasPreferences && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">My Preferences</h3>
              <p className="text-gray-600 mb-4">
                {hasPreferences
                  ? 'Update your dietary preferences and restrictions'
                  : 'Set up your dietary preferences to get started'}
              </p>
              <button
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                onClick={hasPreferences ? handleUpdatePreferences : handleSetupPreferences}
              >
                <Settings className="h-4 w-4" />
                <span>{hasPreferences ? 'Update' : 'Set Up'}</span>
              </button>
            </div>

            {/* Grocery List Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer opacity-75">
              <ShoppingCart className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Grocery List</h3>
              <p className="text-gray-600 mb-4">View and download auto-generated shopping list</p>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed">
                <ShoppingCart className="h-4 w-4" />
                <span>Coming Soon</span>
              </button>
            </div>

            {/* Recipe Videos Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer opacity-75">
              <Star className="h-12 w-12 text-yellow-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Recipe Videos</h3>
              <p className="text-gray-600 mb-4">Watch cooking tutorials for your meals</p>
              <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed">
                <Star className="h-4 w-4" />
                <span>Coming Soon</span>
              </button>
            </div>
          </div>

          {/* Menu History */}
          {menuHistory.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Menus</h2>
              <div className="space-y-3">
                {menuHistory.slice(0, 3).map((menu) => (
                  <div key={menu.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">
                          {formatDate(menu.generated_at)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {menu.is_active ? 'Active Menu' : 'Previous Menu'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {menu.is_active && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Current
                        </span>
                      )}
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats/Info Section */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Meal Planning Journey</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Menus Generated</h3>
                <p className="text-2xl font-bold text-orange-600">{menuHistory.length}</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Health Goals</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {preferences?.health_conditions?.length > 0 
                    ? `${preferences.health_conditions.length} condition(s) considered`
                    : 'No specific conditions'
                  }
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Cuisines</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {preferences?.cuisine?.length || 0} cuisine(s) selected
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;