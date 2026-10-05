"""Local, fictional REST fixture for the Mendix tutorial (Python 3)."""
import argparse
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit


class AssetHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = urlsplit(self.path).path
        cases = {
            '/assets/A100': (200, {'assetCode': 'A100', 'name': '会议室投影仪', 'underWarranty': True}),
            '/assets/A404': (404, {'error': 'asset_not_found'}),
            '/assets/A503': (503, {'error': 'service_unavailable'}),
            '/assets/ABAD': (200, {'assetCode': 'ABAD', 'name': '错误结构样例', 'underWarranty': {'unexpected': True}}),
        }
        status, payload = cases.get(path, (404, {'error': 'asset_not_found'}))
        body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8766)
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), AssetHandler)
    print(f'Fictional asset API: http://127.0.0.1:{args.port}/assets/A100', flush=True)
    print('A404: missing; A503: unavailable; ABAD: wrong field type. Ctrl+C to stop.', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
