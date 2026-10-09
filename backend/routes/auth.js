const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const Employer = require('../models/Employer');

// Simple Email / Password Login Check
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // 1. Check Admin
    if (email === 'admin@instajob.com' && password === 'adminpassword') {
      return res.json({
        role: 'admin',
        user: { name: 'InstaJob Administrator', email: 'admin@instajob.com' }
      });
    }

    // 2. Check Worker Collection
    const worker = await Worker.findOne({ email, password });
    if (worker) {
      return res.json({
        role: 'worker',
        user: worker
      });
    }

    // 3. Check Employer Collection
    const employer = await Employer.findOne({ email, password });
    if (employer) {
      return res.json({
        role: 'employer',
        user: employer
      });
    }

    // 4. Mismatch
    return res.status(401).json({ error: 'Invalid email or password.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper route to get current session details from headers (used to validate existing session on app load)
router.get('/me', async (req, res) => {
  const role = req.headers['x-role'];
  const userId = req.headers['x-user-id'];

  try {
    if (role === 'worker' && userId) {
      const worker = await Worker.findById(userId);
      if (worker) return res.json({ role, user: worker });
    } else if (role === 'employer' && userId) {
      const employer = await Employer.findById(userId);
      if (employer) return res.json({ role, user: employer });
    } else if (role === 'admin') {
      return res.json({
        role: 'admin',
        user: { name: 'InstaJob Administrator', email: 'admin@instajob.com' }
      });
    }
    
    // No valid session details found in headers
    res.status(401).json({ error: 'No active session found.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
