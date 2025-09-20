# Main entry point for Railway deployment
# Import and run the Flask app directly
import os
import sys

if __name__ == '__main__':
    # Import and run the Flask app
    from google_legal_analyzer import app
    
    # Get port from environment variable (Railway sets this)
    port = int(os.getenv('PORT', 5001))
    debug_mode = os.getenv('FLASK_ENV') != 'production'
    
    print(f"Starting Flask app on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
