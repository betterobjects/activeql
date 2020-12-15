---
layout: default
title: Home
nav_order: 1
description: "Overview about ActiveQL"
permalink: /
---

# ActiveQL

From business domain definition to full fledged GraphQL API and Admin UI in minutes - with convention over configuration and DRY (don't repeat yourself) in mind.

## GraphQL and API First

We think [GraphQL](https://graphql.org) is a great way to expose your business domain to any client or 3rd party system. We also believe that it is a good way to follow an API 1st approach - you express your business entities and functionality as API. Everything else (from different user interfaces, integration with other systems to infrastructure task etc.) uses this API as a common understanding of your business domain.

Implementing a GraphQL API is a tedious task though. You need to decide how to structure your schema, how to handle concepts like permissions, searching, sorting, paging, how to implement resolvers that read data from and write data to a database or similar, validate input, relationships etc. And implement it with quite some repetitive code.

**ActiveQL** supports this development with a highly oppionated generation of a GraphQL schema and resolvers. You can run a GraphQL API directly from the description of a business domain (mainly entities and its relations to each other). This gives you the the freedom to concentrate on the implementation of any non-default functionality on top of that.

## Terminologies

We use the this terms in the following meaning throughout this documenatation.

| Term | Description |
| ---- | ----------- |
| Business Domain           | Description of your real world business domain in terms of entities with attributes, operations and relationships. Think of UML class diagrams. |
| Entity                    | Any _thing_ in your business domain. Think of UML class or SQL table. |
| Entity Item               | Any instance of an entity, think of class instance or table row. |
| Domain Configuration      | Any configuration in JSON, typescript or YAML to describe or configure (a part) of your business domain. A _Domain Configuration_ can consist of _Entity Configurations_, _Enum Configurations_, _Custom Queries_ and _Custom Mutations_. |
| DomainDefinition           | You can seperate your _Domain Configuration_ (if you like) over many YAML/JSON files or configuration objects. At runtime all configurations are merged into one _Domain Definition_. From this definition a GraphQL schema and all Query and Mutation Resolvers are generated. |
| Entity Configuration      |  Any configuration in YAML, JSON or object to describe an _entity_ of your business domain with its attributes, validations, behaviour, relationships to other entites etc (or a part of it). |
| Entity Definition         |  You can split the _entity configuration_ of one entity between seperate files or configuration objects. These are merged together at runtime to one _entity definition_ |
| Custom Queries & Mutations | **ActiveQL** generates per convention a number of queries and mutations around your entity definitions. You can however add your own types, queries and mutations to the GraphQL schema - these are called _Custom Queries & Mutations_  |



## Documentation / Tutorial

You will find extensive documentation here:

| Topic | Documentation |
| ----- | ------------- |
| [GraphQL Basics](https://graphql.org/learn) | If you are new GraphQL - we suggest you learn the basics with this very good resources from the makers of the GraphQL specification. |
| [Domain Configuration](./domain-configuration)       | Starting point to describe your business domain  |
| [Entity Configuration](./entity-configuration)       | How to describe entities in your business domain |
| [Attribute Configuration](./attribute-configuration) | Configuration of the attributes of your entities |
| [Tutorial](./tutorial)                               | Step-by-step creation of an executable GraphQL API and Admin UI based on a domain definition |
| Installation | How to run **ActiveQL** |
| Architecture | Technology foundation |


## Example

We believe - as Alan Kay puts it - "Simple things should be simple, complex things should be possible". Let's see the simplicity and power of a domain driven API design by looking at this very simple example of a business domain.

Or you can jump directly to a little more in-depth [tutorial](./tutorial.md).

_YAML_
```yaml
enum:
  CarBrand:
    - Mercedes
    - BMW
    - Audi
    - Porsche

entity:
  Car:
    attributes:
      licence: Key
      brand: CarBrand!
      mileage: Int!
      color: String
```

### This simple example configuration would generate a full fledged GraphQL API including

  * type object for entity
  * query for the type (by id)
  * query for a list of items of types (with filter, sort and paging)
  * filter types for object type
  * filter types for all object type fields (e.g. filtering by String)
  * create mutatation
  * update mutatation
  * delete mutatation
  * input type for the create mutatation
  * input type for the update mutatation
  * result type for create and update mutations
  * enumeration type
  * resolver for the queries and mutations that read/write to a _datastore_ (per default a document based database, e.g. MongoDB)
  * statistics queries to get the number of entries, latest updates etc.
  * some helper types, queries and more

### Some more API Features (not included in this example)

  * validation of mutation input (configuration or function)
  * relationships between entities
  * role based permission management to grant a principal fine-grained access to queries and mutations
  * handling of file uploads
  * seed data for testing your API or filling the datastore with initial data
  * custom code (hooks) to influence the behaviour of the resolver
  * possible replacement for default implementation of
    - datastore
    - resolver
    - validation
    - file save
    - data seeding
  * and more


### Admin UI

Based on your domain definition you can run a generated Admin UI (Angular SPA) that

  * has views for any entities collection - with filtering/search, sorting, paging
  * has views for any entity details
  * has a menu with all entities
  * supports navigation along entity relations
  * supports create, update and delete of entity items
  * supports file uploads and shows binary content (e.g. images)
  * can be customized in any regards
  * and more


### Generated Schema (excerpt)

```graphql
type Car {
  id: ID!
  licence: String!
  brand: CarBrand!
  mileage: Int!
  color: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum CarBrand {
  MERCEDES
  BMW
  AUDI
  PORSCHE
}

input CarBrandFilter {
  is: CarBrand
  isNot: CarBrand
  in: [CarBrand]
  notIn: [CarBrand]
}

input CarCreateInput {
  licence: String!
  brand: CarBrand!
  mileage: Int!
  color: String
}

input CarFilter {
  id: IDFilter
  licence: StringFilter
  brand: CarBrandFilter
  mileage: IntFilter
  color: StringFilter
}

enum CarSort {
  licence_ASC
  licence_DESC
  brand_ASC
  brand_DESC
  mileage_ASC
  mileage_DESC
  color_ASC
  color_DESC
  id_ASC
  id_DESC
}

input CarUpdateInput {
  id: ID!
  brand: CarBrand
  mileage: Int
  color: String
}

scalar DateTime

enum Entity {
  Car
  User
}

input EntityPaging {
  page: Int!
  size: Int!
}

type EntityStats {
  count: Int!
  createdFirst: Date
  createdLast: Date
  updatedLast: Date
}

enum Enum {
  CarBrand
}

input IDFilter {
  is: ID
  isNot: ID
  isIn: [ID]
  notIn: [ID]
  exist: Boolean
}

input IntFilter {
  is: Int
  isNot: Int
  lowerOrEqual: Int
  lower: Int
  greaterOrEqual: Int
  greater: Int
  isIn: [Int]
  notIn: [Int]
  between: [Int]
}

type Mutation {
  ping(some: String): String
  createCar(car: CarCreateInput): SaveCarMutationResult
  updateCar(car: CarUpdateInput): SaveCarMutationResult
  deleteCar(id: ID): [String]
  seed(truncate: Boolean): [String]
}

type Query {
  ping: String
  metaData(path: String): [entityMetaData]
  car(id: ID!): Car
  cars(filter: CarFilter, sort: CarSort, paging: EntityPaging): [Car]
  carsStats(filter: CarFilter): EntityStats
}

type SaveCarMutationResult {
  validationViolations: [ValidationViolation]!
  car: Car
}

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
  regex: String
}

type ValidationViolation {
  attribute: String
  message: String!
}
```

Let's break this generated GraphQL schema down, to show some of the **ActiveQL** conventions.

### Type

```graphql
type Car {
  id: ID!
  licence: String!
  brand: CarBrand!
  mileage: Int!
  color: String
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

From the `Car` entity a GraphQL object type is generated with attributes from the _Entity definition_ becoming fields of this type. As you see, in addition the entity's attributes the type gets a unique `id` field, that is used to identify an _entity item_. This `id` is also used to implement the relationship of entities. The `id` is assigned by the framework (in fact the actual datastore implementation) when you call the _create_ mutation.

You might notice that the "licence" attribute was configured as type `Key` but the resulting field is of type `String!`. `Key` is in fact an **ActiveQL** shortcut, for a more complex attribute configuration. Actually all attribute configurations of this example are shortcuts - we will cover this in [Attribute Configuration](./domain-configuration/attribute-configuration). The attribute "licence" could have been written explicitly as

```yaml
licence:
  type: String
  required: true
  unique: true
  updateInput: false
  queryBy: true
```

Meaning it is a mandatory `String` field, that will be validated as unique and can only be set in a _create mutation_ but not in an _update mutation_. Thus making it immutable and allowing it to unambiguously identify an _entity item_ seperately from the artificial `id`. The `queryBy` configuration will add a `carByLicence` query to easily get a car by its licence.

Every entity type has also `createdAt` and `updatedAt` timestamp fields. That are set automatically by the mutation resolvers.

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

There is also a `seed` mutation you can call to seed the _datastore_ with test or initial data. We did not include any seed data to this example definition, so this would have no effect. For more - check out [Seed Configuration](./domain-configuration/seed-configuration).

**Entity Mutations**

For every entity a _create_, _update_ and _delete mutation_ is generated - in this example `createCar`, `updateCar` and `deleteCar`.

### Input Types

The mutations use _input types_ to hold the value of items that should be created or updated.

```graphql
input CarCreateInput {
  licence: String!
  brand: CarBrand!
  mileage: Int!
  color: String
}

input CarUpdateInput {
  id: ID!
  brand: CarBrand
  mileage: Int
  color: String
}
```

As you see there are seperate types generated for the create and update mutations. The CreateType does not have an `id` while the UpdateType does. The `id` determines which entity item should be updated.

Also note that the "color" attribute is configured as required in the _entity configuration_. Therefore it results in a mandatory field in the `Car` type and in the `CarCreateInput` type. But not in the `CarUpdateInput` type - this is because a client is not forced to pass all attributes in the _update mutation_ but only those it wants to change. Making required attributes mandatory in the GraphQL schema for the _update input_ would not allow to leave the others (e.g. "brand" or "mileage") untouched.

You might also have noticed that there is no "licence" field in the `CarUpdateInput`. This is because we have configured the attribute as `Key` and thererfore it is considered to be immutable.

### Mutation Result Types

The _create and update mutations_ return different data, depending on whether the operation could be executed or was prevented by validation errors.

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

If the mutation could be executed it returns the successfully created/updated _entity items_.

If there were validation errors it returns a list _validation violations_ to inform an API client about the failed validations. Apart from the `unique` nature of the "licence" attribute we do not have any other validations. See [Attribute Validation](./domain-configuration/attribute-configuration#validation) and [Entity Validation](./domain-configuration/entity-configuration#validation) how to add business validations.

Please be aware that invalid GraqphQL requests, e.g. not providing a mandatory field or having a value that does not match to the field type, will be handled by the GraphQL layer - resulting in an error.

So default mutation can have three possible responses:

| Situation | Mutation Response |
| :- | - |
| GraphQL request valid, all business validations passed, mutation was executed | the created / updated _entity item_ |
| GraphQL request valid, one or more business validations did not pass | list of `ValidationViolation`s |
| GraphQL request invalid or error while executing mutation | error array - with stacktrace |



### Create Mutation

For any entity a _create mutation_ is generated to create new entity items. As we've seen, it uses the _create input type_ for the attribute values and the `ValidationViolation` type to inform a client about possible validation errors.

<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="50%"> Request </td> <td width="50%"> Response </td>
</tr>
<tr valign="top"><td markdown="block">

```graphql
mutation {
  createCar(
    car: {
      licence: "HH AQ 2020"
      mileage: 310000
  }){
    car{ id brand mileage licence }
    validationViolations { attribute message }
  }
}
```

</td><td markdown="block">

```json
{
  "error": {
    "errors": [
      {
         "message": "Field \"CarCreateInput.brand\" of required type \"CarBrand!\" was not provided.",
      }
    ]
  }
}
```

</td></tr>
<tr valign="top"><td markdown="block">

```graphql
mutation {
  createCar(
    car: {
      licence: "HH AQ 2020"
      brand: PORSCHE
      mileage: 310000
  }){
    car{ id brand mileage licence }
    validationViolations { attribute message }
  }
}
```

</td><td markdown="block">

```json
{
  "data": {
    "createCar": {
      "car": {
        "id": "hUFcoso8KUs6oXcW",
        "licence": "HH AQ 2020",
        "brand": "MERCEDES",
        "mileage": 10000
      },
      "validationViolations": []
    }
  }
}
```

</td></tr>
<tr valign="top"><td markdown="block">

```graphql
mutation {
  createCar(
    car: {
      licence: "HH AQ 2020"
      brand: MERCEDES
      mileage: 10000
  }){
    car{ id brand mileage licence }
    validationViolations { attribute message }
  }
}
```

</td><td markdown="block">

```json
{
  "data": {
    "createCar": {
      "car": null,
      "validationViolations": [
        {
          "attribute": "licence",
          "message": "value 'HH AQ 2020' must be unique"
        }
      ]
    }
  }
}
```

</td></tr>
</table>

### Update Mutation

For any entity an _update mutation_ is generated to create new entity items. It uses the _update input type_ for the attribute values and the `ValidationViolation` type to inform a client about possible validation errors.


<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="50%"> Request </td> <td width="50%"> Response </td>
</tr>
<tr valign="top"><td markdown="block">

```graphql
mutation {
  updateCar(
    car: {
      id: "hUFcoso8KUs6oXcW"
      mileage: 45000
  }){
    car {
      id
      licence
      brand
      mileage
      createdAt
      updatedAt
    }
    validationViolations { attribute message }
  }
}
```

</td><td markdown="block">

```json
{
  "data": {
    "updateCar": {
      "car": {
        "id": "hUFcoso8KUs6oXcW",
        "licence": "HH AQ 2020",
        "brand": "MERCEDES",
        "mileage": 45000,
        "createdAt": "2020-12-15T14:07:19.320Z",
        "updatedAt": "2020-12-15T14:09:04.840Z"
      },
      "validationViolations": []
    }
  }
}
```

</td></tr>
</table>

See how we only provided the "mileage" value and the rest of the attribute values remain untouched and also how **ActiveQL** added and updated the `createdAt` and `updatedAt` fields of the _entity item_.


### Queries

```graphql
type Query {
  ping: String
  car(id: ID): Car
  cars(filter: CarFilter, sort: CarSort, paging: EntityPaging): [Car]
  carByLicence(licence: String!): Car
  carsStats(filter: CarFilter): EntityStats
}
```

Any schema includes a query `ping` that simply sends back the value `pong` and can be used whether a GraphQL API can be accessed without the need to build any specific query or mutation.

#### Type Query

If a client knows the `id` of an entity item it can gets the item via the type query, e.g.

<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="50%"> Request </td> <td width="50%"> Response </td>
</tr>
<tr valign="top"><td markdown="block">

```graphql
query {
  car( id: "a4Rcu5mAEBAqbnzk" ){
    brand mileage color createdAt updatedAt
  }
}
```

</td><td markdown="block">

```json
{
  "data": {
    "car": {
      "brand": "PORSCHE",
      "mileage": 8000,
      "createdAt": "2020-12-14T11:35:47.211Z",
      "updatedAt": "2020-12-14T11:35:47.211Z"
    }
  }
}
```

</td></tr>
</table>

If the `id` does not exist an exception will be thrown.

#### Types Query

A client can request a result set of entity items with filtering, sorting and paging. The following query will return all car entities in no specific order.

<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="50%"> Request </td> <td width="50%"> Response </td>
</tr>
<tr valign="top"><td markdown="block">

```graphql
query {
  cars {
    id
    licence
    brand
    mileage
  }
}
```

</td><td markdown="block">

```json
{
  "data": {
    "cars": [
      {
        "id": "iXDeS6AcslDcb0Cv",
        "licence": "M TR 2017",
        "brand": "PORSCHE",
        "mileage": 55000
      },
      {
        "id": "hUFcoso8KUs6oXcW",
        "licence": "HH AQ 2020",
        "brand": "MERCEDES",
        "mileage": 45000
      },
      {
        "id": "RvG2Fyb2wa9z0HjM",
        "licence": "HH TR 1970",
        "brand": "AUDI",
        "mileage": 5000
      },
      {
        "id": "KDJjtbCIQgCkeHol",
        "licence": "M TR 2016",
        "brand": "MERCEDES",
        "mileage": 15000
      },
      {
        "id": "8Tp3PD340q7idiK4",
        "licence": "HH TM 2020",
        "brand": "MERCEDES",
        "mileage": 10000
      }
    ]
  }
}
```

</td></tr>
</table>


A more sophisticated usage of the `cars` _types query_:

<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="50%"> Request </td> <td width="50%"> Response </td>
</tr>
<tr valign="top"><td markdown="block">

```graphql
query {
  cars(
    filter: {
      brand: { in: [ MERCEDES, PORSCHE] }
    }
    sort: mileage_DESC
    paging: { page: 0, size: 3 }
  ){
    id brand mileage
  }
}
```

</td><td markdown="block">

```json
{
  "data": {
    "cars": [
      {
        "id": "iXDeS6AcslDcb0Cv",
        "brand": "PORSCHE",
        "mileage": 55000
      },
      {
        "id": "hUFcoso8KUs6oXcW",
        "brand": "MERCEDES",
        "mileage": 45000
      },
      {
        "id": "KDJjtbCIQgCkeHol",
        "brand": "MERCEDES",
        "mileage": 15000
      }
    ]
  }
}
```

</td></tr>
</table>

This query would return the three `cars` of the brand "Mercedes" and "Porsche" with the highest `milage`. See more about filter, sort and paging below or in [Queries and mutation](./queries-and-mutations).


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

### Filter

```graphql
input CarFilter {
  id: ID
  brand: StringFilter
  mileage: IntFilter
}
```

As we have seen, for every entity a FilterType is created that can be used in the types query. For every attribute a corresponding filter type is determined. E.g. the `StringFilter` for the "brand" attribute, the `IntFilter` for the "mileage" attribute. This filter-types are defined by the _datastore_ since their implementation is dependent to the datastore (e.g. database). The default _datastore_ (document based database, NEDB or MongoDB)  provides filter-types for all _scalar types_, _enums_ and some internal types (like for AssoFrom relations). In this example we use the `StringFilter` and `IntFilter`.

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
  is: Int
  isNot: Int
  lowerOrEqual: Int
  lower: Int
  greaterOrEqual: Int
  greater: Int
  isIn: [Int]
  notIn: [Int]
  between: [Int]
}
```

They could be used to filter/search for entity items like so:

<table width="100%" style="font-size: 0.9em"><tr valign="top">
<td width="50%">Request</td><td width="50%">Response</td></tr>
<tr valign="top"><td markdown="block">

```graphql
query {
  cars( filter: {
    brand: { isNot: BMW },
    mileage: { lowerOrEqual: 45000 } } ){
  	id brand mileage
  }
}
```

</td><td markdown="block">

```json
{
  "data": {
    "cars": [
      {
        "id": "a4Rcu5mAEBAqbnzk",
        "brand": "PORSCHE",
        "mileage": 8000
      },
      {
        "id": "Wnt9lTvjiwHn39uX",
        "brand": "PORSCHE",
        "mileage": 12500
      },
      {
        "id": "BHE30fMAn2zXTqtN",
        "brand": "PORSCHE",
        "mileage": 45000
      }
    ]
  }
}
```
</td></tr></table>

For more details check [Section Filter in Queries and Mutations](./queries-and-mutations#filter).

### Sort

For any entity a SortEnum is generated with all attributes that can be used for sorting. For every attribute (unless configured otherwise) two enum values are created. One for ascending order (e.g. `brand_ASC`) and one for descending order (e.g. `mileage_DESC`).

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

An API client may use this _entity sort enum_ in the _types query_ for the entity, to determine the sort order of the result.

### Paging

Any types query support paging. An API client can request to limit the result to a certain number and to skip results (based on a sort order).

```graphql
input EntityPaging {
  page: Int!
  size: Int!
}
```

If a query to the _types query_ wants to use a subset instead of the whole result it can use the _paging input type_. Pages start with 0. If you dont give a sort order, the result set will be ordered by `id`.

You could request the first 10 items like so of a result set of the _types query_ like so:

```graphql
query { cars( sort: mileage_ASC, paging: { page: 0, size: 10 } ) }
```

For the next 10 items it would be (and so on)
```graphql
query { cars( sort: mileage_ASC, paging: { page: 1, size: 10 } ) }
```

## Further reading

This example covered just some basic concepts. To see how you can use some more advanced features, how to add _custom queries and mutations_ or even change the default behaviour please refer to the documentation.

