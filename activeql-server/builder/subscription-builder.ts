import _ from 'lodash';

import { SubscriptionConfig } from '../core/domain-configuration';
import { SchemaBuilder } from './schema-builder';
import { withFilter } from 'apollo-server';

export abstract class SubscriptionBuilder extends SchemaBuilder {

  build(){
    this.graphx.type( 'subscription' ).extendFields( () => {
      let subscription = this.subscription();
      if( _.isString( subscription ) ) subscription = { type: subscription };
      _.isString( subscription.type ) && ( subscription.type = this.graphx.type( subscription.type ) );
      subscription.args = _.mapValues( subscription.args, arg => _.isString( arg ) ? {type: this.graphx.type(arg)} : arg );
      subscription.args = _.mapValues( subscription.args, arg => ! _.isString(arg) && _.isString( arg.type ) ? {type: this.graphx.type(arg.type)} : arg );

      if( _.isNil( subscription.subscribe ) ) subscription.subscribe = this.name();
      if( _.isString( subscription.subscribe) ) {
        const topic = subscription.subscribe;
        subscription.subscribe = () => this.runtime.pubsub.asyncIterator( topic )  ;
      }
      if( _.isFunction( subscription.filter) ) subscription.subscribe = withFilter( subscription.subscribe, subscription.filter );
      if( ! _.isFunction( subscription.resolve) ) subscription.resolve = (payload:any) => payload;
      return _.set( {}, this.name(), subscription );
    });
  }

  abstract subscription():SubscriptionConfig;
}

export class SubscriptionConfigBuilder extends SubscriptionBuilder {

  static create( name:string, config:SubscriptionConfig ):SubscriptionConfigBuilder {
    return new SubscriptionConfigBuilder( name, config );
  }

  name() { return this._name }
  subscription():SubscriptionConfig { return this.config }

  constructor( protected readonly _name:string, protected readonly config:SubscriptionConfig ){ super() }
}
