#!/bin/bash
# Start script for Railway
echo "Starting Legal Analyzer App..."

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

# Start the web server
echo "Starting web server..."
node backend/static-server.js
