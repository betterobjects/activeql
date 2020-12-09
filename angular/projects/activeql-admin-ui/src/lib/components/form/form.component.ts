import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';

import { Subject } from 'rxjs';
import { FieldConfigType, ViolationType } from '../../lib/admin-config';
import { AdminData } from '../../lib/admin-data';
import { AdminService } from '../../services/admin.service';

import { AdminComponent } from '../../components/admin.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'admin-form',
  templateUrl: './form.component.html',
  styleUrls:['./form.component.scss']
})
export class FormComponent extends AdminComponent implements OnInit {

  @Input() data:AdminData;
  @Input() submit:Subject<any>;
  @Output() saveSuccess = new EventEmitter<any>();

  violations:ViolationType[]
  form!:FormGroup
  get fields() { return this.data.entityConfig.form.fields as FieldConfigType[] }
  options = {}
  files:_.Dictionary<File> = {}

  constructor(
    private fb:FormBuilder,
    protected snackBar:MatSnackBar,
    private adminService:AdminService )
  { super() }

  ngOnInit(){
    this.buildForm();
    this.submit.subscribe( () => this.submitForm() );
  }

  async submitForm():Promise<void> {
    this.form.markAsDirty();
    _.forEach( this.form.controls, control => {
      control.markAsDirty();
      control.markAsTouched();
      control.updateValueAndValidity();
    });
    if( this.form.valid ) this.save();
  }

  onFileLoad( event:any ):void {
    const field:FieldConfigType = event.field;
    _.set( this.files, field.name, event.file );
  }

  protected async save(){
    try {
      const saveResult = await this.adminService.save( this.data.id, this.form.value, this.files, this.data.entityConfig );
      _.isUndefined( saveResult.id ) ?
        this.onSaveViolations( saveResult.violations ) :
        this.saveSuccess.emit( saveResult.id );
    } catch (error) {
      this.snackBar.open('Error', error, {
        duration: 3000, horizontalPosition: 'center', verticalPosition: 'top'
      });

    }
  }

  protected onSaveViolations( violations:ViolationType[] ){
    this.violations = violations;
    _.forEach( violations, violation => {
      const control = this.form.controls[violation.attribute];
      if( control ) control.setErrors( { invalid: true } );
    });
  }

  errorTip(field:FieldConfigType):string {
    const control = this.form.controls[field.name];
    if( ! control ) return undefined;
    if( control.hasError('required') ) return 'is required';
    if( control.hasError('invalid') ) return _(this.violations).
      filter( violation => violation.attribute === field.name ).
      map( violation => violation.message ).
      join(', ');
  }

  onSelectionChange(field:FieldConfigType, value:any ){
    const assocConfig = this.adminService.getEntityConfig( field.path );
    if( ! assocConfig ) return;
    _.set( this.data.item, [assocConfig.typeQueryName, 'id'], value );
    _.forEach( this.fields, field => {
      const config = this.data.entityConfig.assocs[field.path];
      if( config && config.scope ) this.options[field.name] =
        _.isFunction( field.values ) ? field.values( this.data.data ) : [];
    });
  }

  protected buildForm(){
    const definition = _.reduce( this.fields, (definition, field) => {
      this.options[field.name] = _.isFunction( field.values ) ? field.values( this.data.data ) : [];
      const validators = field.required ? [Validators.required] : [];
      const value = field.path ? field.keyValue( this.data.item ) : this.value( field, this.data.item );
      const disabled = _.has( field, 'path' ) && _.get( field, 'path' ) === _.get( this.data.parent, 'path' );
      return _.set(definition, field.name, [{value, disabled}, validators]);
    }, {} );
    this.form = this.fb.group(definition);
  }

}
