import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TechMachineFactoryPageComponent } from './factory/tech-machine-factory-page/tech-machine-factory-page.component';
import { TechMachineFactoryViewComponent } from './factory/tech-machine-factory-view/tech-machine-factory-view.component';
import { TechMachineBrowsePageComponent } from './tech-machine-browse-page/tech-machine-browse-page.component';


const routes: Routes = [{
  path:'factory',
  component: TechMachineFactoryPageComponent
},
{
  path:'factory/:id',
  component : TechMachineFactoryPageComponent
},
{
  path:'view/:id',
  component : TechMachineFactoryViewComponent
},
{
  path:'',
  component: TechMachineBrowsePageComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TechMachineRoutingModule { }
