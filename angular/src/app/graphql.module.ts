import { ModuleWithProviders, NgModule } from '@angular/core';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';

export type GRAPHGQL_MODULE_CONFIG = { uri:string }

export function provideApollo(httpLink:HttpLink) {
  const basic = setContext((operation, context) => ({ headers: { Accept: 'charset=utf-8' } }));
  const token = localStorage.getItem('token');
  const auth = setContext((operation, context) => ( token ? { headers: { Authorization: token } } : {} ));
  const uri = GraphQLModule.graphQLModuleConfig.uri;
  const link = ApolloLink.from([basic, auth, httpLink.create({ uri })]);
  const cache = new InMemoryCache();
  return { link, cache };
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [{
    provide: APOLLO_OPTIONS,
    useFactory: provideApollo,
    deps: [HttpLink]
  }]
})
export class GraphQLModule {

  public static graphQLModuleConfig:GRAPHGQL_MODULE_CONFIG;

  public static forRoot(graphQLModuleConfig:GRAPHGQL_MODULE_CONFIG):ModuleWithProviders<GraphQLModule> {
    return {
      ngModule: GraphQLModule,
      providers: (() => {
        GraphQLModule.graphQLModuleConfig = graphQLModuleConfig;
        return [{
          provide: 'graphQLModuleConfig',
          useValue: graphQLModuleConfig
      }]})()
    }
  }
}
