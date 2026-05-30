const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'zenspace_super_secret_key_1337';

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Format token tidak valid. Harus "Bearer <token>".' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ message: 'Token kedaluwarsa atau tidak valid.' });
  }
};

module.exports = authMiddleware;