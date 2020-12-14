# Architectur

## Overview

The following diagram shows an overview of ActiveQL

![ActiveQL Overview][overview]

[overview]: ./img/activeql-overview.png "ActiveQL Overview"


### ActiveQL Server

This library includes the oppionated generation of a GraphOL API based on the definition of a domain definition and was largely influenced by [Ruby-on-Rails](https://rubyonrails.org). It uses the concept of [Convention over configuration](https://en.wikipedia.org/wiki/Convention_over_configuration) and [Don't repeat yourself](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself).

It can be embedded in an ExpressJS application server and uses a typed configuration to easily express domain logic from which it creates

  * a [GraphQL schema](https://graphql.org/graphql-js/basic-types/),
  * default [Resolvers](https://graphql.org/learn/execution/) that uses a datastore to read/write application data from/to and
  * helper queries / resolver to provide the ActiveQL Admin UI with metadata so it can generate a generic UI.

### ActiveQL Admin UI

An Angular Module that uses a ActiveQL GraphQL API to create generic (often Admin) views and services to enable
a human user to interact with your API - search, list, sort entries and create, update, delete operations etc.

Please check out the [documentation](./admin-ui) for more information.

### ActiveQL Starter Application

A ready to run application to run a ActiveQL Server and Admin UI. You can add your domain logic and custom implementation here or use this as a starting point or referece for your own ActiveQL powered application.

Please check out the [documentation](./starter-app) for more information.


## Technologies

Although you can use ActiveQL without deep knowledge of the underlying technologies - in fact ActiveQL's goal is exactly to enable you to fully concentrate on your business domain without the need to engage in technical details - you should be aware of the technologies:

  - **ActiveQL** is a [NodeJS](https://nodejs.org) framework 

  - Is uses [Express](http://expressjs.com) for the server part
  
  - It uses the [Apollo Data Graph Platform](https://www.apollographql.com) and the [Apollo Server Express Middleware](https://www.apollographql.com/docs/apollo-server/) to provide the GraphQL API server
  
  - The configuration of your business domain can be done in Javascript/[Typescript](https://www.typescriptlang.org) or in [YAML](https://yaml.org) files

- **ActiveQL** has the concept of a _datastore_ where application data are read from and written to. ActiveQL ships with two default implementations of a datastore that uses either 
  - a file based document database [NeDB](https://github.com/louischatriot/nedb) (for quickstart, prototyping etc. without any further dependencies) 
  - or [MongoDB](https://www.mongodb.com/try/download/community) (suggested for production purposes). 
  - Other implementations using e.g. relational databeses or even another API (e.g. REST) can be implemented.

- It also includes an [Angular](https://angular.io) application that provides a generic Admin UI if you want to provide users with the possibility to access your business domain API via a generic web application.

- The starter **ActiveQL** application includes a [JWT](https://jwt.io) authorization to authenticate a principal and secure your API via role based permissions.

