import { ModuleWithProviders, NgModule } from '@angular/core';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';

export type GRAPHGQL_MODULE_CONFIG = { uri:string }

const provideApollo = (httpLink:HttpLink) => {
  const basicLink = setContext(() => ({ headers: { Accept: 'charset=utf-8' } }));
  const uri = GraphQLModule.graphQLModuleConfig.uri;
  const link = ApolloLink.from([basicLink, authLink, onErrorLink, httpLink.create({ uri })]);
  const cache = new InMemoryCache();
  return { link, cache };
}

const onErrorLink = onError(({ response, graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );
  if (networkError) console.log(`[Network error]: `, networkError );
});

const authLink = setContext(() => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
});

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
