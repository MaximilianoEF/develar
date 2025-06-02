import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TechMachineRoutingModule } from './tech-machine-routing.module';
import { TechMachineFactoryPageComponent } from './factory/tech-machine-factory-page/tech-machine-factory-page.component';
import { DevelarCommonsModule } from '../../develar-commons/develar-commons.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TechMachineFactoryEditComponent } from './factory/tech-machine-factory-edit/tech-machine-factory-edit.component';
import { TechMachineFactoryViewComponent } from './factory/tech-machine-factory-view/tech-machine-factory-view.component';
import { TechMachineBrowsePageComponent } from './tech-machine-browse-page/tech-machine-browse-page.component';
import { TechMachineBrowseComponent } from './tech-machine-browse/tech-machine-browse.component';
import { TechMachineBrowseTableComponent } from './tech-machine-browse-table/tech-machine-browse-table.component';
import { TmAltaRapidaModalComponent } from './factory/tm-alta-rapida-modal/tm-alta-rapida-modal.component';


@NgModule({
  declarations: [TechMachineFactoryPageComponent, TechMachineFactoryEditComponent, TechMachineFactoryViewComponent, TechMachineBrowsePageComponent, TechMachineBrowseComponent, TechMachineBrowseTableComponent, TmAltaRapidaModalComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TechMachineRoutingModule,
    DevelarCommonsModule
  ]
})
export class TechMachineModule { }
