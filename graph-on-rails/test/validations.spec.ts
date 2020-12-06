import _ from 'lodash';

import { Runtime } from '../core/runtime';
import { Seeder } from '../core/seeder';

describe('Validations', () => {

  let runtime!:Runtime;

  beforeAll( async () => {
    runtime = await Runtime.create( { name: 'test:validations', domainDefinition: {
      entity: {
        Alpha: {
          attributes: {
            name: { type: 'string', required: true, unique: true, validation: { length: { minimum: 2, maximum: 20 }} },
            some: { type: 'string', required: true, unique: 'Delta' },
            foo: { type: 'int' }
          },
          assocTo: ['Delta'],
          validation:( item:any ) => {
            if( item.name == 'foo' && item.some == 'bar' ) return [{message: 'no foobar'}]
            return undefined;
          },
          seeds: {
            alpha1: { name: 'alpha1', some: 'some1', Delta: 'delta1' },
            alpha2: { name: 'alpha2', some: 'some2', Delta: 'delta1' },
            alpha3: { name: 'alpha3', some: 'some3', Delta: 'delta3' }
          }
        },
        Beta: {
          attributes: {
            name: { type: 'string', required: true, validation: { length: { minimum: 2, maximum: 20 }} },
          },
          assocTo: [{ type: 'Delta', required: true }],
          seeds: {
            beta1: { name: 'beta1', Delta: 'delta1' },
            beta2: { name: 'beta2', Delta: 'delta1' }
          }
        },
        Delta: {
          attributes: {
            name: { type: 'string' }
          },
          validation:( item:any ) => {
            if( item.id == null && item.name == 'foobar' ) return [{ attribute: 'name', message: "no foobar" } ]
          },
          seeds: {
            delta1: { name: 'delta1' },
            delta2: { name: 'delta2' },
            delta3: { name: 'delta3' }
          }
        }
      }}
    });

    await Seeder.create( runtime ).seed( true );
  })

  //
  //
  it('should validate attributes', async () => {
    const alpha = runtime.entities['Alpha'];
    let result = await alpha.validate( { some: 'some' } );
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'name',
        message: 'can\'t be blank'
      })
    ]));

    result = await alpha.validate( { name: 'x' } );
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'some',
        message: expect.stringContaining('can\'t be blank')
      })
    ]));

    result = await alpha.validate( { name: 'Cool this', some: 'Some that' } );
    expect( result ).toHaveLength( 0 );
  })

  //
  //
  it( 'should validate required assocTo', async () => {
    const beta = runtime.entities['Beta'];
    const result = await beta.validate( { name: 'aName' } );
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'deltaId',
        message: 'must be provided'
      })
    ]));
  })

  //
  //
  it( 'should validate existing foreignKey', async () => {
    const beta = runtime.entities['Beta'];
    let result = await beta.validate( { name: 'someName', deltaId: '1234' } );
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining({
        attribute: 'deltaId',
        message: expect.stringContaining('could not convert')
      })
    ]));

    const alpha = runtime.entities['Alpha']; // to get a valid but not matching id
    const alpha1 = _.first( await alpha.findByAttribute( {name: 'alpha1'}) );
    result = await beta.validate( { name: 'someName', deltaId: alpha1?.id } );
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'deltaId',
        message: 'must refer to existing item'
      })
    ]));

    const delta = runtime.entities['Delta'];
    const delta1 = await delta.findOneByAttribute({name: 'delta1'});
    expect( delta1 ).toBeDefined()
    result = await beta.validate( { name: 'someName', deltaId: delta1?.id } );
    expect( result ).toHaveLength( 0 );
  })

  //
  //
  it('should have validation message for unique attribute', async () => {
    const alpha = runtime.entities['Alpha'];

    const result = await alpha.validate( { name: 'alpha1', some: 'some' } );
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'name',
        message: 'value \'alpha1\' must be unique'
      })
    ]));
  })

  //
  //
  it('should have validation message for unique attribute with scope', async () => {
    const alpha = runtime.entities['Alpha'];
    const delta = runtime.entities['Delta'];
    const delta1 = _.first( await delta.findByAttribute({name: 'delta1'}) );
    const delta2 = _.first( await delta.findByAttribute({name: 'delta2'}) );

    expect( delta1?.id ).toBeDefined()

    let result = await alpha.validate( { name: 'alphaNeu', some: 'some1', deltaId: delta1?.id } );
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'some',
        message: 'value \'some1\' must be unique within scope \'Delta\''
      })
    ]));

    result = await alpha.validate( { name: 'aX', some: 'some1', deltaId: delta2?.id } );
    expect( result ).toHaveLength( 0 );
  })

  //
  //
  it('should validate the updated item (not just the input)', async () => {
    const alpha = runtime.entities['Alpha'];
    const alpha1 = _.first( await alpha.findByAttribute({name: 'alpha1'}));
    expect( alpha1 ).toBeDefined();
    const result = await alpha.validate( { id: alpha1?.id } );
    expect( result ).toHaveLength( 0 );
  })

  //
  //
  it( 'should not complain for update with the same unique value', async () => {
    const alpha = runtime.entities['Alpha'];
    const alpha1 = _.first( await alpha.findByAttribute({name: 'alpha1'}));
    const result = await alpha.validate( { id: alpha1?.id, name: 'alpha1' } );
    expect( result ).toHaveLength( 0 );
  })

  it( 'should validate the entity from config', async () => {
    const alpha = runtime.entities['Alpha'];
    let result = await alpha.validate( { name: 'foo', some: 'bar' } );
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        message: 'no foobar'
      }),
      expect.not.objectContaining( { attribute: null } )
    ]));
  })

  it( 'should validate the entity from config only create', async () => {
    const delta = runtime.entities['Delta'];
    let result = await delta.validate( { name: 'foobar' } );
    expect( result ).toHaveLength( 1 );
    expect( result ).toEqual( expect.arrayContaining([
      expect.objectContaining( {
        attribute: 'name',
        message: 'no foobar'
      })
    ]));

    const delta1 = await delta.findOneByAttribute( {name: 'delta1' } );
    expect( delta1 ).toBeDefined();
    result = await delta.validate( { id: delta1?.id, name: 'foobar' } );
    expect( result ).toHaveLength( 0 );
  })

})
