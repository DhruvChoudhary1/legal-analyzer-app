const Busboy = require('busboy');
const { PythonShell } = require('python-shell');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Helper function to parse analysis results (copied from your original code)
function parseAnalysisResults(text) {
  const result = {
    documentType: '', summary: '', keyPoints: [], parties: [], importantDates: [], paymentTerms: [], risks: [], recommendations: []
  };
  const lines = text.split('\n');
  let currentSection = '';
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    if (trimmedLine.endsWith(':')) {
      const section = trimmedLine.toLowerCase().replace(':', '').trim();
      if (section in result) currentSection = section;
      continue;
    }
    if (currentSection && trimmedLine.startsWith('-')) {
      const content = trimmedLine.substring(1).trim();
      if (currentSection === 'keypoints') result.keyPoints.push(content);
      else if (currentSection === 'parties') result.parties.push(content);
      else if (currentSection === 'importantdates') result.importantDates.push(content);
      else if (currentSection === 'payment/money') result.paymentTerms.push(content);
      else if (currentSection === 'risks') result.risks.push(content);
      else if (currentSection === 'recommendations') result.recommendations.push(content);
    } else if (currentSection === 'documenttype' && !result.documentType) {
      result.documentType = trimmedLine;
    } else if (currentSection === 'summary' && !result.summary) {
      result.summary = (result.summary ? result.summary + ' ' : '') + trimmedLine;
    }
  }
  return result;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const busboy = new Busboy({ headers: req.headers });
  let uploadFilePath = '';
  let uploadFileName = '';

  busboy.on('file', (fieldname, file, filename) => {
    uploadFileName = filename;
    uploadFilePath = path.join(os.tmpdir(), filename);
    const writeStream = fs.createWriteStream(uploadFilePath);
    file.pipe(writeStream);
    file.on('end', () => writeStream.end());
  });

  busboy.on('finish', () => {
    if (!uploadFilePath) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'],
      scriptPath: path.join(__dirname, '..'),
      args: [uploadFilePath]
    };
    PythonShell.run('legal_analyzer.py', options, (err, results) => {
      fs.unlinkSync(uploadFilePath);
      if (err) {
        res.status(500).json({ error: 'Error analyzing document' });
        return;
      }
      const analysisText = results ? results.join('') : '';
      const analysisData = parseAnalysisResults(analysisText);
      res.status(200).json({
        message: 'Analysis complete',
        analysis: analysisData,
        filename: uploadFileName
      });
    });
  });

  req.pipe(busboy);
};
