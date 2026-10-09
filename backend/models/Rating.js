const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reviewerType: { type: String, enum: ['Worker', 'Employer'], required: true },
  revieweeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  revieweeType: { type: String, enum: ['Worker', 'Employer'], required: true },
  
  // Worker-specific ratings (provided by Employer)
  punctuality: { type: Number, min: 1, max: 5 },
  workQuality: { type: Number, min: 1, max: 5 },
  behaviour: { type: Number, min: 1, max: 5 },
  communication: { type: Number, min: 1, max: 5 },
  
  // Employer-specific ratings (provided by Worker)
  paymentSpeed: { type: Number, min: 1, max: 5 },
  workEnvironment: { type: Number, min: 1, max: 5 },
  management: { type: Number, min: 1, max: 5 },
  safety: { type: Number, min: 1, max: 5 },
  
  overallRating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rating', RatingSchema);
