import argparse
import os
import sys
from pathlib import Path

import uvicorn


# Check WebSocket dependencies
def check_websocket_dependencies():
    pass # This function seems to do nothing for now, might be a placeholder

    return True


# Ensure directory structure exists
def ensure_directories():
    # Create templates directory
    templates_dir = Path("app/web/templates")
    templates_dir.mkdir(parents=True, exist_ok=True)

    # Create static directory
    static_dir = Path("app/web/static")
    static_dir.mkdir(parents=True, exist_ok=True)

    # Ensure __init__.py file exists
    init_file = Path("app/web/__init__.py")
    if not init_file.exists():
        init_file.touch()


if __name__ == "__main__":
    # Add command line arguments
    parser = argparse.ArgumentParser(description="OpenManus Web Application Server") # Description translated
    parser.add_argument("--no-browser", action="store_true", help="Do not automatically open browser on startup") # Help translated
    parser.add_argument("--port", type=int, default=8000, help="Server listening port number (default: 8000)") # Help translated

    args = parser.parse_args()

    ensure_directories()

    # This check is currently always true, but it's a placeholder
    if not check_websocket_dependencies():
        print("Exiting application. Please install the necessary dependencies and try again.") # Message translated
        sys.exit(1)

    # Set environment variable to control automatic browser opening
    if args.no_browser:
        os.environ["AUTO_OPEN_BROWSER"] = "0"
    else:
        os.environ["AUTO_OPEN_BROWSER"] = "1"

    port = args.port

    print(f"🚀 OpenManus Web Application is starting...") # Message translated
    print(f"Visit http://localhost:{port} to start using") # Message translated

    # Run the FastAPI application
    uvicorn.run("app.web.app:app", host="0.0.0.0", port=port, reload=True)
