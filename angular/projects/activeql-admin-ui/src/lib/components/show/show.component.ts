import { ReturnStatement } from '@angular/compiler';
import { Component } from '@angular/core';
import _ from 'lodash';
import { FieldConfig, FieldListConfig, UiAssocFromConfig } from '../../services/admin-config.service';
import { AdminActionComponent } from '../admin-action.component';

@Component({
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent extends AdminActionComponent  {

  get fields() {
    return this.parent ?
      _.filter(this.config.show.fields, field => field.name !== this.parent.viewType.name ) :
      this.config.show.fields
  }

  onSelect( assocFrom:UiAssocFromConfig ){
    const viewType = this.adminConfigService.getEntityViewByName( assocFrom.entity );
    return (id:string) => this.goto( viewType, id, { viewType: this.config, id: this.id} );
  }

  onAction( assocFrom:UiAssocFromConfig ){
    return ({id,action}) => console.log( assocFrom.entity, action, id );
  }

  assocFromFields( assocFrom:UiAssocFromConfig ){
    return _.filter( assocFrom.fields, (field:FieldConfig) => field.name !== this.config.name );
  }

  assocFromItems( assocFrom:UiAssocFromConfig ){
    const entity = _.get( this.adminConfigService.domainConfiguration, ['entity', assocFrom.entity] );
    return _.get( this.item, entity.typesQueryName );
  }

  assocFromTitle( assocFrom:UiAssocFromConfig ){
    const config = this.adminConfigService.getEntityViewByName( assocFrom.entity );
    return config.listTitle();
  }

  assocFromLink( assocFrom:UiAssocFromConfig ){
    const config = this.adminConfigService.getEntityViewByName( assocFrom.entity );
    return ['/admin', this.config.path, this.item.id, config.path ];
  }

  // get fields():FieldConfigType[] {
  //   return _.filter( this.data.entityConfig.show.fields as FieldConfigType[],
  //     field => field.objectTypeField !== false  )
  // }


  // get detailTables() { return this.data.entityConfig.show.table }

  // tableItems( table:AssocTableConfigType ):any[]{
  //   const query = _.get( this.data.entityConfig.assocs, [table.path, 'query']);
  //   return _.get( this.data.item, query );
  // }

  // onChildNew( table:AssocTableConfigType ){
  //   this.router.navigate( ['/admin', this.data.path, this.data.id, table.path, 'new' ] );
  // }

  onAttributeClick( event:any ):void {
    const url = _.get( event, 'srcElement.currentSrc' );
    if( url ) window.open( url, '_blank' );
  }
}
