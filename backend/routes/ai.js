const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const Job = require('../models/Job');
const aiService = require('../services/aiService');

// Get AI Career Guidance
router.post('/career-guidance', async (req, res) => {
  const workerId = req.headers['x-user-id'];
  if (!workerId) return res.status(400).json({ error: 'x-user-id header is required' });

  try {
    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ error: 'Worker profile not found' });

    const guidance = await aiService.getCareerGuidance(worker);
    res.json({ guidance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate AI Resume
router.post('/resume', async (req, res) => {
  const workerId = req.headers['x-user-id'];
  if (!workerId) return res.status(400).json({ error: 'x-user-id header is required' });

  try {
    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ error: 'Worker profile not found' });

    const resume = await aiService.generateResume(worker);
    res.json({ resume });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Suggest Salary for posting
router.post('/salary-suggestion', async (req, res) => {
  const { title, skillsRequired } = req.body;
  if (!title) return res.status(400).json({ error: 'Job title is required' });

  try {
    const skills = Array.isArray(skillsRequired) ? skillsRequired : (skillsRequired || '').split(',').map(s => s.trim());
    const suggestion = await aiService.getSalarySuggestion(title, skills);
    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI Smart Recommendations for the current Worker (Jobs they should apply for)
router.get('/recommendations', async (req, res) => {
  const workerId = req.headers['x-user-id'];
  if (!workerId) return res.status(400).json({ error: 'x-user-id header is required' });

  try {
    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    // Fetch all active jobs
    const jobs = await Job.find({});
    
    // Compute match score for all jobs and sort
    const matchedJobs = [];
    for (const job of jobs) {
      const match = await aiService.getMatchScore(worker, job);
      matchedJobs.push({
        job,
        score: match.score,
        explanation: match.explanation
      });
    }

    // Sort by compatibility score
    matchedJobs.sort((a, b) => b.score - a.score);

    res.json(matchedJobs.slice(0, 5)); // top 5 recommendations
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI Worker Recommendations for a specific Job
router.get('/workers-for-job/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const workers = await Worker.find({});
    const matches = [];

    for (const worker of workers) {
      const match = await aiService.getMatchScore(worker, job);
      matches.push({
        worker,
        score: match.score,
        explanation: match.explanation
      });
    }

    matches.sort((a, b) => b.score - a.score);
    res.json(matches.slice(0, 5)); // top 5 candidates
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
