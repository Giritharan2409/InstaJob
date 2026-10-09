const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, default: 'password123' },
  phone: { type: String, required: true },
  skills: [{ type: String }],
  preferredCategory: { type: String, required: true },
  availability: { type: String, required: true },
  trustScore: { type: Number, default: 100 },
  earnings: { type: Number, default: 0 },
  badges: [{ type: String }],
  bio: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Worker', WorkerSchema);
