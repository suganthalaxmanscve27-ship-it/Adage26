import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Dev middleware to handle /api/send-email locally during npm run dev
function devApiServer() {
  return {
    name: 'dev-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/send-email') && req.method === 'POST') {
          try {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const parsedBody = JSON.parse(body || '{}');
                const env = loadEnv('development', process.cwd(), '');
                const apiKey = env.BREVO_API_KEY || env.VITE_BREVO_API_KEY;
                const senderEmail = env.BREVO_SENDER_EMAIL || env.VITE_BREVO_SENDER_EMAIL || 'civiladagegce@gmail.com';

                const { default: handler } = await import('./api/send-email.js');
                const mockReq = { method: 'POST', body: parsedBody };
                const mockRes = {
                  status(code) {
                    res.statusCode = code;
                    return this;
                  },
                  json(data) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                  }
                };
                process.env.BREVO_API_KEY = apiKey;
                process.env.BREVO_SENDER_EMAIL = senderEmail;
                await handler(mockReq, mockRes);
              } catch (e) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: e.message }));
              }
            });
          } catch (err) {
            next();
          }
          return;
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devApiServer()],
  base: '/',
})
