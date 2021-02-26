import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { activeqlServer } from './activeql/bin/activeql-app';

require('dotenv').config();
const PORT = process.env.PORT || 4000;

(async () => {
  const app = express();
  app.use('*', cors());
  app.use(compression());
  app.set('port', PORT );

  const server = await activeqlServer( app );
  const httpServer = createServer( app );
  server.installSubscriptionHandlers( httpServer );

  httpServer.listen({port: PORT}, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`)
  });
})();
