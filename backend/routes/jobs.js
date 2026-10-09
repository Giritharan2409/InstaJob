const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Employer = require('../models/Employer');
const aiService = require('../services/aiService');

// Haversine formula to compute distance in km
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

// Get jobs list with filters (category, query search, emergency, nearby)
router.get('/', async (req, res) => {
  const { category, search, emergency, lat, lng, maxDistance } = req.query;

  try {
    let query = {};
    if (category) {
      query.category = category;
    }
    if (emergency === 'true') {
      query.emergency = true;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skillsRequired: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let jobs = await Job.find(query).sort({ createdAt: -1 });

    // Filter by coordinates if lat, lng and maxDistance are provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const distanceThreshold = parseFloat(maxDistance) || 15; // default 15km

      jobs = jobs.map(job => {
        const dist = getDistance(userLat, userLng, job.latitude, job.longitude);
        const jobObj = job.toObject();
        jobObj.distance = parseFloat(dist.toFixed(2));
        return jobObj;
      }).filter(job => job.distance <= distanceThreshold);

      // Sort by closest distance
      jobs.sort((a, b) => a.distance - b.distance);
    }

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single job's details
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post a new job
router.post('/', async (req, res) => {
  const employerId = req.headers['x-user-id'];
  if (!employerId) return res.status(400).json({ error: 'x-user-id header is required' });

  const {
    title,
    category,
    description,
    salary,
    workingHours,
    duration,
    vacancies,
    skillsRequired,
    locationName,
    latitude,
    longitude,
    date,
    dressCode,
    contactPerson,
    emergency
  } = req.body;

  try {
    const employer = await Employer.findById(employerId);
    if (!employer) return res.status(404).json({ error: 'Employer profile not found' });

    // Trigger AI Fake Job Detection
    const aiResult = await aiService.checkFakeJob({
      title,
      category,
      description,
      salary: parseFloat(salary),
      vacancies: parseInt(vacancies),
      contactPerson
    });

    const newJob = new Job({
      title,
      employerId,
      companyName: employer.companyName,
      category,
      description,
      salary: parseFloat(salary),
      workingHours,
      duration: parseInt(duration),
      vacancies: parseInt(vacancies),
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : skillsRequired.split(',').map(s => s.trim()),
      locationName,
      latitude: parseFloat(latitude) || 12.9716, // fallback Bangalore coordinates
      longitude: parseFloat(longitude) || 77.5946,
      date,
      dressCode,
      contactPerson,
      emergency: emergency === true || emergency === 'true',
      aiFakeScore: aiResult.fakeScore,
      aiAnalysis: aiResult.analysis
    });

    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a job
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
