import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import _ from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FieldList, FieldConfig  } from '../../services/admin-config.service';
import { AdminComponent } from '../admin.component';

@Component({
  selector: 'admin-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent extends AdminComponent {
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  @Input() fields:FieldList
  @Output() selectItem = new EventEmitter<any>();
  @Output() actionItem = new EventEmitter<{item:any, action:string}>();
  @Input() set items( items:any[]){ this.setDataSource( items ) }

  dataSource:MatTableDataSource<any> = null;
  searchTerm:string;
  private searchEntered:Subject<string> = new Subject<string>();

  private setDataSource( items:any ){
    if( ! items ) return;
    this.dataSource = new MatTableDataSource(items);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => this.sortValue( item, property );
    this.prepareSearch();
  }

  get columns() { return _.concat( _.map( this.fields, field => field.name ), 'actions' ) }
  get search():boolean { return false /* _.isBoolean( this.config.search ) ? this.config.search : _.size(this.dataSource?.data) > 10 */ }
  get pageSizeOptions() { return [10, 20, 50] }

  get defaultActions() { return /* this.config.defaultActions || */ ['show', 'edit', 'delete'] }
  get actions() { return [] /*_.map(this.config.actions, (action, name) => _.set( action, 'name', name ) ) */ }

  onSearch = ($event:any) => this.searchEntered.next($event);
  onSelect = (id:any) => this.selectItem.emit( id );
  onEdit = (item:any) => this.actionItem.emit({ item, action: 'edit'} );
  onDelete = (item:any) => this.actionItem.emit({ item, action: 'delete'} );

  private getFieldConfig( name:string ){ return _.find( this.fields, field => field.name === name ) }

  private sortValue( item:any, fieldName:string ){
    const field = this.getFieldConfig( fieldName );
    return field ? field.sortValue( item ) : '';
  }

  private prepareSearch(){
    this.searchTerm = undefined;
    // this.dataSource.filterPredicate = (item:any, filter:string ) => {
    //   return _.some( this.fields, field => {
    //     if( _.isFunction( field.search ) ) return field.search( _.get( item, field.name ), filter );
    //     const value = _.toLower( this.value( field, item ) );
    //     return _.includes( value, _.toLower( filter ) );
    //   });
    // }
    // this.searchEntered.pipe( debounceTime(400), distinctUntilChanged() ).
    //   subscribe( () => this.doSearch() );
  }

  private doSearch(){
    this.dataSource.filter = this.searchTerm;
  }

  cancelSearch(){
    this.searchTerm = undefined;
    this.doSearch();
  }

}
