const mongoose = require('mongoose');

const EmployerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, default: 'password123' },
  phone: { type: String, required: true },
  industry: { type: String, required: true },
  rating: { type: Number, default: 5 },
  description: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Employer', EmployerSchema);
