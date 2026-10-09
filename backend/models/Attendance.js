const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  checkInTime: { type: Date, default: Date.now },
  checkInLat: { type: Number },
  checkInLng: { type: Number },
  checkOutTime: { type: Date },
  checkOutLat: { type: Number },
  checkOutLng: { type: Number },
  status: { 
    type: String, 
    enum: ['checked_in', 'checked_out', 'absent', 'flagged'], 
    default: 'checked_in' 
  },
  gpsVerified: { type: Boolean, default: true }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
