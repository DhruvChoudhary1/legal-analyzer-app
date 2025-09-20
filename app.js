const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Legal Analyzer Application...');
console.log('📅 Date:', new Date().toISOString());

// Function to start Python AI service
function startPythonService() {
    console.log('\n🐍 Starting Python AI Service (google_legal_analyzer.py)...');
    
    const pythonProcess = spawn('python3', ['google_legal_analyzer.py'], {
        stdio: 'inherit',
        cwd: process.cwd()
    });

    pythonProcess.on('spawn', () => {
        console.log('✅ Python AI Service started successfully');
        console.log('🔗 AI Service will be available at: http://localhost:5001');
    });

    pythonProcess.on('error', (error) => {
        console.error('❌ Python AI Service error:', error.message);
        console.log('💡 Make sure Python is installed and requirements are met');
    });

    pythonProcess.on('exit', (code) => {
        console.log(`🔄 Python AI Service exited with code: ${code}`);
        if (code !== 0) {
            console.log('🔄 Attempting to restart Python service...');
            setTimeout(startPythonService, 3000); // Restart after 3 seconds
        }
    });

    return pythonProcess;
}

// Function to start Node.js backend service
function startNodeService() {
    console.log('\n🟢 Starting Node.js Backend (static-server.js)...');
    
    const nodeProcess = spawn('node', ['backend/static-server.js'], {
        stdio: 'inherit',
        cwd: process.cwd()
    });

    nodeProcess.on('spawn', () => {
        console.log('✅ Node.js Backend started successfully');
        console.log('🌐 Web Server will be available at: http://localhost:5000');
    });

    nodeProcess.on('error', (error) => {
        console.error('❌ Node.js Backend error:', error.message);
        console.log('💡 Make sure Node.js dependencies are installed (npm install)');
    });

    nodeProcess.on('exit', (code) => {
        console.log(`🔄 Node.js Backend exited with code: ${code}`);
        if (code !== 0) {
            console.log('🔄 Attempting to restart Node.js service...');
            setTimeout(startNodeService, 3000); // Restart after 3 seconds
        }
    });

    return nodeProcess;
}

// Function to handle graceful shutdown
function handleShutdown() {
    console.log('\n🛑 Shutting down Legal Analyzer Application...');
    
    if (pythonProcess) {
        console.log('🐍 Stopping Python AI Service...');
        pythonProcess.kill('SIGTERM');
    }
    
    if (nodeProcess) {
        console.log('🟢 Stopping Node.js Backend...');
        nodeProcess.kill('SIGTERM');
    }
    
    setTimeout(() => {
        console.log('✅ Application shutdown complete');
        process.exit(0);
    }, 2000);
}

// Handle process termination signals
process.on('SIGINT', handleShutdown);  // Ctrl+C
process.on('SIGTERM', handleShutdown); // Termination signal
process.on('SIGQUIT', handleShutdown); // Quit signal

// Start both services
console.log('\n🚀 Initializing both services...');

// Start Python AI service first
const pythonProcess = startPythonService();

// Wait a bit, then start Node.js service
setTimeout(() => {
    const nodeProcess = startNodeService();
    
    // Show final status after both services have time to start
    setTimeout(() => {
        console.log('\n' + '='.repeat(60));
        console.log('🎉 LEGAL ANALYZER APPLICATION RUNNING');
        console.log('='.repeat(60));
        console.log('🌐 Frontend: http://localhost:5000');
        console.log('🧠 AI Service: http://localhost:5001');
        console.log('📤 Upload Page: http://localhost:5000/start.html');
        console.log('🧪 Test Backend: http://localhost:5000/api/test');
        console.log('🔍 Test AI: http://localhost:5001/api/health');
        console.log('='.repeat(60));
        console.log('✨ Ready to analyze legal documents!');
        console.log('🛑 Press Ctrl+C to stop both services');
        console.log('='.repeat(60) + '\n');
    }, 5000);
    
}, 2000); // Give Python service 2 seconds to start first

// Keep the main process alive
process.stdin.resume();
