# ActiveQLAdminUI

This is the Admin UI library for ActiveQL - a framework for building domain driven GraphQL APIs with an oppionated approach and _convention over configuration_ and _DRY_ in mind. Build domain driven GraphQL APIs with convention over configuration and DRY in mind. From domain model to full fledged GraphQL API and Admin UI in minutes.

You find the package for ActiveQL Server here [https://www.npmjs.com/package/activeql-server](https://www.npmjs.com/package/activeql-server)

The ActiveQL Admin UI will offer you default views for 

* Menu for entities
* List of entity items (with search, sort and pagination)
* Detail view of an entity item
* Master-Detail View for relationships between entities
* Navigation to related entity items
* File-Upload 


You can find the [full documentation and tutorial here](https://betterobjects.github.io/activeql).

## Installation

To start developing a GraphQL API you could embedd this library in your [Express](http://expressjs.com) application - but we recommend one the following methods that provides you with an instantly up-and-running environment. 

### Application Generator 

The easiest way to start is the ActiveQL application generator at [https://github.com/betterobjects/activeql-generator](https://github.com/betterobjects/activeql-generator)

You can create a new ActiveQL application in the folder `my-activeql` (or any other name) with the following command: 
```
npx betterobjects/activeql-generator my-activeql
```

<br>

### Starter-Application 

If you can't use `npx` you can also clone the ActiveQL-Starter-Application at [https://github.com/betterobjects/activeql-starter](https://github.com/betterobjects/activeql-starter)

```
git clone https://github.com/betterobjects/activeql-starter
```

<br>

### Install dependencies 

Please call `npm install` in these folders 

```
cd my-activeql/express
npm install

cd my-activeql/angular
npm install
```

## Start developing

In the folder `./express/activeql/domain-configuration` create a YAML file, e.g. `car.yml` with the following content: 

```yaml
entity:
  Car: 
    attributes: 
      licence: Key
      brand: String!
      color: String
      mileage: Int
```

Start the server and client application with the following command:

```
cd express
npm run start 
```

If you point your browser to [http://localhost:4200](http://localhost:4200) you will see the Admin UI allowing you to create, read, update and delete entity items (Cars in this example).
