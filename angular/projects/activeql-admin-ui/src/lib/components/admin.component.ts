import { FieldConfig } from "../lib/admin-config.service"
import _ from 'lodash';

export class AdminComponent {

  render( field:FieldConfig, item:any ){ return field.render( item ) }

  label( field:FieldConfig ){ return _.isString( field.label ) ? field.label : field.label() }

}
