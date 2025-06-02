import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UcoBrowsePageComponent } from './uco-browse/uco-browse-page/uco-browse-page.component';
import { UcoFactoryPageComponent } from './uco-factory/uco-factory-page/uco-factory-page.component';
import { UcoFactoryViewComponent } from './uco-factory/uco-factory-view/uco-factory-view.component';


const routes: Routes = [
{
  path: 'factory',
  component : UcoFactoryPageComponent
},
{
  path : 'factory/:id',
  component : UcoFactoryPageComponent
},
{
  path : 'view/:id',
  component : UcoFactoryViewComponent
},
{
  path: '',
  component : UcoBrowsePageComponent
},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UcoRoutingModule { }
