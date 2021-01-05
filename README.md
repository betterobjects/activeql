This is the development project for 

# ActiveQL 

A framework for building domain driven GraphQL APIs with an oppionated approach and _convention over configuration_ and _DRY_ in mind. Based on a simple domain configuration (mainly entities with attributes and their relationships) it 

  * generates a full GraphQL schema with aspects like searching, sorting, paging, permission access etc.   
  * provides a full fledged GraphQL API with resolvers - powered by [Apollo](https://www.apollographql.com) and [MongoDB](https://www.mongodb.com) (other Databases can be supported as well)
  * provides an Admin UI for basic CRUD applications 
  * allows to be extended for any non-convention requirement with custom code

You can find the [documentation here](https://betterobjects.github.io/activeql/)

# Use ActiveQL

To develop applications with ActiveQL you do not need this repository but use instead either 

### Application Generator 

```
npx betterobjects/activeql-generator
```

## Starter-Application 

You could also clone the ActiveQL-Starter-Application: 

[https://betterobjects.github.com/activeql-app](https://betterobjects.github.com/activeql-app)


## Embed Libraries 

You can also use the following libraries in your in your ExpressJS and optionally Angular Applications and follow the documentation how to embed them. We suggest taking a a look into the [Starter Application](#starter-application.md) to see how to use it.
w
| Libray            | URL                                                 | 
| ----------------- | --------------------------------------------------- | 
| ActiveQLServer    | https://www.npmjs.com/package/activeql-server       |
| ActiveQLAdminUI   | https://www.npmjs.com/package/activeql-admin-ui     |


# Developing ActiveQL

If you want to develop the ActiveQL framework you can clone this repository.

### Install required libraries

You have to run `npm install` in this folders: 

  * express
  * angular
  * activeqlServer

### Run the shell-applications

`cd /path/to/your-repo/express`

|   |   |   |
| - | - | - |
| Express           | `npm run start` | starts the ActiveQL Express server       |
| Angular           | `npm run ng`    | starts the Angular Admin UI application       |
| Express & Angular | `npm run dev`   | starts the Express and Angular application    |

### Publish package 

In folder `./angular/projects/activeql-admin-ui` and `./activeql-server` do 

```
npm version patch 
npm publish
```
