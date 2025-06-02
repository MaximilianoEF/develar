import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DevelarCommonsModule } from '../../develar-commons/develar-commons.module';
import { DevelarMaterialModule } from '../../develar-commons/develar-materials.module';

import { TaxonomiaRoutingModule } from './taxonomia-routing.module';
import { TesauroGDocPageComponent } from './tesauro-gdoc-page/tesauro-gdoc-page.component';
import { TesauroGDocBrowseComponent } from './tesauro-gdoc-browse/tesauro-gdoc-browse.component';
import { TesauroGDocTableComponent } from './tesauro-gdoc-table/tesauro-gdoc-table.component';
import { TesauroGdocEditComponent } from './factory/tesauro-gdoc-edit/tesauro-gdoc-edit.component';
import { TerminoTableComponent } from './factory/termino-table/termino-table.component';
import { TaxonomiaTerminoEditComponent } from './factory/taxonomia-termino-edit/taxonomia-termino-edit.component';
import { AltaRapidaTerminoComponent } from './zmodals/alta-rapida-termino/alta-rapida-termino.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';


@NgModule({
  declarations: [TesauroGDocPageComponent, TesauroGDocBrowseComponent, TesauroGDocTableComponent, TesauroGdocEditComponent, TerminoTableComponent, TaxonomiaTerminoEditComponent, AltaRapidaTerminoComponent, BreadcrumbComponent],
  imports: [
    CommonModule,
    DevelarCommonsModule,
    DevelarMaterialModule,
    ReactiveFormsModule,
    TaxonomiaRoutingModule
  ]
})
export class TaxonomiaModule { }
