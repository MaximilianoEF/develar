import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DevelarCommonsModule } from '../../develar-commons/develar-commons.module';
import { DevelarMaterialModule } from '../../develar-commons/develar-materials.module';
import { AccessionRecordsRoutingModule } from './accession-records-routing.module';

import { AccessionRecordsPageComponent } from './accession-records-page/accession-records-page.component';
import { AccessionRecordsBrowseComponent } from './accession-records-browse/accession-records-browse.component';
import { AccessionRecordsTableComponent } from './accession-records-table/accession-records-table.component';
import { HeaderActionsARComponent } from './factory/header-actions-ar/header-actions-ar.component';
import { MigracionesArEditComponent } from './factory/migraciones-ar-edit/migraciones-ar-edit.component';
import { AccessionRecordsMasterPanelComponent } from './factory/accession-records-master-panel/accession-records-master-panel.component';
import { UdaPanelComponent } from './factory/uda-panel/uda-panel.component';
import { BarcoVaporesArEditComponent } from './factory/barco-vapores-ar-edit/barco-vapores-ar-edit.component';


@NgModule({
  declarations: [
    AccessionRecordsPageComponent,
    AccessionRecordsBrowseComponent, 
    AccessionRecordsTableComponent, 
    HeaderActionsARComponent, 
    MigracionesArEditComponent, 
    AccessionRecordsMasterPanelComponent, UdaPanelComponent, BarcoVaporesArEditComponent,
  ],
  imports: [
    CommonModule,
    AccessionRecordsRoutingModule,
    ReactiveFormsModule,
    DevelarCommonsModule,
    DevelarMaterialModule
  ]
})
export class AccessionRecordsModule { }
