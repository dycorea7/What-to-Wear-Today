const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const OPENAI_IMAGE_QUALITY = process.env.OPENAI_IMAGE_QUALITY || 'medium';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const ALLOWED_SIZES = new Set(['1024x1024', '1024x1536', '1536x1024']);
const aiCache = new Map();

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 100000) {
        reject(new Error('Request body too large.'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function isPathSafe(baseDir, targetPath) {
  const resolved = path.resolve(baseDir, targetPath);
  return resolved.startsWith(baseDir);
}

async function handleImageRequest(req, res) {
  if (!OPENAI_API_KEY) {
    sendJson(res, 500, { error: 'Missing OPENAI_API_KEY on server.' });
    return;
  }

  let payload;
  try {
    const raw = await readRequestBody(req);
    payload = JSON.parse(raw || '{}');
  } catch (err) {
    sendJson(res, 400, { error: 'Invalid JSON payload.' });
    return;
  }

  const prompt = String(payload.prompt || '').trim();
  const size = String(payload.size || '1024x1024');

  if (!prompt) {
    sendJson(res, 400, { error: 'Prompt is required.' });
    return;
  }

  if (!ALLOWED_SIZES.has(size)) {
    sendJson(res, 400, { error: 'Unsupported size.' });
    return;
  }

  const cacheKey = `${size}|${prompt}`;
  if (aiCache.has(cacheKey)) {
    sendJson(res, 200, { dataUrl: aiCache.get(cacheKey), cached: true });
    return;
  }

  try {
    const apiRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_IMAGE_MODEL,
        prompt,
        size,
        quality: OPENAI_IMAGE_QUALITY,
      }),
    });

    const data = await apiRes.json();
    if (!apiRes.ok) {
      const message = data?.error?.message || 'OpenAI image generation failed.';
      sendJson(res, apiRes.status, { error: message });
      return;
    }

    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      sendJson(res, 500, { error: 'OpenAI response missing image data.' });
      return;
    }

    const dataUrl = `data:image/png;base64,${b64}`;
    aiCache.set(cacheKey, dataUrl);
    sendJson(res, 200, { dataUrl });
  } catch (err) {
    sendJson(res, 500, { error: 'Failed to contact OpenAI API.' });
  }
}

function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = requestUrl.pathname;
  if (pathname === '/') pathname = '/index.html';

  const filePath = path.join(__dirname, pathname);
  if (!isPathSafe(__dirname, filePath)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/image') {
    handleImageRequest(req, res);
    return;
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end('Method not allowed');
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
