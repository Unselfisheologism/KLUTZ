# api/index.py

import sys
import os
import asyncio

# Add the OpenManus directory to the Python path
# This assumes OpenManus is at the root of your project
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the main function that builds the ASGI application
# Adjust the import path based on the actual location of your main function within OpenManus
try:
    from OpenManus.protocol.a2a.app.main import main as manus_main
except ImportError as e:
    print(f"Error importing OpenManus main function: {e}")
    print("Please check the import path in api/index.py")
    # In a real application, you might want to raise the exception or exit here
    manus_main = None

# Build the ASGI application instance by running the main function
# This needs to be done within an asyncio event loop
# Vercel's Python runtime might handle the event loop, but let's ensure it runs correctly.

app = None # Initialize app to None

if manus_main:
    try:
        # Create and run an asyncio event loop to call the async main function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        app = loop.run_until_complete(manus_main())
        loop.close()
    except Exception as e:
        print(f"Error building OpenManus application: {e}")
        # Handle the error as appropriate for your application

# Vercel will use this `app` object as the entry point for the Serverless Function
# It must be a valid ASGI application instance (like Starlette or FastAPI app).
