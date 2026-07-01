const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    filename: String,
    extractedText: String,
    atsScore: {
      type: Number,
      default: null,
    },
    feedback: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    jobDescription: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);