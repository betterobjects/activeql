import { ApolloServerExpressConfig } from 'apollo-server-express';
import { DomainDefinition, MongoDbDataStore, GamaServer } from 'graph-on-rails';
import depthLimit from 'graphql-depth-limit';
import path from 'path';
import express from 'express';

import { domainConfiguration } from './domain-configuration';
import { addJwtLogin } from './impl/jwt-login';
import { addPrincipalFromHeader } from './impl/principal-from-header';

// some default values
const UPLOAD_DIR = '/uploads';
const UPLOAD_PATH = '/files';
const GRAPHQL_URL = '/graphql';
const MONGODB_URL = 'mongodb://localhost:27017';
const MONGODB_DBNAME = 'GAMA';
const DOMAIN_CONFIGURATION_FOLDER = './domain-configuration';

// load domain configuration from yaml files in folder ./domain-configuration
const domainDefinition:DomainDefinition = new DomainDefinition( DOMAIN_CONFIGURATION_FOLDER );

// add configuration from ./domain-configuration.ts
domainDefinition.add( domainConfiguration );

// add custom code
addPrincipalFromHeader( domainDefinition );

// the default datastore implementation
const dataStore = () => MongoDbDataStore.create({ url: MONGODB_URL, dbName: MONGODB_DBNAME });

// default Apollo configuration
const apolloConfig:ApolloServerExpressConfig = { validationRules: [depthLimit(7)] };

// GAMA config
const gamaConfig = { domainDefinition, dataStore };

export const gama = async( app: any ) => {
  addJwtLogin( domainDefinition, app );
  app.use( UPLOAD_PATH, express.static( path.join(__dirname, UPLOAD_DIR ) ) );
  const server = await GamaServer.create( apolloConfig, gamaConfig );
  server.applyMiddleware({ app, path: GRAPHQL_URL });
}

