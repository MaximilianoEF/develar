import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { UnidadDescripcionRoutingModule } from "./unidad-descripcion-routing.module";
import { UnidadDescripcionPageComponent } from "./unidad-descripcion-factory/unidad-descripcion-page/unidad-descripcion-page.component";
import { DevelarCommonsModule } from "../../develar-commons/develar-commons.module";
import { UnidadDescripcionAncestorBrowserComponent } from "./unidad-descripcion-factory/unidad-descripcion-ancestor-browser/unidad-descripcion-ancestor-browser.component";
import { UnidadDescripcionActionsComponent } from "./unidad-descripcion-factory/unidad-descripcion-actions/unidad-descripcion-actions.component";
import { UnidadDescripcionTextAreaComponent } from "./unidad-descripcion-factory/unidad-descripcion-text-area/unidad-descripcion-text-area.component";
import { UnidadDescripcionHeaderComponent } from "./unidad-descripcion-factory/unidad-descripcion-header/unidad-descripcion-header.component";
import { UnidadDescripcionInputAreaComponent } from "./unidad-descripcion-factory/unidad-descripcion-input-area/unidad-descripcion-input-area.component";
import { FormIdentificadorComponent } from "./unidad-descripcion-factory/mini-form/form-identificador/form-identificador.component";
import { FormContextComponent } from "./unidad-descripcion-factory/mini-form/form-context/form-context.component";
import { UnidadDescripcionComponent } from "./unidad-descripcion/unidad-descripcion.component";
import { UnidadDescripcionBrowseComponent } from "./unidad-descripcion-browse/unidad-descripcion-browse.component";
import { UnidadDescripcionBrowseTableComponent } from "./unidad-descripcion-browse-table/unidad-descripcion-browse-table.component";
import { UnidadDescripcionAltaRapidaComponent } from "./unidad-descripcion-factory/unidad-descripcion-alta-rapida/unidad-descripcion-alta-rapida.component";
import { FormContenidoComponent } from "./unidad-descripcion-factory/mini-form/form-contenido/form-contenido.component";
import { FormDocComponent } from "./unidad-descripcion-factory/mini-form/form-doc/form-doc.component";
import { FormCondicionesComponent } from "./unidad-descripcion-factory/mini-form/form-condiciones/form-condiciones.component";
import { FormNotasComponent } from "./unidad-descripcion-factory/mini-form/form-notas/form-notas.component";
import { UnidadDescripcionHistoryComponent } from "./unidad-descripcion-history/unidad-descripcion-history.component";
import { HistoriesModalComponent } from './unidad-descripcion-history/histories-modal/histories-modal.component';
import { UnidadDescripcionDetailedViewPageComponent } from './unidad-descripcion-detailed-view/unidad-descripcion-detailed-view-page/unidad-descripcion-detailed-view-page.component';
import { ViewIdentificacionComponent } from './unidad-descripcion-detailed-view/view-areas/view-identificacion/view-identificacion.component';
import { ViewControlDescripcionComponent } from './unidad-descripcion-detailed-view/view-areas/view-control-descripcion/view-control-descripcion.component';
import { UnidadDescripcionJerarquiaComponent } from './unidad-descripcion-jerarquia/unidad-descripcion-jerarquia.component';
import { ViewContenidoEstructuraComponent } from './unidad-descripcion-detailed-view/view-areas/view-contenido-estructura/view-contenido-estructura.component';
import { ViewCondicionesAccesoUsoComponent } from './unidad-descripcion-detailed-view/view-areas/view-condiciones-acceso-uso/view-condiciones-acceso-uso.component';
import { ViewDocumentacionAsociadaComponent } from './unidad-descripcion-detailed-view/view-areas/view-documentacion-asociada/view-documentacion-asociada.component';
import { ViewNotasComponent } from './unidad-descripcion-detailed-view/view-areas/view-notas/view-notas.component';
import { ViewContextoComponent } from './unidad-descripcion-detailed-view/view-areas/view-contexto/view-contexto.component';
import { SyncUDAfromAtomComponent } from './sync-udafrom-atom/sync-udafrom-atom.component';
import { SyncAtomPageComponent } from './sync-atom-page/sync-atom-page.component';
import { ViewContentUdComponent } from './unidad-descripcion-detailed-view/view-areas/view-content-ud/view-content-ud.component';
import { BuildStringifyComponent } from './build-stringify/build-stringify.component';
import { UnidadDescripcionCardViewComponent } from './unidad-descripcion-card-view/unidad-descripcion-card-view.component';
import { UnidadDescripcionAtomViewComponent } from './unidad-descripcion-atom-view/unidad-descripcion-atom-view.component';
import { UnidadDescripcionChildrenTreeComponent } from './unidad-descripcion-children-tree/unidad-descripcion-children-tree.component';
import { ApareoUdPageComponent } from './apareo/apareo-ud-page/apareo-ud-page.component';
import { ApareoUdBrowseComponent } from './apareo/apareo-ud-browse/apareo-ud-browse.component';
import { ListSelectedUdModalComponent } from './apareo/list-selected-ud-modal/list-selected-ud-modal.component';
import { ApareoUdTableComponent } from './apareo/apareo-ud-table/apareo-ud-table.component';
import { ActionUDAModalComponent } from './zmodals/action-udamodal/action-udamodal.component';
import { ControlDescripcionComponent } from './unidad-descripcion-factory/mini-form/control-descripcion/control-descripcion.component';
import { PuntosAccesoComponent } from './unidad-descripcion-factory/mini-form/puntos-acceso/puntos-acceso.component';
import { UdaMinieditorComponent } from './zmodals/uda-minieditor/uda-minieditor.component';
import { ExportarUdasModalComponent } from './zmodals/exportar-udas-modal/exportar-udas-modal.component';
import { UdaMigracionAtomModalComponent } from './zmodals/uda-migracion-atom-modal/uda-migracion-atom-modal.component';

@NgModule({
  declarations: [
    UnidadDescripcionPageComponent,
    UnidadDescripcionAncestorBrowserComponent,
    UnidadDescripcionActionsComponent,
    UnidadDescripcionTextAreaComponent,
    UnidadDescripcionHeaderComponent,
    UnidadDescripcionInputAreaComponent,
    FormIdentificadorComponent,
    FormDocComponent,
    FormContextComponent,
    FormContenidoComponent,
    FormCondicionesComponent,
    UnidadDescripcionComponent,
    UnidadDescripcionBrowseComponent,
    UnidadDescripcionBrowseTableComponent,
    UnidadDescripcionAltaRapidaComponent,
    FormNotasComponent,
    UnidadDescripcionHistoryComponent,
    HistoriesModalComponent,
    UnidadDescripcionDetailedViewPageComponent,
    ViewIdentificacionComponent,
    ViewControlDescripcionComponent,
    UnidadDescripcionJerarquiaComponent,
    ViewContenidoEstructuraComponent,
    ViewCondicionesAccesoUsoComponent,
    ViewDocumentacionAsociadaComponent,
    ViewNotasComponent,
    ViewContextoComponent,
    SyncUDAfromAtomComponent,
    SyncAtomPageComponent,
    ViewContentUdComponent,
    BuildStringifyComponent,
    UnidadDescripcionCardViewComponent,
    UnidadDescripcionAtomViewComponent,
    UnidadDescripcionChildrenTreeComponent,
    ApareoUdPageComponent,
    ApareoUdBrowseComponent,
    ListSelectedUdModalComponent,
    ApareoUdTableComponent,
    ActionUDAModalComponent,
    ControlDescripcionComponent,
    PuntosAccesoComponent,
    UdaMinieditorComponent,
    ExportarUdasModalComponent,
    UdaMigracionAtomModalComponent
  ],
  imports: [
    CommonModule,
    UnidadDescripcionRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    DevelarCommonsModule,
  ],
  exports: [
    UnidadDescripcionBrowseTableComponent,
    UnidadDescripcionCardViewComponent
  ]
})
export class UnidadDescripcionModule {}
