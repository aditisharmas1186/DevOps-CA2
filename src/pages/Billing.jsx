import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Check, 
  Star, 
  Calendar,
  AlertCircle,
  Download,
  Settings,
  Crown
} from 'lucide-react';
import { billingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Billing = () => {
  const [plans, setPlans] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const [plansResponse, subscriptionResponse] = await Promise.all([
        billingAPI.getPlans(),
        billingAPI.getSubscription()
      ]);
      
      setPlans(plansResponse.data.plans);
      setSubscription(subscriptionResponse.data);
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      toast.error('Failed to load billing information');
      
      // Set mock data for demo
      setPlans({
        free: {
          name: 'Free',
          price: 0,
          features: [
            'Up to 1,000 data records',
            'Basic analytics',
            'Monthly reports',
            'Email support'
          ],
          limits: { dataRecords: 1000, aiQueries: 10 }
        },
        pro: {
          name: 'Pro',
          price: 29,
          features: [
            'Up to 50,000 data records',
            'Advanced analytics',
            'Real-time insights',
            'AI-powered forecasting',
            'Weekly reports',
            'Priority support'
          ],
          limits: { dataRecords: 50000, aiQueries: 100 }
        },
        enterprise: {
          name: 'Enterprise',
          price: 99,
          features: [
            'Unlimited data records',
            'Custom analytics',
            'Real-time insights',
            'Advanced AI features',
            'Custom integrations',
            'Daily reports',
            'Dedicated support'
          ],
          limits: { dataRecords: Infinity, aiQueries: Infinity }
        }
      });
      
      setSubscription({
        subscription: {
          plan: 'free',
          status: 'active',
          currentPeriodEnd: null
        },
        planDetails: {
          name: 'Free',
          price: 0,
          features: [
            'Up to 1,000 data records',
            'Basic analytics',
            'Monthly reports',
            'Email support'
          ]
        },
        usage: {
          dataRecords: 250,
          aiQueries: 5,
          lastUpdated: new Date()
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    if (planId === 'free') return;
    
    setUpgrading(true);
    setSelectedPlan(planId);
    
    try {
      const response = await billingAPI.createCheckoutSession(planId);
      
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to start upgrade process');
    } finally {
      setUpgrading(false);
      setSelectedPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    
    try {
      await billingAPI.cancelSubscription();
      toast.success('Subscription will be canceled at the end of the current period');
      fetchBillingData();
    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      await billingAPI.reactivateSubscription();
      toast.success('Subscription reactivated successfully');
      fetchBillingData();
    } catch (error) {
      console.error('Reactivate subscription error:', error);
      toast.error('Failed to reactivate subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentPlan = subscription?.subscription?.plan || 'free';
  const planDetails = subscription?.planDetails;
  const usage = subscription?.usage;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Subscription</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your subscription and billing information.
        </p>
      </div>

      {/* Current Subscription */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                currentPlan === 'enterprise' ? 'bg-purple-100 dark:bg-purple-900/20' :
                currentPlan === 'pro' ? 'bg-blue-100 dark:bg-blue-900/20' :
                'bg-gray-100 dark:bg-gray-700'
              }`}>
                {currentPlan === 'enterprise' ? (
                  <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                ) : currentPlan === 'pro' ? (
                  <Star className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                ) : (
                  <CreditCard className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Current Plan: {planDetails?.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {planDetails?.price > 0 ? `$${planDetails.price}/month` : 'Free forever'}
                </p>
              </div>
            </div>
            
            {subscription?.subscription?.status === 'canceled' && (
              <button
                onClick={handleReactivateSubscription}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Reactivate
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Subscription Details */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Subscription Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`font-medium ${
                    subscription?.subscription?.status === 'active' ? 'text-green-600' :
                    subscription?.subscription?.status === 'canceled' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {subscription?.subscription?.status || 'Active'}
                  </span>
                </div>
                {subscription?.subscription?.currentPeriodEnd && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Next billing:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Plan type:</span>
                  <span className="text-gray-900 dark:text-white capitalize">{currentPlan}</span>
                </div>
              </div>
            </div>

            {/* Usage */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Current Usage</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Data Records</span>
                    <span className="text-gray-900 dark:text-white">
                      {usage?.dataRecords?.toLocaleString() || 0} / {plans?.[currentPlan]?.limits?.dataRecords === Infinity ? '∞' : plans?.[currentPlan]?.limits?.dataRecords?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((usage?.dataRecords || 0) / (plans?.[currentPlan]?.limits?.dataRecords || 1) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">AI Queries</span>
                    <span className="text-gray-900 dark:text-white">
                      {usage?.aiQueries || 0} / {plans?.[currentPlan]?.limits?.aiQueries === Infinity ? '∞' : plans?.[currentPlan]?.limits?.aiQueries || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-secondary-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((usage?.aiQueries || 0) / (plans?.[currentPlan]?.limits?.aiQueries || 1) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {currentPlan !== 'free' && subscription?.subscription?.status === 'active' && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Need to make changes to your subscription?
                  </span>
                </div>
                <button
                  onClick={handleCancelSubscription}
                  className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Plans</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Choose the plan that best fits your business needs.
          </p>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {plans && Object.entries(plans).map(([planId, plan]) => (
              <div 
                key={planId}
                className={`
                  relative border rounded-xl p-6 transition-all duration-200
                  ${currentPlan === planId 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                  }
                  ${planId === 'pro' ? 'ring-2 ring-primary-500 ring-opacity-50' : ''}
                `}
              >
                {planId === 'pro' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {currentPlan === planId && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h4>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(planId)}
                  disabled={currentPlan === planId || upgrading}
                  className={`
                    w-full py-3 px-4 rounded-lg font-medium transition-colors
                    ${currentPlan === planId
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : planId === 'free'
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50'
                    }
                  `}
                >
                  {upgrading && selectedPlan === planId ? (
                    <LoadingSpinner size="sm" />
                  ) : currentPlan === planId ? (
                    'Current Plan'
                  ) : planId === 'free' ? (
                    'Downgrade'
                  ) : (
                    'Upgrade'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Billing History</h3>
            <button className="flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Download className="w-4 h-4 mr-1" />
              Download All
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No billing history available</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Your billing history will appear here once you have transactions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;