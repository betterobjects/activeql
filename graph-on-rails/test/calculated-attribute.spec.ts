import { printSchema } from 'graphql';
import _ from 'lodash';

import { Runtime } from '../core/runtime';
import { DomainDefinition } from '../core/domain-definition';

import { Seeder } from '../core/seeder';

describe('Calculated Attributes', () => {

  let runtime!:Runtime;


  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

  beforeAll( async () => {

    const domainDefinition = new DomainDefinition({
      entity: {
        Alpha: {
          attributes: {
            name: { type: 'string' },
            some: { type: 'int' },
            calculatedA: { type: 'string!', resolve: () => 'calculatedA' },
            calculatedB: { type: 'int', resolve: async () => 42 }
          },
          seeds: {
            alpha1: { name: 'alpha1' },
            alpha2: { name: 'alpha2' }
          }
        }
      }
    });

    runtime = await Runtime.create( { name: 'test:virtual-attributes', domainDefinition });
    await Seeder.create( runtime ).seed( true );
  })

  //
  //
  it('should not include virtual attributes in input & filter type', ()=> {
    const schema = printSchema( runtime.schema );
    expect( schema ).not.toContain('calculatedA: StringFilter');
  });

  //
  //
  it('should resolve a virtual attribute', async () => {
    const alpha = runtime.entities['Alpha'];
    const alpha1 = _.first( await alpha.findByAttribute( { name: 'alpha1' } ) );

    expect( alpha1?.item ).toMatchObject({ name: 'alpha1' } );
    expect( alpha1?.item.calculatedA ).toEqual( 'calculatedA'  );
    expect( alpha1?.item.calculatedB ).toEqual( 42 );
  })

})
