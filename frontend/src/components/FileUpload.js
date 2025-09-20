import React, { useRef } from 'react';
import axios from 'axios';

const FileUpload = ({ onAnalysisComplete, onError, loading, setLoading }) => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = React.useState('No file selected');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('No file selected');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const file = fileInputRef.current.files[0];
    if (!file) {
      onError('Please select a file to upload.');
      return;
    }

    // Validate file type
    const allowedExtensions = /(\.pdf|\.doc|\.docx|\.txt)$/i;
    if (!allowedExtensions.exec(file.name)) {
      onError('Invalid file type. Please upload PDF, DOC, DOCX, or TXT files only.');
      return;
    }

    setLoading(true);
    onError('');

    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onAnalysisComplete(response.data.analysis);
    } catch (error) {
      console.error('Upload error:', error);
      onError(error.response?.data?.error || 'Error uploading file. Please try again.');
    }
  };

  return (
    <div id="uploadSection">
      <form id="uploadForm" onSubmit={handleSubmit}>
        <div className="upload-area">
          <div className="upload-icon">
            <i className="fas fa-file-upload"></i>
          </div>
          <label className="upload-label" htmlFor="fileUpload">
            Select your legal document to analyze
          </label>
          
          <input 
            type="file" 
            id="fileUpload" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt" 
            required 
            disabled={loading}
          />
          <label htmlFor="fileUpload" className="get-started-btn" style={{display: 'inline-block', padding: '18px 40px'}}>
            <i className="fas fa-folder-open"></i> Choose File
          </label>
          
          <div className="file-name" id="fileName" style={{marginTop: '15px'}}>
            {fileName}
          </div>
        </div>
        
        <button 
          type="submit" 
          className="get-started-btn" 
          id="analyzeBtn"
          disabled={loading}
        >
          {loading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-search"></i>
          )}
          {loading ? 'Processing...' : 'Analyze Document'}
        </button>
      </form>
      
      <div className="filetypes-info" style={{marginTop: '15px'}}>
        Supported formats: PDF, DOC, DOCX, TXT
      </div>
    </div>
  );
};

export default FileUpload;