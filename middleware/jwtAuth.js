const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
  // Get token from header
  const token = req.headers['x-auth-token'];

  // Check if no token is present
  if (!token) {
    return res.status(401).json({ msg: 'No token found' });
  }

  // Verify token
  try {
    const decoded = jwt.decode(token, config.get('jwtSecret'));

    req.user = decoded.user;
    next();
  } catch (err) {
    // Token not valid
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
