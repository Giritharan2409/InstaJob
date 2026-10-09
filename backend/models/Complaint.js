const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reporterType: { type: String, enum: ['Worker', 'Employer'], required: true },
  reportedId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reportedType: { type: String, enum: ['Worker', 'Employer', 'Job'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'resolved', 'dismissed'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
