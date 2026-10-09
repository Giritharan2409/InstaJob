const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
  amount: { type: Number, required: true },
  upiId: { type: String, default: 'worker@upi' },
  transactionId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed'], 
    default: 'success' 
  },
  releasedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);
