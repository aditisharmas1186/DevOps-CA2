import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  Brain, 
  Upload, 
  Shield, 
  Zap,
  Users,
  DollarSign,
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Upload,
      title: 'Easy Data Import',
      description: 'Upload CSV, Excel files or connect via APIs like Google Sheets and Stripe'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Visualize KPIs, track revenue, customers, and growth metrics in real-time'
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Get intelligent business recommendations and forecasts powered by OpenAI'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with encrypted data storage and secure API connections'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO, TechStart',
      content: 'This dashboard transformed how we understand our business metrics. The AI insights are incredibly valuable.',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2'
    },
    {
      name: 'Michael Chen',
      role: 'Founder, DataCorp',
      content: 'The forecasting capabilities helped us plan our growth strategy and secure our Series A funding.',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Smart SaaS Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-primary-600 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your Business Data into
              <span className="text-primary-600"> Actionable Insights</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Upload your business data and get AI-powered analytics, forecasts, and recommendations 
              to drive growth and make smarter decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg">
                Watch Demo
              </button>
            </div>
            
            <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Enterprise Security
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Real-time Analytics
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                1000+ Happy Customers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to understand your business
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From data upload to AI insights, we provide all the tools you need to make data-driven decisions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Beautiful, Intuitive Dashboard
            </h2>
            <p className="text-xl text-gray-600">
              Get a complete view of your business metrics in one place
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-2xl">
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="h-96 bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-24 h-24 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900">Dashboard Preview</h3>
                  <p className="text-gray-600 mt-2">Interactive charts, KPIs, and real-time data</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by growing businesses
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
                <p className="text-gray-600 mb-6 text-lg italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that's right for your business
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 text-green-500 mr-3" />
                  Up to 1,000 data records
                </li>
                <li className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 text-green-500 mr-3" />
                  Basic analytics
                </li>
                <li className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 text-green-500 mr-3" />
                  Monthly reports
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full bg-gray-100 text-gray-900 text-center py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-primary-600 text-white rounded-xl p-8 transform scale-105">
              <h3 className="text-xl font-semibold mb-4">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$29</span>
                <span className="opacity-80">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <DollarSign className="w-4 h-4 text-green-300 mr-3" />
                  Up to 50,000 data records
                </li>
                <li className="flex items-center">
                  <DollarSign className="w-4 h-4 text-green-300 mr-3" />
                  Advanced analytics
                </li>
                <li className="flex items-center">
                  <DollarSign className="w-4 h-4 text-green-300 mr-3" />
                  AI-powered forecasting
                </li>
                <li className="flex items-center">
                  <DollarSign className="w-4 h-4 text-green-300 mr-3" />
                  Weekly reports
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full bg-white text-primary-600 text-center py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 text-green-500 mr-3" />
                  Unlimited data records
                </li>
                <li className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 text-green-500 mr-3" />
                  Custom analytics
                </li>
                <li className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 text-green-500 mr-3" />
                  Advanced AI features
                </li>
                <li className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 text-green-500 mr-3" />
                  Dedicated support
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full bg-gray-100 text-gray-900 text-center py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to transform your business data?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that use our platform to make smarter, data-driven decisions.
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg inline-flex items-center"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <TrendingUp className="w-8 h-8 text-primary-400" />
              <span className="text-xl font-bold">Smart SaaS Dashboard</span>
            </div>
            <p className="text-gray-400">
              © 2025 Smart SaaS Dashboard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;