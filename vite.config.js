import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';

const localTimestampPath = path.resolve('dev/timestamp.json');

const serveLocalTimestamp = () => {
  const middleware = (req, res, next) => {
    const requestPath = req.url?.split('?')[0];

    if (requestPath !== '/timestamp.json') {
      next();
      return;
    }

    fs.readFile(localTimestampPath, 'utf8', (error, content) => {
      if (error) {
        next(error);
        return;
      }

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(content);
    });
  };

  return {
    name: 'serve-local-timestamp',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
};

export default defineConfig({
  plugins: [serveLocalTimestamp()],
});
