# Principal

To control access to the entity queries and mutations GAMA includes a default `EntityPermission` module that uses the concept of a `principal` object (with the properties "roles") that is expected in the `context` (under the name "principal") of any query or mutation.

A principal bears the information of API client / user
  * possible _roles_ for the current 
  * possible restrictions to the data handled by the queries and mutations
  * possible API limits

## Setting the principal 

Whether and how an application determines a principial object is usually specific to the actual implementation. You would probably integrate a Authentication Provider or SSO, or implement your own logic. In the _GAMA starter application_ you will find a JWT based implementation that you can use right away or adapt to your applications requirement.

## Example - User as Principal

To show how you would add your own implementation to obtain and provide a `principal` to your GAMA application we will create a bit similar solution to the default JWT based implementation but use a quite simple approach with a _User_ entity as `prinicipal` that will hold all information to grant or prohibit any API client's access to certain queries and mutations. 

We will provide a method that we can call from our's apps `gama-app.ts` to include this implementation to our application.

```typescript
export const addSimpleLogin = ( domainDefinition:DomainDefinition ) => {
  domainDefinition.add( domainConfiguration );
  domainDefinition.contextFn.push( addPrincipalToApolloContext );
}
```

As you see we add two things to the `DomainDefintion` 
  * some domain configuration - the user entity and a custom mutation, and 
  * a so called _context function_ that gives us access to the `context` object 

We start with the configuration of the User entity with username/password and assigned roles. 

```typescript
const domainConfiguration:DomainConfiguration = {
  entity: {
    User: {
      attributes: {
        username: 'Key',
        password: {
          type: 'String!',
          resolve: () => '***'
        },
        roles: '[String!]'
      }
    },
    permission: {
      admin: true
    }
  }
}
```

You might have noticed we have overriden the `resolve` for the "password" attribute. Per default every attribute of an entity can be requested by a client. But even if we will not store plaintext passwords in our _datastore_ we don't want to expose any actual password value through our API and therefore replace it with `***`. We also set permission to `{ admin: true }` which would allow access to this entity's queries and mutations only for user with the role "admin".

We want to add some _seed data_ to be able to test our principal implementation later. We add some users with different roles. Since we will not - as said - store plaintext passwords here, we will use an encrypted hash value instead. See how we use the `password` method in the _seed data_. The `password` method uses the [bcrypt.js](https://github.com/dcodeIO/bcrypt.js) library to create a secure hash of a plaintext password.

```typescript
const domainConfiguration:DomainConfiguration = {
  entity: {
    User: {
    // left out
    seeds: {
      admin: {
        username: 'admin',
        password: hash('admin'),
        roles: ['admin']
      },
      manager: {
        username: 'manager',
        password: hash('manager'),
        roles: ['manager', 'user']
      },
      user: {
        username: 'user',
        password: hash('user'),
        roles: ['user']
      },
      assistant: {
        username: 'assistant',
        password: hash('assistant'),
        roles: ['assistant']
      }
    }
  }
}

const hash = (password:string):string => 
  bcrypt.hashSync( password, bcrypt.genSaltSync(10) );
```

A client should be able to call a login method on our API with a "username" and "password" and if the credentials are valid gets a token to send along the following GraphQL requests. For this we add _custom mutation_ `login`.

```typescript
const domainConfiguration:DomainConfiguration = {
  entity: {
    User: {
      // left out
    },
  }
  mutation: {
    login: ( runtime:Runtime ) => ({
      type: 'String',
      args: {
        username: 'String!',
        password: 'String!'
      },
      resolve: (root:any, args:any) => login( runtime, args.username, args.password ),
      description: 'returns a token if successfull, null otherwise'
    })
  }
}

const login = async (runtime:Runtime, username:string, password:string) => {
  const user = await findUser( runtime, username );
  if( ! await bcrypt.compare( password, user.password ) ) return undefined;
  const token = generateToken();
  setUser( user, token );
  return token;
}

const findUser = async ( runtime:Runtime, username:string ) => {
  const entity = runtime.entity('User')
  const user = await entity.findOneByAttribute( { username } );
  return user ? user.item : {};
}

const generateToken = () => hash( _.toString(_.random(9999999) ) );

const setUser = (user:any, token:string) => {
  const roles = user.roles;
  _.set( user, 'roles', () => _.includes( roles, 'admin' ) ? true : roles );
  _.set( users, [token], { user, date: Date.now() } );
}

const users:{[token:string]:{ user:any, date:number }} = {};
```

The mutation defines the input (username, password) and return type, the token-string. It delegates the resolve to the login function that: 

  * loads the according user item for the username from the datastore
  * compares the credentials - password-hash from user item with provided passwort 
  * if successfull - creates a token (just a random number, hashed again)
  * stores the user item under this token - along with the current datetime and
  * and returns the token to the API client. 

The default `EntityPermissions` implementation expects a principal to have either `roles` attribute or `function` that return an array of roles or a boolean value. We manipulate the user item in a way that we do not expose the roles from the _datastore_ directly but add a `roles` function instead in which we simply return `true` if any of the user's roles include the "admin" role. With this such a _super user_ is allowed to access any entity's queries and mutation, even if the "admin" role is not included specifically to an entity definition.

A client can now use the `login` mutation to get a valid token. 

*request*
```graphql
mutation {
  login( username: "admin" password: "admin" )
}
```
*response*
```json
{
  "data": {
    "login": "$2a$10$XtwAduBLg1trfQ92Mvzm2e8kQ0oW.YARj/miwIZuSbDGbKAb7wk7."
  }
}
```

The client would probably store this token in a session context or similar to use it in later requests. Let's assume the client wants to get a list of all user items. The token must be provided as http Authorization header. In the GraphQL playground you find the section "HTTP HEADERS" in the lower left corner of the window where you could enter the token.

*request*
```graphql
query { 
  users{ id username password }
}
```
```json
{
  "Authorization": "$2a$10$h2lh8L0bblS4JYIFqbBIXOHwMGuQLnltY4MlPo19J7U4SXPEhFXCu"
}
```

We now want to validate the token value and - if successfull - provide the user principal to the `context`. We have to do this for every request of course. The `DomainDefinition` allows us to add a `contextFn` function that is called for every request and provides the _ExpressJS request object_ and the _Apollo context_. 

```typescript
const addPrincipalToApolloContext = 
    async (expressContext:{req:express.Request}, apolloContext:any) => {
      const token = expressContext.req.headers.authorization;  
  const principal = token ? validUser( token ) : undefined;
  _.set( apolloContext, 'principal', principal );
}

const validUser = ( token:string) => {
  const entry = users[token];
  if( entry && (Date.now() - entry.date) < MAX_VALID ) return entry.user;
  invalidToken( token );
}

const MAX_VALID = 12 * 60 * 60 * 1000; // 12 hours
```

In the `addPrincipalToApolloContext` method we
  * extract the token from the http request header `expressContext.req.headers.authorization`
  * try to obtain an entry from the users map for the token
  * if found check the maximum validity period - delete the entry if exceeded
  * set the principal object to the `context`

From now on the `EntityPermissions` implementation can use the `principal` to determin allowed queries, mutation and data. 

