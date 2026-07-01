const Resume = require('../models/Resume');
const { extractTextFromPDF } = require('../services/pdfService');
const { calculateATSScore } = require('../services/atsService');
const { analyzeResumeWithAI } = require('../services/geminiService');

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const extractedText = await extractTextFromPDF(req.file.buffer);
    const { score, feedback } = calculateATSScore(extractedText);
    const jobDescription = req.body.jobDescription || '';

    let aiFeedback = null;
    try {
      aiFeedback = await analyzeResumeWithAI(extractedText, jobDescription);
    } catch (aiError) {
      console.warn('Gemini AI unavailable:', aiError.message);
    }

    const resume = await Resume.create({
      user: req.user._id,
      filename: req.file.originalname,
      extractedText,
      atsScore: score,
      feedback: {
        ats: feedback,
        ai: aiFeedback,
      },
      jobDescription,
      status: 'completed',
    });

    res.status(201).json({
      message: 'Resume analyzed successfully',
      resume: {
        id: resume._id,
        filename: resume.filename,
        atsScore: resume.atsScore,
        feedback: resume.feedback,
        status: resume.status,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-extractedText');
    res.status(200).json({ resumes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.status(200).json({ resume });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};