import { HostListener } from '@angular/core';
import _ from 'lodash';
import { FieldConfig } from '../services/admin-config.service';

export class AdminComponent {

  render( field:FieldConfig, item:any ){ return field.render( item ) }
  label( field:FieldConfig ){ return _.isString( field.label ) ? field.label : field.label() }

}
