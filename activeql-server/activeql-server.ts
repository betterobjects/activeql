import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit';
import _ from 'lodash';

import { Runtime, RuntimeConfig } from './core/runtime';

/**
 * I'd love to have this outside of this (library) package - alas Apollo checks somehow that the same constructor
 * is used - and when I use Apollo in the server/express package he is confused
 */
export class ActiveQLServer {

  static async create( runtimeConfig:RuntimeConfig, apolloConfig:ApolloServerExpressConfig = {} ):Promise<ApolloServer> {
    _.defaults( apolloConfig, { validationRules: [depthLimit(7)] } );
    const runtime = await Runtime.create( runtimeConfig );
    apolloConfig.schema = runtime.schema;
    apolloConfig.context = async (expressContext:any) => {
      const apolloContext = _.set( {}, 'runtime', runtime );
      const contextFn =
        _.has( runtimeConfig, 'domainDefinition.contextFn' ) ? _.get( runtimeConfig, 'domainDefinition.contextFn' ) :
        _.has( runtimeConfig, 'contextFn' ) ? _.get( runtimeConfig, 'contextFn' ) : undefined;
      await Promise.all( _.map( contextFn, fn => Promise.resolve( fn( expressContext, apolloContext ) ) ) );
      return apolloContext;
    }
    return new ApolloServer( apolloConfig );
  }

}
