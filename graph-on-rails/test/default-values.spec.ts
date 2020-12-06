import { printSchema } from 'graphql';
import _ from 'lodash';

import { Seeder } from '../core/seeder';
import { Runtime } from '../core/runtime';
import { EntityItem } from '../entities/entity-item';


describe('Default Values', () => {

  let runtime!:Runtime;

  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

  beforeAll( async () => {
    runtime = await Runtime.create( { name: 'text',
      domainDefinition: {
        entity: {
          Alpha: {
            attributes: {
              name: 'key',
              number: {
                type: 'int',
                default: 23
              }
            },
            assocTo: 'Beta',
            seeds: {
              alpha1: { name: 'alpha1' },
              alpha2: { name: 'alpha2', number: 42 },
              alpha3: { name: 'alpha3', number: 0 },
              alpha4: { name: 'alpha4', number: undefined },
            }
          },
          Beta: {
            attributes: {
              name: 'key',
              af: {
                type: 'AngularFunction',
                default: 'sin'
              }
            },
            assocFrom: 'Alpha',
            seeds: {
              beta1: { name: 'beta1' },
              beta2: { name: 'beta2', af: 'tan' }
            }

          }
        },
        enum: {
          AngularFunction: ['sin', 'cos', 'tan', 'cot']
        }
      }
    });

    await Seeder.create( runtime ).seed( true );

  })

  //
  //
  it('should set default in seed data', async ()=> {
    const alpha = runtime.entities['Alpha'];
    const beta = runtime.entities['Beta'];

    const alpha1 = await alpha.findOneByAttribute( {name: 'alpha1'} );
    const alpha2 = await alpha.findOneByAttribute( {name: 'alpha2'} );
    const alpha3 = await alpha.findOneByAttribute( {name: 'alpha3'} );
    const alpha4 = await alpha.findOneByAttribute( {name: 'alpha4'} );
    const beta1 = await beta.findOneByAttribute( {name: 'beta1'} );
    const beta2 = await beta.findOneByAttribute( {name: 'beta2'} );

    expect( alpha1?.item.number ).toEqual( 23 );
    expect( alpha2?.item.number ).toEqual( 42 );
    expect( alpha3?.item.number ).toEqual( 0 );
    expect( alpha4?.item.number ).toBeNull()

    expect( beta1?.item.af ).toEqual('sin');
    expect( beta2?.item.af ).toEqual('tan');
  });

  //
  //
  it('should set default when creating / update', async ()=> {
    const alpha = runtime.entities['Alpha'];

    let alpha5 = await alpha.accessor.save( {name: 'alpha5' } );
    if( ! (alpha5 instanceof EntityItem) ) return expect( false ).toBeTruthy();
    expect( alpha5?.item.number ).toEqual( 23 );

    alpha5 = await alpha.accessor.save( {id: alpha5.id, number: null } );
    if( ! (alpha5 instanceof EntityItem) ) return expect( false ).toBeTruthy();
    expect( alpha5?.item.number ).toBeNull();

    let alpha6 = await alpha.accessor.save( {name: 'alpha6', number: 42 } );
    if( ! (alpha6 instanceof EntityItem) ) return expect( false ).toBeTruthy();
    expect( alpha6?.item.number ).toEqual( 42 );

  });

})
