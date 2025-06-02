import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DevelarCommonsModule } from '../../develar-commons/develar-commons.module';
import { DevelarMaterialModule } from '../../develar-commons/develar-materials.module';
import { ReactiveFormsModule } from '@angular/forms';

import { MigranteRoutingModule } from './migrante-routing.module';
import { MigrantePageComponent } from './migrante-page/migrante-page.component';
import { MigranteBrowseComponent } from './migrante-browse/migrante-browse.component';
import { MigranteTableComponent } from './migrante-table/migrante-table.component';
import { SolicitudesAntecedentesModalComponent } from './zmodals/solicitudes-antecedentes-modal/solicitudes-antecedentes-modal.component';
import { SyncAnaliticosLibrosComponent } from './sync-analiticos-libros/sync-analiticos-libros.component';


@NgModule({
  declarations: [
    MigrantePageComponent, 
    MigranteBrowseComponent, 
    MigranteTableComponent, SolicitudesAntecedentesModalComponent, SyncAnaliticosLibrosComponent],
  imports: [
    CommonModule,
    DevelarCommonsModule,
    DevelarMaterialModule,
    ReactiveFormsModule,
    MigranteRoutingModule
  ]
})
export class MigranteModule { }
