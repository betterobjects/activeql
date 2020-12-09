import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';

import { activeql } from './activeql-app';

(async () => {
  const app = express();
  app.use('*', cors());
  app.use(compression());

  await activeql( app );

  const httpServer = createServer( app );

  httpServer.listen(
    { port: 3000 },
    () => console.log(`
      🚀 GraphQL is now running on http://localhost:3000/graphql`)
  );

})();

