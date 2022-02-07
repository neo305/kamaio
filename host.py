import http.server
import socketserver
import socket
from http.server import HTTPServer, BaseHTTPRequestHandler, SimpleHTTPRequestHandler
import ssl


PORT = 8080
Handler = http.server.SimpleHTTPRequestHandler
hostname = socket.gethostname()
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.connect(('10.255.255.255', 1))
IP = s.getsockname()[0]

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("Http server up")
    print("Adress : http://", IP,":",PORT)
    httpd.serve_forever()
