---
layout: page
title: Domain Configuration
permalink: /domain-configuration/
has_children: true
nav_order: 10
---

# Domain Configuration 

The generation of the GraphQL schema and the read/write access to data and functionality is defined by a 
configuration of your business domain, by large parts entities with its attributes in addition to custom queries and
mutations.

The Domain Configuration is a TypeScript object of the type

```
type DomainConfiguration = {
  entity?:{[name:string]:EntityConfig},
  enum?:{[name:string]:EnumConfig},
  query?:{[name:string]:QueryConfigFn},
  mutation?:{[name:string]:MutationConfigFn}
}
```

## Structure of your Domain Configuration

The source of domain configuration can be any number of YAML files or JavaScript/TypeScript configuration object, that will be merged together. 

When you are using the ActiveQL starter application, you can simply put YAML files (we suggest one file per entity/enum) in the folder `./express/activeql/domain-configuration`. 

If you want to write the configuration as a JavaScript/TypeScript object, the easiest way to start is to add your configuration in the file `./express/activeql/domain-configuration.ts`. 

Both the folder and TypeScript file will be automatically parsed by the application.

You can nonetheless choose any other combination of folders or files to structure your application. A common approach is to seperate the seed data from the rest of the entity definition. You usually would not want to have seed test data in a production environment. So it is easy to include them only in development.

Let's assume you want to have your basic entity definitions as yaml files in one folder, test seed data as yaml files in another and production seed data in a seperate folder. You also want to have some configuration (usually callback functions) in a seperate TypeScript file per entity. This could be a folder structure: 

```
cd ./express/activeql

./domain-configuration                      # your basic entity/enum definitions
./domain-configuration/car.yml
./domain-configuration/car.ts               # TypeScript configuration object for car
./domain-configuration/driver.yml
./domain-configuration/driver.ts            # TypeScript configuration object for driver
./domain-configuration/fleet.yml

./domain-configuration/seed-test            # the test seed data
./domain-configuration/seed-testcar.yml
./domain-configuration/seed-testdriver.yml
./domain-configuration/seed-testfleet.yml

./domain-configuration/seed-prod            # the production seed data
./domain-configuration/seed-prodfleet.yml
```

This structure should be made known to the ActiveQL runtime in the file `activeql-app.ts` like so: 

```typescript
import { carDomainDefinition } from './domain-configuration/car';
import { driverDomainDefinition } from './domain-configuration/driver';

// this will add all yml filders from the given folders
const domainDefinition:DomainDefinition = new DomainDefinition([
  __dirname + '/domain-configuration'],
  __dirname + '/domain-configuration/seed-test'   // "seed-prod" in production environment
]);

domainDefinition.add( carDomainDefinition );
domainDefinition.add( driverDomainDefinition );

export const activeqlServer = async( app: any ) => {
  const server = await ActiveQLServer.create( { runtimeConfig } );
  server.applyMiddleware({ app, path: '/graphql` });
}
```
