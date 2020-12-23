import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import _ from 'lodash';
import { Subject } from 'rxjs';

import { Action, EntityViewType, FieldConfig, ParentType, ViolationType } from '../../services/admin-config.service';
import { AdminDataService } from '../../services/admin-data.service';
import { AdminComponent } from '../admin.component';

@Component({
  selector: 'admin-form',
  templateUrl: './form.component.html',
  styleUrls:['./form.component.scss']
})
export class FormComponent extends AdminComponent implements OnInit {

  @Input() action:Action;
  @Input() viewType:EntityViewType
  @Input() parent:ParentType
  @Input() data:any;
  @Input() submit:Subject<any>;
  @Output() saveSuccess = new EventEmitter<any>();

  get fields() { return this.viewType[this.action].fields }
  get item() { return _.get( this.data, this.viewType.entity.typeQueryName, {} ) };
  violations:ViolationType[]
  form!:FormGroup
  options = {}
  files:_.Dictionary<File> = {}

  constructor(
    protected fb:FormBuilder,
    protected adminDataService:AdminDataService,
    protected snackBar:MatSnackBar
  ){ super() }

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
    const field:any = event.field;
    _.set( this.files, field.name, event.file );
  }

  protected async save(){
    try {
      const saveResult = await this.adminDataService.save( this.item.id, this.form.value, this.files, this.viewType.entity );
      _.isString( saveResult.id ) ? this.saveSuccess.emit( saveResult.id ): this.onSaveViolations( saveResult.violations );
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

  errorTip(field:any):string {
    const control = this.form.controls[field.name];
    if( ! control ) return undefined;
    if( control.hasError('required') ) return 'is required';
    if( control.hasError('invalid') ) return _(this.violations).
      filter( violation => violation.attribute === field.name ).
      map( violation => violation.message ).
      join(', ');
  }

  onSelectionChange(field:any, value:any ){
    // const assocConfig = this.adminService.getEntityConfig( field.path );
    // if( ! assocConfig ) return;
    // _.set( this.data.item, [assocConfig.typeQueryName, 'id'], value );
    // _.forEach( this.fields, field => {
    //   const config = this.data.entityConfig.assocs[field.path];
    //   if( config && config.scope ) this.options[field.name] =
    //     _.isFunction( field.values ) ? field.values( this.data.data ) : [];
    // });
  }

  protected buildForm(){
    const definition = _.reduce( this.viewType[this.action].fields, (definition, field) => {
      if( _.isFunction( field.options ) ) this.options[field.name] = field.options( this.data );
      const validators = field.required ? [Validators.required] : [];
      const valueDisabled = this.resolveValueDisbled( field );
      return _.set(definition, field.name, [valueDisabled, validators]);
    }, {} );
    this.form = this.fb.group(definition);
  }

  private resolveValueDisbled( field:FieldConfig ){
    if( this.parent?.viewType.name !== field.name ) return { value: field.value( this.item), disabled: field.disabled };
    if( field.type === 'assocTo' )return { value: this.parent.id, disabled: true };
    if( field.type === 'assocToMany' ){
      let value = field.value( this.item );
      value = value ? _.uniq( _.concat( value, this.parent.id) ) : [this.parent.id];
      return { value, disabled: false };
    }
  }

}
