const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Worker = require('../models/Worker');
const Employer = require('../models/Employer');
const Job = require('../models/Job');

// Submit a rating
router.post('/', async (req, res) => {
  const reviewerId = req.headers['x-user-id'];
  const reviewerType = req.headers['x-role'] === 'worker' ? 'Worker' : 'Employer';

  if (!reviewerId) return res.status(400).json({ error: 'x-user-id header is required' });

  const {
    jobId,
    revieweeId,
    revieweeType,
    punctuality,
    workQuality,
    behaviour,
    communication,
    paymentSpeed,
    workEnvironment,
    management,
    safety,
    overallRating,
    comment
  } = req.body;

  try {
    const rating = new Rating({
      jobId,
      reviewerId,
      reviewerType,
      revieweeId,
      revieweeType,
      punctuality,
      workQuality,
      behaviour,
      communication,
      paymentSpeed,
      workEnvironment,
      management,
      safety,
      overallRating: parseInt(overallRating),
      comment
    });

    await rating.save();

    // Update profiles based on rating details
    if (revieweeType === 'Worker') {
      const worker = await Worker.findById(revieweeId);
      if (worker) {
        // Adjust trust score dynamically based on performance
        let scoreAdjustment = 0;
        if (overallRating >= 4) {
          scoreAdjustment = 3; // boost score
        } else if (overallRating <= 2) {
          scoreAdjustment = -10; // penalty
        }
        
        worker.trustScore = Math.min(100, Math.max(0, worker.trustScore + scoreAdjustment));
        
        // Add badges if rating is excellent
        if (overallRating === 5 && !worker.badges.includes('Star Performer')) {
          worker.badges.push('Star Performer');
        }
        await worker.save();
      }
    } else if (revieweeType === 'Employer') {
      const employer = await Employer.findById(revieweeId);
      if (employer) {
        // Re-compute average rating for employer
        const ratings = await Rating.find({ revieweeId, revieweeType: 'Employer' });
        const sum = ratings.reduce((acc, curr) => acc + curr.overallRating, 0);
        employer.rating = parseFloat((sum / ratings.length).toFixed(1));
        await employer.save();
      }
    }

    res.status(201).json(rating);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
