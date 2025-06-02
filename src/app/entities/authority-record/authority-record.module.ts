import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DevelarCommonsModule } from '../../develar-commons/develar-commons.module';
import { AuthorityRecordRoutingModule } from './authority-record-routing.module';
import { AuthorityRecordPageComponent } from './authority-record-page/authority-record-page.component';
import { AuthorityRecordBrowseComponent } from './authority-record-browse/authority-record-browse.component';
import { AuthorityRecordBrowseTableComponent } from './authority-record-browse-table/authority-record-browse-table.component';
import { AuthorityRecordCreateComponent } from './authority-record-create/authority-record-create.component';
import { AuthorityRecordEditComponent } from './authority-record-edit/authority-record-edit.component';
import { RelatedAuthorityRecordComponent } from './modals/related-authority-record/related-authority-record.component';
import { RelatedArchivalDescriptionComponent } from './modals/related-archival-description/related-archival-description.component';
import { QuickCreationComponent } from './modals/quick-creation/quick-creation.component';


@NgModule({
  declarations: [AuthorityRecordPageComponent, AuthorityRecordBrowseComponent, AuthorityRecordBrowseTableComponent, AuthorityRecordCreateComponent, AuthorityRecordEditComponent, RelatedAuthorityRecordComponent, RelatedArchivalDescriptionComponent, QuickCreationComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DevelarCommonsModule,
    AuthorityRecordRoutingModule
  ]
})
export class AuthorityRecordModule { }
