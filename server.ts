/**
 * RTI Online - Full-Stack Express Server Entrypoint
 * Compatible with AWS Amplify, Node.js, Express, and Docker runtimes.
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { apiRouter } from './src/server/routes/api';

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Mount REST API Router
app.use('/api', apiRouter);

// 404 Handler for Unmatched API Endpoints
app.use('/api', (req, res) => {
  const timestamp = new Date().toISOString();
  console.warn(`[API 404] [${timestamp}] ${req.method} ${req.originalUrl || req.url} - Endpoint not found`);
  res.status(404).json({
    error: `API endpoint '${req.method} ${req.originalUrl || req.url}' does not exist.`,
    status: 404,
    timestamp,
    path: req.originalUrl || req.url,
  });
});

// Centralized Error Handling Middleware for Express / API
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;

  if (err instanceof SyntaxError && 'body' in err && (err as any).status === 400) {
    console.error(`[API Parse Error] [${timestamp}] ${method} ${url} -> 400 Bad Request: Malformed JSON payload.`);
    return res.status(400).json({
      error: 'Malformed JSON payload in request body.',
      status: 400,
      timestamp,
      path: url,
    });
  }

  if (err.name === 'StateTransitionError') {
    console.warn(`[API State Error] [${timestamp}] ${method} ${url} -> 409 Conflict: ${err.message}`);
    return res.status(409).json({
      error: err.message,
      status: 409,
      timestamp,
      path: url,
    });
  }

  if (err.name === 'MulterError' || (err.message && err.message.includes('PDF'))) {
    const multerStatus = err.code === 'LIMIT_FILE_SIZE' ? 413 : 422;
    const msg =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Uploaded file exceeds the maximum allowed limit of 1 MB.'
        : err.message || 'Invalid file upload.';
    console.warn(`[API Upload Error] [${timestamp}] ${method} ${url} -> ${multerStatus}: ${msg}`);
    return res.status(multerStatus).json({
      error: msg,
      status: multerStatus,
      timestamp,
      path: url,
      fieldErrors: { file: msg },
    });
  }

  const statusCode = typeof err.status === 'number' ? err.status : typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message = err.message || 'An unexpected internal server error occurred. Please try again.';

  console.error(`[API Failure] [${timestamp}] ${method} ${url} -> ${statusCode}: ${message}`);
  if (statusCode >= 500 && err.stack) {
    console.error(`[API Error Stack]\n${err.stack}`);
  }

  return res.status(statusCode).json({
    error: message,
    status: statusCode,
    timestamp,
    path: url,
    fieldErrors: err.fieldErrors || undefined,
  });
});

// Static Asset Serving & SPA Fallback for Production / AWS Amplify
const distPath = path.resolve(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Helpful route if accessed before build
  app.get('/', (_req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>RTI Online Backend</title></head>
        <body style="font-family: system-ui; padding: 2rem;">
          <h2>RTI Online API Server is active on port ${PORT}</h2>
          <p>Endpoints available:</p>
          <ul>
            <li><a href="/api/health">/api/health</a></li>
            <li><a href="/api/authorities">/api/authorities</a></li>
            <li><a href="/api/faq">/api/faq</a></li>
            <li><a href="/api/demo/registry">/api/demo/registry</a></li>
          </ul>
        </body>
      </html>
    `);
  });
}

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[RTI-Backend] Express Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
