# How to use the GAMA generated GraphQL API

## Queries

### Filter / Search 

String filter case-sensitive - even if caseSensitive false , flag has only effect on the contains family 

TODO

### Order

TODO

### Paging 

TODO

## Mutations

### Return Type of Create and Update Mutations

TODO

### Upload Binary Data / Files in a Mutation

TODO

### Update Mutation 

Only updates attributes you provide and leaves all other attributes values untouched. If you want to set a value to 
`null` you can do this explicitly. This works for Non-Null fields only of course.

```graphql
mutation {
  updateCar ( 
    car: { 
      id: "5fae6d009c154b3c54342c2b"
      mileage: null, 
    } 
  ) { 
    car{ id brand color mileage } 
  }
}
```
