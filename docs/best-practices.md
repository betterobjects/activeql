# Best Practises

## Structure your configuration 

If you have a non-trivial domain definition, you can split your configuration, even the same entity definition 
between any number of YAML or object configurations. 
Let's say you want to seperate the seed data (see [Seeds-Configuration](./seeds-configuration.md)) 
from the configuration of the attributes - thus making it easy to in-/exlcude the seeds-configuration from the domain configuration, or even have seperate seed-configurations.
Let's further assume you prefer writing your entity configurations in YAML but need one of the function callbacks
only available in object notation. 

We recommend the following pattern: 

  * one configuration folder for your domain definition
    * named after your business domain, e.g. `./cars-management`.
    * one YAML file per entity or enum in this folder with the fille-name of the dasherized filename, e.g. entity
    `VehicleFleet` configuration is in file `./vehicle-fleet.yml`. 
  * one folder per set of seed-data if you want to seperate the seed-data / configuration from the 
    entity configuration  
    * folder named after your business domain, e.g. `./cars-management-seeds`
    * files named exactly as the file with the rest of the entity definition
  * one src folder for the configuration-object definitions
    * named after your business domain, e.g. `./cars-managemnt-src`
    * one file per _use-case_  


### Example

For an express application this could look as follows (any *.ts file can of course also be *.js file, the usage
of typescript is recommended but optional): 

```
./project-root/
    ./app.ts
    ./cars-management-config
        ./car.yml
        ./car-fleet.yml
        ./driver.yml
    ./cars-management-seeds
        ./car.yml
        ./car-fleet.yml
        ./driver.yml
    ./cars-management-src
        ./my-login.ts
        ./schema-extension.ts
```

In your `app.ts` you could point to these locations like so: 

```typescript
import { MyLogin } from './cars-management-src';
import { schemaExtension } from './schema-extension';

const createGamaServer = async (apolloConfig:ApolloServerExpressConfig) => {
  const domainDefintion = new DomainDefinition( ['./cars-management-config', './cars-management-seeds'] );
  domainDefintion.add( schemaExtension );
  domainDefintion.add( new MyLogin( apolloConfig ).getConfiguration() );
  
  return GamaServer.create( apolloConfig, domainDefintion );
}

// default express app
(async () => {
  const app = express();
  app.use('*', cors());
  app.use(compression());

  const uploadRootDir = path.join(__dirname, 'uploads');
  app.use('/uploads', express.static(uploadRootDir));

  const apolloConfig:ApolloServerExpressConfig = { validationRules: [depthLimit(7)] };
  
  const server = await createGamaServer( apolloConfig );
  server.applyMiddleware({ app, path: '/graphql' });

  const httpServer = createServer( app );
  httpServer.listen( { port: 3000 }, () => console.log(` 
    🚀 GraphQL is now running on http://localhost:3000/graphql 
    Uploads in ${uploadRootDir}`)
  );
})();

```


