import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UcoRoutingModule } from './uco-routing.module';
import { UcoFactoryPageComponent } from './uco-factory/uco-factory-page/uco-factory-page.component';
import { UcoFactoryEditComponent } from './uco-factory/uco-factory-edit/uco-factory-edit.component';
import { UcoFactoryViewComponent } from './uco-factory/uco-factory-view/uco-factory-view.component';
import { UcoAltaRapidaModalComponent } from './uco-factory/uco-alta-rapida-modal/uco-alta-rapida-modal.component';
import { UcoBrowsePageComponent } from './uco-browse/uco-browse-page/uco-browse-page.component';
import { UcoBrowseTableComponent } from './uco-browse/uco-browse-table/uco-browse-table.component';
import { UcoBrowseComponent } from './uco-browse/uco-browse/uco-browse.component';
import { DevelarCommonsModule } from '../../develar-commons/develar-commons.module';
import { ReactiveFormsModule } from '@angular/forms';
import { UcoBrowseModalComponent } from './uco-browse/uco-browse-modal/uco-browse-modal.component';


@NgModule({
  declarations: [UcoFactoryPageComponent, UcoFactoryEditComponent, UcoFactoryViewComponent, UcoAltaRapidaModalComponent, UcoBrowsePageComponent, UcoBrowseTableComponent, UcoBrowseComponent, UcoBrowseModalComponent],
  imports: [
    CommonModule,
    DevelarCommonsModule,
    ReactiveFormsModule,
    UcoRoutingModule
  ]
})
export class UcoModule { }
