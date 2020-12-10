# ActiveQL Server

This is the server package for ActiveQL - A framework for building domain driven GraphQL APIs with an oppionated approach and _convention over configuration_ and _DRY_ in mind. Based on a simple domain configuration (mainly entities with attributes and their relationships) it 

  * generates a full GraphQL schema with aspects like searching, sorting, paging, permission access etc.   
  * provides a full fledged GraphQL API with resolvers - powered by [Apollo](https://www.apollographql.com) and [MongoDB](https://www.mongodb.com) (other Databases can be supported as well)
  * provides an Admin UI for basic CRUD applications 
  * allows to be extended for any non-convention requirement with custom code

You can find the [documentation here](https://betterobjects.github.io/activeql/)


## Starter Application 

The easiest and fastest way to start developing a GraphQL API (and optional UI) with ActiveQL is **not** to use this library but to use the ActiveQL-Starter-Application. 

You can clone this here: [https://betterobjects.github.com/activeql-app](https://betterobjects.github.com/activeql-app)

You find all necessary instructions there. 


## Embedding the library in your own application

Instead of using the ActiveQL-Starter-Application you can of course also embedd this library in your own [Express](http://expressjs.com) application. 

We would nonetheless recommend to look into the ActiveQL-Starter-Application at [https://betterobjects.github.com/activeql-app](https://betterobjects.github.com/activeql-app) to see how to use this library. 


### Creating an ActivQL server instance 

If you want to apply all defaults you can simply create an instance of the ActiveQLServer and apply your app as a middleware to it.

`./app.ts`
```typescript
import { ActiveQLServer } from 'activeql-server';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';

(async () => {
  const app = express();
  app.use('*', cors());
  app.use(compression());

  const server = await ActiveQLServer.create();
  server.applyMiddleware({ app, path: '/graphql' });

  const httpServer = createServer( app );

  httpServer.listen(
    { port: 3000 },
    () => console.log(`
      🚀 GraphQL is now running on http://localhost:3000/graphql`)
  );

})();
```

### Customizing the ActiveQLServer instance

If you want to apply some more options to the creation of the ActiveQLServer instance (which is probably the case), you could extract this to a seperate file, that you call from you app.ts: 

`./app.ts`
```typescript
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
```

`./activeql-server.ts`
```typescript
import { ApolloServerExpressConfig } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit';
import path from 'path';
import express from 'express';

import { domainConfiguration } from './domain-configuration';
import { addJwtLogin } from './impl/jwt-login';

// some default values
const UPLOAD_DIR = '/uploads';
const UPLOAD_PATH = '/files';
const GRAPHQL_URL = '/graphql';
const DOMAIN_CONFIGURATION_FOLDER = './domain-configuration';

// load domain configuration from yaml files in folder ./domain-configuration
const domainDefinition:DomainDefinition = new DomainDefinition( DOMAIN_CONFIGURATION_FOLDER );

// add custom code from ./domain-configuration.ts
domainDefinition.add( domainConfiguration );

// default Apollo configuration
const apolloConfig:ApolloServerExpressConfig = { validationRules: [depthLimit(7)] };

// create runtime config
const runtimeConfig = { domainDefinition };

export const activeql = async( app: any ) => {

  // add JWT Authentication
  addJwtLogin( domainDefinition, app );
  
  // serve files uploaded via API statically 
  app.use( UPLOAD_PATH, express.static( path.join(__dirname, UPLOAD_DIR ) ) );
  
  // create ActiveQLServer instance 
  const server = await ActiveQLServer.create( apolloConfig, runtimeConfig );
  
  // apply to middleware
  server.applyMiddleware({ app, path: GRAPHQL_URL });
}
```
