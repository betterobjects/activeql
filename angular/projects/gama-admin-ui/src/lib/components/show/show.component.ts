import { Component } from '@angular/core';
import * as _ from 'lodash';
import { AdminEntityComponent } from '../../components/admin-entity.component';
import { AssocTableConfigType, FieldConfigType } from '../../lib/admin-config';

@Component({
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent extends AdminEntityComponent {

  get fields():FieldConfigType[] { return this.data.entityConfig.show.fields as FieldConfigType[] }
  get detailTables() { return this.data.entityConfig.show.table }

  tableItems( table:AssocTableConfigType ):any[]{
    const query = _.get( this.data.entityConfig.assocs, [table.path, 'query']);
    return _.get( this.data.item, query );
  }

  onChildNew( table:AssocTableConfigType ){
    this.router.navigate( ['/admin', this.data.path, this.data.id, table.path, 'new' ] );
  }

  onAttributeClick( event:any ):void {
    const url = _.get( event, 'srcElement.currentSrc' );
    if( url ) window.open( url, '_blank' );
  }
}
