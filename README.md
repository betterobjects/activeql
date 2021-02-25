This is the development project for 

# ActiveQL 

A framework for building domain driven GraphQL APIs with an oppionated approach and _convention over configuration_ and _DRY_ in mind. Based on a simple domain configuration (mainly entities with attributes and their relationships) it 

  * generates a full GraphQL schema with aspects like searching, sorting, paging, permission access etc.   
  * provides a full fledged GraphQL API with resolvers - powered by [Apollo](https://www.apollographql.com) and [MongoDB](https://www.mongodb.com) (other Databases can be supported as well)
  * provides an Admin UI for basic CRUD applications 
  * allows to be extended for any non-convention requirement with custom code

You can find the [documentation here](https://betterobjects.github.io/activeql/)

## Use ActiveQL

To develop applications with ActiveQL you do not need this repository start with one of the following 

### Application Generator (not yet)

```
npx betterobjects/activeql-generator
```

<br>

### Starter-Application 

You can clone the ActiveQL-Starter-Application and following the instructions there:

[https://betterobjects.github.com/activeql-app](https://betterobjects.github.com/activeql-app)

<br>

### Embed Libraries 

You can also use the following libraries in your in your ExpressJS and optionally Angular Applications and follow the documentation how to embed them. We suggest taking a a look into the [Starter Application](#starter-application.md) to see how to use it.

| Libray            | URL                                                 | 
| ----------------- | --------------------------------------------------- | 
| ActiveQLServer    | https://www.npmjs.com/package/activeql-server       |
| ActiveQLAdminUI   | https://www.npmjs.com/package/activeql-admin-ui     |

<br>

## Developing the ActiveQL framework

This repo is for developing the ActiveQL framework or if you want to have the sources of the framework at hand when developing GraphQL APIs and/or Admin UI application(s).

### Repository structure

| Folder | Content |   
| - | - | 
| `./` | nothing interesting happens on the root folder level |  
| `./express`           | default Express application in which the ActiveQL Server library is used | 
| `./express/app.ts`    | creates default Express app that integrates the ActiveQL Apollo Server | 
| `./express/activeql`  | all code and configuration for the GraphQL API | 
| `./express/activeql/activeql-app.ts` | entry point for the configuration and starting the ActiveQL Apollo Server | 
| `./express/activeql/domain-configuration`  | default folder for entity and enum configuration yaml files | 
| `./express/activeql/impl`  | default folder for custom javascript/typescript code  | 
| `./express/upload`    | default folder all uploaded files are stored and served from | 
| `./express/db`        | default folder for the [NeDB](https://github.com/louischatriot/nedb) files (when using the [NedbDatastore](https://github.com/betterobjects/activeql/blob/master/activeql-server/nedb-datastore/nedb.data-store.ts)) | 
| `./angular`           | default Angular application in which the ActiveQL Admin UI module is used |
| `./angular/src`       | components and services embedding the ActiveQL Admin UI |
| `./activeql-server`   | the ActiveQL server library |
| `./angular/pojects/activeql-admin-ui` | the ActiveQL Admin UI module |

<br>

### Install required libraries

You have to run `npm install` in this folders: 

```
./activeql-server
./express
./angular
```

<br>

### Run the shell-applications

| application | in folder | command  |   |
| - | - | - | - |
| Express & Angular | `./express` | `npm run start`  | starts both the Express (port 4000) <br> and Angular (port 4200) application |
| Express           | `./express` | `npm run server` | starts only the ActiveQL Express server on port 4000 |
| Angular           | `./angular` | `ng serve`       | starts only the Angular Admin UI application  on port 4200 |


<br>

### Build & Publish ActiveQL Admin UI Angular module 

```
cd angular/projects/activeql-admin-ui
npm version patch 
```

```
cd angular
ng build activeql-admin-ui --prod
```

```
cd angular/dist/activeql-admin-ui
npm publish
```

This is done in one step by calling `./bin/publishNg.sh` from the root dir. 

**You should reference to the new version in the generator and starter-application!**

<br>

### Build & Publish ActiveQL server library 

```
cd activeql-server
npm version patch 
npm publish         # this will build 1st in dist
rm -rf dist         # otherwise you won't see changes in the ts-files in the running application
```

```
cd ../activeql-starter/express
npm i activeql-server               # this will bumb to the latest version
```

This is done in one step by calling `./bin/publishServer.sh` from the root dir. 

**You should reference to the new version in the generator!**
