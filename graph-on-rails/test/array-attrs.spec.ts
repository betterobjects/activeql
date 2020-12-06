import { printSchema } from 'graphql';

import { DomainConfiguration } from '../core/domain-configuration';
import { Runtime } from '../core/runtime';
import { Seeder } from '../core/seeder';

const domainConfiguration:DomainConfiguration = {
  entity: {
    User: {
      attributes: {
        username: 'string!',
        roles: '[string]',
        someIds: {
          type: 'int',
          list: true
        }
      },
      seeds: {
        admin: {
          username: 'admin',
          roles: ['user', 'admin'],
          someIds: [1, 2, 3]
        },
        regular: {
          username: 'regular',
          roles: ['user'],
          someIds: [23, 42]
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
    await Seeder.create( runtime ).seed( true );
    if( false ) console.log( printSchema( runtime.schema ) );
  })

  it('should have array values from seed', async ()=> {
    const user = runtime.entities['User'];
    const admin = await user.findOneByAttribute( {username: 'admin'} );
    expect( admin?.item.roles ).toEqual(['user', 'admin']);
    expect( admin?.item.someIds ).toEqual([1,2,3]);
  });

  it('should store and read array values', async ()=> {
    const user = runtime.entities['User'];
    await user.accessor.save( { username: 'another', roles: ['foo', 'bar'], someIds: [23]})
    const another = await user.findOneByAttribute( {username: 'another'} );
    expect( another?.item.roles ).toEqual(['foo', 'bar']);
    expect( another?.item.someIds ).toEqual([23]);
  });

  it('should filter array values', async ()=> {
    const user = runtime.entities['User'];

  });

})
