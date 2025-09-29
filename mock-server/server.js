import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { spawnSync } from 'child_process';
import { createRequire } from 'module';

const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const compiledHandlerPath = path.join(distDir, 'mock-server', 'handlers.js');
const compiledDbPath = path.join(distDir, 'mock-server', 'db.js');
const sourceHandlerPath = path.join(__dirname, 'handlers.ts');
const sourceDbPath = path.join(__dirname, 'db.ts');

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
  const require = createRequire(import.meta.url);
  const tscPath = require.resolve('typescript/bin/tsc');
  const compile = spawnSync(
    process.execPath,
    [
      tscPath,
      sourceHandlerPath,
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
};

if (needsBuild()) {
  console.log('\u2692\ufe0f  Building mock-server TypeScript sources...');
  buildSources();
}

const handlerModuleUrl = pathToFileURL(compiledHandlerPath).href;
const { handleRequest } = await import(handlerModuleUrl);

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1', async (req, res, next) => {
  const method = req.method?.toUpperCase();
  if (!method || !ALLOWED_METHODS.has(method)) {
    res.status(405).json({ message: `Method ${req.method} is not supported by the mock server.` });
    return;
  }

  try {
    const result = await handleRequest(method, req.path, req.query ?? {}, req.body);
    if (method === 'DELETE') {
      res.status(204).send();
      return;
    }
    if (method === 'POST' && result === undefined) {
      res.status(204).send();
      return;
    }
    res.json(result ?? {});
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ message: `Endpoint [${req.method}] ${req.originalUrl} not found on mock server.` });
});

app.use((err, req, res, next) => {
  const status = typeof err?.status === 'number' ? err.status : 500;
  const message = err?.message || 'Internal Server Error';
  const payload = { message };
  if (err?.data) {
    payload.data = err.data;
  }
  console.error(`\u26A0\ufe0f  [Mock API] ${req.method} ${req.originalUrl}`, err);
  res.status(status).json(payload);
});

const port = Number(process.env.MOCK_SERVER_PORT || 4000);
app.listen(port, () => {
  console.log(`\u2705  SRE Platform Mock Server is running on http://localhost:${port}`);
  console.log(`\u2139\ufe0f  API base URL: http://localhost:${port}/api/v1`);
});
