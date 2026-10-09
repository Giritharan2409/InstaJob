const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  status: { 
    type: String, 
    enum: ['applied', 'selected', 'rejected', 'work_started', 'completed', 'paid'], 
    default: 'applied' 
  },
  aiMatchScore: { type: Number, default: 0 },
  aiMatchExplanation: { type: String },
  appliedAt: { type: Date, default: Date.now },
  selectedAt: { type: Date },
  completedAt: { type: Date },
  paymentReleasedAt: { type: Date }
});

module.exports = mongoose.model('Application', ApplicationSchema);
