import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer eyJhbGciOiJIUzI1Ni...")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token is valid
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get the user from the token's ID and attach it to the request object
      // We exclude the password from the user object
      req.user = await User.findById(decoded.user.id).select('-password');
      
      // Move on to the next function (the actual controller)
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { protect };