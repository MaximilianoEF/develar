import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccessionRecordsPageComponent } from './accession-records-page/accession-records-page.component';
import { AccessionRecordsMasterPanelComponent } from './factory/accession-records-master-panel/accession-records-master-panel.component';


const routes: Routes = [
  {
    path: 'factory/:id',
    component: AccessionRecordsMasterPanelComponent
  },
  {
    path: 'factory',
    component: AccessionRecordsMasterPanelComponent
  },
  {
    path: '',
    data: { modo: 'browser' },
    component: AccessionRecordsPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccessionRecordsRoutingModule { }
