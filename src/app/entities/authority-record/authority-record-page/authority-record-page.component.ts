import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../../develar-commons/shared-service';
import { finalize, take } from 'rxjs/operators';
import { AuthorityRecordQuery } from '../authority-record.model';
import { AuthorityRecordService } from '../authority-record.service';
import { AuthorityRecordModalService } from '../authority-record-modal.service';




@Component({
  selector: 'authority-record-page',
  templateUrl: './authority-record-page.component.html',
  styleUrls: ['./authority-record-page.component.scss'],
  providers: [AuthorityRecordModalService]
})
export class AuthorityRecordPageComponent implements OnInit {
  public pageTitle = 'Gestión de registros de autoridad';
  public showData = false;

  public searching = false;

  constructor(
    private authorityRecordService: AuthorityRecordService,
    private sharedService: SharedService,
    private router: Router,
    private route: ActivatedRoute,
    private modalsService: AuthorityRecordModalService
  ) {
    this.sharedService.emitChange(this.pageTitle);
  }

  ngOnInit(): void {
  }

  public fetchAuthorityRecords(query: AuthorityRecordQuery): void {
    this.searching = true;

    this.authorityRecordService.fetchAuthorityRecordsByQuery(query)
      .pipe(
        take(2),
        finalize(() => this.searching = false)
      )
      .subscribe(items => {
        if (items && items.length > 0) {
          this.authorityRecordService.updateTableData();
          this.showData = true;
        } else {
          this.showData = false;
        }
      });
  }

  /**
   * Abre el modal de alta rápida de registros de autoridad
   *
   * Pre: ninguna
   * Post: ninguna
   *
   */
  public openQuickCreateModal(): void {
    const dialogRef = this.modalsService.setupAuthorityRecordQuickCreation();

    dialogRef.subscribe(result => {
      if (result) {
        this.router.navigate(['factory', result._id], { relativeTo: this.route }).then();
      }
    });
  }
}
