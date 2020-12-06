---
layout: page
title: Home
permalink: /home/
nav_order: 1
---

# GAMA

From business domain definition to GraphQL API and Admin UI in minutes - or _**GraphQL on Steroids**_

We think [GraphQL](https://graphql.org) is a great way to expose your business domain to any client or 3rd party system.  Implementing a GraphQL API is a tedious task though. You need to decide how to structure your schema, how to handle concepts like searching, sorting, paging, how to implement resolvers that read data from
and write data to a database or similar, validate input, relationships etc.

GAMA supports this development with an oppinionated approach based on the configuration of a business domain
(mainly entities and its relations to each other).

We believe - as Alan Kay puts it - "Simple things should be simple, complex things should be possible". Let's see
the simplicity and power of a business-domain-configuration-based API creation by looking at an simple example. Or you can jump directly to a little more in-depth [tutorial](./tutorial.md).

## Example

A defintion of a simple _entity_ could like like

_YAML_
```yaml
entity:
  Car:
    attributes:
      brand: String!
      mileage: Int
```

and will generate the following schema, incl. resolvers using (per default) a MongoDB to read and write data, executable by the GAMA starter app without any further efforts.

* a type definition
* a query for the type (by id)
* a query for a list of types (with filter and sort)
* a filter for the type
* filter types for all Types and Scalars
* a sort enum for the list query
* a create mutatation
* an update mutatation
* an input type for the create mutatation
* an input type for the update mutatation
* a result type for create and update mutations
* resolver for the queries and mutations that read/write to a data store (per default a mongo db)
* and some helper types, query and mutations we'll cover later

Let's break the generated GraphQL scheme for this simple example down

### Type

```graphql
type Car {
  id: ID!
  brand: String!
  mileage: Int
  createdAt: Date
  updatedAt: Date
}
```

The `car` entity becomes a GraphQL type with attributes from the _Entity definition_ becoming attributes of this type.
As you see, in addition an entity gets a unique `id` that is used to identify any item (instance) of an _entity_.
This `id` is also used to implement the relationship of entities.

The `id` is assigned by the framework (in fact the actual datastore implementation) when you call the _create_ mutation.

Every entity type has also `createdAt` and `updatedAt` timestamp fields. That are set automatically by the mutation resolvers.

### Input Types

The mutations use _Input Types_ to hold the value of items that should be created or updated.

```graphql
input CarCreateInput {
  brand: String!
  mileage: Int
}

input CarUpdateInput {
  id: ID!
  brand: String
  mileage: Int
}
```

As you see there are seperate types used by the create and update mutations. The CreateType does not have an `id` -
this will be assigned by the _datastore_, where the UpdateType does. The `id` determines which entity item should be
updated. Also note that the `brand` attribute in this case is not a mandatory field in the `CarUpdateInput`, even it
is configured as such, and the `CarCreateInput` does have it as mandatory. This is because a client is not forced to
pass all attributes in the _update mutation_ but only those it wants to change. But making required attributes
mandatory in the GraphQL schema would not allow to leave the brand untouched.

***
_Request_

```graphql
mutation {
  createCar(  car: { mileage: 310000 }  )
  {
    car{ id brand mileage }
    validationViolations { attribute message }
  }
}
```

_Response_

```json
{
  "error": {
    "errors": [
      {
        "message": "Field \"CarCreateInput.brand\" of required type \"String!\" was not provided."
      }
    ]
  }
}
```

***

_Request_

```graphql
mutation {
  updateCar(
    car: {
      id: "5fa94775477b8bba016e81b0"
      mileage: 310000
  )
  {
    car{ id brand mileage }
    validationViolations { attribute message }
  }
}
```

_Response_

```json
{
  "data": {
    "updateCar": {
      "car": {
        "id": "5fa94775477b8bba016e81b0",
        "brand": "Porsche",
        "mileage": 310000
      },
      "validationViolations": []
    }
  }
}
```

***

### Filter

```graphql
input CarFilter {
  id: ID
  brand: StringFilter
  mileage: IntFilter
}
```

For every entity-type a filter-type is created that is used in the types query. For every attribute a corresponding
filter type is determined. E.g. the `StringFilter` for the `brand` attribute. This filter-types are defined by
the _datastore_ since their implementation is dependent to the datastore (e.g. database). For this example
the default _mongodb datastore_ provides the following _scalar filter-types_:

```graphql
input StringFilter {
  is: String
  isNot: String
  in: [String]
  notIn: [String]
  contains: String
  doesNotContain: String
  beginsWith: String
  endsWith: String
  caseSensitive: Boolean
}

input IntFilter {
  eq: Int
  ne: Int
  le: Int
  lt: Int
  ge: Int
  gt: Int
  isIn: [Int]
  notIn: [Int]
  between: [Int]
}
```

<table width="100%" style="font-size: 0.9em"><tr valign="top">
<td width="50%">Request</td><td width="50%">Response</td></tr>
<tr valign="top"><td width="50%">

```graphql
query {
  cars( filter: {
    brand: { contains: "a" },
    mileage: { gt: 100000 } } ){
  	id brand mileage
  }
}
```

</td><td width="50%">

```json
{
  "data": {
    "cars": [
      {
        "id": "5fa94775477b8bba016e81a4",
        "brand": "Audi",
        "mileage": 125331
      },
      {
        "id": "5fa94775477b8bba016e81a1",
        "brand": "Audi",
        "mileage": 121349
      },
      {
        "id": "5fa94775477b8bba016e8196",
        "brand": "Audi",
        "mileage": 105400
      },
      {
        "id": "5fa94775477b8bba016e8195",
        "brand": "Toyota",
        "mileage": 141964
      },
  ...
```
</td></tr></table>


For more details check [Filter Types](./filter-types.md)

### Sort

```graphql
enum CarSort {
  brand_ASC
  brand_DESC
  mileage_ASC
  mileage_DESC
  id_ASC
  id_DESC
}
```

The _types query_ uses this the _entity sort enum_ to determine the sort order of the result. For every attribute
(unless configured otherwise) two enum values are created. One for ascending order (e.g. `brand_ASC`) and one for
descending order (e.g. `mileage_DESC`).

### Paging

```graphql
input EntityPaging {
  page: Int!
  size: Int!
}
```

If a query to the _types query_ wants to use a subset instead of the whole result it can use the _paging input type_.
So a result set with 100 items would deliver the first 10 items when used with the query

```graphql
  query {
    cars( paging: { page: 0, size: 10 } )
  }
```

For the next 10 items it would be
```graphql
  query {
    cars( paging: { page: 1, size: 10 } )
  }
```

Pages start with 0.

### Queries

```graphql
type Query {
  ping: String
  car(id: ID): Car
  cars(filter: CarFilter, sort: CarSort, paging: EntityPaging): [Car]
  carsStats(filter: CarFilter): EntityStats
}
```

Any schema includes a query `ping` that simply sends back the value `pong` and can be used whether a GraphQL API can
be accessed without the need to build any specific query or mutation.

#### Type Query

If a client knows the `id` of an entity item it can access this via the type query, eg.
```graphql
query {
  car( id:"5fa5138860b514597c3c6fa5"){ id brand mileage }
}
```

If this `id` does not exist an exception will be thrown.

#### Types Query

A client can request a result set of entity items with filtering, sorting and paging, e.g.
```graphql
query {
  cars { id brand  mileage}
}
```
will return all car entities in no specific order.

A more sophisticated usage of the `cars` _types query_:
```graphql
query {
  cars(
    filter: { brand: { in: [ "Mercedes", "Porsche"] } }
    sort: mileage_DESC
    paging: { page: 0, size: 3 }
  )
  { id brand  mileage}
}
```
would return the three `cars` of the brand "Mercedes" and "Porsche" with the highest `milage`.


### Mutations

```graphql
type Mutation {
  ping(some: String): String
  seed(truncate: Boolean): String
  createCar(car: CarCreateInput): SaveCarMutationResult
  updateCar(car: CarUpdateInput): SaveCarMutationResult
  deleteCar(id: ID): [String]
}
```

Any schema includes a mutation `ping` that simply sends the value back and can be used wheter a GraphQL API can
be accessed without the need to build any specific query or mutation.

```graphql
mutation {
    ping(some: "Thomas")
}
```

```json
{
  "data": {
    "ping": "pong, Thomas!"
  }
}
```

Also any schema comes with the `seed` mutation that can be called to seed the datastore with seed data, as defined
in the _entity configuration_. Since we haven't included any seed data in this simple example - nothing would
happen, except when you would call
```graphql
mutation {
    seed(truncate: true)
}
```
In this case all entity collections (e.g. tables) in the datastore would be truncated. So you should use this
carefully.

TODO - should be disabled in production.

The _create, update, delete mutations_ will take the input values and create, update or delete the entity item
in the datastore.

### Mutation Result Types

The _create and update mutations_ have a different return whether the operation could be executed or validation
errors prevented this. They return a _mutation result type_ that hold either the _validation violations_ or the
successfully created/updated entity item.

```graphql
type SaveCarMutationResult {
  validationViolations: [ValidationViolation]!
  car: Car
}

type ValidationViolation {
  attribute: String
  message: String!
}
```

To get possible validation errors from a `createCar` mutation or the assigned id of the newly created car,
a client would use something like the following mutation:
```graphql
mutation {
  createCar( car: { brand: "Porsche", mileage: 20000 } ){
    validationViolations { attribute message }
  	car { id }
}
```

Since we did not include any validation in our simple example we would always get the `id` from this mutation. Any
non-validation error would lead to an exception in the GraphQL layer and its handling is not part of the schema.

### Statistics

A client can request some basic statistics about the entity. This can also be used for filtered result sets.

  * `count` the number of items
  * `createdFirst` the date when the first item was created
  * `createdLast` the date when the last item was created
  * `updatedLast` the date when the first item was updated

```graphql
type EntityStats {
  count: Int!
  createdFirst: Date
  createdLast: Date
  updatedLast: Date
}
```
To know how many `cars` of the brand 'Porsche' exist a client can use the following query:
```graphql
  query {
    carsStats( filter: {brand: "Porsche" } ){ count }
  }
```

This example covered just some basic concepts. Please refer to the documentation to see the possibilities to
translate your business domain into a GraqphQL API and UI.



















<br>

---

You will find extensive documentation here:

|   |    |
| ------------------------------------------------------- | ------------------------------------------------ |
| [Domain Configuration](./domain-configuration.md)       | Starting point to describe your business domain  |
| [Entity Configuration](./entity-configuration.md)       | How to describe entities in your business domain |
| [Attribute Configuration](./attribute-configuration.md) | Configuration of the attributes of your entities |


<br>


## Terminologies

We use the following terms in a dedicated meaning

### Business Domain

Description of your real world domain in terms of entities with attributes, operations and relationships.
Think of UML class diagrams.

### Domain Configuration

Any configuration in JSON, typescript or YAML to describe or configure (a part) of your business domain.
A _Domain Configuration_ can consist of _Entity Configurations_, _Enum Configurations_, _Custom Queries_ and
_Custom Mutations_.

### Entity Configuration

A configuration in JSON, typescript or YAML to describe an **entity** of your business domain with its
attributes, validations, behaviour, relationships to other entites etc.

### DomainDefintion

You can seperate your _Domain Configuration_ (if you like) over many files or configuration objects. All your
configurations are turned into one _Domain Definition_. From this definition a GraphQL schema and all
Query and Mutation Resolvers are generated.

<br>


## Technologies

GAMA is an acronym for **G**raphQL-**A**pollo-**M**ongodb-**A**ngular which should indicate the technologies it uses
to provide a framework for business domain driven APIs / applications.

Although you can use GAMA without deep knowledge of the underlying technologies - in fact GAMAs goal is exactly
to enable you to fully concentrate on your business domain without the need to engage in technical details - we
encourage to familiarize with this technologies:

- GAMA is a [NodeJS](https://nodejs.org) framework that uses [Express](http://expressjs.com).

- It uses the [Apollo Data Graph Platform](https://www.apollographql.com)
and the [Apollo Server Express Middleware](https://www.apollographql.com/docs/apollo-server/)

- The configuration of your business domain can be done in Javascript/[Typescript](https://www.typescriptlang.org) or
in [YAML](https://yaml.org) files

- GAMA has the concept of a _datastore_ where application data are read from and written to. GAMA ships with a default
implementation of a datastore that uses [MongoDB](https://www.mongodb.com/try/download/community). Other
implemenatations that use e.g. relational databeses or even another API (e.g. REST) can be implemented.

- It also includes an [Angular](https://angular.io) application that provides a generic Admin UI if you want to
provide users with the possibility to access your business domain API via web application.

## Overview

The following diagram shows an overview of GAMA

![GAMA Overview][overview]

[overview]: ./img/gama-overview.png "GAMA Overview"

GAMA provides 4 packages / modules:

### Graph-on-Rails Server Library

The name Graph-on-Rails is a reminiscence to [Ruby-on-Rails](https://rubyonrails.org) which was a large influence to
the development of GAMA. It uses the concept of [Convention over configuration](https://en.wikipedia.org/wiki/Convention_over_configuration) and [Don't repeat yourself](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself).

The library is highly opionated how a business domain (mainly entities and CRUD operations) should be provided as
a GraphQL API. It uses a typed configuration to easily express domain logic from which it creates

  * a [GraphQL schema](https://graphql.org/graphql-js/basic-types/),
  * default [Resolvers](https://graphql.org/learn/execution/) that uses a datastore to read/write application data from/to and
  * helper queries / resolver to provide the GAMA Admin UI with metadata so it can generate a generic UI.

### Graph-on-Rails Server Application

The server application to expose your GraphQL API. You can embed the Graph-on-Rails library in your own
express application or use this application as a boilerplate
[Apollo Express Server](https://www.apollographql.com/docs/apollo-server/).

This (or your custom) application is the place for your domain configuration.

Please check out the [documentation](./server.md) for more information.

### GAMA UI Angular Module

An Angular Module that uses a Graph-on-Rails GraphQL API to create generic (often Admin) views and services to enable
a human user to interact with your API - search, list, sort entries and create, update, delete operations etc.

Please check out the [documentation](./angular-module.md) for more information.

### GAMA UI Angular Application

You can embedd the GAMA UI Angular Module in your own Angular application or use this boilerplate Angular application
that provides the Admin UI in a generic fashion.

Please check out the [documentation](./angular-application.md) for more information.
