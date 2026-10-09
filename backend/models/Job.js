const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
  companyName: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  salary: { type: Number, required: true }, // Hourly or Daily rate
  workingHours: { type: String, required: true },
  duration: { type: Number, required: true }, // 2 to 4 days
  vacancies: { type: Number, required: true },
  skillsRequired: [{ type: String }],
  locationName: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  date: { type: String, required: true }, // Start Date e.g. "2026-08-05"
  dressCode: { type: String },
  contactPerson: { type: String, required: true },
  emergency: { type: Boolean, default: false },
  aiFakeScore: { type: Number, default: 0 },
  aiAnalysis: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);
