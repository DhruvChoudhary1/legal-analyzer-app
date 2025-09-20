import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import AnalysisResults from './components/AnalysisResults';
import './App.css';

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalysisComplete = (analysisData) => {
    setAnalysis(analysisData);
    setLoading(false);
    setError('');
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
    setAnalysis(null);
  };

  return (
    <div className="App">
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <div className="container">
        <h1>Generative AI for Demystifying Legal Documents</h1>
        <p className="intro-text">
          Our AI-powered tool translates complex legal jargon into simple, clear language you can understand. 
          Navigate contracts and legal texts confidently with instant summaries and detailed explanations tailored just for you.
        </p>
        
        {!analysis ? (
          <FileUpload 
            onAnalysisComplete={handleAnalysisComplete}
            onError={handleError}
            loading={loading}
            setLoading={setLoading}
          />
        ) : (
          <AnalysisResults 
            analysis={analysis}
            onNewAnalysis={() => setAnalysis(null)}
          />
        )}
        
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}
        
        <div className="trust-badge">
          <i className="fas fa-lock"></i>
          <span>Secure & Confidential • No Registration Required</span>
        </div>
      </div>
    </div>
  );
}

export default App;