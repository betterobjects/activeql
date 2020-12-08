import { DomainConfiguration } from "graph-on-rails";

// you can add object based configuration here
export const domainConfiguration:DomainConfiguration = {
  entity: {
    Car: {
      attributes: {
        registration: {
          type: 'Date!',
          defaultValue: () => new Date()
        }
      }
    }
  }
}
