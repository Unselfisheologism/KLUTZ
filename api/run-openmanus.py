# api/run-openmanus.py

import sys
import json
import subprocess
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        try:
            request_data = json.loads(post_data)
            prompt = request_data.get('prompt', '')

            if not prompt:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Prompt is required'}).encode('utf-8'))
                return

            # Construct the command to run OpenManus/main.py
            # IMPORTANT: Ensure the path to python and OpenManus/main.py is correct in the Vercel environment
            # You might need to adjust the path based on how your project is structured in the deployment
            command = [sys.executable, 'OpenManus/main.py', '--prompt', prompt]
            
            process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdout, stderr = process.communicate()

            if process.returncode != 0:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response_data = {'error': f'OpenManus script failed with error:', 'stderr': stderr.decode('utf-8'), 'stdout': stdout.decode('utf-8')}
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
            else:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response_data = {'response': stdout.decode('utf-8')}
                self.wfile.write(json.dumps(response_data).encode('utf-8'))

        except json.JSONDecodeError:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Invalid JSON'}).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

    def do_GET(self):
         self.send_response(200)
         self.send_header('Content-type', 'text/plain')
         self.end_headers()
         self.wfile.write('This is the OpenManus runner function.'.encode('utf-8'))
         return
