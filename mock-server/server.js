import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { spawnSync } from 'child_process';
import { createRequire } from 'module';
import { createServer } from 'http';
import { URL } from 'url';

const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const compiledHandlerPath = path.join(distDir, 'mock-server', 'handlers.js');
const compiledDbPath = path.join(distDir, 'mock-server', 'db.js');
const sourceHandlerPath = path.join(__dirname, 'handlers.ts');
const sourceDbPath = path.join(__dirname, 'db.ts');

const require = createRequire(import.meta.url);

const ensureDistDir = () => {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
};

const isOutdated = (compiledPath, sourcePath) => {
  if (!fs.existsSync(compiledPath)) return true;
  const compiledTime = fs.statSync(compiledPath).mtimeMs;
  const sourceTime = fs.statSync(sourcePath).mtimeMs;
  return compiledTime < sourceTime;
};

const needsBuild = () => {
  return (
    isOutdated(compiledHandlerPath, sourceHandlerPath) ||
    isOutdated(compiledDbPath, sourceDbPath)
  );
};

const buildSources = () => {
  ensureDistDir();
  const tscPath = require.resolve('typescript/bin/tsc');
  const compile = spawnSync(
    process.execPath,
    [
      tscPath,
      sourceHandlerPath,
      sourceDbPath,
      '--outDir',
      distDir,
      '--module',
      'ESNext',
      '--target',
      'ES2020',
      '--moduleResolution',
      'node',
      '--esModuleInterop',
      '--noEmit',
      'false'
    ],
    { stdio: 'inherit' }
  );

  if (compile.status !== 0) {
    console.error('\u274c  Failed to compile mock-server TypeScript sources.');
    process.exit(compile.status ?? 1);
  }

  const handlerContent = fs.readFileSync(compiledHandlerPath, 'utf8');
  const patchedContent = handlerContent.replace("from './db'", "from './db.js'");
  if (patchedContent !== handlerContent) {
    fs.writeFileSync(compiledHandlerPath, patchedContent);
  }
};

if (needsBuild()) {
  console.log('\u2692\ufe0f  Building mock-server TypeScript sources...');
  buildSources();
}

const handlerModuleUrl = pathToFileURL(compiledHandlerPath).href;
const { handleRequest } = await import(handlerModuleUrl);

const sendJson = (res, status, payload) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(payload ? JSON.stringify(payload) : undefined);
};

const server = createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendJson(res, 400, { message: 'Invalid request' });
    return;
  }

  const method = req.method.toUpperCase();

  if (method === 'OPTIONS') {
    sendJson(res, 204);
    return;
  }

  if (!ALLOWED_METHODS.has(method)) {
    sendJson(res, 405, { message: `Method ${method} is not supported by the mock server.` });
    return;
  }

  const requestUrl = new URL(req.url, `http://${process.env.MOCK_SERVER_HOST ?? 'localhost'}`);
  const pathname = requestUrl.pathname;

  if (!pathname.startsWith('/api/v1')) {
    sendJson(res, 404, { message: `Endpoint [${method}] ${pathname} not found on mock server.` });
    return;
  }

  const apiPath = pathname.substring('/api/v1'.length) || '/';
  const queryParams = Object.fromEntries(requestUrl.searchParams.entries());

  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', async () => {
    let body = null;
    if (chunks.length > 0) {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (raw.trim()) {
        try {
          body = JSON.parse(raw);
        } catch {
          sendJson(res, 400, { message: 'Invalid JSON payload' });
          return;
        }
      }
    }

    try {
      const result = await handleRequest(method, apiPath, queryParams, body);
      if (method === 'DELETE' || (method === 'POST' && result === undefined)) {
        sendJson(res, 204);
        return;
      }
      sendJson(res, 200, result ?? {});
    } catch (error) {
      const status = typeof error?.status === 'number' ? error.status : 500;
      const message = error?.message || 'Internal Server Error';
      const payload = { message };
      if (error?.data) {
        payload.data = error.data;
      }
      console.error(`\u26A0\ufe0f  [Mock API] ${method} ${pathname}`, error);
      sendJson(res, status, payload);
    }
  });
});

const host = process.env.MOCK_SERVER_HOST || 'localhost';
const port = Number(process.env.MOCK_SERVER_PORT || 4000);
server.listen(port, () => {
  console.log(`\u2705  SRE Platform Mock Server is running on http://${host}:${port}`);
  console.log(`\u2139\ufe0f  API base URL: http://${host}:${port}/api/v1`);
});
