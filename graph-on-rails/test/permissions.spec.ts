import _ from 'lodash';

import { DomainConfiguration } from '../core/domain-configuration';
import { Runtime } from '../core/runtime';
import { Seeder } from '../core/seeder';
import { CRUD } from '../entities/entity-resolver';

const domainConfiguration:DomainConfiguration = {
  entity: {
    Fleet: {
      attributes: {
        name: 'Key'
      },
      seeds: {
        fleet1: { name: 'Fleet 1' },
        fleet2: { name: 'Fleet 2' },
        fleet3: { name: 'Fleet 3' }
      }
    },
    Car: {
      attributes: {
        licence: 'Key',
        brand: 'String!',
        color: 'String'
      },
      assocTo: 'Fleet',
      seeds: {
        redBmw: {
          licence: 'redBmw',
          brand: 'BMW',
          color: 'red',
          Fleet: 'fleet1'
        },
        greenBmw: {
          licence: 'greenBmw',
          brand: 'BWM',
          color: 'green',
          Fleet: 'fleet1'
        },
        blackBmw: {
          licence: 'blackBmw',
          brand: 'BWM',
          color: 'black',
          Fleet: 'fleet1'
        },
        blueAudi: {
          licence: 'blueAudi',
          brand: 'Audi',
          color: 'blue',
          Fleet: 'fleet1'
        },
        redAudi: {
          licence: 'redAudi',
          brand: 'Audi',
          color: 'red',
          Fleet: 'fleet2'
        },
        redPorsche: {
          licence: 'redPorsche',
          brand: 'Porsche',
          color: 'red',
          Fleet: 'fleet2'
        },
        blackPorsche: {
          licence: 'blackPorsche',
          brand: 'Porsche',
          color: 'black',
          Fleet: 'fleet3'
        }
      },
      permissions: {
        roleA: true,
        user: ( { principal } ) => ({color: { $in: principal.colors }}),
        userWithBlue: () => ({color: { $eq: 'blue' }}),
        userC: ( {principal, runtime} ) =>
          runtime.dataStore.buildExpressionFromFilter( runtime.entity('Car'), { color: { in: principal.colors}} ),
        assistant: ( { action } ) => _.includes( [CRUD.READ], action ),
        manager: ( { principal } ) => ({ id: { $in: principal.carIds } }),
        fleetUser: 'Fleet',
        readUser: {
          read: true
        }
      }
    },
    Accessory: {
      attributes: {
        name: 'Key'
      },
      assocTo: 'Car',
      seeds: {
        aForRedBmw: {
          name: 'aForRedBwm',
          Car: 'redBmw'
        },
        bForRedBmw: {
          name: 'bForRedBmw',
          Car: 'redBmw'
        },
        aForBlueAudi: {
          name: 'aForBlueAudi',
          Car: 'aForBlueAudi'
        },
        aForGreenBwm: {
          name: 'aForGreenBwm',
          Car: 'greenBmw'
        },
        aForBlackPorsche: {
          name: 'aForBlackPorsche',
          Car: 'blackPorsche'
        }
      },
      permissions: 'Car'
    },
    Some: {
      attributes: {
        name: 'String'
      },
      assocTo: 'Accessory',
      permissions: {
        fleetUser: 'Accessory:Car:Fleet'
      },
      seeds: {
        Some1aForBlueAudi: {
          name: 'Some1aForBlueAudi',
          Accessory: 'aForBlueAudi',
        },
        Some2aForBlueAudi: {
          name: 'Some2aForBlueAudi',
          Accessory: 'aForBlueAudi',
        },
        Some1bForRedBmw: {
          name: 'Some1bForRedBmw',
          Accessory: 'bForRedBmw'
        },
        Some1bForBlackPorsche: {
          name: 'Some1aForBlackPorsche',
          Accessory: 'aForBlackPorsche'
        }
      }
    },
    Foo: {
      attributes: {
        name: 'String'
      },
      seeds: {
        foo1: {
          name: 'foo1'
        }
      }
    }
  }
};


describe('Permissions', () => {

  let runtime!:Runtime;

  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

  beforeAll( async () => {
    runtime = await Runtime.create({ name: 'test:permissions', domainDefinition: domainConfiguration });
    const messages = await Seeder.create( runtime ).seed( true );
    console.log( messages );
  }, 20000 );

  it('should allow super user', async ()=> {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const car = runtime.entity('Car');
    const redBmw = await car.findOneByAttribute( {licence: 'redBmw'} );
    if( ! redBmw ) throw new Error();

    const superUser = _.defaults( { context: { principal: { roles: true } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( superUser );
    expect( resolverCtx.args.filter ).toBeUndefined();
    await car.entityPermissions.ensureTypeRead( redBmw.id, superUser );
  });

  it('should prohibit looser user', async ()=> {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const car = runtime.entity('Car');
    const redBmw = await car.findOneByAttribute( {licence: 'redBmw'} );
    if( ! redBmw ) throw new Error();

    const rolesFalse = _.defaults( { context: { principal: { roles: false } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( rolesFalse );
    expect( resolverCtx.args.filter ).toEqual( { id: null } );
    await expect( car.entityPermissions.ensureTypeRead( redBmw.id, rolesFalse ) ).rejects.toBeTruthy();

    const noRoles = _.defaults( { context: { principal: { roles: false } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( noRoles );
    expect( resolverCtx.args.filter ).toEqual( { id: null } );
    await expect( car.entityPermissions.ensureTypeRead( redBmw.id, noRoles ) ).rejects.toBeTruthy();
  });

  it('should allow everyone if no permissions definition at entity exists', async () =>{
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const foo = runtime.entity('Foo');

    const foo1 = await foo.findOneByAttribute( {name: 'foo1'} );
    if( ! foo1 ) throw new Error();

    await foo.entityPermissions.ensureTypesRead( resolverCtx );
    expect( resolverCtx.args.filter ).toBeUndefined();
    await foo.entityPermissions.ensureTypeRead( foo1.id, resolverCtx );
  })

  it( 'should set no permssion filter if at least one role allows action', async () => {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const car = runtime.entity('Car');
    const redBmw = await car.findOneByAttribute( {licence: 'redBmw'} );
    if( ! redBmw ) throw new Error();

    const superUser = _.defaults( { context: { principal: { roles: ['roleA','user'] } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( superUser );
    expect( resolverCtx.args.filter ).toBeUndefined();
    await car.entityPermissions.ensureTypeRead( redBmw.id, superUser );
  })

  it('should add a filter when defined by role and principal', async () => {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const car = runtime.entity('Car');

    const redBmw = await car.findOneByAttribute( {licence: 'redBmw'} );
    if( ! redBmw ) throw new Error();

    const blueAudi = await car.findOneByAttribute( {licence: 'blueAudi'} );
    if( ! blueAudi ) throw new Error();

    const user = _.defaults( { context: { principal: { roles: 'user', colors: ['red', 'green'] } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( user );
    expect( user.args.filter ).toMatchObject( { expression: { color: { $in: ['red', 'green' ] } } } );

    const userWithAllowedId = _.defaults( { args: { id: redBmw.id } }, user );
    await expect( car.entityPermissions.ensureTypeRead( redBmw.id, userWithAllowedId ) ).resolves.not.toThrowError();

    const userWithUnallowedId = _.defaults( { args: { id: blueAudi.id } }, user );
    await expect( car.entityPermissions.ensureTypeRead( blueAudi.id, userWithUnallowedId ) ).rejects.toBeTruthy();
  })

  it( 'should or-join multiple permission expressions', async () => {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const car = runtime.entity('Car');

    const blueAudi = await car.findOneByAttribute( {licence: 'blueAudi'} );
    if( ! blueAudi ) throw new Error();

    const user = _.defaults( { context: { principal: { roles: ['user','userWithBlue'], colors: ['red', 'green'] } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( user );
    expect( user.args.filter ).toMatchObject(
      { expression: { $or: [{ color: { $in: ['red', 'green' ] } }, { color: { $eq: 'blue'}}]} } );

    const userWithBlueId = _.defaults( { args: { id: blueAudi.id } }, user );
    await expect( car.entityPermissions.ensureTypeRead( blueAudi.id, userWithBlueId ) ).resolves.not.toThrowError();
  })

  it('should be able to use filter syntax', async () => {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const car = runtime.entity('Car');

    const user = _.defaults( { context: { principal: { roles: 'userC', colors: ['red', 'green'] } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( user );
    expect( user.args.filter ).toMatchObject( { expression: { color: { $in: ['red', 'green' ] } } } );
  })

  it( 'should get permissions from delegate', async () => {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const accessory = runtime.entity('Accessory');

    const user = _.defaults( { context: { principal: { roles: ['user'], colors: ['red', 'green'] } } }, _.clone(resolverCtx)  );
    await accessory.entityPermissions.ensureTypesRead( user );
    expect( user.args.filter.expression.carId['$in'] ).toHaveLength( 4 );
    const user2 = _.defaults( { context: { principal: { roles: ['user'], colors: ['red', 'green'] } } }, _.clone(resolverCtx)  );
    const acessories = await accessory.resolver.resolveTypes( user2 );
    expect( acessories ).toHaveLength( 3 );
  })

  it( 'should get permission from assignedEntity', async () => {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const fleet = runtime.entity('Fleet');
    const fleet1 = await fleet.findOneByAttribute({ name: 'Fleet 1' } );
    if( ! fleet1 ) throw new Error();
    const car = runtime.entity('Car');

    const fleetUserCtx = _.defaults( { context: { principal: { roles: ['fleetUser'], fleetId: fleet1.id } } }, _.clone(resolverCtx)  );
    await car.entityPermissions.ensureTypesRead( fleetUserCtx );
    console.log( fleetUserCtx.args.filter.expression );
    expect( fleetUserCtx.args.filter.expression.fleetId['$eq']).toBe( fleet1.id );
  })

  it( 'should get permission from assignedEntity over multiple hops', async () => {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const fleet = runtime.entity('Fleet');
    const fleet3 = await fleet.findOneByAttribute({ name: 'Fleet 3' } );
    if( ! fleet3 ) throw new Error();
    const accessory = runtime.entity('Accessory');
    const aForBlackPorsche = await accessory.findOneByAttribute({name: 'aForBlackPorsche'});
    if( ! aForBlackPorsche ) throw new Error();
    const some = runtime.entity('Some');

    const fleetUserCtx = _.defaults( { context: { principal: { roles: ['fleetUser'], fleetId: fleet3.id } } }, _.clone(resolverCtx)  );
    await some.entityPermissions.ensureTypesRead( fleetUserCtx );
    console.log( fleetUserCtx.args.filter.expression );
    expect( fleetUserCtx.args.filter.expression.accessoryId['$in'][0]).toBe( aForBlackPorsche.id );
  })

  fit( 'should differentiate per action', async () => {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const car = runtime.entity('Car');

    const readUserCtx = _.defaults( { context: { principal: { roles: ['readUser'] } } }, _.clone(resolverCtx)  );
    await car.entityPermissions.ensureTypesRead( readUserCtx );
    expect( readUserCtx.args.filter ).toBeUndefined();

    const blueAudi = await car.findOneByAttribute( {licence: 'blueAudi'} );
    if( ! blueAudi ) throw new Error();
    readUserCtx.args.car = { id: blueAudi.id, color: 'black' };
    await expect( car.entityPermissions.ensureSave( readUserCtx ) ).rejects.toBeTruthy();
  })
})
