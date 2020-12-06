import _ from 'lodash';

import { Runtime } from '../core/runtime';
import { Seeder } from '../core/seeder';


describe('Resolver', () => {

  let runtime!:Runtime;

  beforeAll( async () => {
    runtime = await Runtime.create( { name: 'test:resolver', domainDefinition: {
      entity: {
        Alpha: {
          attributes: {
            name: 'key',
            number: 'int'
          },
          seeds: {
            a1: { name: 'a1', number: 1 },
            a2: { name: 'a2', number: 2 },
            a3: { name: 'a3', number: 3 },
            a4: { name: 'a4' }
          }
        }
      }
    }});
    await Seeder.create( runtime ).seed( true );
    // logSchema( gor );
  })

  it('should find entities', () => {
    const alpha = runtime.entities['Alpha'];
    expect( alpha ).toBeDefined();
    const foo = runtime.entities['Foo'];
    expect( foo ).toBeUndefined();
  })

  it('should find items by string filter', async () => {
    const resolverCtx = { root:{}, args:{}, context:{} };
    const alpha = runtime.entities['Alpha'];
    resolverCtx.args = { filter: { name: { is: 'a1' } }};
    const a1 = await alpha.resolver.resolveTypes( resolverCtx );
    expect( a1 ).toHaveLength(1);
    resolverCtx.args = { filter: { name: { contains: 'a' } } };
    const arr = await alpha.resolver.resolveTypes( resolverCtx );
    expect( arr ).toHaveLength(4);
    resolverCtx.args = { filter: { name: { is: 'aX' } } };
    const aX = await alpha.resolver.resolveTypes( resolverCtx );
    expect( aX ).toHaveLength(0);
  })

  it('should find items by int filter', async () => {
    const resolverCtx = { root:{}, args:{}, context:{} };
    const alpha = runtime.entities['Alpha'];

    resolverCtx.args = { filter: { number: { lt: 2 } } };
    const aLt2 = await alpha.resolver.resolveTypes( resolverCtx );
    expect( aLt2 ).toHaveLength(1);

    resolverCtx.args =  { filter: { number: { gt: 1 } } };
    const aGt1 = await alpha.resolver.resolveTypes( resolverCtx );
    expect( aGt1 ).toHaveLength(2);

    resolverCtx.args =  { filter: { number: { between: [2,4] } } };
    const aBetween2_4 = await alpha.resolver.resolveTypes( resolverCtx );
    expect( aBetween2_4 ).toHaveLength(2);
  })


})
