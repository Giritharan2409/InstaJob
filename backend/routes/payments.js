const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

// Get payment history
router.get('/history', async (req, res) => {
  const role = req.headers['x-role'];
  const userId = req.headers['x-user-id'];

  if (!userId) return res.status(400).json({ error: 'x-user-id header is required' });

  try {
    let query = {};
    if (role === 'worker') {
      query.workerId = userId;
    } else if (role === 'employer') {
      query.employerId = userId;
    } else {
      // Admin sees all
      query = {};
    }

    const history = await Payment.find(query)
      .populate('jobId')
      .populate('workerId')
      .populate('employerId')
      .sort({ releasedAt: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
