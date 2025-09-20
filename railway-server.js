const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Legal Analyzer on Railway...');
console.log(`📅 Port: ${PORT}`);

// Import fetch for Node.js (using dynamic import)
let fetch;
const importFetch = async () => {
  const module = await import('node-fetch');
  fetch = module.default;
};

// Initialize fetch
importFetch();

// Start Python AI service in background
console.log('🐍 Starting Python AI service...');
const pythonProcess = spawn('python3', ['google_legal_analyzer.py'], {
    stdio: 'pipe',
    cwd: process.cwd(),
    env: { ...process.env, PORT: '5001' }
});

pythonProcess.stdout.on('data', (data) => {
    console.log(`🐍 Python: ${data}`);
});

pythonProcess.stderr.on('data', (data) => {
    console.log(`🐍 Python Error: ${data}`);
});

pythonProcess.on('error', (error) => {
    console.error('❌ Python AI Service error:', error.message);
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend/public directory
app.use(express.static(path.join(__dirname, 'frontend/public')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Legal Analyzer API is working on Railway!', 
    timestamp: new Date().toISOString(),
    status: 'OK',
    port: PORT
  });
});

// AI service status check
app.get('/api/ai-status', async (req, res) => {
  try {
    if (!fetch) {
      await importFetch();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const healthResponse = await fetch('http://localhost:5001/api/health', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      res.json({
        aiService: 'available',
        status: 'Google Cloud AI service is running',
        details: healthData
      });
    } else {
      res.json({
        aiService: 'unavailable',
        status: 'AI service not responding',
        statusCode: healthResponse.status,
        fallback: 'Using mock data'
      });
    }
  } catch (error) {
    res.json({
      aiService: 'unavailable',
      status: 'AI service connection failed',
      error: error.message,
      fallback: 'Using mock data'
    });
  }
});

// Upload endpoint with AI integration
app.post('/api/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File uploaded:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Ensure fetch is available
    if (!fetch) {
      await importFetch();
    }

    try {
      console.log('Checking AI service health...');
      
      // Check if Python AI service is available with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const healthResponse = await fetch('http://localhost:5001/api/health', {
        signal: controller.signal,
        timeout: 5000
      });
      
      clearTimeout(timeoutId);
      
      if (!healthResponse.ok) {
        throw new Error(`AI service responded with status: ${healthResponse.status}`);
      }

      console.log('AI service is healthy, sending file for analysis...');

      // Create form data for file upload
      const formData = new FormData();
      formData.append('document', fs.createReadStream(req.file.path), {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });

      // Send file to Python AI service for analysis
      const analysisController = new AbortController();
      const analysisTimeoutId = setTimeout(() => analysisController.abort(), 120000);

      const analysisResponse = await fetch('http://localhost:5001/api/analyze', {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(),
        signal: analysisController.signal
      });

      clearTimeout(analysisTimeoutId);

      if (!analysisResponse.ok) {
        const errorText = await analysisResponse.text();
        throw new Error(`AI analysis failed (${analysisResponse.status}): ${errorText}`);
      }

      const analysisResult = await analysisResponse.json();
      
      console.log('AI analysis completed successfully');
      
      // Return the AI analysis result
      res.json({
        message: 'Analysis complete using Google Cloud AI',
        fileName: req.file.originalname,
        analysis: analysisResult.analysis,
        aiProvider: 'Google Cloud AI (Gemini)'
      });

    } catch (aiError) {
      console.warn('AI service error, falling back to mock data:', aiError.message);
      
      // Fallback to mock analysis if AI service is unavailable
      res.json({
        message: 'Analysis complete (Mock data - AI service unavailable)',
        fileName: req.file.originalname,
        analysis: {
          documentType: 'Contract Agreement',
          summary: `Analysis of ${req.file.originalname}: This appears to be a legal document that requires professional review.`,
          keyPoints: [
            `Document uploaded: ${req.file.originalname}`,
            `File size: ${(req.file.size / 1024).toFixed(1)} KB`,
            'Professional legal review recommended'
          ],
          risks: [
            'This is mock data - AI service temporarily unavailable',
            'Full analysis requires Google Cloud AI setup'
          ],
          recommendations: [
            'Try again in a few moments',
            'Ensure Google AI API key is configured'
          ]
        },
        note: 'Mock data used - AI service error: ' + aiError.message
      });
    }

    // Clean up the uploaded file after a delay
    setTimeout(() => {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        console.log('Cleaned up uploaded file:', req.file.filename);
      }
    }, 30000);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Server error during upload',
      details: error.message 
    });
  }
});

// Handle file upload errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ error: error.message });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/public/index.html'));
});

// Catch all handler for SPA-like behavior
app.get('*', (req, res) => {
  // Check if it's an API route that doesn't exist
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // For non-API routes, serve the appropriate HTML file or index.html
  const requestedFile = req.path === '/' ? 'index.html' : req.path.substring(1);
  const filePath = path.join(__dirname, 'frontend/public', requestedFile);
  
  // Check if the requested file exists
  if (fs.existsSync(filePath) && requestedFile.endsWith('.html')) {
    res.sendFile(filePath);
  } else {
    // Default to index.html for unknown routes
    res.sendFile(path.join(__dirname, 'frontend/public/index.html'));
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Legal Analyzer running on Railway: http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'frontend/public')}`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`📄 Main page: http://localhost:${PORT}`);
  console.log(`🐍 Python AI service: http://localhost:5001`);
  console.log(`✅ Ready to analyze legal documents!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  if (pythonProcess) {
    pythonProcess.kill('SIGTERM');
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  if (pythonProcess) {
    pythonProcess.kill('SIGTERM');
  }
  process.exit(0);
});
