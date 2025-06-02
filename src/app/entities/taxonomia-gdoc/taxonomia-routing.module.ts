import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TesauroGdocEditComponent } from './factory/tesauro-gdoc-edit/tesauro-gdoc-edit.component';
import { TesauroGDocPageComponent } from './tesauro-gdoc-page/tesauro-gdoc-page.component';


const routes: Routes = [
  {
    path: 'factory',
    component: TesauroGdocEditComponent
  },
  {
    path: 'factory/:id',
    component: TesauroGdocEditComponent
  },
  {
    path: '',
    component: TesauroGDocPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaxonomiaRoutingModule { }
