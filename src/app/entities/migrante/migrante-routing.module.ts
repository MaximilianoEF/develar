import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MigrantePageComponent } from './migrante-page/migrante-page.component';
import { SyncAnaliticosLibrosComponent } from './sync-analiticos-libros/sync-analiticos-libros.component';


const routes: Routes = [
  {
    path: 'sincronizacion',
    component: SyncAnaliticosLibrosComponent
  },
  {
    path: '',
    component: MigrantePageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MigranteRoutingModule { }
