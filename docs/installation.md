---
layout: page
title: Install, Embedd, Run
nav_order: 50
---

# ActiveQL Installation 

## ActiveQL generator

Install from ActiveQL generator and dependencies

```
npx betterobjects/activeql-generator my-activeql

cd ./my-activeql/express
npm i

cd ../my-activeql/angular
npm i
```

## ActiveQL starter application 

or _alternatively_ you can fork and clone the ActiveQL starter application

```
git clone https://github.com/betterobjects/activeql-starter.git
# or preferably your forked repository

cd ./activeql-starter/express
npm i

cd ../activeql-starter/angular
npm i
```



# Application start

To run GraphQL API server and Admin UI simply enter

```
cd ./express
npm run start
```

These are the commands from the generator and starter application

| folder | command | |
|-|-|-|
| `./express` | `npm run start` | starts ActiveQL Server (Express, port `4200`) and Admin UI (Angular, port `3000`) in debug mode |
| `./express` | `npm run server` | starts only the ActiveQL Server (Express, port `4200`) in debug mode |
| `./angular` | `ng serve` | starts only the Admin UI (Angular, port `3000`) in debug mode |


# Embedd libraries in your applications 

Instead of using the generated or starter application you can embedd the ActiveQL libraries in your existing applications. 

## Express 

### Install ActiveQL

```
npm i activeql-server
```

### Add as Express middleware

in your `app.js` add the ActiveQL server as middleware. `DOMAIN_CONFIGURATION_FOLDER` should point to a folder with your domain-configuration files. 

```typescript
(async () => {
  const app = express();
  app.use('*', cors());
  app.set('port', 3000 );

  const domainDefinition:DomainDefinition = new DomainDefinition( DOMAIN_CONFIGURATION_FOLDER );  
  const server = await ActiveQLServer.create( { domainDefinition } );
  server.applyMiddleware({ app, path: '/graphql' });

  const httpServer = createServer( app );

  httpServer.listen({port}, () => console.log(
    `🚀 GraphQL is running on http://localhost:3000/graphql`));
})();
```

For more options how to configure the ActiveQL server please refer to [Integrating ActiveQL Server](#activeqlserver)

### Angular

```
npm i activeql-admin-ui
```

In your `app.module.ts` add the `ActiveQLAdminUIModule` as follows. `adminConfig` is the optional configuration of the Admin UI application. 

```typescript
import { ActiveQLAdminUIModule } from 'activeql-admin-ui';
import { AppComponent } from './components/app/app.component';
import { GraphQLModule } from './graphql.module';
import { adminConfig } from './config/admin.config';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    GraphQLModule.forRoot({uri: 'http://localhost:3000/graphql'}),
    ActiveQLAdminUIModule.forRoot( adminConfig ),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Please check [https://apollo-angular.com/docs/](https://apollo-angular.com/docs/) on how to embedd the `GraphQLModule` in your application. 

For more options how to configure the ActiveQL Admin UI module please refer to [Integrating ActiveQL Admin UI](#admin-ui)
