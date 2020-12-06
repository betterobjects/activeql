This is the development project for 

# GAMA 

The GraphQL framework with an oppionated approach and _convention over configuration_ and _DRY_ in mind. Based on a simple domain configuration (mainly entities with attributes and their relationships) it 

  * generates a full GraphQL schema with aspects like searching, sorting, paging, permission access etc.   
  * provides a full fledged GraphQL API with resolvers - powered by [Apollo](https://www.apollographql.com) and [MongoDB](https://www.mongodb.com) (other Databases can be supported as well)
  * provides an Admin UI for basic CRUD applications 
  * allows to be extended for any non-convention requirement with custom code

You can find the [documentation here](./doc/gama.md)

# Use Gama

To develop applications with GAMA you do not need this repository but use instead either the Starter-Application (recommended) or embedd the GAMA Express-Server (and optionally Admin-UI client) library in your application.

## Starter-Application 

The easiest and fastest way to start developing a GraphQL API (and optional UI) with GAMA is to clone the GAMA-Starter-Application: 

[https://betterobjects.github.com/gama-app](https://betterobjects.github.com/gama-app)

Image

Image

After you cloned your repository, you could start by adding an entity ( e.g. `Car`) in the folder `./express/domain-configuration`.

```yaml
Car: 
  attributes: 
    brand: String!
    model: String!
    color: String
    mileage: Int
```

You would then start the GAMA Server by

```
cd express
npm run start
```

If you go with a browser to `http://localhost:3000/graphql` you should see the generated schema and be able to call queries and mutations. 


## Embed Libraries 


You can also use the following libraries in your in your ExpressJS and optionally Angular Applications and follow the documentation how to embed them. We suggest taking a a look into the [Starter Application](#starter-application.md) to see how to use it.

| Libray  | URL | 
| - | - | 
| GamaExpress | https://www.npmjs.com/package/gama-express |
| ngGamaAdminUI | https://www.npmjs.com/package/ng-gama-admin-ui |

<br>

# Developing GAMA

If you want to develop the GAMA framework you can clone this repository.

### Install required libraries

You have to run `npm install` in this folders: 

  * express
  * angular
  * gamaExpress

### Run the shell-applications

`cd /path/to/your-repo/express`

|   |   |   |
| - | - | - |
| Express           | `npm run start` | starts the Apllo-GraphQL Express server       |
| Angular           | `npm run ng`    | starts the Angular Admin UI application       |
| Express & Angular | `npm run dev`   | starts the Express and Angular application    |

