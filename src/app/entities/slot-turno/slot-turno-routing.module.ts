import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SlotTurnoPageComponent } from './slot-turno-page/slot-turno-page.component';
import { SlotTurnoFactoryComponent } from './slot-turno-factory/slot-turno-factory.component';


const routes: Routes = [
  {
    path: '',
    component: SlotTurnoPageComponent
  },
  {
    path: 'factory/:id',
    component: SlotTurnoFactoryComponent
  },
  {
    path: 'factory',
    component: SlotTurnoFactoryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SlotTurnoRoutingModule { }
