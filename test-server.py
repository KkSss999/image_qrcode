#!/usr/bin/env python3
"""
Simple HTTP test server for QR Code Reader extension development.
Serves local files for testing the browser extension.
"""

import http.server
import socketserver
import os

# Server port configuration
PORT = 8000

# Get the directory where this script is located
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Change working directory to project root
os.chdir(DIRECTORY)

# Configure HTTP request handler with custom MIME type mappings
Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    '.png': 'image/png',
    '.html': 'text/html',
    '.js': 'application/javascript',
})

# Start the HTTP server
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Test server running at: http://localhost:{PORT}/test.html")
    print("Press Ctrl+C to stop the server")
    httpd.serve_forever()
