---
layout: page
title: Domain Configuration
permalink: /domain-configuration/
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

You can provide the _Runtime_ with such an object (or multiple that will be merged) or write this in YAML files
and point to folder(s) where to find this Domain Configuration files.

### Schema and Resolvers

The Domain Configuration will be translated to a GraqhQL Schema and corresponding resolvers. How the schema and 
resolver for Entities and Enums are structured is highly oppinionated, but can be influenced and even replaced
by a total different implementation and can always be complemented by adding custom queries, mutations, 
types and resolvers. 

For detailed documentation see

  * [Entity Configuration](../entity-configuration)
  * [Attribute Configuration](./attribute-configuration.md)
  * [Enum Configuration](./enum-configuration.md)
  * [Custom Query Configuration](./custom-query-configuration.md)
  * [Custom Mutation Configuration](./custom-mutation-configuration.md)


### GraphQL API / Apollo Express

The generated Schema and Resolvers can be made available as a GraphQL API using an [Express](http://expressjs.com)
/ [Apollo](https://www.apollographql.com) NodeJS application. 

GAMA includes a default / example application that you can customize.

This can be used by any GrapqhQL Client - restrictions in regards of accessing 
the API technical (e.g. API call limits, restriced client IPs) are out of concern of GAMA and should be 
handled on a custom level.

For detailed documentation see: [GAMA Express Application](./gama-express.md)


### GAMA Admin UI

Based on the Schema and some meta information from the Domain Configuration GAMA includes an optional 
[Angular](https://angular.io) application that provides a generic Admin UI. 

This Application can be customized as well.

For detailed documentation see: [GAMA Angular Admin UI](./gama-angular.md)

## Example

Let's look at some of the concepts at this simple example. We use YAML files and a Typescript object to configure a 
very easy business domain of _cars_.

```yaml
enum:
  CarBrand:
    - Mercedes
    - Volkswagen
    - Audi
    - Porsche
    - Toyota
    - Bentley

entity: 
  Car: 
    attributes:      
      brand: CarBrand!
      mileage: Int
      color: String
```

Lets assume we put this in a yaml file (we could also split these in two files) in a folder with the name 
`./car-config`. Since we want to add some custom code we use now a TypeScript object for the rest of our 
domain definition. Note that you could also have included the above Enum and Entity definition in this object. You can 
split and combine this as you like. All YAML file definitions and all configuration objects are merged into one
single domain configuration in the end.

We recommend having one YAML file per enum / type, and add custom code in one configuration object per use case.

From the simple domain configuration above we will alread get full fledged CRUD queries and mutations 
(incl. filtering, sorting, paging, validation etc.) but we alsow want to add a non-Entity based query 
(Winners of the Le Mans Race) and a custom mutation (repaint of a car). 

```typescript
const winnerYear = {
  Toyota: [2020, 2019, 2018],
  Porsche: [2017,2016,2015,2014,2013,2012,2011,2010],
  Peugeot: [2009],
  Audi: [2008,2007,2006,2005,2004],
  Bentley: [2003]
}

const repaint = async (rt:Runtime, id:string, color:string) => {
  const car = rt.entity('Car');
  const c = await car.findById( id );
  c.item.color = color;  
  return (await c.save()).item;
}

export const domainConfiguration:DomainConfiguration = {
  query: {
    leMansWinner: (rt:Runtime) => ({
      type: '[Int!]',
      args: { brand: { type: 'CarBrand' } },
      resolve: ( root:any, args:any ) => _.get( winnerYear, args.brand as string )
    })
  },
  mutation: {
    repaint: (rt:Runtime) => ({
      type: 'Car',
      args: { id: { type: 'ID' }, color: { type: 'String!' } },
      resolve: async (root:any, args:any) => repaint( rt, args.id, args.color )
    })
  }
}
```

You might realize we are using some helper methods (e.g. `findById`) and also not referring any GraphQL type
directly but its string representation. All this we will be covered in the  [Custom Querys and Mutations]() section. 
But you already should see that you can add any query and mutation that is not party of the default generated schema. 
These queries and mutation can make use of the Graph-on-Rails library (as the mutation in this example) or can be 
totally independent from it (as the query shows). The use of [Lodash](https://lodash.com) `_.get( ... )` is optional
of course.

We can then combine this into one Domain Definition that provides our GraphQL API.

```typescript
const domainDefinition = new DomainDefinition( './car-config' );
domainDefinition.add( domainConfiguration );
```

This example would lead to the following schema (the annotations / desciptions) are only added here for explanation 
and are not part of the schema generation: 

```graphql
''' meta information for the Gama Admin UI so it can generate a generic UI for a human user '''
type assocMetaData {
  path: String
  query: String
  required: Boolean
  typesQuery: String
  foreignKey: String
  scope: String
}

''' the GraphQL type of our Car entity '''
type Car {
  id: ID!
  brand: CarBrand
  mileage: Int
  color: String
  createdAt: Date
  updatedAt: Date
}

''' the GraphQL Enum type for the CarBrand enum '''
enum CarBrand {
  MERCEDES
  BMW
  VOLKSWAGEN
  AUDI
  PORSCHE
  TOYOTA
  BENTLEY
}

''' type to filter Cars by the CarBrand enum '''
input CarBrandFilter {
  ne: CarBrand
  eq: CarBrand
  in: [CarBrand]
  notIn: [CarBrand]
}

''' the input type for the create mutation for Car '''
input CarCreateInput {
  brand: CarBrand
  mileage: Int
  color: String
}

''' filter type on all attributes of the Car type that is used in the cars types query '''
input CarFilter {
  id: ID
  brand: CarBrandFilter
  mileage: IntFilter
  color: StringFilter
}

''' Enum to express desired sort by attribute for the cars types query ''' 
enum CarSort {
  brand_ASC
  brand_DESC
  mileage_ASC
  mileage_DESC
  color_ASC
  color_DESC
  id_ASC
  id_DESC
}

''' the input type for the update mutation for Car '''
input CarUpdateInput {
  id: ID!
  brand: CarBrand
  mileage: Int
  color: String
}

''' a Data scalar you can use in your entity configurations, queries or mutations '''
scalar Date

''' meta information for the Gama Admin UI so it can generate a generic UI for a human user '''
type entityMetaData {
  path: String
  typeQuery: String
  typesQuery: String
  deleteMutation: String
  updateMutation: String
  updateInput: String
  createMutation: String
  createInput: String
  foreignKey: String
  fields: [fieldMetaData]
  assocTo: [assocMetaData]
  assocToMany: [assocMetaData]
  assocFrom: [assocMetaData]
}

''' type to get a certain subset of a types query '''
input EntityPaging {
  page: Int!
  size: Int!
}

''' type for statistics about entity data '''
type EntityStats {
  count: Int!
  createdFirst: Date
  createdLast: Date
  updatedLast: Date
}

''' meta information for the Gama Admin UI so it can generate a generic UI for a human user '''
type fieldMetaData {
  name: String!
  type: String
  required: Boolean
  validation: JSON
  unique: String
  calculated: Boolean
  filter: String
  mediaType: String
}

''' the default type to filter entities by int attribute (provided by the datastore) '''
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

''' a JSON scalar you can use in your entity configurations, queries or mutations '''
scalar JSON

''' the CUD mutations for the car type are added, you also find the custom mutation here '''
type Mutation {
  ping(some: String): String
  seed(truncate: Boolean): String
  repaint(id: ID, color: String!): Car
  createCar(car: CarCreateInput): SaveCarMutationResult
  updateCar(car: CarUpdateInput): SaveCarMutationResult
  deleteCar(id: ID): [String]
}

''' the type queries for the car type are added, you also find the custom query here '''
type Query {
  ping: String
  metaData(path: String): [entityMetaData]
  leMansWinner(brand: CarBrand): [Int!]
  car(id: ID): Car
  cars(filter: CarFilter, sort: CarSort, paging: EntityPaging): [Car]
  carsStats(filter: CarFilter): EntityStats
}

''' the return type for the generated saveCar mutation '''
type SaveCarMutationResult {
  validationViolations: [ValidationViolation]!
  car: Car
}

''' the default type to filter entities by int attribute (provided by the datastore) '''
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

``` the type for possible validation errors in the return of the create and update mutation '''
type ValidationViolation {
  attribute: String
  message: String!
}
```

### Inpect Domain Configuration via GraqpQL 

Wouldn't it be great if you could inspect the current domain configuration via GraqpQL? You might ask, why though? 
You may not always have access to the actual configuration. Since this could also be a security concern, 
this feature is only available in the development stage. See how you can set the stage in the 
[GAMA Configuration Documentation](./gama-configuration).


You can query the whole configuration via GraphQL, we of course see always the typed configuration and no longer any
YAML content; also we see only the names of the custom queries and mutations.

<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="40%"> Request </td> <td width="60%"> Response </td>
</tr>
<tr valign="top"><td>

```graphql
query {
	domainConfiguration
}
```

</td><td>

```json
{
  "data": {
    "domainConfiguration": {
      "enum": {
        "CarBrand": [
          "Mercedes",
          "Volkswagen",
          "Audi",
          "Porsche",
          "Toyota",
          "Bentley"
        ]
      },
      "entity": {
        "Car": {
          "attributes": {
            "brand": "CarBrand!",
            "mileage": "Int",
            "color": "String"
          }
        }
      },
      "query": {
        "leMansWinner": "[Custom Function]"
      },
      "mutation": {
        "repaint": "[Custom Function]"
      }
    }
  }
}
```

</td></tr>
</table>

GAMA even offers Enums for all Enties and Enum Configurations in your Domain Configuration which you can use to get a 
specific Entity or Enum Configuration in your query which might be practical with large configuration sets.

<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="40%"> Request </td> <td width="60%"> Response </td>
</tr>
<tr valign="top"><td>

```graphql
query {
	domainConfiguration( entity: Car )
}
```

</td><td>

```json
{
  "data": {
    "domainConfiguration": {
      "Car": {
        "attributes": {
          "brand": "CarBrand!",
          "mileage": "Int",
          "color": "String"
        }
      }
    }
  }
}
```

</td></tr>
<tr valign="top"><td>

```graphql
query {
	domainConfiguration( enum: CarBrand )
}
```

</td><td>

```json
{
  "data": {
    "domainConfiguration": {
      "CarBrand": [
        "Mercedes",
        "Volkswagen",
        "Audi",
        "Porsche",
        "Toyota",
        "Bentley"
      ]
    }
  }
}
```

</td></tr>
</table>
