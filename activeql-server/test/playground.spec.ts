import { DomainConfiguration } from '../core/domain-configuration';
import _ from 'lodash';

describe('playground', () => {

  class Augmentable {
    constructor(augment: any = {}) {
      Object.assign(this, augment)
    }
    static create<T extends typeof Augmentable, U>(this: T, augment?: U) {
      return new this(augment) as InstanceType<T> & U
    }
  }


  it('should not complain',  async () => {
    expect( true ).toBeTruthy()

    const augment = Augmentable.create({ id: 123, key: 'hallo', assocToBeta: async () => 'some' })
    expect( augment.key ).toEqual( 'hallo' );
    augment.key = 'new';
    expect( augment.key ).toEqual( 'new' );
  })

  it('xxx',  async () => {
    const ids = [1,2,3];
    const idStrings = _.chain( ids ).
      filter( id => id % 2 != 0 ).
      map( id => _.toString(id) ).
      value()
    expect( idStrings ).toEqual(['1','3'])
  })
})

