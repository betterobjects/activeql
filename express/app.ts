import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { activeqlServer } from './activeql-app';


require('dotenv').config();
const port = process.env.PORT || 3000;

(async () => {
  const app = express();
  app.use('*', cors());
  app.use(compression());
  app.set('port', port );

  await activeqlServer( app );
  const httpServer = createServer( app );

  httpServer.listen({port}, () => console.log(`🚀 GraphQL is running on http://localhost:${port}/graphql`));
})();

