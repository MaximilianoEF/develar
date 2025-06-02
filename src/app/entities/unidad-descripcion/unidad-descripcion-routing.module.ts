import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ApareoUdPageComponent } from './apareo/apareo-ud-page/apareo-ud-page.component';
import { BuildStringifyComponent } from './build-stringify/build-stringify.component';
import { MustHaveSavedChangesTextAreaGuard } from './musthavesavedchangestextarea-guard';
import { SyncAtomPageComponent } from './sync-atom-page/sync-atom-page.component';
import { UnidadDescripcionAtomViewComponent } from './unidad-descripcion-atom-view/unidad-descripcion-atom-view.component';
import { UnidadDescripcionDetailedViewPageComponent } from './unidad-descripcion-detailed-view/unidad-descripcion-detailed-view-page/unidad-descripcion-detailed-view-page.component';
import { UnidadDescripcionPageComponent } from './unidad-descripcion-factory/unidad-descripcion-page/unidad-descripcion-page.component';
import { UnidadDescripcionComponent } from './unidad-descripcion/unidad-descripcion.component';


const routes: Routes = [
  {
    path: 'factory/:id',
    canDeactivate : [MustHaveSavedChangesTextAreaGuard, ],
    component: UnidadDescripcionPageComponent

  },
  {
    path: 'factory',
    canDeactivate :  [MustHaveSavedChangesTextAreaGuard, ],
    component : UnidadDescripcionPageComponent
  },
  {
    path: 'vista-detallada/:id',
    component: UnidadDescripcionAtomViewComponent
  },
  {
    path : 'vista/:id',
    component : UnidadDescripcionDetailedViewPageComponent
  },
  {
    path: 'atom',
    component : SyncAtomPageComponent
  },
  {
    path: 'apareo',
    component: ApareoUdPageComponent
  },
  {
    path: 'stringify',
    component: BuildStringifyComponent
  },
  {
    path: '',
    component: UnidadDescripcionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnidadDescripcionRoutingModule { }
