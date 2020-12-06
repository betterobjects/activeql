import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import _ from 'lodash';

import { DomainDefinition } from './core/domain-definition';
import { DomainConfiguration } from './core/domain-configuration';
import { GamaConfig, Runtime } from './core/runtime';

/**
 * I'd love to have this outside of this (library) package - alas Apollo checks somehow that the same constructor
 * is used - and when I use Apollo in the server/express package he is confused
 */
export class GamaServer {


  static async create( apolloConfig:ApolloServerExpressConfig, gamaConfig:GamaConfig|DomainDefinition|DomainConfiguration|string ):Promise<ApolloServer> {
    const runtime = await Runtime.create( gamaConfig );
    apolloConfig.schema = runtime.schema;
    apolloConfig.context = async (expressContext:any) => {
      const apolloContext = _.set( {}, 'runtime', runtime );
      const contextFn =
        _.has( gamaConfig, 'domainDefinition.contextFn' ) ? _.get( gamaConfig, 'domainDefinition.contextFn' ) :
        _.has( gamaConfig, 'contextFn' ) ? _.get( gamaConfig, 'contextFn' ) : undefined;
      await Promise.all( _.map( contextFn, fn => Promise.resolve( fn( expressContext, apolloContext ) ) ) );
      return apolloContext;
    }
    return new ApolloServer( apolloConfig );
  }



}
