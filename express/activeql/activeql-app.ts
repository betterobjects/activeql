import { ApolloServerExpressConfig } from 'apollo-server-express';
import { DomainDefinition, MongoDbDataStore, ActiveQLServer, Runtime } from 'activeql-server';
import depthLimit from 'graphql-depth-limit';
import path from 'path';
import express from 'express';

import { domainConfiguration } from './domain-configuration';
import { addJwtLogin, useJwtLogin } from './impl/jwt-login';
import { addPrincipalFromHeader } from './impl/principal-from-header';

// some default values
const UPLOAD_DIR = '/uploads';
const UPLOAD_PATH = '/files';
const GRAPHQL_URL = '/graphql';
// const MONGODB_URL = 'mongodb://localhost:27017';
// const MONGODB_DBNAME = 'ActiveQL';
const DOMAIN_CONFIGURATION_FOLDER = __dirname + '/domain-configuration';

// load domain configuration from yaml files in folder ./domain-configuration
const domainDefinition:DomainDefinition = new DomainDefinition( DOMAIN_CONFIGURATION_FOLDER );

// add configuration from ./domain-configuration.ts
domainDefinition.add( domainConfiguration );

// add custom code
// addPrincipalFromHeader( domainDefinition );
addJwtLogin( domainDefinition );

// the default datastore implementation
// const dataStore = () => MongoDbDataStore.create({ url: MONGODB_URL, dbName: MONGODB_DBNAME });

// default Apollo configuration
const apolloConfig:ApolloServerExpressConfig = { validationRules: [depthLimit(7)] };

// ActiveQL config
const runtimeConfig = { domainDefinition };

export const activeqlServer = async( app: any ) => {
  useJwtLogin( app );
  app.use( UPLOAD_PATH, express.static( path.join(__dirname, UPLOAD_DIR ) ) );
  const server = await ActiveQLServer.create( apolloConfig, runtimeConfig );
  server.applyMiddleware({ app, path: GRAPHQL_URL });
}

export const activeqlSeeed = async (truncate:boolean) => {
  const runtime = await Runtime.create({domainDefinition});
  return runtime.seed( truncate );
}
