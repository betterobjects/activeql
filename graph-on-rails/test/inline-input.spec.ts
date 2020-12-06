import YAML from 'yaml';

import { ResolverContext } from '../core/domain-configuration';
import { Runtime } from '../core/runtime';
import { Seeder } from '../core/seeder';

const domainConfiguration = YAML.parse(`
  enum:
    Color:
      - red
      - green
      - yellow

  entity:
    Alpha:
      attributes:
        name: key
      assocTo:
        - type: Beta
          input: true
      seeds:
        alphaSeed1:
          name: alphaSeed1
          beta:
            name: betaSeed1
            color: green

    Beta:
      attributes:
        name: key
        color: Color!
`);

describe('Inline Input', () => {

  let runtime!:Runtime;

  beforeAll( async () => {
    runtime = await Runtime.create( { name: 'test:inline-input', domainDefinition: domainConfiguration } );
    await Seeder.create( runtime ).seed( true );
    // console.log( printSchema( await runtime.schema() ));
  })

  it('should find create entities',  async () => {
    const alpha = runtime.entities['Alpha'];
    expect( alpha ).toBeDefined();
    const beta = runtime.entities['Beta'];
    expect( beta ).toBeDefined();
    await beta.resolver.saveType( {root:{}, args:{ beta: { name: 'beta1', color: 'RED'} }, context:{} } );
    const beta1 = await beta.findOneByAttribute( {name: 'beta1' } );
    expect( beta1?.item ).toEqual( expect.objectContaining( {name: 'beta1', color: 'RED' }) );
    await alpha.resolver.saveType( {root:{}, args:{ alpha: { name: 'alpha1', betaId: beta1?.id } }, context:{} } );
    const alpha1 = await alpha.findOneByAttribute( {name: 'alpha1' } );
    expect( alpha1?.item ).toEqual( expect.objectContaining( { name: 'alpha1', betaId: beta1?.id } ) );
  })


  it('should find create entities with inline input',  async () => {
    const alpha = runtime.entities['Alpha'];

    const resolverCtx:ResolverContext = { root:{}, args:{}, context:{} }
    resolverCtx.args = {
      alpha: {
        name: 'alpha3',
        beta: { name: 'betaInline', color: 'red' }
      }
    }
    await alpha.resolver.saveType( resolverCtx );
    const alpha3 = await alpha.findOneByAttribute({name: 'alpha3'});
    const betaInline = await alpha3?.assocTo('Beta');
    expect( betaInline?.item ).toMatchObject({ name: 'betaInline', color: 'red' })
  })

})
