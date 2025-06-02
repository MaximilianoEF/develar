import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {finalize} from 'rxjs/operators';
import {NotificationService} from '../../../../develar-commons/notifications.service';
import {SharedService} from '../../../../develar-commons/shared-service';
import {IngestaModalService} from '../../ingest-factory/ingesta-modal.service';
import {IngestaHelper} from '../../ingesta.helper';
import {IngestaService} from '../../ingesta.service';

@Component({
  selector: 'ingest-process-browser-page',
  templateUrl: './ingest-process-browser-page.component.html',
  styleUrls: ['./ingest-process-browser-page.component.scss'],
  providers: [IngestaModalService]
})
export class IngestProcessBrowserPageComponent implements OnInit {

  public pageTitle: string = 'Gestión de partes de ingesta';
  public showData: boolean = false;
  public searching: boolean = false;

  constructor(
    private _ingestaService: IngestaService,
    private sharedService: SharedService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _notification: NotificationService,
    private modalsService: IngestaModalService
  ) {
    this.sharedService.emitChange(this.pageTitle);
  }

  ngOnInit(): void {
  }

  public fetchIngestProcess(query: any): void {
    this.searching = true;

    /**
     * En este caso no es necesario el operador take(2) utilizado en los browsers de UDA o authority-records, puesto que
     * findByQuery siempre retorna Observable, el cual completa en algún momento, de manera que el operador finalize()
     * funciona sin problemas.
     */
    this._ingestaService.findByQuery(query)
      .pipe(
        finalize(() => this.searching = false)
      )
      .subscribe(items => {
        if (items) {
          if (items.length > 0) {
            this._ingestaService.dataRecordsSource.next(IngestaHelper.buildDataTablePI(items));
            this.showData = true;
          } else if (items.length === 0) {
            this.showData = false;
            this._notification.warn(`No se han encontrado registros para la búsqueda indicada.`);
          }
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
    const dialogRef = this.modalsService.setupAltaRapidaIngestProcess();

    dialogRef.subscribe(result => {
      if (result) {
        this._ingestaService.getNextSerial(result.serial).subscribe(serial => {

          result = IngestaHelper.buildStartPI(result, serial);
          this._ingestaService.create(result).then(pi => {
            this._ingestaService.pi$.next(pi);
            this._router.navigate(['proceso-ingesta', pi._id], {relativeTo: this._route}).then();
          });
        });
      }
    });
  }
}
