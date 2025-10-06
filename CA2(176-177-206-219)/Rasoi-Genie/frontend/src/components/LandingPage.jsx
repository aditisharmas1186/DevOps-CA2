import { ChefHat, Calendar, Heart, Clock, Utensils, ArrowRight, PlayCircle, ShoppingCart, Download } from 'lucide-react';

function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-4">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <span className="text-2xl font-bold text-gray-800">MealPlanner</span>
          </div>
          <div className="space-x-4">
            <button 
              onClick={() => onNavigate('login')}
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => onNavigate('signup')}
              className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition-colors font-medium"
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Never Wonder
            <span className="text-orange-600 block">What to Cook Again</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Get personalized weekly meal plans tailored to your taste, dietary preferences, and cooking time. 
            Make every meal a delightful experience for your Indian household.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => onNavigate('signup')}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <span>Start Planning Meals</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors">
              <PlayCircle className="h-6 w-6" />
              <span>Watch Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
            Everything You Need for Perfect Meal Planning
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-lg transition-shadow">
              <Calendar className="h-16 w-16 text-orange-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Weekly Menu Planning</h3>
              <p className="text-gray-600">Get a complete week's menu with balanced, diverse meals that never repeat.</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow">
              <Heart className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Health-Conscious</h3>
              <p className="text-gray-600">Accommodates diabetes, cholesterol, blood pressure, and other health conditions.</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-lg transition-shadow">
              <Clock className="h-16 w-16 text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Time-Flexible</h3>
              <p className="text-gray-600">Choose cooking times from 15 to 45 minutes based on your schedule.</p>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-16">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50">
              <Utensils className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Regional Cuisines</h4>
              <p className="text-sm text-gray-600">North Indian, South Indian, Gujarati, Marathi, Bengali, Punjabi</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50">
              <PlayCircle className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Recipe Videos</h4>
              <p className="text-sm text-gray-600">YouTube recipe recommendations for every dish</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-teal-50 to-green-50">
              <ShoppingCart className="h-12 w-12 text-teal-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Smart Grocery Lists</h4>
              <p className="text-sm text-gray-600">Auto-generated shopping lists for your meal plan</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50">
              <Download className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Printable Menus</h4>
              <p className="text-sm text-gray-600">Download and print your weekly meal plans</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Kitchen?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of Indian families who've simplified their meal planning</p>
          <button 
            onClick={() => onNavigate('signup')}
            className="bg-white text-orange-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Get Started for Free
          </button>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;