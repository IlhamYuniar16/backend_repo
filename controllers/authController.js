const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'zenspace_super_secret_key_1337';

exports.register = async (req, res) => {
  console.log('Register request received:', req.body);
  
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    console.log('Validation failed: missing fields');
    return res.status(400).json({ message: 'Semua kolom input wajib diisi.' });
  }

  if (password.length < 6) {
    console.log('Validation failed: password too short');
    return res.status(400).json({ message: 'Password minimal harus terdiri dari 6 karakter.' });
  }

  try {
    console.log('Checking if user exists:', email);
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'Email sudah terdaftar. Gunakan email lain.' });
    }

    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Saving user to database...');
    const newUser = await db.saveUser({
      name,
      email,
      password: hashedPassword
    });

    console.log('User saved successfully:', newUser.id);

    console.log('Generating token...');
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Registration successful');
    res.status(201).json({
      message: 'Registrasi berhasil!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Registration error details:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server.',
      error: error.message 
    });
  }
};

exports.login = async (req, res) => {
  console.log('Login request received:', req.body);
  
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('Validation failed: missing email or password');
    return res.status(400).json({ message: 'Email dan password wajib diisi.' });
  }

  try {
    console.log('Finding user by email:', email);
    const user = await db.findUserByEmail(email);
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Kredensial tidak valid (Email tidak terdaftar).' });
    }

    console.log('User found, checking password...');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('Password incorrect for user:', email);
      return res.status(400).json({ message: 'Kredensial tidak valid (Password salah).' });
    }

    console.log('Password correct, generating token...');
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Login successful for user:', email);
    res.json({
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error details:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server.',
      error: error.message 
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    console.log('Get profile for user:', req.user.id);
    const user = await db.findUserById(req.user.id);
    
    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server.',
      error: error.message 
    });
  }
}; 