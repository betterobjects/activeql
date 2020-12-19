import { CdkPortal, DomPortalOutlet } from "@angular/cdk/portal";
import { ApplicationRef, Component, ComponentFactoryResolver, Injector, Input, ViewChild } from "@angular/core";

@Component({
  selector: 'admin-dyn-content',
  template: `
    <ng-container *cdkPortal>
      <ng-content> </ng-content>
    </ng-container>
  `,
})
export class DynamicContentComponent {

  @Input() selector:string;
  @ViewChild(CdkPortal) portal:CdkPortal;
  private outlet:DomPortalOutlet;

  constructor(
      private componentFactoryResolver:ComponentFactoryResolver,
      private applicationRef:ApplicationRef,
      private injector:Injector
  ) {
  }

  ngAfterViewInit():void {
    this.outlet = new DomPortalOutlet(
        document.querySelector(this.selector),
        this.componentFactoryResolver,
        this.applicationRef,
        this.injector
    );

    if( this.outlet.outletElement ) this.outlet.attach(this.portal);
  }

  ngOnDestroy():void {
    if( this.outlet ) this.outlet.detach();
  }

}
