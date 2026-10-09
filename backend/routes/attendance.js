const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Worker = require('../models/Worker');
const Notification = require('../models/Notification');

// Distance calculation utility
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// QR & GPS Check-In
router.post('/check-in', async (req, res) => {
  const workerId = req.headers['x-user-id'];
  if (!workerId) return res.status(400).json({ error: 'x-user-id header is required' });

  const { applicationId, lat, lng, qrCodeContent } = req.body;

  try {
    const app = await Application.findById(applicationId).populate('jobId');
    if (!app) return res.status(404).json({ error: 'Application record not found' });

    // Validate QR code content contains jobId for integrity
    if (qrCodeContent && !qrCodeContent.includes(app.jobId._id.toString())) {
      return res.status(400).json({ error: 'Invalid QR code scanned for this job site.' });
    }

    // Verify distance using GPS
    const jobLat = app.jobId.latitude;
    const jobLng = app.jobId.longitude;
    const distanceKm = getDistance(parseFloat(lat), parseFloat(lng), jobLat, jobLng);
    const gpsVerified = distanceKm <= 0.5; // verified if within 500 meters

    // Update application status to work_started if not already
    if (app.status === 'selected') {
      app.status = 'work_started';
      await app.save();
    }

    const attendance = new Attendance({
      applicationId,
      jobId: app.jobId._id,
      workerId,
      checkInTime: new Date(),
      checkInLat: parseFloat(lat),
      checkInLng: parseFloat(lng),
      gpsVerified,
      status: gpsVerified ? 'checked_in' : 'flagged'
    });

    await attendance.save();

    // Create Notification
    const alert = new Notification({
      recipientId: app.jobId.employerId,
      recipientType: 'Employer',
      title: 'Worker Checked In',
      message: `Worker checked in at "${app.jobId.title}". GPS Verification: ${gpsVerified ? 'Passed (within 500m)' : 'Flagged (Out of range)'}`
    });
    await alert.save();

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// QR & GPS Check-Out
router.post('/check-out', async (req, res) => {
  const workerId = req.headers['x-user-id'];
  if (!workerId) return res.status(400).json({ error: 'x-user-id header is required' });

  const { applicationId, lat, lng } = req.body;

  try {
    const attendance = await Attendance.findOne({ applicationId, workerId, status: { $in: ['checked_in', 'flagged'] } }).sort({ checkInTime: -1 });
    if (!attendance) {
      return res.status(400).json({ error: 'No active check-in session found for this worker.' });
    }

    const app = await Application.findById(applicationId).populate('jobId');
    const distanceKm = getDistance(parseFloat(lat), parseFloat(lng), app.jobId.latitude, app.jobId.longitude);
    const gpsVerified = distanceKm <= 0.5;

    attendance.checkOutTime = new Date();
    attendance.checkOutLat = parseFloat(lat);
    attendance.checkOutLng = parseFloat(lng);
    attendance.gpsVerified = attendance.gpsVerified && gpsVerified;
    attendance.status = 'checked_out';
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance logs for active worker
router.get('/worker', async (req, res) => {
  const workerId = req.headers['x-user-id'];
  if (!workerId) return res.status(400).json({ error: 'x-user-id header is required' });

  try {
    const logs = await Attendance.find({ workerId }).populate('jobId').sort({ checkInTime: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get job attendance checklist (For Employer to view check-ins for a job)
router.get('/job/:jobId', async (req, res) => {
  try {
    const logs = await Attendance.find({ jobId: req.params.jobId }).populate('workerId').sort({ checkInTime: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
