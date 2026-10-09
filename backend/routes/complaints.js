const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Worker = require('../models/Worker');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

// Create a complaint
router.post('/', async (req, res) => {
  const reporterId = req.headers['x-user-id'];
  const reporterType = req.headers['x-role'] === 'worker' ? 'Worker' : 'Employer';

  if (!reporterId) return res.status(400).json({ error: 'x-user-id header is required' });

  const { reportedId, reportedType, title, description } = req.body;

  try {
    const complaint = new Complaint({
      reporterId,
      reporterType,
      reportedId,
      reportedType,
      title,
      description,
      status: 'pending'
    });

    await complaint.save();
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all complaints (Admin action)
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find({}).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update complaint status (Admin action)
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    complaint.status = status;
    await complaint.save();

    // Optionally suspend user if complaint is resolved with critical flag
    if (status === 'resolved' && complaint.reportedType === 'Worker') {
      const worker = await Worker.findById(complaint.reportedId);
      if (worker) {
        // Decrease trust score heavily for being flagged
        worker.trustScore = Math.max(0, worker.trustScore - 20);
        await worker.save();
        
        // Notify worker
        const flagNotify = new Notification({
          recipientId: worker._id,
          recipientType: 'Worker',
          title: 'Account Warning',
          message: `Your account has been flagged regarding: "${complaint.title}". Trust score reduced. Repeated reports will lead to suspension.`
        });
        await flagNotify.save();
      }
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
