# 📋 Legal Document Analyzer

An intelligent legal document analysis tool powered by **Google Cloud Generative AI (Gemini)** that automatically classifies, analyzes, and explains legal documents in plain English.

## 🌟 Features

- **🤖 AI-Powered Analysis**: Uses Google's Gemini AI for intelligent document classification and analysis
- **📄 Multi-Format Support**: Analyzes PDF, DOCX, and TXT files
- **🎯 Document Type Detection**: Automatically identifies 18+ legal document types including contracts, NDAs, wills, court orders, etc.
- **🔍 Plain Language Translation**: Converts complex legal jargon into understandable explanations
- **⚖️ Risk Assessment**: Identifies potential legal risks with severity levels (LOW/MEDIUM/HIGH/CRITICAL)
- **💡 Actionable Recommendations**: Provides step-by-step guidance and suggestions
- **🚀 Real-time Processing**: Fast analysis with fallback mock data when AI service is unavailable
- **🔒 Secure**: Temporary file processing with automatic cleanup

## 🏗️ Architecture

```
Frontend (Static HTML/JS) ↔ Backend (Node.js) ↔ AI Service (Python + Google Gemini)
```

- **Frontend**: Static HTML pages served by Express.js
- **Backend**: Node.js server (`static-server.js`) handling file uploads and API routing
- **AI Service**: Python Flask service (`google_legal_analyzer.py`) with Google Cloud AI integration

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **Python** (3.8 or higher)
- **Google AI API Key** (from [Google AI Studio](https://makersuite.google.com/app/apikey))

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd legal-analyzer-app
```

### 2. Set Up Python Environment
```bash
# Install Python dependencies
pip install -r requirements.txt
```

### 3. Set Up Node.js Environment
```bash
# Navigate to backend directory
cd backend

# Install Node.js dependencies
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```bash
# backend/.env
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

**Get your API key from**: [Google AI Studio](https://makersuite.google.com/app/apikey)

### 5. Start the Services

**Terminal 1 - Start Python AI Service:**
```bash
# From project root
python google_legal_analyzer.py
```
*AI service will run on: http://localhost:5001*

**Terminal 2 - Start Node.js Backend:**
```bash
# From backend directory
cd backend
npm run static
```
*Web server will run on: http://localhost:5000*

### 6. Access the Application
Open your browser and go to: **http://localhost:5000**

## 📁 Project Structure

```
legal-analyzer-app/
├── 📄 google_legal_analyzer.py     # Main AI service (Python + Google Gemini)
├── 📄 requirements.txt             # Python dependencies
├── 📄 DOCUMENT_TYPES.md           # Supported document types
├── 📄 GOOGLE_CLOUD_SETUP.md       # Setup instructions
├── 📄 .gitignore                  # Git ignore rules
├── 📁 backend/
│   ├── 📄 static-server.js        # Main Node.js server
│   ├── 📄 Package.json            # Node.js dependencies
│   ├── 📄 .env                    # Environment variables (create this)
│   ├── 📁 uploads/                # Temporary file storage
│   └── 📁 node_modules/           # Node.js packages
├── 📁 frontend/
│   ├── 📁 public/
│   │   ├── 📄 index.html          # Landing page
│   │   ├── 📄 start.html          # Upload page
│   │   └── 📄 analysis.html       # Results page
│   └── 📁 src/                    # React components (optional)
└── 📁 temp_uploads/               # Temporary file processing
```

## 🎯 Supported Document Types

The AI can automatically detect and analyze:

- **📝 Contracts**: Business agreements, service contracts
- **🤐 NDAs**: Non-disclosure agreements
- **📜 Wills**: Estate planning documents
- **🏠 Leases**: Rental agreements
- **💼 Employment**: Job contracts
- **🤝 Partnerships**: Business partnership agreements
- **⚖️ Power of Attorney**: Legal authority documents
- **📋 Licenses**: Licensing agreements
- **🤝 Settlements**: Legal settlements
- **🏢 Corporate**: Corporate bylaws, articles
- **🏡 Real Estate**: Property transactions
- **⚖️ Court Orders**: Judicial directives
- **📋 Judgments**: Court decisions
- **📝 Affidavits**: Sworn statements
- **📢 Legal Notices**: Cease and desist letters
- **🛡️ Insurance**: Insurance policies
- **💰 Loans**: Loan agreements

## 🔧 API Endpoints

### Backend Server (Port 5000)
- `GET /` - Main application
- `GET /api/test` - Backend health check
- `GET /api/ai-status` - AI service status
- `POST /api/upload` - Document upload and analysis

### AI Service (Port 5001)
- `GET /api/health` - AI service health check
- `GET /api/test-ai` - Test AI connection
- `POST /api/analyze` - Document analysis endpoint

## 🛠️ Development

### Running in Development Mode
```bash
# Backend with auto-reload
cd backend
npm run static-dev

# Python AI service with auto-reload
python google_legal_analyzer.py
```

### Testing the Setup
1. **Test Backend**: http://localhost:5000/api/test
2. **Test AI Service**: http://localhost:5001/api/health
3. **Test AI Connection**: http://localhost:5000/api/ai-status

## 🔒 Security Features

- **Environment Variables**: API keys stored securely in `.env` files
- **File Validation**: Only allows PDF, DOCX, TXT uploads
- **File Size Limits**: 10MB maximum file size
- **Temporary Processing**: Files are automatically deleted after analysis
- **CORS Protection**: Configured for specific origins

## 📊 Example Analysis Output

```json
{
  "documentType": "Contract Agreement",
  "summary": "This is a comprehensive service agreement...",
  "parties": ["ABC Company", "XYZ Corporation"],
  "keyTerms": ["12-month duration", "Monthly payments of $5,000"],
  "risks": [
    {
      "item": "No penalty clause for late delivery",
      "severity": "MEDIUM",
      "mitigation": "Add specific delivery timelines with penalties"
    }
  ],
  "recommendations": [
    "Define intellectual property ownership clearly",
    "Include detailed dispute resolution process"
  ]
}
```

## 🐛 Troubleshooting

### Common Issues

1. **AI Service Not Available**
   - Check if Python service is running on port 5001
   - Verify Google AI API key in `.env` file
   - Check firewall settings

2. **File Upload Fails**
   - Ensure file is PDF, DOCX, or TXT format
   - Check file size is under 10MB
   - Verify `uploads/` directory exists

3. **Module Not Found Errors**
   - Run `pip install -r requirements.txt`
   - Run `npm install` in backend directory

### Error Messages
- **"AI service unavailable"**: Python service not running or wrong port
- **"Invalid API key"**: Check Google AI API key in `.env` file
- **"File too large"**: Reduce file size to under 10MB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Cloud AI** for providing the Gemini AI models
- **Flask** and **Express.js** for the web framework
- **Multer** for file upload handling
- **PyPDF2** and **python-docx** for document processing

## 📞 Support

If you encounter any issues or have questions:
1. Check the [troubleshooting section](#-troubleshooting)
2. Review the [Google Cloud setup guide](GOOGLE_CLOUD_SETUP.md)
3. Open an issue in the repository

## 🚀 Deployment (Making Your Website Live)

### **Option 1: Railway (Recommended - Easiest)**

Railway is perfect for full-stack apps with both Node.js and Python services.

**Steps:**
1. **Sign up**: Go to [railway.app](https://railway.app) and sign up with GitHub
2. **Deploy from GitHub**:
   - Click "Deploy from GitHub repo"
   - Select your `legal-analyzer-app` repository
   - Railway will automatically detect both services
3. **Configure Environment Variables**:
   - In your Railway dashboard, go to Variables
   - Add: `GOOGLE_AI_API_KEY=your_api_key_here`
   - Add: `NODE_ENV=production`
   - Add: `FLASK_ENV=production`
4. **Deploy**: Railway handles everything automatically!

**Your live URL**: `https://your-app-name.railway.app`

### **Option 2: Render**

**Steps:**
1. **Sign up**: Go to [render.com](https://render.com)
2. **Create Web Service**:
   - Connect your GitHub repo
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node static-server.js`
3. **Create Background Service** (for Python AI):
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python google_legal_analyzer.py`
4. **Environment Variables**:
   - Add `GOOGLE_AI_API_KEY` to both services
   - Add `AI_SERVICE_URL` to web service pointing to your background service

### **Environment Variables for Production**

Set these in your deployment platform:

```bash
GOOGLE_AI_API_KEY=your_google_ai_api_key
NODE_ENV=production
FLASK_ENV=production
PORT=5000
AI_SERVICE_URL=https://your-ai-service-url.com
```

### **Pre-Deployment Checklist**

- ✅ All files committed to Git and pushed to GitHub
- ✅ Google AI API key ready
- ✅ Test locally: both services running
- ✅ Check static files load correctly
- ✅ Verify file upload functionality works

### **Post-Deployment Testing**

1. **Test your live website**: Visit your deployment URL
2. **Check backend health**: `your-url.com/api/test`
3. **Test AI service**: `your-url.com/api/ai-status`
4. **Upload a test document**: Verify end-to-end functionality

### **Quick Deployment Commands**

```bash
# Commit your changes
git add .
git commit -m "Add deployment configuration"
git push origin main

# Then deploy on Railway or Render using their web interface
```

---

**⚡ Built with Google Cloud Generative AI • Made for Legal Professionals and Everyone Else**
