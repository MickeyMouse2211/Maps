import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from '../app/map/map.component'
import { MunicipalitiesComponent } from '../app/municipalities/municipalities.component';
import { TableComponent } from './table/table.component';


const routes: Routes = [
  { path: '', redirectTo: 'map', pathMatch: 'full' },
  { path: 'map', component: MapComponent },
  { path: 'table/:munCode/:munName', component: TableComponent },
  { path: 'municipalities/:stateCode', component: MunicipalitiesComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
