const express = require('express');
const router = express.Router();
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Rating = require('../models/Rating');

// Get all employers (for Admin dashboard)
router.get('/', async (req, res) => {
  try {
    const employers = await Employer.find({});
    res.json(employers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get employer profile details
router.get('/profile', async (req, res) => {
  const employerId = req.headers['x-user-id'];
  if (!employerId) return res.status(400).json({ error: 'x-user-id header is required' });

  try {
    const employer = await Employer.findById(employerId);
    if (!employer) return res.status(404).json({ error: 'Employer not found' });

    const jobs = await Job.find({ employerId }).sort({ createdAt: -1 });
    const ratings = await Rating.find({ revieweeId: employerId }).sort({ createdAt: -1 });

    res.json({
      employer,
      jobs,
      ratings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update employer profile
router.put('/profile', async (req, res) => {
  const employerId = req.headers['x-user-id'];
  if (!employerId) return res.status(400).json({ error: 'x-user-id header is required' });

  const { companyName, phone, industry, description, address, name } = req.body;

  try {
    const employer = await Employer.findByIdAndUpdate(
      employerId,
      { companyName, phone, industry, description, address, name },
      { new: true }
    );
    res.json(employer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
