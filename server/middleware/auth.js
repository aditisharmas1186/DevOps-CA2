import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const requirePlan = (minPlan) => {
  const planHierarchy = { free: 0, pro: 1, enterprise: 2 };
  
  return (req, res, next) => {
    const userPlan = req.user.subscription.plan;
    
    if (planHierarchy[userPlan] < planHierarchy[minPlan]) {
      return res.status(403).json({ 
        message: `This feature requires a ${minPlan} plan or higher`,
        currentPlan: userPlan,
        requiredPlan: minPlan
      });
    }
    
    next();
  };
};