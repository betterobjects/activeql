import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @Input() entity:string;
  @Output() newEntity = new EventEmitter<void>()

  onNewEntity(){ this.newEntity.emit() }
}
