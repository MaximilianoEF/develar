import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IngestaRoutingModule } from './ingesta-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DevelarCommonsModule } from '../../develar-commons/develar-commons.module';

import { IngestFactoryPageComponent } from './ingest-factory/ingest-factory-page/ingest-factory-page.component';

import { IngestMasterPanelComponent } from './ingest-factory/ingest-master-panel/ingest-master-panel.component';
import { UdaSelectModalComponent } from './ingest-factory/zmodals/uda-select-modal/uda-select-modal.component';

import { IngestRootfolderPanelComponent } from './ingest-factory/ingest-rootfolder-panel/ingest-rootfolder-panel.component';
import { IngestRootfolderBaseComponent } from './ingest-factory/ingest-rootfolder-base/ingest-rootfolder-base.component';
import { AssetsTreeComponent } from './ingest-factory/ingest-rootfolder-xcomponents/assets-tree/assets-tree.component';
import { AssetsTableComponent } from './ingest-factory/ingest-rootfolder-xcomponents/assets-table/assets-table.component';

import { IngestTechdataPanelComponent } from './ingest-factory/ingest-techdata-panel/ingest-techdata-panel.component';
import { IngestTechdataBaseComponent } from './ingest-factory/ingest-techdata-base/ingest-techdata-base.component';
import { MachineDataEditComponent } from './ingest-factory/ingest-techdata-xcomponents/machine-data-edit/machine-data-edit.component';

import { RootfolderModalComponent } from './ingest-factory/zmodals/rootfolder-modal/rootfolder-modal.component';
import { AssetsTreeviewModalComponent } from './ingest-factory/zmodals/assets-treeview-modal/assets-treeview-modal.component';

import { IngestUdaPanelComponent } from './ingest-factory/ingest-uda-panel/ingest-uda-panel.component';
import { AltaRapidaIngestProcessModalComponent } from './ingest-process/alta-rapida-ingest-process-modal/alta-rapida-ingest-process-modal.component';
import { IngestUdaBaseComponent } from './ingest-factory/ingest-uda-base/ingest-uda-base.component';
import { IngestProcessBrowserComponent } from './ingest-process/ingest-process-browser/ingest-process-browser.component';
import { IngestProcessBrowserTableComponent } from './ingest-process/ingest-process-browser-table/ingest-process-browser-table.component';
import { IngestProcessBrowserPageComponent } from './ingest-process/ingest-process-browser-page/ingest-process-browser-page.component';
import { AssetsEditModalComponent } from './ingest-factory/ingest-rootfolder-xcomponents/assets-edit-modal/assets-edit-modal.component';
import { UdsFormdataModalComponent } from './ingest-factory/zmodals/uds-formdata-modal/uds-formdata-modal.component';
import { ConfirmationModalComponent } from './ingest-factory/zmodals/confirmation-modal/confirmation-modal.component';
import { UdaTreeComponent } from './ingest-factory/ingest-uda-base-xcomponentes/uda-tree/uda-tree.component';
import { AssetMetadataModalComponent } from './ingest-factory/zmodals/asset-metadata-modal/asset-metadata-modal.component';
import { AprobationModalComponent } from './ingest-factory/zmodals/aprobation-modal/aprobation-modal.component';
import { DerivadaAssetModalComponent} from './derivadas-factory/zmodals/derivada-asset/derivada-asset-modal.component';
import { SlugPiEditComponent } from './ingest-factory/zmodals/slug-pi-edit/slug-pi-edit.component';


@NgModule({
  declarations: [
    IngestFactoryPageComponent,
    IngestUdaPanelComponent,
    UdaSelectModalComponent,
    IngestRootfolderPanelComponent,
    RootfolderModalComponent,
    IngestMasterPanelComponent,
    AltaRapidaIngestProcessModalComponent,
    IngestUdaBaseComponent,
    IngestTechdataPanelComponent,
    IngestProcessBrowserComponent,
    IngestProcessBrowserTableComponent,
    IngestProcessBrowserPageComponent,
    AssetsTreeviewModalComponent,
    IngestTechdataBaseComponent,
    MachineDataEditComponent,
    IngestRootfolderBaseComponent,
    AssetsTreeComponent,
    AssetsTableComponent,
    AssetsEditModalComponent,
    UdsFormdataModalComponent,
    ConfirmationModalComponent,
    UdaTreeComponent,
    AssetMetadataModalComponent,
    AprobationModalComponent,
    DerivadaAssetModalComponent,
    SlugPiEditComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DevelarCommonsModule,
    IngestaRoutingModule
  ]
})
export class IngestaModule { }
