import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';

import { activeqlServer } from './activeql-app';

require('dotenv').config();

(async () => {
  const app = express();
  app.use('*', cors());
  app.use(compression());

  await activeqlServer( app );

  const httpServer = createServer( app );

  httpServer.listen(
    { port: 3000 },
    () => console.log(`
      🚀 GraphQL is now running on http://localhost:3000/graphql`)
  );

})();

