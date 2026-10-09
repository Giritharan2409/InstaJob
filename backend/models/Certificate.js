const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  title: { type: String, required: true }, // e.g., "Web Developer", "Event Assistant"
  companyName: { type: String, required: true },
  description: { type: String, required: true },
  verificationCode: { type: String, required: true, unique: true },
  issuedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Certificate', CertificateSchema);
