import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { AuthorityRecord } from './authority-record.model';
import { RelatedArchivalDescriptionComponent } from './modals/related-archival-description/related-archival-description.component';
import { RelatedAuthorityRecordComponent } from './modals/related-authority-record/related-authority-record.component';
import { QuickCreationComponent } from './modals/quick-creation/quick-creation.component';
import { AuthorityRecordService } from './authority-record.service';

@Injectable()
export class AuthorityRecordModalService {
  private dialogResult$ = new Subject<AuthorityRecord>();

  constructor(
    private authorityRecordService: AuthorityRecordService,
    private dialogService: MatDialog
  ) {
  }

  public setupRelatedAuthorityModal(): Subject<AuthorityRecord> {
    this.dialogResult$ = new Subject<AuthorityRecord>();
    this.openRelatedAuthorityModal();
    return this.dialogResult$;
  }

  public setupRelatedArchivalDescriptionmodal(): Subject<AuthorityRecord> {
    this.dialogResult$ = new Subject<AuthorityRecord>();
    this.openRelatedArchivalDescriptionModal();
    return this.dialogResult$;
  }

  public setupAuthorityRecordQuickCreation(): Subject<AuthorityRecord> {
    this.dialogResult$ = new Subject<AuthorityRecord>();
    this.openAuthorityRecordQuickCreationModal();
    return this.dialogResult$;
  }

  public openRelatedAuthorityModal(): void {
    const dialogRef = this.dialogService.open(RelatedAuthorityRecordComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dialogResult$.next(result);
      }
    });
  }

  public openRelatedArchivalDescriptionModal(): void {
    const dialogRef = this.dialogService.open(RelatedArchivalDescriptionComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dialogResult$.next(result);
      }
    });
  }

  public openAuthorityRecordQuickCreationModal(): void {
    const dialogRef = this.dialogService.open(QuickCreationComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authorityRecordService.create(result)
          .then(created => this.dialogResult$.next(created)
          );
      }
    });
  }
}
