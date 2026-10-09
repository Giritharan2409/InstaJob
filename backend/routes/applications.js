const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const Worker = require('../models/Worker');
const Employer = require('../models/Employer');
const Certificate = require('../models/Certificate');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const aiService = require('../services/aiService');

// Apply for a job
router.post('/apply', async (req, res) => {
  const workerId = req.headers['x-user-id'];
  if (!workerId) return res.status(400).json({ error: 'x-user-id header is required' });

  const { jobId } = req.body;

  try {
    // Check if already applied
    const existingApp = await Application.findOne({ jobId, workerId });
    if (existingApp) {
      return res.status(400).json({ error: 'You have already applied for this job.' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    // Calculate AI matching compatibility
    const aiMatch = await aiService.getMatchScore(worker, job);

    const app = new Application({
      jobId,
      workerId,
      status: 'applied',
      aiMatchScore: aiMatch.score,
      aiMatchExplanation: aiMatch.explanation
    });

    await app.save();

    // Create notification for employer
    const notify = new Notification({
      recipientId: job.employerId,
      recipientType: 'Employer',
      title: 'New Job Applicant',
      message: `${worker.name} applied for your job listing: "${job.title}" (AI Compatibility: ${aiMatch.score}%)`
    });
    await notify.save();

    res.status(201).json(app);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get applications for current worker
router.get('/worker', async (req, res) => {
  const workerId = req.headers['x-user-id'];
  if (!workerId) return res.status(400).json({ error: 'x-user-id header is required' });

  try {
    const apps = await Application.find({ workerId }).populate('jobId').sort({ appliedAt: -1 });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get applications/applicants for a job (sorted by AI match score)
router.get('/job/:jobId', async (req, res) => {
  try {
    const apps = await Application.find({ jobId: req.params.jobId })
      .populate('workerId')
      .sort({ aiMatchScore: -1 });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Application Status (select, reject, work_started, completed, paid)
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  try {
    const app = await Application.findById(appId = req.params.id).populate('jobId').populate('workerId');
    if (!app) return res.status(404).json({ error: 'Application not found' });

    app.status = status;
    if (status === 'selected') {
      app.selectedAt = new Date();
    } else if (status === 'completed') {
      app.completedAt = new Date();

      // Generate digital work certificate
      const certCount = await Certificate.countDocuments({});
      const serialNum = `CERT-INSTA-${1000 + certCount}-${Math.floor(100 + Math.random() * 900)}`;

      const certificate = new Certificate({
        workerId: app.workerId._id,
        jobId: app.jobId._id,
        title: app.jobId.title,
        companyName: app.jobId.companyName,
        description: `This certifies that ${app.workerId.name} has successfully completed a short-term employment engagement as a ${app.jobId.title} from ${app.jobId.date} for a duration of ${app.jobId.duration} days.`,
        verificationCode: serialNum
      });
      await certificate.save();

      // Notify Worker
      const notifyCert = new Notification({
        recipientId: app.workerId._id,
        recipientType: 'Worker',
        title: 'Work Certificate Issued',
        message: `Congratulations! A digital work certificate has been issued for your work at "${app.jobId.companyName}".`
      });
      await notifyCert.save();

    } else if (status === 'paid') {
      app.paymentReleasedAt = new Date();

      // Calculate total earnings
      // Salary is hourly, let's assume duration * 8 hours per day
      const jobDuration = app.jobId.duration || 3;
      const hourlyRate = app.jobId.salary || 20;
      const totalAmount = jobDuration * 8 * hourlyRate;

      // Update worker earnings and badges
      const worker = await Worker.findById(app.workerId._id);
      if (worker) {
        worker.earnings += totalAmount;
        // Issue badges based on benchmarks
        if (worker.earnings >= 1000 && !worker.badges.includes('Elite Earner')) {
          worker.badges.push('Elite Earner');
        }
        if (worker.badges.length === 0) {
          worker.badges.push('Quick Starter');
        }
        await worker.save();
      }

      // Create Payment log
      const txId = `UPI-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const payment = new Payment({
        applicationId: app._id,
        jobId: app.jobId._id,
        workerId: app.workerId._id,
        employerId: app.jobId.employerId,
        amount: totalAmount,
        upiId: `${worker ? worker.phone : '9988776655'}@okaxis`,
        transactionId: txId,
        status: 'success'
      });
      await payment.save();

      // Notify Worker
      const notifyPayment = new Notification({
        recipientId: app.workerId._id,
        recipientType: 'Worker',
        title: 'Payment Released',
        message: `Your payment of $${totalAmount} for "${app.jobId.title}" has been successfully transferred via UPI.`
      });
      await notifyPayment.save();
    }

    await app.save();

    // Notify user of status update
    const statusNotify = new Notification({
      recipientId: app.workerId._id,
      recipientType: 'Worker',
      title: 'Application Status Updated',
      message: `Your application status for "${app.jobId.title}" at ${app.jobId.companyName} has been updated to "${status.replace('_', ' ')}".`
    });
    await statusNotify.save();

    res.json(app);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
