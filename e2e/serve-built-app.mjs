import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, relative, resolve, sep } from 'node:path';

const host = process.env.E2E_APP_HOST ?? '127.0.0.1';
const port = Number(process.env.E2E_APP_PORT ?? 4200);
const root = resolve('dist/task-manager/browser');
const indexFile = join(root, 'index.html');

if (!existsSync(indexFile)) {
  console.error(`Missing ${indexFile}. Run npm run build before e2e.`);
  process.exit(1);
}

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

function sendFile(res, filePath) {
  const type = mimeTypes[extname(filePath)] ?? 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  createReadStream(filePath).pipe(res);
}

createServer((req, res) => {
  const requestPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
  const candidate = normalize(join(root, requestPath));
  const relativePath = relative(root, candidate);
  const escaped = relativePath.startsWith('..') || relativePath.includes(`..${sep}`);
  const existingFile = !escaped && existsSync(candidate) && statSync(candidate).isFile();
  sendFile(res, existingFile ? candidate : indexFile);
}).listen(port, host, () => {
  console.log(`Serving ${root} at http://${host}:${port}`);
});
