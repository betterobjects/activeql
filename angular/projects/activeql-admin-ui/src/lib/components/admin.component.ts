import { Directive } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import _ from 'lodash';

import { AdminConfigService } from '../services/admin-config.service';
import { FieldConfig } from '../services/admin-config.types';
import { AdminDataService } from '../services/admin-data.service';

@Directive()
export class AdminComponent {

  constructor(
    protected fb:FormBuilder,
    protected route:ActivatedRoute,
    protected router:Router,
    protected dialog:MatDialog,
    protected snackBar:MatSnackBar,
    protected adminDataService:AdminDataService,
    protected adminConfigService:AdminConfigService ){}

  render( field:FieldConfig, item:any ){ return field.render( item ) }
  label( field:FieldConfig ){ return _.isString( field.label ) ? field.label : field.label() }

}
