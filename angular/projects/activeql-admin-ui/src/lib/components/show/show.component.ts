import { ReturnStatement } from '@angular/compiler';
import { Component } from '@angular/core';
import _ from 'lodash';
import { AdminActionComponent } from '../admin-action.component';

@Component({
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent extends AdminActionComponent  {

  get fields() { return this.config.show.fields }


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
