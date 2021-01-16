---
layout: page
title: Best Practices
nav_order: 40
---

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
    * named after your business domain, e.g. `./cars-management` or generic `./domain-configuration`.
    * one YAML file per entity or enum in this folder with the fille-name of the dasherized filename, e.g. entity
    `VehicleFleet` configuration is in file `./vehicle-fleet.yml`. 
  * one folder per set of seed-data if you want to seperate the seed-data / configuration from the 
    entity configuration  
    * folder named after your business domain, e.g. `./cars-management-seeds` or generic `./seeds`
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
    ./activeql
      ./cars-management
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

