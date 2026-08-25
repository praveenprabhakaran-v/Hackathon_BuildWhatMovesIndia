import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { defineConfig } from 'vite';
import { apiRouter } from './src/server/routes/api';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'express-api-dev-middleware',
        configureServer(server) {
          const app = express();

          // Body parsers with size limit
          app.use(express.json({ limit: '10mb' }));
          app.use(express.urlencoded({ extended: true, limit: '10mb' }));
          app.use(cookieParser());

          // Mount Primary REST API Router
          app.use('/api', apiRouter);

          // 404 Handler for Unmatched API Endpoints
          app.use('/api', (req: Request, res: Response) => {
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
          app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
            const timestamp = new Date().toISOString();
            const method = req.method;
            const url = req.originalUrl || req.url;

            // 1. JSON Syntax / Body Parsing Errors
            if (err instanceof SyntaxError && 'body' in err && (err as any).status === 400) {
              console.error(`[API Parse Error] [${timestamp}] ${method} ${url} -> 400 Bad Request: Malformed JSON payload.`);
              return res.status(400).json({
                error: 'Malformed JSON payload in request body.',
                status: 400,
                timestamp,
                path: url,
              });
            }

            // 2. State Transition / Conflict Errors
            if (err.name === 'StateTransitionError') {
              console.warn(`[API State Error] [${timestamp}] ${method} ${url} -> 409 Conflict: ${err.message}`);
              return res.status(409).json({
                error: err.message,
                status: 409,
                timestamp,
                path: url,
              });
            }

            // 3. File Upload / Multer Errors
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

            // 4. General / Unhandled Exceptions
            const statusCode = typeof err.status === 'number' ? err.status : typeof err.statusCode === 'number' ? err.statusCode : 500;
            const message = err.message || 'An unexpected internal server error occurred. Please try again.';

            // Detailed structured logging for server diagnostics
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

          server.middlewares.use(app);
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
