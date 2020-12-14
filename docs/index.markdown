---
layout: default
title: Home
nav_order: 1
description: "Overview about ActiveQL"
permalink: /
---

# ActiveQL

From business domain definition to full fledged GraphQL API and Admin UI in minutes - some call it _**GraphQL on Steroids**_

## API First

We believe in an API 1st approach - when you express your business functionality as an API. Everything else (from different user interfaces, integration with other systems to infrastructure task etc.) uses this API as a common understanding of your business domain.

We think [GraphQL](https://graphql.org) is a great way to expose your business domain to any client or 3rd party system. Implementing a GraphQL API is a tedious task though. You need to decide how to structure your schema, how to handle concepts like searching, sorting, paging, how to implement resolvers that read data from and write data to a database or similar, validate input, relationships etc. And implement it with quite some repeated code.

**ActiveQL** supports this development with the generation of a GraphQL schema and resolvers based on the configuration of a business domain (mainly entities and its relations to each other).

## Terminologies

We use the this terms in the following meaning throughout this documenatation.

|   |    |
| ------------------------- | ------------------------------------------------ |
| Business Domain           | Description of your real world domain in terms of entities with attributes, operations and relationships. Think of UML class diagrams. |
| Entity                    | Any _thing_ in your business domain. Think of UML class or SQL table. |
| Entity Item               | Any instance of an entity, think of class instance or table row. |
| Domain Configuration      | Any configuration in JSON, typescript or YAML to describe or configure (a part) of your business domain. A _Domain Configuration_ can consist of _Entity Configurations_, _Enum Configurations_, _Custom Queries_ and _Custom Mutations_. |
| DomainDefintion           | You can seperate your _Domain Configuration_ (if you like) over many YAML/JSON files or configuration objects. At runtime all configurations are merged into one _Domain Definition_. From this definition a GraphQL schema and all Query and Mutation Resolvers are generated.|
| Entity Configuration      |  A configuration in JSON, typescript or YAML to describe an _entity_ of your business domain with its attributes, validations, behaviour, relationships to other entites etc. |


## Documentation / Tutorial

You will find extensive documentation here:

|   |    |
| ----------------------------------------------       | ------------------------------------------------ |
| [GraphQL Basics](https://graphql.org/learn)           | If you are new GraphQL - we suggest you learn the basisc with this very good resources from the makers of the GraphQL specification. |
| [Domain Configuration](./domain-configuration)       | Starting point to describe your business domain  |
| [Entity Configuration](./entity-configuration)       | How to describe entities in your business domain |
| [Attribute Configuration](./attribute-configuration) | Configuration of the attributes of your entities |
| [Tutorial](./tutorial)                               | Step-by-step creation of an executable GraphQL API  and Admin UI based on a domain definition |
| Installation | | 
| Architecture | |



## Example

We believe - as Alan Kay puts it - "Simple things should be simple, complex things should be possible". Let's see the simplicity and power of a business-domain-configuration-based API creation by looking at this very simple example of a business domain.

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
      brand: CarBrand!
      mileage: Int
```

### This would generate a full fledged GraphQL API including

  * the object type definition (Car and Driver)
  * queries for the type (by id)
  * queries for a list of types (with filter, sort and paging)
  * relationships between object types
  * filter types for every object type
  * filter types for all Types and Scalars (e.g. filtering by String)
  * create mutatations for all object types
  * update mutatations for all object types
  * delete mutatations for all object types
  * input type for the create mutatation
  * input type for the update mutatation
  * result type for create and update mutations
  * enumeration types as defined
  * resolver for the queries and mutations that read/write to a _datastore_ (per default a document based database, e.g. MongoDB)
  * statistics queries to get the number of entries, latest updates etc.
  * some helper types, query and more

### More API Features (not included in this example)

  * validation of mutation input (configuration or function)
  * handling of file uploads
  * relationships between object types
  * role based permission management to grant a principal fine-grained access to queries and mutations
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
  brand: CarBrand!
  mileage: Int
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
  brand: CarBrand!
  mileage: Int
}

input CarFilter {
  id: IDFilter
  brand: CarBrandFilter
  mileage: IntFilter
}

enum CarSort {
  brand_ASC
  brand_DESC
  mileage_ASC
  mileage_DESC
  id_ASC
  id_DESC
}

input CarUpdateInput {
  id: ID!
  brand: CarBrand
  mileage: Int
}

scalar Date
scalar DateTime
scalar JSON

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
  car(id: ID): Car
  cars(filter: CarFilter, sort: CarSort, paging: EntityPaging): [Car]
  carsStats(filter: CarFilter): EntityStats
  domainConfiguration(entity: Entity, enum: Enum): JSON
}

type SaveCarMutationResult {
  validationViolations: [ValidationViolation]!
  car: Car
}

type SaveUserMutationResult {
  validationViolations: [ValidationViolation]!
  user: User
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

Let's break the generated GraphQL scheme for this simple example down, to show some of the **ActiveQL** principles.

### Type

```graphql
type Car {
  id: ID!
  brand: String!
  mileage: Int
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

The `Car` entity becomes a GraphQL type with attributes from the _Entity definition_ becoming fields of this type. As you see, in addition the entity's attributes the type gets a unique `id` field, that is used to identify any item (instance) of an _entity_. This `id` is also used to implement the relationship of entities.

The `id` is assigned by the framework (in fact the actual datastore implementation) when you call the _create_ mutation.

Every entity type has also `createdAt` and `updatedAt` timestamp fields. That are set automatically by the mutation resolvers.

### Queries

```graphql
type Query {
  ping: String
  car(id: ID): Car
  cars(filter: CarFilter, sort: CarSort, paging: EntityPaging): [Car]
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
    brand mileage createdAt updatedAt
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
        "id": "Tj37c1I6EJscODJa",
        "brand": "MERCEDES",
        "mileage": 90500
      },
      {
        "id": "Kjh3AMZmnRDULf21",
        "brand": "AUDI",
        "mileage": 49500
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
    filter: { brand: { in: [ "Mercedes", "Porsche"] } }
    sort: mileage_DESC
    paging: { page: 0, size: 3 }
  )
  { id brand  mileage}
}
```

</td><td markdown="block">

```json
{
  "data": {
    "cars": [
      {
        "id": "Tj37c1I6EJscODJa",
        "brand": "MERCEDES",
        "mileage": 90500
      },
      {
        "id": "Wnt9lTvjiwHn39uX",
        "brand": "PORSCHE",
        "mileage": 12500
      },
      {
        "id": "a4Rcu5mAEBAqbnzk",
        "brand": "PORSCHE",
        "mileage": 8000
      }
    ]
  }
}
```

</td></tr>
</table>

This query would return the three `cars` of the brand "Mercedes" and "Porsche" with the highest `milage`. See more about filter, sort and paging below or in [Queries and mutation](./queries-and-mutations).

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

<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="50%"> Request </td> <td width="50%"> Response </td>
</tr>
<tr valign="top"><td markdown="block">

```graphql
mutation {
    ping(some: "Thomas")
}
```

</td><td markdown="block">

```json
{
  "data": {
    "ping": "pong, Thomas!"
  }
}
```

</td></tr>
</table>

**Entity Mutations**

For every entity a _create_, _update_ and _delete mutation_ is generated along with _input types_ holding the values for the entity's attributes and a _result type_ holding the created/updated item or any validation errors.


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

As you see there are seperate types used by the create and update mutations. The CreateType does not have an `id` while the UpdateType does. The `id` determines which entity item should be updated. Also note that the `brand` attribute in this case is not a mandatory field in the `CarUpdateInput`, even it is configured as such, and the `CarCreateInput` does have it as mandatory. This is because a client is not forced to pass all attributes in the _update mutation_ but only those it wants to change. But making required attributes mandatory in the GraphQL schema would not allow to leave the brand untouched.


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

Since we did not include any validation in our simple example we would always get the `id` from this mutation. Any non-validation error would lead to an exception in the GraphQL layer and its handling is not part of the schema.

### Create Mutation

For any entity a _create mutation_ is generated to create new entity items. It uses the _create input type_ for the attribute values and the `ValidationViolation` type to inform a client about possible validation errors.

<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="50%"> Request </td> <td width="50%"> Response </td>
</tr>
<tr valign="top"><td markdown="block">

```graphql
mutation {
  createCar(  car: { mileage: 310000 }  )
  {
    car{ id brand mileage }
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
        "message": "Field \"CarCreateInput.brand\" of required type \"CarBrand!\" was not provided."
      }
    ]
  }
}
```

</td></tr>
<tr valign="top"><td markdown="block">

```graphql
mutation {
  createCar(  car: { brand: PORSCHE mileage: 310000 }  )
  {
    car{ id brand mileage }
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
        "id": "BHE30fMAn2zXTqtN",
        "brand": "PORSCHE",
        "mileage": 310000
      },
      "validationViolations": []
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
  updateCar(  car: { id: "BHE30fMAn2zXTqtN" mileage: 45000 }  )
  {
    car{ id brand mileage createdAt updatedAt }
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
        "id": "BHE30fMAn2zXTqtN",
        "brand": "PORSCHE",
        "mileage": 45000,
        "createdAt": "2020-12-14T12:21:09.089Z",
        "updatedAt": "2020-12-14T12:25:59.893Z"
      },
      "validationViolations": []
    }
  }
}
```

</td></tr>
</table>

See how we only provided the "mileage" value and the "brand" stays untouched and also how **ActiveQL** added and updated the `createdAt` and `updatedAt` fields of the entity object type.

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
    brand: { contains: "a" },
    mileage: { gt: 100000 } } ){
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

This example covered just some basic concepts. Please refer to the documentation to see the possibilities to
translate your business domain into a GraqphQL API and UI.
