import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthorityRecordPageComponent } from './authority-record-page/authority-record-page.component';
import { AuthorityRecordCreateComponent } from './authority-record-create/authority-record-create.component';
import { AuthorityRecordEditComponent } from './authority-record-edit/authority-record-edit.component';

const routes: Routes = [
  {
    path: 'factory/:id',
    component: AuthorityRecordEditComponent
  },
  {
    path: 'factory',
    component: AuthorityRecordCreateComponent
  },
  {
    path: '',
    component: AuthorityRecordPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthorityRecordRoutingModule { }
