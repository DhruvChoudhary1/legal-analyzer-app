import React from 'react';

const AnalysisResults = ({ analysis, onNewAnalysis }) => {
  return (
    <div className="results-container">
      <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Analysis Results</h2>
      
      <div className="result-section">
        <h3>Document Type</h3>
        <p>{analysis.documentType || 'Not specified'}</p>
      </div>
      
      <div className="result-section">
        <h3>Summary</h3>
        <p>{analysis.summary || 'No summary available'}</p>
      </div>
      
      {analysis.keyPoints && analysis.keyPoints.length > 0 && (
        <div className="result-section">
          <h3>Key Points</h3>
          <ul>
            {analysis.keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}
      
      {analysis.parties && analysis.parties.length > 0 && (
        <div className="result-section">
          <h3>Parties Involved</h3>
          <ul>
            {analysis.parties.map((party, index) => (
              <li key={index}>{party}</li>
            ))}
          </ul>
        </div>
      )}
      
      {analysis.importantDates && analysis.importantDates.length > 0 && (
        <div className="result-section">
          <h3>Important Dates</h3>
          <ul>
            {analysis.importantDates.map((date, index) => (
              <li key={index}>{date}</li>
            ))}
          </ul>
        </div>
      )}
      
      {analysis.paymentTerms && analysis.paymentTerms.length > 0 && (
        <div className="result-section">
          <h3>Financial Terms</h3>
          <ul>
            {analysis.paymentTerms.map((term, index) => (
              <li key={index}>{term}</li>
            ))}
          </ul>
        </div>
      )}
      
      {analysis.risks && analysis.risks.length > 0 && (
        <div className="result-section">
          <h3>Potential Risks</h3>
          <ul>
            {analysis.risks.map((risk, index) => (
              <li key={index}>{risk}</li>
            ))}
          </ul>
        </div>
      )}
      
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="result-section">
          <h3>Recommendations</h3>
          <ul>
            {analysis.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
      
      <button 
        onClick={onNewAnalysis}
        className="get-started-btn"
        style={{marginTop: '30px'}}
      >
        <i className="fas fa-plus"></i> Analyze Another Document
      </button>
    </div>
  );
};

export default AnalysisResults;