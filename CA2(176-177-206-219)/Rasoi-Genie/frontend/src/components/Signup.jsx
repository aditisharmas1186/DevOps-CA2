import { useState, useEffect } from 'react';
import { ChefHat, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';
import { authUtils } from '../utils/auth';

function SignupPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validations, setValidations] = useState({
    username: false,
    email: false,
    password: false
  });

  // Form validation
  useEffect(() => {
    setValidations({
      username: authUtils.validateUsername(formData.username),
      email: authUtils.validateEmail(formData.email),
      password: authUtils.validatePassword(formData.password)
    });
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validations.username || !validations.email || !validations.password) {
      setError('Please fill all fields correctly');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiService.register(formData);
      alert('Registration successful! You can now login.');
      onNavigate('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <ChefHat className="h-10 w-10 text-orange-600" />
            <span className="text-3xl font-bold text-gray-800">MealPlanner</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Create Your Account</h2>
          <p className="text-gray-600 mt-2">Start your personalized meal planning journey</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    validations.username ? 'border-green-300' : 'border-gray-300'
                  }`}
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                {formData.username && (
                  <CheckCircle className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    validations.username ? 'text-green-500' : 'text-gray-300'
                  }`} />
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">At least 3 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    validations.email ? 'border-green-300' : 'border-gray-300'
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {formData.email && (
                  <CheckCircle className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    validations.email ? 'text-green-500' : 'text-gray-300'
                  }`} />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a password"
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    validations.password ? 'border-green-300' : 'border-gray-300'
                  }`}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !validations.username || !validations.email || !validations.password}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;