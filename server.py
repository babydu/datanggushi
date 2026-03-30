#!/usr/bin/env python3
"""
历史生存模拟器 - 服务器
提供游戏页面和剧本API
"""
import json
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = 8080

class GameHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/' or path == '/index.html':
            self.serve_file('index.html', 'text/html')
        elif path == '/game.js':
            self.serve_file('game.js', 'application/javascript')
        elif path == '/style.css':
            self.serve_file('style.css', 'text/css')
        elif path == '/api/packs':
            self.serve_packs()
        elif path == '/api/packs/song':
            self.serve_song_pack()
        elif path.startswith('/data/'):
            filename = path[1:]
            if os.path.exists(filename):
                self.serve_file(filename, 'application/json')
            else:
                self.send_error(404, 'File not found')
        else:
            super().do_GET()
    
    def serve_file(self, filename, content_type):
        try:
            with open(filename, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', f'{content_type}; charset=utf-8')
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_error(404, 'File not found')
    
    def serve_packs(self):
        packs = {
            "packs": [
                {
                    "id": "song",
                    "name": "宋朝历史生存剧本",
                    "dynasty": "宋朝",
                    "description": "分卷式还原宋朝开封府辖区内的人生历程。玩家将体验北宋仁宗年间的市井生活。",
                    "version": "1.0",
                    "author": "官方内置",
                    "endpoint": "/api/packs/song"
                }
            ]
        }
        self.send_json(packs)
    
    def serve_song_pack(self):
        try:
            with open('data/song_pack.json', 'r', encoding='utf-8') as f:
                pack_data = json.load(f)
            self.send_json(pack_data)
        except FileNotFoundError:
            self.send_error(404, 'Pack not found')
        except json.JSONDecodeError:
            self.send_error(500, 'Invalid JSON')
    
    def send_json(self, data):
        content = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(content)
    
    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {args[0]}")

def main():
    server = HTTPServer(('', PORT), GameHandler)
    print(f"历史生存模拟器服务器已启动")
    print(f"访问地址: http://localhost:{PORT}")
    print(f"剧本API: http://localhost:{PORT}/api/packs")
    print(f"按 Ctrl+C 停止服务器")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
        server.shutdown()

if __name__ == '__main__':
    main()
