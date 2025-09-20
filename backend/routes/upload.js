const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { PythonShell } = require('python-shell');
const Analysis = require('../models/Analysis');
const path = require('path');
const fs = require('fs');

// Upload and analyze document
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Call Python script to analyze the document
    const options = {
      mode: 'text',
      pythonPath: 'python3', // or 'python' depending on your system
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.join(__dirname, '..', '..'),
      args: [req.file.path]
    };

    PythonShell.run('legal_analyzer.py', options, async (err, results) => {
      if (err) {
        console.error('Python error:', err);
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(500).json({ error: 'Error analyzing document' });
      }

      try {
        // Parse the analysis results
        const analysisText = results.join('');
        const analysisData = parseAnalysisResults(analysisText);

        // Save to database
        const analysisRecord = new Analysis({
          filename: req.file.filename,
          originalName: req.file.originalname,
          fileType: path.extname(req.file.originalname).substring(1),
          ...analysisData
        });

        await analysisRecord.save();

        // Send response
        res.json({
          message: 'Analysis complete',
          analysis: analysisData,
          id: analysisRecord._id
        });

        // Clean up uploaded file after processing
        setTimeout(() => {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        }, 5000);

      } catch (parseError) {
        console.error('Parse error:', parseError);
        res.status(500).json({ error: 'Error parsing analysis results' });
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

// Get analysis by ID
router.get('/analysis/:id', async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    res.json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all analyses
router.get('/analyses', async (req, res) => {
  try {
    const analyses = await Analysis.find().sort({ createdAt: -1 });
    res.json(analyses);
  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to parse analysis results
function parseAnalysisResults(text) {
  const result = {
    documentType: '',
    summary: '',
    keyPoints: [],
    parties: [],
    importantDates: [],
    paymentTerms: [],
    risks: [],
    recommendations: []
  };

  const lines = text.split('\n');
  let currentSection = '';

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) continue;

    // Check for section headers
    if (trimmedLine.endsWith(':')) {
      const section = trimmedLine.toLowerCase().replace(':', '').trim();
      if (section in result) {
        currentSection = section;
      }
      continue;
    }

    // Parse content based on current section
    if (currentSection && trimmedLine.startsWith('-')) {
      const content = trimmedLine.substring(1).trim();
      if (currentSection === 'keypoints') {
        result.keyPoints.push(content);
      } else if (currentSection === 'parties') {
        result.parties.push(content);
      } else if (currentSection === 'importantdates') {
        result.importantDates.push(content);
      } else if (currentSection === 'payment/money') {
        result.paymentTerms.push(content);
      } else if (currentSection === 'risks') {
        result.risks.push(content);
      } else if (currentSection === 'recommendations') {
        result.recommendations.push(content);
      }
    } else if (currentSection === 'documenttype' && !result.documentType) {
      result.documentType = trimmedLine;
    } else if (currentSection === 'summary' && !result.summary) {
      result.summary = (result.summary ? result.summary + ' ' : '') + trimmedLine;
    }
  }

  return result;
}

module.exports = router;