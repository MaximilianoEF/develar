import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VidaQueryPageComponent } from './vida-query/vida-query-page.component';
import { VidaQueryDetailedViewComponent } from './vida-query/vida-query-detailed-view/vida-query-detailed-view.component';
import { TurnosBrowseComponent } from './turnos/turnos-browse/turnos-browse.component';
import { TurnosEditComponent } from './turnos/turnos-edit/turnos-edit.component';
import { ConsultasEditComponent } from './consultas/consultas-edit/consultas-edit.component';
import { DashboardMainComponent } from './dashboard/dashboard-main/dashboard-main.component';
import { PersonasPageComponent } from './personas/personas-page/personas-page.component';
import { VidaQueryHistoryPageComponent } from './vida-query/vida-query-history/vida-query-history-page/vida-query-history-page.component';
import { AdminScriptsComponent } from './zadmin/admin-scripts/admin-scripts.component';
import { TesauroPageComponent } from './vida-query/tesauro/tesauro-page/tesauro-page.component';
import { MustBeLoggedInGuard } from '../develar-commons/guards/mustbeloggedin-guard';
import { MustBeAuthenticatedGuard } from '../develar-commons/guards/mustbeauthenticated-guard';
import { DocumentacionPageComponent } from './documentacion/documentacion-page/documentacion-page.component';
import { DashboardUserPageComponent } from './dashboard/dashboard-user-page/dashboard-user-page.component';
import { ConsultasPanelComponent } from './consultas/consultas-panel/consultas-panel.component';
import { TurnosPanelComponent } from './turnos/turnos-panel/turnos-panel.component';
import { TurnosCreateComponent } from './turnos/turnos-create/turnos-create.component';
import { RegistroUserWebComponent } from '../entities/userweb/registro-user/registro-user.component';
import { UnidadDescripcionAtomViewComponent } from '../entities/unidad-descripcion/unidad-descripcion-atom-view/unidad-descripcion-atom-view.component';

const routes: Routes = [
  {
    path: 'fichatecnica',
    pathMatch: 'full',
    // canActivate: [MustBeAuthenticatedGuard],
    data: { modo: 'buscador-multimedia' },
    component: VidaQueryPageComponent,
  },
  {
    path: 'tesauro',
    pathMatch: 'full',
    component: TesauroPageComponent,
  },
  {
    path: 'historial',
    pathMatch: 'full',
    canActivate: [MustBeLoggedInGuard],
    component: VidaQueryHistoryPageComponent,
  },
  {
    path: 'fichatecnica/:id',
    component: VidaQueryDetailedViewComponent,
    canActivate: [MustBeAuthenticatedGuard],
  },
  {
    path: 'fichatecnica/vista-detallada/:id',
    component: UnidadDescripcionAtomViewComponent,
    canActivate: [MustBeAuthenticatedGuard],
  },
  {
    path: 'adminscripts',
    pathMatch: 'full',
    component: AdminScriptsComponent,
  },
  {
    path: 'usuario/dashboard',
    canActivate: [MustBeLoggedInGuard],
    component: DashboardUserPageComponent,
    children: [
      {
        path: 'antecedentesmigratorios',
        loadChildren: () => import('../entities/migrante/migrante.module').then(m => m.MigranteModule)
      },
      {
        path: 'turnospresenciales',
        component: TurnosPanelComponent,
      },
      {
        path: 'turnospresenciales/alta',
        component: TurnosCreateComponent,
      },
      {
        path: 'turnospresenciales/vigentes',
        component: TurnosBrowseComponent,
      },
      {
        path: 'turnospresenciales/editar/:id',
        component: TurnosEditComponent,
      },
      {
        path: 'consultas',
        component: ConsultasPanelComponent,
        data: { modo: 'consulta' },
      },
      {
        path: 'historialbusquedas',
        component: VidaQueryHistoryPageComponent,
      },
      {
        path: 'consultas/alta',
        component: ConsultasEditComponent,
        data: { modo: 'consulta' },
      },
      {
        path: 'consultas/editar/:id',
        component: ConsultasEditComponent,
        data: { modo: 'consulta' },
      },

      {
        path: 'servicios',
        component: ConsultasPanelComponent,
        data: { modo: 'servicio' },
      },
      {
        path: 'servicios/alta',
        component: ConsultasEditComponent,
        data: { modo: 'servicio' },
      },
      {
        path: 'servicios/editar/:id',
        component: ConsultasEditComponent,
        data: { modo: 'servicio' },
      },

      {
        path: 'datos/:id',
        component: RegistroUserWebComponent,
      },
      {
        path: 'personas/:id',
        component: PersonasPageComponent,
      },
      {
        path: 'documentacion',
        component: DocumentacionPageComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        component: DashboardMainComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgnRoutingModule {}
