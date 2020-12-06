# Resolver Hooks

An easy way to extend the implementation of GAMA resolvers are _entitiy hooks_. You can define this as part of the `EntityConfiguration` object. 

```typescript

export type EntityConfig  = {
  // other properties left out
  hooks?:EntityHooksType
}

export type EntityHooksType = {
  preSave?: PreResolverHook
  afterSave?: AfterResolverHook
  preTypeQuery?: PreResolverHook
  afterTypeQuery?: AfterResolverHook
  preTypesQuery?: PreResolverHook
  afterTypesQuery?: AfterResolverHook
  preDelete?: PreResolverHook
  afterDelete?: AfterResolverHook
}

export type PreResolverHook = 
  (rhc:ResolverHookContext) => undefined|object|Promise<undefined|object>;

export type AfterResolverHook = 
  (resolved: any, rhc:ResolverHookContext) => object|Promise<object>;

export type ResolverHookContext = {
  resolverCtx:ResolverContext
  runtime:Runtime
  principal:PrincipalType
}

export type ResolverContext = {
  root:any
  args:any
  context:any
}
```

In any _hook_ function you get the `ResolverContext` which holds the data from the GraphQL layer, the principal and the runtime which you can use to perform any task or influencing the default implementation. 

The `beforeHooks` can interrupt the normal execution flow by returning an `object`. This would be handled as the result that will be sent to the client. In other words - if a `beforeXXX` hook returns `undefined` the regular implementation will be executed. If it returns an object - neither the regular implementation nor any possible `afterXXX` hook will be performed.

In the the `afterXXX` hooks you also get the `resolved` value that is about to being sent to the client. A `afterXXX` hook must return this `resolved` either changed or untouched, otherwise nothing will be sent to the client.

## Example

<div style="font-size:0.8em">

```typescript 
const domainConfiguration:DomainConfiguration = {
  entity: {
    Car: {
      hooks: {
        preTypeQuery: () => console.log( 'preType' ),
        afterTypeQuery: (resolved:any) => { console.log( "afterTypeQuery"); return resolved },
        preTypesQuery: () => console.log( 'preTypes' ),
        afterTypesQuery: (resolved:any) => { console.log( "afterTypesQuery"); return resolved },
        preSave: () => console.log( 'preSave' ),
        afterSave: (resolved:any) => { console.log( "afterSave"); return resolved },
        preDelete: () => console.log( 'preDelete' ),
        afterDelete: (resolved:any) => { console.log( "afterDelete"); return resolved },
      }

    }
  }
}
```
</div>



