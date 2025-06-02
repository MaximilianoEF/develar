import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DevelarCommonsModule } from '../../develar-commons/develar-commons.module';

import { SlotTurnoRoutingModule } from './slot-turno-routing.module';
import { SlotTurnoPageComponent } from './slot-turno-page/slot-turno-page.component';
import { SlotTurnoFactoryComponent } from './slot-turno-factory/slot-turno-factory.component';
import { SlotTurnoBrowseComponent } from './slot-turno-browse/slot-turno-browse.component';
import { SlotTurnoBrowseTableComponent } from './slot-turno-browse-table/slot-turno-browse-table.component';
import { QuickCreateComponent } from './zmodals/quick-create/quick-create.component';
import { ConfirmationModalComponent } from './zmodals/confirmation-modal/confirmation-modal.component';
import { SlotTurnoEditComponent } from './slot-turno-edit/slot-turno-edit.component';

@NgModule({
  declarations: [
    SlotTurnoPageComponent,
    SlotTurnoFactoryComponent,
    SlotTurnoBrowseComponent,
    SlotTurnoBrowseTableComponent,
    SlotTurnoEditComponent,
    QuickCreateComponent,
    ConfirmationModalComponent
  ],
  imports: [
    CommonModule,
    SlotTurnoRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DevelarCommonsModule,
  ],
})
export class SlotTurnoModule {}
