import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function localApiPlugin() {
  return {
    name: 'local-vercel-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      for (const key of ['MONGODB_URI', 'MONGODB_DB', 'MONGODB_COLLECTION']) {
        if (env[key] && !process.env[key]) {
          process.env[key] = env[key];
        }
      }

      const apiUrl = pathToFileURL(path.resolve(process.cwd(), 'api/appreciation.js')).href;

      server.middlewares.use('/api/appreciation', async (req, res, next) => {
        if (req.url && req.url !== '/' && !req.url.startsWith('/?')) {
          return next();
        }

        try {
          let rawBody = '';
          if (req.method === 'POST') {
            rawBody = await new Promise((resolve, reject) => {
              let data = '';
              req.on('data', (chunk) => {
                data += chunk;
              });
              req.on('end', () => resolve(data));
              req.on('error', reject);
            });
          }

          const { default: handler } = await import(apiUrl);
          const apiReq = { method: req.method, body: rawBody };
          const apiRes = {
            setHeader: (k, v) => res.setHeader(k, v),
            status(code) {
              res.statusCode = code;
              return this;
            },
            json(payload) {
              if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
              }
              res.end(JSON.stringify(payload));
              return this;
            },
            end(body) {
              res.end(body);
              return this;
            },
          };

          await handler(apiReq, apiRes);
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localApiPlugin()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-dom/client'],
          motion: ['framer-motion'],
          gsap: ['gsap', 'gsap/ScrollTrigger'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
