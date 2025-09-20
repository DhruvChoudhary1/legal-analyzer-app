# 📋 Legal Document Analyzer

An intelligent legal document analysis tool powered by **Google Cloud Generative AI (Gemini)** that automatically classifies, analyzes, and explains legal documents in plain English.

🚀 **Live Demo**: [https://legal-analyzer-app-production.up.railway.app/](https://legal-analyzer-app-production.up.railway.app/)

## 🌟 Features

- **🤖 AI-Powered Analysis**: Uses Google's Gemini AI for intelligent document classification and analysis
- **📄 Multi-Format Support**: Analyzes PDF, DOCX, and TXT files
- **🎯 Document Type Detection**: Automatically identifies 18+ legal document types including contracts, NDAs, wills, court orders, etc.
- **🔍 Plain Language Translation**: Converts complex legal jargon into understandable explanations
- **⚖️ Risk Assessment**: Identifies potential legal risks with severity levels (LOW/MEDIUM/HIGH/CRITICAL)
- **💡 Actionable Recommendations**: Provides step-by-step guidance and suggestions
- **🚀 Real-time Processing**: Fast analysis with live AI processing
- **🔒 Secure**: Temporary file processing with automatic cleanup
- **🌐 Cloud Deployed**: Live on Railway with Python Flask backend

## 🏗️ Architecture

```
Frontend (HTML/JS) ↔ Python Flask App (app.py) ↔ Google Gemini AI
```

**Single Python Service Architecture:**
- **Frontend**: Static HTML pages served directly by Flask
- **Backend**: Python Flask service (`app.py`) handling both web serving and AI processing
- **AI Service**: Integrated Google Cloud Generative AI (Gemini) within the Flask app

## 📋 Prerequisites

- **Python** (3.11 or higher)
- **Google AI API Key** (from [Google AI Studio](https://makersuite.google.com/app/apikey))

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/DhruvChoudhary1/legal-analyzer-app.git
cd legal-analyzer-app
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```bash
# .env
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

**Get your API key from**: [Google AI Studio](https://makersuite.google.com/app/apikey)

### 4. Run the Application
```bash
python app.py
```

### 5. Access the Application
Open your browser and go to: **http://localhost:5001**

## 📁 Project Structure

```
legal-analyzer-app/
├── 📄 app.py                      # Main Flask application (Python + Google Gemini)
├── 📄 requirements.txt            # Python dependencies
├── 📄 runtime.txt                 # Python version for deployment
├── 📄 .env.example               # Environment variables template
├── 📄 .gitignore                 # Git ignore rules
├── 📁 frontend/
│   └── 📁 public/
│       ├── 📄 index.html         # Landing page
│       ├── 📄 start.html         # Upload page
│       └── 📄 analysis.html      # Results page
├── 📁 backend/                   # Legacy Node.js files (kept for reference)
└── 📁 temp_uploads/              # Temporary file processing
```

# Install Python dependencies
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the project root:
```bash
# .env
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

**Get your API key from**: [Google AI Studio](https://makersuite.google.com/app/apikey)

### 5. Start the Application

**Single Command:**
```bash
# From project root
python app.py
```
*Application will run on: http://localhost:5001*

### 6. Access the Application
Open your browser and go to: **http://localhost:5001**

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

### Flask Application (app.py)
- `GET /` - Main application (serves frontend)
- `GET /<path:filename>` - Static file serving 
- `GET /api/health` - Application health check
- `GET /api/test-ai` - Test Google AI connection
- `POST /api/analyze` - Document upload and analysis

## 🛠️ Development

### Running in Development Mode
```bash
# Run the Flask application
python app.py
```

### Testing the Setup
1. **Test Application**: http://localhost:5001/
2. **Test Health Check**: http://localhost:5001/api/health
3. **Test AI Connection**: http://localhost:5001/api/test-ai

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

1. **Application Won't Start**
   - Check if Python 3.11+ is installed: `python --version`
   - Verify Google AI API key in `.env` file
   - Install dependencies: `pip install -r requirements.txt`

2. **File Upload Fails**
   - Ensure file is PDF, DOCX, or TXT format
   - Check file size is under 10MB
   - Verify `temp_uploads/` directory exists

3. **AI Analysis Fails**
   - Check Google AI API key is valid
   - Test AI connection: `/api/test-ai` endpoint
   - Check internet connectivity

### Error Messages
- **"Analyzer not initialized"**: Check Google AI API key in environment variables
- **"AI connection failed"**: Verify API key and internet connection
- **"File too large"**: Reduce file size to under 10MB

### Local Development Issues
- **Port 5001 already in use**: Change port in `app.py` or kill existing process
- **Module not found**: Run `pip install -r requirements.txt`
- **Permission denied**: Check file permissions for `temp_uploads/` directory

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

## 🚀 Deployment

### **Live Deployment on Railway**

Your app is successfully deployed at: **https://legal-analyzer-app-production.up.railway.app/**

### **Deploy Your Own Copy**

**Option 1: Railway (Recommended)**

1. **Fork this repository** on GitHub
2. **Sign up** at [railway.app](https://railway.app) with GitHub
3. **Create New Project** → Deploy from GitHub repo
4. **Select your forked repository**
5. **Set Environment Variables**:
   ```
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   FLASK_ENV=production
   ```
6. **Deploy!** Railway will automatically:
   - Detect Python app from `requirements.txt` and `runtime.txt`
   - Install dependencies
   - Run `python app.py`

**Option 2: Other Platforms**

The app includes standard deployment files:
- `requirements.txt` - Python dependencies
- `runtime.txt` - Python 3.11 specification
- `app.py` - Main application entry point

Deploy on: Render, Heroku, Google Cloud Run, or any Python hosting platform.

### **Environment Variables for Production**

Required environment variable:
```bash
GOOGLE_AI_API_KEY=your_google_ai_api_key_from_google_ai_studio
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Google Cloud AI** for providing the Gemini AI models
- **Flask** for the lightweight Python web framework
- **Railway** for seamless Python deployment platform
- **PyPDF2** and **python-docx** for document processing

## 📞 Support

If you encounter any issues or have questions:
1. Check the [troubleshooting section](#-troubleshooting)
2. Test the live demo: [https://legal-analyzer-app-production.up.railway.app/](https://legal-analyzer-app-production.up.railway.app/)
3. Open an issue in the repository

Optional:
```bash
FLASK_ENV=production
PORT=5001
```

---

**⚡ Built with Google Cloud Generative AI • Deployed on Railway • Pure Python Power**
