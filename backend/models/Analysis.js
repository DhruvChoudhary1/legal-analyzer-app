const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  documentType: String,
  summary: String,
  keyPoints: [String],
  parties: [String],
  importantDates: [String],
  paymentTerms: [String],
  risks: [String],
  recommendations: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analysis', analysisSchema);