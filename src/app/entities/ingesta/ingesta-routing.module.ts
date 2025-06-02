import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IngestProcessBrowserPageComponent } from './ingest-process/ingest-process-browser-page/ingest-process-browser-page.component';
import { IngestFactoryPageComponent } from './ingest-factory/ingest-factory-page/ingest-factory-page.component';


const routes: Routes = [{
  path: '',
  component: IngestProcessBrowserPageComponent
},
{
  path: 'proceso-ingesta',
  component: IngestFactoryPageComponent
},
{
  path: 'proceso-ingesta/:id',
  component: IngestFactoryPageComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IngestaRoutingModule { }
