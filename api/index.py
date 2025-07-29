# api/index.py

import sys
import os

# Add the OpenManus directory to the Python path
# This assumes OpenManus is at the root of your project
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the FastAPI app instance from OpenManus
# Adjust the import path based on the actual location of your FastAPI app within OpenManus
try:
    from OpenManus.app.web.app import app
except ImportError as e:
    print(f"Error importing FastAPI app: {e}")
    print("Please check the import path in api/index.py")
    # You might want to raise the exception or exit here in a real application
    app = None # Set app to None or a dummy app if import fails

# Vercel will use this `app` object as the entry point for the Serverless Function
# If your FastAPI app is defined differently, you might need to adjust this.
