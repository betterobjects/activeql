# ActiveQL Server

This is the server package for ActiveQL - a framework for building domain driven GraphQL APIs with an oppionated approach and _convention over configuration_ and _DRY_ in mind. Based on a simple domain configuration (mainly entities with attributes and their relationships) it 

  * generates a full GraphQL schema with aspects like searching, sorting, paging, permission access etc.   
  * provides a full fledged GraphQL API with resolvers 
  * allows to be extended for any non-convention requirement with custom code
  * provides an Admin UI for basic CRUD applications; see: [https://www.npmjs.com/package/activeql-admin-ui](https://www.npmjs.com/package/activeql-admin-ui)

You can find the [full documentation and tutorial here](https://betterobjects.github.io/activeql).

## Start Developing

To start developing a GraphQL API you could embedd this library in your [Express](http://expressjs.com) application - but we recommend one the following methods that provides you with an instantly up-and-running environment. 

### Application Generator (not yet fully functional)

```
npx betterobjects/activeql-generator
```

<br>

### Starter-Application 

You can clone the ActiveQL-Starter-Application and following the instructions there:

[https://github.com/betterobjects/activeql-starter](https://github.com/betterobjects/activeql-starter)

```
git clone https://github.com/betterobjects/activeql-starter
```

<br>

### Quick Example

In the folder `./express/activeql/domain-configuration` create a YAML file, e.g. `car.yml` with the following content: 

```yaml
entity:
  Car: 
    attributes: 
      licence: Key
      brand: String!
      mileage: Int
```

Start the server 

```
cd express
npm run server:dev
```

This will start a GraphqlAPI endpoint at `http://localhost:3000/graphql`. 

If you point your browser to this address you will find full fledged GraphQL API whith many queries and mutations you can interact with. For reading / storing data an embedded MongoDB-like database [NeDB](https://github.com/louischatriot/nedb) is used per default. You can change the used database of course.

To create a car you could call the mutation: 

```graphql
mutation{
  createCar( car: { licence: "HH AQ 2021" brand: "Mercedes", mileage: 10000 } ){
    car{ id licence brand mileage }
  }
}
```

with the answer from your GraphQL API

```json
{
  "data": {
    "createCar": {
      "car": {
        "id": "GjgoJZ9RNHPQ1Pij",
        "licence": "HH AQ 2021",
        "brand": "Mercedes",
        "mileage": 10000
      }
    }
  }
}
```

The whole generated schema from the example above would look like:

```graphql
type Car {
  id: ID!
  licence: String!
  brand: String!
  color: String
  mileage: Int
  createdAt: DateTime!
  updatedAt: DateTime!
}

input CarCreateInput {
  licence: String!
  brand: String!
  color: String
  mileage: Int
}

input CarFilter {
  id: IDFilter
  licence: StringFilter
  brand: StringFilter
  color: StringFilter
  mileage: IntFilter
}

enum CarSort {
  licence_ASC
  licence_DESC
  brand_ASC
  brand_DESC
  color_ASC
  color_DESC
  mileage_ASC
  mileage_DESC
  id_ASC
  id_DESC
}

input CarUpdateInput {
  id: ID!
  brand: String
  color: String
  mileage: Int
}

scalar Date

scalar DateTime

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

scalar JSON

type Mutation {
  ping(some: String): String
  login(username: String!, password: String!): String
  createCar(car: CarCreateInput): SaveCarMutationResult
  updateCar(car: CarUpdateInput): SaveCarMutationResult
  deleteCar(id: ID): [String]
  createUser(user: UserCreateInput): SaveUserMutationResult
  updateUser(user: UserUpdateInput): SaveUserMutationResult
  deleteUser(id: ID): [String]
  seed(truncate: Boolean): [String]
}

type Query {
  ping: String
  jwtValid: Boolean
  car(id: ID!): Car
  cars(filter: CarFilter, sort: CarSort, paging: EntityPaging): [Car]
  carsStats(filter: CarFilter): EntityStats
  user(id: ID!): User
  users(filter: UserFilter, sort: UserSort, paging: EntityPaging): [User]
  usersStats(filter: UserFilter): EntityStats
  domainConfiguration(seeds: Boolean, customQueriesMutationsSrc: Boolean): JSON
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

type User {
  id: ID!
  username: String!
  roles: [String!]
  createdAt: DateTime!
  updatedAt: DateTime!
}

input UserCreateInput {
  username: String!
  roles: [String!]
  password: String!
}

input UserFilter {
  id: IDFilter
  username: StringFilter
}

enum UserSort {
  username_ASC
  username_DESC
  roles_ASC
  roles_DESC
  password_ASC
  password_DESC
  id_ASC
  id_DESC
}

input UserUpdateInput {
  id: ID!
  roles: [String!]
  password: String!
}

type ValidationViolation {
  attribute: String
  message: String!
}
```
