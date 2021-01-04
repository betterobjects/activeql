import { printSchema } from 'graphql';

import { DomainConfiguration } from '../core/domain-configuration';
import { DomainDefinition } from '../core/domain-definition';
import { Runtime } from '../core/runtime';
import { Entity } from '../entities/entity';


describe('Schema Generation', () => {


  it('should generate type and enum', async () => {
    const domainDefinition:DomainConfiguration = {
      entity: {
        Car: {
          attributes: {
            licenceNr: 'string',
            fuel: 'Fuel'
          }
        }
      },
      enum: {
        Fuel: ['lead', 'gas', 'diesel']
      }
    };
    const runtime = await Runtime.create( domainDefinition );
    const schema = printSchema( runtime.schema );
    // console.log( schema );
    expect(schema).toContain('Car');
    expect(schema).toContain('CarFilter');
    expect(schema).toContain('Fuel');
    expect(schema).toContain('FuelFilter');
  });

  it( 'should generate schema from config', async () => {
    const runtime = await Runtime.create('./test/config-types');
    const schema = printSchema( runtime.schema );
    // console.log( schema );
    expect(schema).toContain('Car');
    expect(schema).toContain('CarFilter');
    expect(schema).toContain('Fuel');
    expect(schema).toContain('FuelFilter');
  });

  it('should distinguish required variants', async () => {
    const runtime = await Runtime.create({ name: 'test:schema',
    domainDefinition: {
        entity: {
          Alpha: {
            attributes: {
              alwaysRequired: { type: 'string', required: true },
              noRequired: { type: 'string' },
              explicitNoRequired: { type: 'string', required: false }
            }
          }
        }
      }
    });
    const schema = printSchema( runtime.schema );
    expect( schema ).toContain('type Alpha');
    // console.log( schema )
  })

})
