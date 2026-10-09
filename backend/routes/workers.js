const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const Certificate = require('../models/Certificate');
const Payment = require('../models/Payment');
const Rating = require('../models/Rating');

// Get all workers (for Admin dashboard)
router.get('/', async (req, res) => {
  try {
    const workers = await Worker.find({});
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get worker profile with sub-resources (certificates, payments, ratings)
router.get('/profile', async (req, res) => {
  const workerId = req.headers['x-user-id'];
  if (!workerId) return res.status(400).json({ error: 'x-user-id header is required' });

  try {
    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const certificates = await Certificate.find({ workerId });
    const payments = await Payment.find({ workerId }).sort({ releasedAt: -1 });
    const ratings = await Rating.find({ revieweeId: workerId }).sort({ createdAt: -1 });

    res.json({
      worker,
      certificates,
      payments,
      ratings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update worker profile
router.put('/profile', async (req, res) => {
  const workerId = req.headers['x-user-id'];
  if (!workerId) return res.status(400).json({ error: 'x-user-id header is required' });

  const { skills, preferredCategory, availability, bio, phone } = req.body;

  try {
    const worker = await Worker.findByIdAndUpdate(
      workerId,
      { skills, preferredCategory, availability, bio, phone },
      { new: true }
    );
    res.json(worker);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle suspend status of user (Admin action)
router.patch('/:id/suspend', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    
    // Toggle suspension via a badge or trust score manipulation for demonstration
    // Since we don't have separate boolean flag in model, let's decrease trustScore to 0 to suspend
    const newScore = worker.trustScore === 0 ? 100 : 0;
    worker.trustScore = newScore;
    await worker.save();
    
    res.json({ message: `Worker suspension toggled. Trust score is now ${newScore}.`, worker });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
