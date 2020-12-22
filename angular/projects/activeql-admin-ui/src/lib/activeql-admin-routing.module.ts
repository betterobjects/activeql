import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './components/index/index.component';
import { AdminDataResolver } from './services/admin-data.resolver';
import { ShowComponent } from './components/show/show.component';
import { CreateComponent } from './components/create/create.component';
import { EditComponent } from './components/edit/edit.component';
// import { HomeComponent } from './components/home/home.component';
// import { ErrorComponent } from './components/error.component';

const routes:Routes = [
  { path: 'admin', children: [
    // { path: 'home', component: HomeComponent },
    { path: 'error', redirectTo: '/'  },
    { path: ':path', component: IndexComponent , resolve: { data: AdminDataResolver }, runGuardsAndResolvers: 'always' },
    { path: ':path/show/:id', component: ShowComponent, resolve: { data: AdminDataResolver } },
    { path: ':path/new', component: CreateComponent, resolve: { data: AdminDataResolver } },
    { path: ':path/edit/:id', component: EditComponent, resolve: { data: AdminDataResolver } },
    { path: ':parent/:parentId', children: [
      { path: ':path', component: IndexComponent, resolve: { data: AdminDataResolver }, runGuardsAndResolvers: 'always' },
      { path: ':path/show/:id', component: ShowComponent, resolve: { data: AdminDataResolver } },
      { path: ':path/new', component: CreateComponent, resolve: { data: AdminDataResolver } },
      { path: ':path/edit/:id', component: EditComponent, resolve: { data: AdminDataResolver } }
    ]}
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes )],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
