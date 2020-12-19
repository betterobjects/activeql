import { PortalModule } from '@angular/cdk/portal';
import { CommonModule, registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import en from '@angular/common/locales/en';
import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AdminRoutingModule as ActiveQLAdminRoutingModule } from './activeql-admin-routing.module';
import { BreadcrumComponent } from './components/breadcumb.component';
import { DynamicContentComponent } from './components/dynamic-content.component';
// import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
// import { CreateComponent } from './components/create/create.component';

// import { EditComponent } from './components/edit/edit.component';
// import { ErrorComponent } from './components/error.component';
// import { FileUploadComponent } from './components/file-upload.component';
// import { FormComponent } from './components/form/form.component';
// import { HomeComponent } from './components/home/home.component';
import { IndexComponent } from './components/index/index.component';
// import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';
// import { ShowComponent } from './components/show/show.component';
import { TableComponent } from './components/table/table.component';

import { AdminConfigService } from './lib/admin-config.service';
// import { SafePipe } from './pipes/safe.pipe';
// import { AdminDataResolver } from './services/admin-data.resolver';
import { AdminService } from './services/admin.service';

registerLocaleData(en);

// @dynamic
export function initializeApp1(adminService:AdminService) {
  return () => adminService.init( async ():Promise<any> => ActiveQLAdminUIModule.adminConfig );
}

// @dynamic
@NgModule({
  declarations: [
    IndexComponent,
    TableComponent,
    BreadcrumComponent,
    DynamicContentComponent,
    // ShowComponent,
    // EditComponent,
    // CreateComponent,
    // FileUploadComponent,
    // FormComponent,
    // ConfirmDialogComponent,
    // MessageDialogComponent,
    // ErrorComponent,
    // HomeComponent,
    // SafePipe
  ],
  imports: [
    ActiveQLAdminRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    PortalModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    FlexLayoutModule
  ],
  exports: [
    IndexComponent,
    // HomeComponent,
    // ShowComponent,
    // EditComponent,
    // CreateComponent,
    TableComponent,
    // ErrorComponent
  ],
  providers: [
    AdminService,
    AdminConfigService,
    // AdminDataResolver,
    { provide: APP_INITIALIZER ,useFactory: initializeApp1, deps: [AdminService], multi: true },
  ]
})
export class ActiveQLAdminUIModule {

  static adminConfig:any;

  public static forRoot(adminConfig:any): ModuleWithProviders<ActiveQLAdminUIModule> {
    return {
      ngModule: ActiveQLAdminUIModule,
      providers: (() => {
        ActiveQLAdminUIModule.adminConfig = adminConfig;
        return [{
          provide: 'adminConfig',
          useValue: adminConfig
        }];
      })()
    }
  }

}

