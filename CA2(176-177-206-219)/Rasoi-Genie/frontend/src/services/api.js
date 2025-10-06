const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/register', {
      method: 'POST',
      body: userData,
    });
  }

  async login(credentials) {
    return this.request('/login', {
      method: 'POST',
      body: credentials,
    });
  }

  // Preferences
  async savePreferences(preferences, token) {
    return this.request('/preferences', {
      method: 'POST',
      body: preferences,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getPreferences(token) {
    return this.request('/preferences', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Menu Generation
  async generateMenu(token, regenerateRequest = null) {
    return this.request('/generate-menu', {
      method: 'POST',
      body: regenerateRequest || {},
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getCurrentMenu(token) {
    return this.request('/current-menu', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async regenerateMeal(token, menuId, day, meal) {
    return this.request('/regenerate-meal', {
      method: 'POST',
      body: {
        menu_id: menuId,
        day: day,
        meal: meal,
      },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getMenuHistory(token, limit = 10) {
    return this.request(`/menu-history?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Future: Not implemented yet
  async generateGroceryList(token, menuId) {
    throw new Error('Grocery list generation not yet implemented');
  }

  async getRecipeVideos(token, dishName) {
    throw new Error('Recipe video search not yet implemented');
  }
}

export const apiService = new ApiService();
