# Permissions

Everything described here refers to the default `EntityPermissions` implementation. You could replace this with your own implementation though - as described in [Custom Implementations](./custom-implementations.md).

## Securing your API

Per default your API is public. Anyone with access to the GraphQL endpoint can request any query or mutation. You can of course add restrictions on higher levels, e.g. enabling access via VPN or limit to certain IPs etc. These measures would be out of scope for GAMA. 

On a functional level though GAMA supports three quite common approaches to control the access of an API by a client:

  * access to queries and mutations based on roles and rights 
  * limiting the data a client can read or manage, e.g. based on assigned items (think of seeing only employees of any organisation a certain user is member of but not of other organisation's)
  * API limits - the number of possible API requests a client can make  (not yet)


## Principal 

To evaluate access rights GAMA expects an object of type `PrincipalType` under the name `principal` in the resolver context. This can be either the `object` itself or a function returning the principal object.

```typescript
export type PrincipalType = {
  roles?:PrincipalRolesType|PrincipalRolesTypeFn
}

export type PrincipalRolesType = undefined|boolean|string|string[]
export type PrincipalRolesTypeFn = 
  (runtime:Runtime, resolverContext:ResolverContext) => PrincipalRolesType

export type context = {
  principal?:PrincipalType | ((rt:Runtime, ctx:ResolverContext) => PrincipalType)
}
```

See how an application can provide a principal here: [GAMA Principal](./gama-principal.md).

<br>

**No principal**

If no principal can be determined any default query and mutation of any entity with a `permissions` definition would be prohibited

<br>

**Principal roles**

These are possible values of the `roles` property - provided it as literals or as a function that is evaluated everytime a permission is determined. 

| Value     | Type | Description  |
| --------- | ---- | ------------ |
| _empty_   | `undefined` | same as no `principal` present  |
| `true`    | boolean     | "superuser" - any query & mutation of any entity is allowed - regardless of assigned filter |
| `false`   | boolean     | "looser user" - same as `undefined` - no action allowed if permissions are required | 
| roleName  | string | any query & mutation of any entity requiring this role is allowed - if assigned filter match |
| roleNames | string[] | any query & mutation of any entity requiring any of these roles is allowed - if assigned filter match |

<br/>

---

## Entity Permissions Definition

You may configure required role(s) for accessing queries and mutations of an entity by adding it to the entity configuration. 

```typescript
export type EntityConfig  = {
  // rest omitted
  permissions?:PermissionDelegate|EntityPermissionsType
}

export type PermissionDelegate = string
```

**Permissions Values**

| Value | Type | Description |  
| ----- | - | - |
| _empty_ | `undefined` | no permission evaluation for this entity, any query and mutation is allowed unlimited, regardless if a `principal` exists or has any roles  |
| [Role Permissions](#role-permissions) | EntityPermissionsType |  require certain roles to allow qeries and mutation for this entity    |
| [Permission Delegate](#permission-delegate) | string  | Entity name, must be an `assocTo` relationship, delegates the permissions evaluation to this entity |

<br/>

### Example

```yaml
entities: 
  Car:
    attributes: 
      licence: Key
```

There will be no permission evaluation for any query or mutation of this entity. Whether a principal is present or what roles the principal has, has no effect. 

<br>

## Role Permissions

```typescript
export type EntityPermissionsType = {
  [role:string]:
    boolean | 
    ActionPermissionType
    PermissionExpressionFn |     
    AssignedEntity 
}

export type AssignedEntity = string
```

Possible values (per role) are:

| Value | Type | Description |  
| ----------------------- | - | - |
| `true` | boolean | any query and mutation of this entity is allowed if principal has role `roleName`, any restriction from other roles are not regarded |
| `false` | boolean | same as not adding `roleName` to permissions definition |
| [Action Permissions](#action-permissions) | ActionPermissionType | differentiate permissions for this entity / role further per action (create, read, update, delete)  |
| [Permission Function(s)](#permission-function) | PermissionExpressionFn | Callback to add expressions to determine the permitted items for the role  |
| [Assigned Entity](#assigned-entity) | string |  name of an entity that is referenced by the principal object to filter permitted items for all actions |

<br/>

### Example 

```yaml
entities: 
  Car:
    attributes: 
      licence: Key
    permissions: 
      manager: true
      assistant: false
```

Any principal with the role "manager" is allowed to access any query and mutation of the entity. The configuration of the role "assistent" is redundant. It could have been omitted. Any principal without the "manager" role (whether it has "assistant" or not) can not access any of the queries or mutations of this entity.

<br>

## Action Permissions

If you want to diffirentiate the allowed action (e.g. a client should be able to read data but not save or delete them) you can specify a permission per action.

```typescript
export type ActionPermissionType = {
  create?: boolean|AssignedEntity
  read?: boolean|AssignedEntity
  update?: boolean|AssignedEntity
  delete?: boolean|AssignedEntity
}
```

| Value | Type | Description |  
| -------- | - | - |
| `true`    | boolean | queries and mutations of this entity for the action(s) are allowed if principal has role `roleName`, any restriction from other roles are not regarded |
| `false`   | boolean | same as omitting the actions permissions definition |
| [Assigned Entity](#assigned-entity) | string |  name of an entity that is referenced by the principal object to filter permitted items for this action |


<br/>

The allowed / prohibited action affect the following queries and mutations.

| Action  |  Query / Mutation | 
| - | - | 
| create | `createEntity` mutation | 
| read   | `type` and `types` query     | 
| update | `updateEntity` mutation      |
| delete | `deleteEntity` mutation |

<br/>

### Example 

```yaml
entities: 
  Car:
    attributes: 
      licence: Key
    permissions: 
      manager: 
        create: true
        read: true
        update: true
        delete: true
      assistant: 
        read: true
        delete: false
```

The configuration of the "manager" role is equivalent to the shorter notation `manager: true`. 

Any principal with the role "assistant" might only access the read queries. The configuration of the `delete` action is redundant, any action other than `read` is prohibited. 

<br>

## Permission Function

```typescript
export type PermissionExpressionFn = 
  (peCtx:PermissionExpressionContext) => Permission|Promise<Permission>

export type PermissionExpressionContext = {
  action:CRUD
  principal:PrincipalType
  role:string
  resolverCtx:ResolverContext,
  runtime:Runtime
}

export type Permission = undefined|boolean|PermissionExpression
export type PermissionExpression = object
```

While the other permission configurations are literal values and therefore can be expressed in YAML or JSON you can add a callback in the configuration object in which you can implement any desired permission behaviour based on the `PermissionExpressionContext`.

The possible return values of the Permission Function and their affects are as follows. You can also return a `Promise` of these values. 

| Value | Type | Description |  
| -------- | - | - |
| _no value_ | `undefined` | no effect - action might be allowed if granted by other roles | 
| `true`    | boolean | query and mutations of this entity for the action is allowed |
| `false`   | boolean | same as omitting - action might be allowed if granted by other roles |
| [Permission Expression](#permission-expression) | object | Expression used to filter permitted items for an action |

<br>

### Example

```typescript
const domainConfiguration:DomainConfiguration = {
  entity: {
    Car: {
      attributes: {
        brand: 'String!'
      }
      permissions: {
        manager: ({action}) => return _.includes(['read','create','update'], action ),
        assistant: ({action, principal}) => {
          if( action === CRUD.READ && principal.active === true ) return true;          
        }
      }
    }
  }
}
```

Any principal with the role "manager" is allowed any query and mutation of the entity, except the `delete` mutation. Of course this could have also be written as `action !== 'delete'` or even with static configuration.

Any principal with the role "assistant" might access the read queries if the principal object has an `active` property with the value `true`. This is assuming that the principal object somehow has this property set correctly - see [GAMA Principal](./gama-principal.md) how to achieve this. Here we just to demonstrate that you can use any object from the `PermissionExpressionContext` to determine the permission. 

<br>

## Permission Expression

If the value of either a role or action permssion is a boolean - it has the effect that any affected query or  mutation is either allowed or prohibited regardless of the actual data handled by this query or mutation.

This is sometimes not fine grained enough - a principal might probably be allowed to read all entity items but may only create or update certain items and should not be allowed to delete any items at all. 

While - in this example - read would be simply `true` and delete `false` - we must find a way do define which exact items a principal might update or create. 

This can be done via `PermissionExpression`s that a role permission or action permission can provide. Think of an expression as an additional _filter_ to a query or mutation. Only data that match this _expression_ are allowed to be or read, created, updated, deleted. If multiple roles bestow more than one permission expression to a principal this would be true for any data that matches any of the expressions - think of an `or` join of _expressions_.

If _any_ of the roles of a principal allows unlimited access to a query or mutation (by having a permisson value `true`) no further expression will be evaluated. One `true` overrides all expression-limits. 

On the other hand if _any_ role provides an `expression` - the affected query or mutation is allowed. If no role provides an `expression` - the permission for query or mutation is the same as `false`, thus prohibited per se.

<br>

## Effect of permission values on queries and mutations

***types query***
|             |   |  
| ----------- | - | 
| `true`      | query is resolved without any limitations                 |
| `false`     | query is allowed but will return no items                 |
| expression  | expressions are added to the filter of the query          |

<br>

***type query***
|             |   | 
| ----------- | - | 
| `true`      | query is resolved                                                               |
| `false`     | an error is thrown always                                                       |
| expression  | if `id` is not within the items that match the expressions an error is thrown   |

<br>

***create mutation***
|             |   | 
| ----------- | - | 
| `true`      | mutation is executed                                     |
| `false`     | an error is thrown always                                |
| expression  | if the item attempted to be created does not match the expressions - in other words: the resulting item would not allowed to be read by a type query - an error is thrown |

<br>

***update mutation***
|             |   | 
| ----------- | - | 
| `true`      | mutation is executed                                     |
| `false`     | an error is thrown always                                |
| expression  | if `id` is not within the items that match the expressions or the item attempted to be updated does not match the expressions - in other words: the resulting item would not allowed to be read by a type query - an error is thrown |

<br>

***delete mutation***
|             |   | 
| ----------- | - | 
| `true`      | mutation is executed                                                          |
| `false`     | an error is thrown always                                                     |
| expression  | if `id` is not within the items that match the expressions an error is thrown |

<br>

***assocFrom relationship in query***
|             |   |  
| ----------- | - | 
| `true`      | all items from the `assocFrom` entity will be included                              |
| `false`     | no item from the `assocFrom` entity will be included                                |
| expression  | only items from the `asscoFrom` entity that match the expressions will be included  |

<br>

***assocTo relationship in query***
|             |   |  
| ----------- | - | 
| `true`      | item from the `assocTo` entity will be included                                                 |
| `false`     | item from the `assocTo` entity will not be included                                             |
| expression  | item from the `assocTo` entity will be included if it matches the expression, `null` otherwise  |

<br>


### Example

```typescript
const domainConfiguration:DomainConfiguration = {
  entity: {
    Car: {
      attributes: {
        brand: 'String!'
      }
      permissions: {
        assistant: ({ action }) => {          
          if( action === CRUD.DELETE ) return false;
          return { brand: { $in: ['VW', 'BMW', 'Opel'] } };
        }
      }
    }
  }
}
```

While a principal with the role "assistant" is not allowed to delete any car item, it is allowed to call the read queries and create and update mutations. However, the data that the read query returns will only include items where the "brand" of a car is included in the given array "allowed brand values". You would probably do not hard code this, but get the value from the principal object. 

You might have realized that the `expression` is in the syntax of the current _datastore_ implementation (default MongoDB). If you would decide to run your domain configuration with another _datastore_ implementation - say MySQL - things will not work as expected. 

On one hand this gives you all the freedom and possibilities the underlying _datastore_ technology offers, like complex aggregations, joins, calculations etc. On the other hand is your domain configuration now coupled to a certain _datastore_ implementation. You can possibly avoid this by delegating the creation of the expression to the datastore itself and using the (of course limited) possibilities of the filter definition for this entity. Than the example above could've been written with filter syntax like so:

```typescript

assistant: ({runtime}) => 
  runtime.dataStore.buildExpressionFromFilter( 
    runtime.entity('Car'), { brand: { in: ['VW', 'BMW', 'Opel'] } } )
}
```

It does look similar - since the default filter implementations leans to the default MongoDB implementation. Nonetheless if the non-default _datastore_ implementation uses the same filter syntax as the default implementation - which we suggest - it would run against this implementation as well. 

As an a bit more complex example - that could not be implemented via default filter syntax - we could want to express that a principal should be allowed to read and write cars items of all "asigned brands" as provided by the principal object or every other car item that has a higher mileage than `100,000`. The MongoDB expression for this requirement would look like this: 

```typescript
assistant: ({principal}) => ({
  $or: [
    { brand: { $in: principal.brands } }, 
    { mileage: { $gt: 100000 } }
  ]
})
```

## Assigned Entity

Quite often there is the situation that your principal is an entity item itself (e.g. a User item) and the User has a relationship to one or more other entities as kind of assigned entity. Let's look at this domain example: 

```
+----------------+           +--------------+        +--------+        +-----------+
| User           |           | VehicleFleet |        | Car    |        | Accessory |
+----------------+           +--------------+        +--------+        +-----------+
| roles:string[] |           |              |        |        |        |           |
|                +----1..* --|              |--1-----|        |--1-----|           |
|                |           |              |        |        |        |           |
|                |           |              |        |        |        |           |
+----------------+           +--------------+        +--------+        +-----------+
```

The user is assigned to one or many VehicleFleets. Therefore a user should be able to access the entities VehicleFleet, Car, Accessory with right regarding to its roles but limited to entity items of the assigned VehicleFeets. 

You could express this with a [Permission Function](#permission-function). That takes the principal and adds the matching expression. 

```typescript
entity: {
  VehicleFleet: {
    permissions: {
      manager: ({principal}) => ({ id: { $in: principal.vehicleFleetIds } })
    }
  },
  Car: {
    permissions: {
      manager: ({principal}) => ({ vehicleFleetId: { $in: principal.vehicleFleetIds } })
    }
  },
  Accessory: {
    permissions: {
      manager: async ({principal, runtime}) => {
        const car = runtime.entity('Car');
        const allowedCars = await car.findByAttribute({vehicleFleetId: principal.vehicleFleetIds});
        const allowedCardIds = _.map( allowedCars, car => car.id );
        return { carId: { $in: allowedCardIds } };
      }
    }
  }
}
```

As you see this becomes quite complicated when moving along relationships. This can be expressed shorter by simply referring to the entiy a principal item is assigned to. The following would achieve the same as above.

```yaml
entity: 
  VehicleFleet:
    permissions:
      manager: VehicleFleet

  Car: 
    assocTo: VehicleFleet
    permissions:
      manager: VehicleFleet

  Accessory:
    assocTo: Car
    permissions:
      manager: Car.VehicleFleet
```

When expressing this permission at an entity - if the entity that a principal is assigned to is not the entity itself or a `assocTo` relationship from the entity, you can specify the "path" to the assigned entity with dots between the entity names.

This works over any amount of entity `assocTo` relationships. As you might have guessed, we hit the datastore for any entity that is more than one `assocTo` relationship away - so this may become a performance issue with very large datasets. You can of course always implement your own expression function - or bypass this permission implementation alltogether by providing [Resolver Hooks](./resolver-hooks.md) or even your own entity permission implementation.

Please not that we configured the `AssignedEntity` at the role level, thus allowing any action for this role limited by this assigned entity. We can also configure this for a certain action like so: 

```yaml
entity: 
  VehicleFleet:
    permissions:
      manager: 
        read: true
        create: VehicleFleet
        update: VehicleFleet        
```

Now a principal with the role "manager" is allowed to read any VehicleFleet item, but is only allowed to create and update VehicleFleet items for the assigned VehicleFleets (and deleting not allowed at all). 


<br>

## Permission Delegate

Often the definition of roles, rights and Assigned Entities are repeated identitcal for many entities. If you have an `assocTo` relationship between two entities you can avoid this duplication and delegate the permission definition to the `assocTo` entity. The role rights are identitcal to the ones at the delegate entity. Even if the permissions at the delegate entity include a permission expression or AssignedEntity - an expression is created in which the foreignKeys match the permitted ids from the delegate entity.

Let's say there is the following _domain definition_. 

```yaml
entity: 
  VehicleFleet:
    attributes: 
      name: Key
    permission:
      manager: true

  Car:
    attributes: 
      licence: Key
      brand: String
    assocTo: VehicleFleet
    permissions: 
      manager: VehicleFleet
      user: 
        read: VehicleFleet

  Accessory:
    attributes:
      name: String!
      price: Float!
    assocTo: Car
    permissions: Car
```

`Accessory` delegates its permissions definition to `Car` - this is identical to 

```yaml
  Accessory:
    attributes:
      name: String!
      price: Float!
    assocTo: Car
    permissions: 
      manager: Car.VehicleFleet
      user: 
        read: Car.VehicleFleet
```

<br/>

## Restricting attributes based on roles

We have seen how to control which queries and mutations a principal might access and how to limit the affected data. Sometimes there might be another security issue where you want to restrict the possible attributes a user / principal might see. 

Let`s look at this example 

```yaml
entity: 
  Car: 
    attributes: 
      licence: Key
      brand: String!
      mileage: Int!
    permissions: 
      manager: true
      assistant: 
        read: true
```

So far a principal with the role "manager" might read and write any car item, a principal with the role "assistant" can read all car items. Let's assume you do not want to provide an "assistant" with the mileage of a car. While GAMA does not provide an explicit solution to this, there are many ways to achieve this. 

***Attribute Resolver***

We cannot take away the attribute "mileage" for certain API clients, since it is part of the type definition of the GraphQL schema. But we can hide or mask any attribute value - even based on the principal's role. 

```typescript
const domainDefinition:DomainDefinition = {
  entities: {
    Car: {
      attributes: {
        brand: 'String',
        mileage: {
          type: 'Int',
          resolve: ({principal, item}) => 
            _.includes(principal.roles, 'manager') ? item.mileage : null
        }
      },
      permission: {
        manager: true, 
        assistant: { read: true }        
      }
    }
  }
}
```

So only if the principal has the role "manager" we actually return the "mileage" value - otherwise `null`, thus preventing any other user (e.g. the "assistant") from seeing the mileage of a car. 

***Shadow Entity***

GAMA uses a _convention over configuration_ approach wherever possible. But the 2nd part is equaly important, we can override any convention. And use that for a neat little trick to split access to certain attribute sets of an entity for different principal roles. 

Take a look at the following example: 

```yaml
entity:
  Car:
    attributes: 
      brand: String
      mileage: Int
      price: Int
    },
    assocTo: Fleet
    assocFrom: Accessory
    permissions: 
      manager: true

  Accessory: 
    attributes: 
      name: String
      price: Int    
    assocTo: Car

  CarLimited: 
    attributes:
      brand: String    
    assocTo: Fleet
    assocFrom: Accessory
    collection: cars
    foreignKey: carId
    statsQuery: false,
    createMutation: false
    updateMutation: false
    deleteMutation: false
    permissions: 
      assistant: 
        read: true
```

In the definition of the so called _shadow entity_ `CarLimited` we use the same `collection` as for `Car` - and not as per convention "car_limiteds" - thus getting the same entity items in the queries for this entity. But we include only the attributes a user without the "manager" role should see. 

The `assocFrom` relationship from `Accessory` would assume however to find its foreignKey - again as per convention - as "carLimitedId". But in the _datastore_ accessory items have `carId` as foreign key. So we also set this value to `carId` and now have a seperate entity that we can give seperate permissions with only a subset of the attributes of the "real" entity. 

Even if it would be possible to have create, update and delete mutations we decided here to not include them in the schema, since the only purpose in this example is to grant read rights to the entity for the role "assistant". Having the according muatations in the schema could lead to confusion. 

***Resolver Hooks***

You could also use `afterTypeQuery` and `afterTypesQuery` hooks to hide or mask unwanted values from the resolved data based on the principal's roles. 

```typescript
const domainDefinition:DomainDefinition = {
  entities: {
    Car: {
      attributes: {
        brand: 'String',
        color: 'String',
        mileage: 'Int'
        price: 'Int'
      },
      permission: {
        manager: true, 
        assistant: { read: true }        
      },
      hooks: {
        afterTypeQuery: (resolved:any, {principal} ) =>
          _.includes( principal.roles, 'assistant' ) ?
            _.pick( resolved, ['id', 'brand'] ) : resolved,
        afterTypesQuery: (resolved:any, {principal} ) =>
          _.includes( principal.roles, 'assistant' ) ?
            _.map( resolved, item => _.pick( item, ['id', 'brand'] ) ) : resolved
      }
    }
  }
}
```
For more details look at [Resolver Hooks](./resolver-hooks.md).
