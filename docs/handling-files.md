---
layout: page
title: Handling Files
nav_order: 50
---

# Handling Files

ActiveQL provides a GrapqhQL type `File` that is defined as follows.

```graphql
type File {
    filename: String!
    mimetype: String!
    encoding: String!
    secrect: String!
  }
```


For any attribute of the type "File" an input of type [GraphQLUpload](https://www.apollographql.com/docs/apollo-server/data/file-uploads/) is added to the create and update mutation (not the input type). 

As you see from the type, if a client provides a File (in fact a FileStream) in either the create or update mutation, ActiveQL does not store any binary data in the _datastore_ but just metadata about the file. The actual save or write of the file is done by an implementation of `EntityFileSave`. 

The default `EntityFileSave` implementation writes the file to the local filesystem in the following path:
```
[Express rootDir]/[uploadRootDir]/[secret]/[Entity]/[ID]/[Attribute]/[Filename]
```
The delivery of the file to a client is out of scope for ActiveQL. The ActiveQL starter application nonetheless serves the file via ExpressJS. A client can obtain the necessary values (`filename`, `mimetype`, `encoding`, `secret`) from the `File` type in the query and create a http get request with the following path: 
```
/files/[secret]/[Entity]/[ID]/[Attribute]/[Filename]
```
Example:
```
http://host-of-express-app:port/files/0987654321/Car/5fc81/picture/mercedes.jpg
```

| path item | description |
| --------- | - |
| Express rootDir | the root directory of your Express app; disregaded if uploadRootDir is absolute path |
| uploadRootDir   | as defined in GamConfig.uploadRootDir when creating a Runtime; default 'upload'  |
| secret          | a secret token generated for every file upload; secures guessing file paths when serving to clients |
| Entity          | type name of the entity  |
| ID              | id of the entity item that holds the metadata |
| Attribute       | name of attribute that holds the metadata |
| Filename        | original filename from the upload; sanitized (blank to - and no # characters) |

<br>

If you prefer not to store and serve files from the local filesystem but e.g. directly to/from a database or a cloud file service like S3, you would implement your own `EntityFileSave` implementation. You would have to inform your API clients (ideally in the schema documentation) how to obtain the actual file download then.

<br>

### Example

<table width="100%" style="font-size: 0.9em">
<tr valign="top">
<td width="30%"> YAML Configuration </td> <td width="70%"> Schema (excerpt) </td>
</tr>
<tr valign="top"><td>

```yaml
entity:
  Car: 
    attributes:
      brand: String!
      image: File
```

</td><td>

```graphql
type Car {
  id: ID!
  brand: String!
  image: File
  createdAt: DateTime!
  updatedAt: DateTime!
}

type File {
  filename: String!
  mimetype: String!
  encoding: String!
}

type Mutation {
  createCar(car: CarCreateInput, image: Upload): SaveCarMutationResult
  updateCar(car: CarUpdateInput, image: Upload): SaveCarMutationResult
}

scalar Upload
```

</td></tr>

</table>

You need a client with the ability to send multipart requests. Alas the GraphiQL playground that Apollo ships 
with is not able to do that. You can test this feature with other API test tools like 
[Altair](https://altair.sirmuel.design) though. 

You should declare a variable for each file upload and set in the "Add Files" section accordingly. Be aware that variables begin with `$` - best practice would be use the same name as the attribute. So if you have an attribute `picture` you would declare the variable `$picture: Upload`. In the file upload dialog you refer to the variable without `$` prefix then. 

![File Upload][file-upload]

[file-upload]: ./img/file-upload.png "File Upload"

<table width="100%" style="font-size: 0.8em">
<tr valign="top">
<td width="50%"> Request </td> <td width="50%"> Response </td>
</tr>
<tr valign="top"><td>

```graphql
mutation($image: Upload) {
  createCar( car: { brand: "Mercedes" } image: $image ){
    car{ id brand image { filename mimetype encoding secret } }
    validationViolations { attribute message }
  }
}
```

</td><td>

```json
{
  "data": {
    "createCar": {
      "car": {
        "id": "5faaef9164e3abf9383ae141",
        "brand": "Mercedes",
        "image": {
          "filename": "01-mercedes-benz.jpeg",
          "mimetype": "image/jpeg",
          "encoding": "7bit",
          "secret": "234234238"
        }
      },
      "validationViolations": []
    }
  }
}
```

</td></tr>
</table>
