import * as _ from 'lodash';
import * as inflection from 'inflection';
import { EntityConfigType, TitlePurposeType, FieldConfigType } from '../services/admin-config';

export abstract class AdminComponent {

  title( purpose:TitlePurposeType, config:EntityConfigType ):string {
    if( _.isFunction( config.title ) ) return config.title( purpose );
    if( _.isString( config.title ) ) return config.title;
    return _.includes(['show','edit'], purpose ) ?
      inflection.humanize( inflection.singularize( config.path ) ) :
      inflection.humanize( config.path );
  }

  name( item:any, config:EntityConfigType ){
    return config.name( item );
  }

  label( field:FieldConfigType ):string {
    if( _.isFunction( field.label ) ) return field.label();
    // if there is i18n - return label lookup of label | name
    if( _.isString( field.label ) ) return field.label;
    if( _.isString( field.name ) ) return inflection.humanize( field.name );
    if( _.isString( field.path ) ) return inflection.humanize( inflection.singularize( field.path ) );
    return _.toString(field);
  }

  render( field:FieldConfigType, item:any ){
    if( ! _.isFunction( field.render ) ) field.render = (item) => {
      const value = _.get( item, field.name );
      return _.isArray( value ) ? _.map( value, v => _.toString(v)).join(', ') : _.toString(value);
    }
    return field.render( item );
  }

  value( field:FieldConfigType, item:any ){
    if( ! _.isFunction( field.value ) ) field.value = (item) => _.get( item, field.name );
    return field.value( item );
  }

  protected warn<T>( message:string, type:T ):T {
    console.warn(message);
    return type;
  }

}
