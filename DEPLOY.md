# 🚀 Deploy Legal Analyzer - Simple Guide

## 📋 Your App Structure:
- **🐍 Python AI Service**: `google_legal_analyzer.py` (Google Gemini AI)
- **🌐 Node.js Web Server**: `backend/static-server.js` (Express + Frontend)

## 🎯 **Deployment Strategy: Railway**

Railway is the best option because it supports both Node.js and Python in one platform.

### **Step 1: Deploy to Railway**

1. **Go to [railway.app](https://railway.app)**
2. **Sign up** with your GitHub account
3. **New Project** → **Deploy from GitHub repo**
4. **Select**: `DhruvChoudhary1/legal-analyzer-app`

### **Step 2: Configure Environment Variables**

In Railway dashboard → **Variables** → Add these:

```bash
# Required: Google AI API Key
GOOGLE_AI_API_KEY=your_api_key_here

# Production settings
NODE_ENV=production
FLASK_ENV=production

# Port settings (Railway auto-assigns)
PORT=3000
```

**Get Google AI API Key**: [Google AI Studio](https://makersuite.google.com/app/apikey)

### **Step 3: Railway Auto-Deployment**

Railway will automatically:
- ✅ Install Node.js dependencies (`npm install`)
- ✅ Install Python dependencies (`pip install -r requirements.txt`)
- ✅ Start your web server (`node backend/static-server.js`)

### **Step 4: Start Python AI Service**

After deployment, you'll need to manually start the Python service:

1. **Railway Dashboard** → **Your Project** → **Deploy**
2. **Add a new service** for Python:
   - **Command**: `python google_legal_analyzer.py`
   - **Add same environment variables**

## 🌐 **Your Live URLs**

After deployment:
- **Web App**: `https://your-app-name.railway.app`
- **Test API**: `https://your-app-name.railway.app/api/test`

## 🔧 **Alternative: Two-Service Deployment**

If Railway doesn't work well:

### **Option A: Vercel + Railway**
1. **Vercel**: Deploy Node.js web service (free)
2. **Railway**: Deploy Python AI service ($5 credits)

### **Option B: PythonAnywhere + Netlify**
1. **PythonAnywhere**: Deploy Python AI (free tier)
2. **Netlify**: Deploy frontend (free)

## 🛠️ **Local Testing**

Before deployment, test locally:

```bash
# Terminal 1: Start Python AI
python google_legal_analyzer.py

# Terminal 2: Start Web Server  
cd backend
node static-server.js
```

Visit: `http://localhost:5000`

## 📞 **Support**

- **Railway Issues**: Check Railway dashboard logs
- **Python Errors**: Ensure Google AI API key is set
- **Node.js Errors**: Check if all dependencies installed

---

**🎯 Railway is your best bet - it's designed for exactly this type of multi-language setup!**
