const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');

const app = express();
const PORT = 5000;

// Import fetch for Node.js (using dynamic import)
let fetch;
const importFetch = async () => {
  const module = await import('node-fetch');
  fetch = module.default;
};

// Initialize fetch
importFetch();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend/public directory
app.use(express.static(path.join(__dirname, '../frontend/public')));

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
    message: 'Backend server is working!', 
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// AI service status check
app.get('/api/ai-status', async (req, res) => {
  try {
    // Ensure fetch is available
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

// Get all analyses (placeholder)
app.get('/api/analyses', (req, res) => {
  res.json({
    message: 'Analyses endpoint working',
    analyses: []
  });
});

// Upload endpoint with Google Cloud AI integration
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
      console.log('Fetch not ready, waiting...');
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
      const analysisTimeoutId = setTimeout(() => analysisController.abort(), 120000); // 2 minute timeout

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
          summary: 'This is a sample contract between two parties outlining terms and conditions for services rendered. The document establishes clear responsibilities, payment terms, and legal obligations for both parties involved.',
          keyPoints: [
            'Contract duration: 12 months with automatic renewal clause',
            'Payment terms: Net 30 days from invoice date',
            'Termination clause: 30 days written notice required by either party',
            'Performance standards: Clearly defined deliverables and milestones'
          ],
          parties: [
            'ABC Company (Service Provider)',
            'XYZ Corporation (Client)'
          ],
          importantDates: [
            '2024-01-15: Contract effective date',
            '2024-12-15: Contract expiration date',
            '2024-02-01: First deliverable due date',
            '2024-06-30: Mid-term review scheduled'
          ],
          paymentTerms: [
            'Monthly payment: $5,000 per month',
            'Late payment fee: 1.5% interest per month on overdue amounts',
            'Expense reimbursement: Pre-approved expenses covered',
            'Invoice submission: By 5th of each month'
          ],
          risks: [
            'No explicit penalty clause for late delivery of services',
            'Termination conditions could be more specific',
            'Intellectual property rights not clearly defined',
            'Force majeure clause lacks detail'
          ],
          recommendations: [
            'Add specific delivery timelines with penalty clauses',
            'Define intellectual property ownership clearly',
            'Include detailed dispute resolution process',
            'Specify force majeure conditions and procedures',
            'Add data protection and confidentiality clauses'
          ]
        },
        note: 'This is mock data. AI service error: ' + aiError.message
      });
    }

    // Clean up the uploaded file after a delay
    setTimeout(() => {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        console.log('Cleaned up uploaded file:', req.file.filename);
      }
    }, 30000); // Clean up after 30 seconds

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
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Catch all handler for SPA-like behavior
app.get('*', (req, res) => {
  // Check if it's an API route that doesn't exist
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // For non-API routes, serve the appropriate HTML file or index.html
  const requestedFile = req.path === '/' ? 'index.html' : req.path.substring(1);
  const filePath = path.join(__dirname, '../frontend/public', requestedFile);
  
  // Check if the requested file exists
  if (fs.existsSync(filePath) && requestedFile.endsWith('.html')) {
    res.sendFile(filePath);
  } else {
    // Default to index.html for unknown routes
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Legal Analyzer Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, '../frontend/public')}`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`📄 Main page: http://localhost:${PORT}`);
  console.log(`📤 Upload page: http://localhost:${PORT}/start.html`);
});