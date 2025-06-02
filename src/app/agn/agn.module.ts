import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DevelarCommonsModule } from '../develar-commons/develar-commons.module';
import { PersonModule } from '../entities/person/person.module';

import { VidaQueryService } from './vida-query/vida-query.service';
import { ConsultasService } from './consultas/consulta.service';

import { AgnRoutingModule } from './agn-routing.module';

import { AgnComponent } from './agn.component';
import { AdminScriptsComponent } from './zadmin/admin-scripts/admin-scripts.component';

import { DashboardMainComponent } from './dashboard/dashboard-main/dashboard-main.component';
import { UserDatosDashboardComponent } from './user-datos/user-datos-dashboard/user-datos-dashboard.component';
import { ServiciosDashboardComponent } from './servicios/servicios-dashboard/servicios-dashboard.component';
import { DashboardUserPageComponent } from './dashboard/dashboard-user-page/dashboard-user-page.component';

import { VidaQueryPageComponent } from './vida-query/vida-query-page.component';
import { VidaQueryBrowseComponent } from './vida-query/vida-query-browse/vida-query-browse.component';
import { VidaQueryListComponent } from './vida-query/vida-query-list/vida-query-list.component';
import { VidaQueryViewComponent } from './vida-query/vida-query-view/vida-query-view.component';
import { VidaQueryModalComponent } from './vida-query/vida-query-modal/vida-query-modal.component';
import { VidaQueryDetailedViewComponent } from './vida-query/vida-query-detailed-view/vida-query-detailed-view.component';
import { VidaQueryHistoryPageComponent } from './vida-query/vida-query-history/vida-query-history-page/vida-query-history-page.component';
import { VidaQueryHistoryBrowseComponent } from './vida-query/vida-query-history/vida-query-history-browse/vida-query-history-browse.component';
import { VidaQueryHistoryTableComponent } from './vida-query/vida-query-history/vida-query-history-table/vida-query-history-table.component';

import { TurnosDashboardComponent } from './turnos/turnos-dashboard/turnos-dashboard.component';
import { TurnosBrowseComponent } from './turnos/turnos-browse/turnos-browse.component';
import { TurnosBrowseTableComponent } from './turnos/turnos-browse-table/turnos-browse-table.component';
import { TurnosEditComponent } from './turnos/turnos-edit/turnos-edit.component';
import { TurnosEditFormComponent } from './turnos/turnos-edit/turnos-edit-form/turnos-edit-form.component';
import { TurnosDialogConfirmationComponent } from './turnos/turnos-dialog-confirmation/turnos-dialog-confirmation.component';
import { TurnosDialogConsultaComponent } from './turnos/turnos-dialog-consulta/turnos-dialog-consulta.component';
import { TurnosPanelComponent } from './turnos/turnos-panel/turnos-panel.component';
import { TurnosMainComponent } from './turnos/turnos-main/turnos-main.component';
import { TurnosCreateComponent } from './turnos/turnos-create/turnos-create.component';
import { TurnosEditModalComponent } from './turnos/turnos-edit-modal/turnos-edit-modal.component';

import { ConsultasBrowseComponent } from './consultas/consultas-browse/consultas-browse.component';
import { ConsultasTableComponent } from './consultas/consultas-table/consultas-table.component';
import { ConsultasDashboardComponent } from './consultas/consultas-dashboard/consultas-dashboard.component';
import { ConsultasEditComponent } from './consultas/consultas-edit/consultas-edit.component';
import { ConsultasPanelComponent } from './consultas/consultas-panel/consultas-panel.component';
import { ConsultasListComponent } from './consultas/consultas-list/consultas-list.component';
import { AddPaseConsultaModalComponent } from './consultas/consultas-xcomponents/add-pase-consulta-modal/add-pase-consulta-modal.component';

import { PersonasDatosDashboardComponent } from './personas-datos-dashboard/personas-datos-dashboard.component';
import { PersonasPageComponent } from './personas/personas-page/personas-page.component';
import { PersonasCoreBaseComponent } from './personas/personas-core/personas-core-base/personas-core-base.component';
import { PersonasCoreEditComponent } from './personas/personas-core/personas-core-edit/personas-core-edit.component';
import { PersonasCoreViewComponent } from './personas/personas-core/personas-core-view/personas-core-view.component';
import { PersonasContactdataPanelComponent } from './personas/personas-contactdata/personas-contactdata-panel/personas-contactdata-panel.component';
import { PersonasContactdataBaseComponent } from './personas/personas-contactdata/personas-contactdata-base/personas-contactdata-base.component';
import { PersonasContactdataEditComponent } from './personas/personas-contactdata/personas-contactdata-edit/personas-contactdata-edit.component';
import { PersonasContactdataViewComponent } from './personas/personas-contactdata/personas-contactdata-view/personas-contactdata-view.component';
import { PersonasAddressBaseComponent } from './personas/personas-address/personas-address-base/personas-address-base.component';
import { PersonasAddressEditComponent } from './personas/personas-address/personas-address-edit/personas-address-edit.component';
import { PersonasAddressPanelComponent } from './personas/personas-address/personas-address-panel/personas-address-panel.component';
import { PersonasAddressViewComponent } from './personas/personas-address/personas-address-view/personas-address-view.component';
import { PersonasVinculosPanelComponent } from './personas/personas-vinculos/personas-vinculos-panel/personas-vinculos-panel.component';
import { PersonasVinculosBaseComponent } from './personas/personas-vinculos/personas-vinculos-base/personas-vinculos-base.component';
import { PersonasVinculosEditComponent } from './personas/personas-vinculos/personas-vinculos-edit/personas-vinculos-edit.component';
import { PersonasVinculosViewComponent } from './personas/personas-vinculos/personas-vinculos-view/personas-vinculos-view.component';

import { TesauroPageComponent } from './vida-query/tesauro/tesauro-page/tesauro-page.component';
import { TesauroBrowseComponent } from './vida-query/tesauro/tesauro-browse/tesauro-browse.component';
import { TesauroTagCloudComponent } from './vida-query/tesauro/tesauro-tag-cloud/tesauro-tag-cloud.component';

import { DocumentacionPageComponent } from './documentacion/documentacion-page/documentacion-page.component';
import { DocumentacionDashboardComponent } from './documentacion/documentacion-dashboard/documentacion-dashboard.component';
import { DocumentacionFilesComponent } from './documentacion/documentacion-files/documentacion-files.component';
import { DocumentacionPanelComponent } from './documentacion/documentacion-panel/documentacion-panel.component';
import { DocumentacionCardComponent } from './documentacion/documentacion-card/documentacion-card.component';
import { DocumentacionCardModalComponent } from './documentacion/documentacion-card-modal/documentacion-card-modal.component';
import { UserwebModule } from '../entities/userweb/userweb.module';
import { UnidadDescripcionModule } from '../entities/unidad-descripcion/unidad-descripcion.module';


@NgModule({
    imports: [
      DevelarCommonsModule,
      ReactiveFormsModule,
      AgnRoutingModule,
      CommonModule,
      UserwebModule,
      PersonModule,
      UnidadDescripcionModule
    ],
    declarations : [
      AgnComponent,
      VidaQueryPageComponent,
      VidaQueryBrowseComponent,
      VidaQueryListComponent,
      VidaQueryViewComponent,
      VidaQueryModalComponent,
      VidaQueryDetailedViewComponent,
      TurnosDashboardComponent,
      TurnosBrowseComponent,
      DashboardMainComponent,
      TurnosBrowseTableComponent,
      TurnosEditComponent,
      UserDatosDashboardComponent,
      ConsultasBrowseComponent,
      ConsultasTableComponent,
      ConsultasDashboardComponent,
      ConsultasEditComponent,
      TurnosEditFormComponent,
      TurnosDialogConfirmationComponent,
      PersonasDatosDashboardComponent,
      PersonasPageComponent,
      PersonasCoreBaseComponent,
      PersonasCoreEditComponent,
      PersonasCoreViewComponent,
      PersonasContactdataPanelComponent,
      PersonasContactdataBaseComponent,
      PersonasContactdataEditComponent,
      PersonasContactdataViewComponent,
      PersonasAddressBaseComponent,
      PersonasAddressEditComponent,
      PersonasAddressPanelComponent,
      PersonasAddressViewComponent,
      PersonasVinculosPanelComponent,
      PersonasVinculosBaseComponent,
      PersonasVinculosEditComponent,
      PersonasVinculosViewComponent,
      VidaQueryHistoryPageComponent,
      VidaQueryHistoryBrowseComponent,
      VidaQueryHistoryTableComponent,
      TurnosDialogConsultaComponent,
      TesauroPageComponent,
      TesauroBrowseComponent,
      TesauroTagCloudComponent,
      AdminScriptsComponent,
      DocumentacionPageComponent,
      DocumentacionDashboardComponent,
      DocumentacionFilesComponent,
      DocumentacionPanelComponent,
      DocumentacionCardComponent,
      DocumentacionCardModalComponent,
      ServiciosDashboardComponent,
      DashboardUserPageComponent,
      ConsultasPanelComponent,
      ConsultasListComponent,
      TurnosPanelComponent,
      TurnosMainComponent,
      TurnosCreateComponent,
      TurnosEditModalComponent,
      AddPaseConsultaModalComponent
    ],
    exports: [
      // VidaQueryPageComponent,
      // VidaQueryPageComponent,
      // VidaQueryBrowseComponent,
      // VidaQueryListComponent,
      // VidaQueryViewComponent,
      // VidaQueryModalComponent,
      // VidaQueryDetailedViewComponent
    ],
    entryComponents: [],
    providers: [VidaQueryService, ConsultasService]
  })
  export class AgnModule { }
