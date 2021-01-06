import { Directive } from '@angular/core';
import _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminConfigService, EntityViewType, ParentType } from '../services/admin-config.service';
import { AdminDataService } from '../services/admin-data.service';

import { FieldConfig } from '../services/admin-config.service';
import { FormBuilder } from '@angular/forms';

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
