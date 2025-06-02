import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { NotificationService } from '../../../develar-commons/notifications.service';
import { AccessionRecordsModalService } from '../accession-records-modal.service';
import { AccessionRecordQuery } from '../accession-records-model';
import { AccessionRecordsService } from '../accession-records.service';

@Component({
  selector: 'accession-records-page',
  templateUrl: './accession-records-page.component.html',
  styleUrls: ['./accession-records-page.component.scss'],
  providers: [AccessionRecordsModalService]
})
export class AccessionRecordsPageComponent implements OnInit {

  public showData = false;
  public searching: boolean = false;

  constructor(
    private _service: AccessionRecordsService,
    private _notificationService: NotificationService,
    private _router: Router,
    private route: ActivatedRoute,
    private _modalService: AccessionRecordsModalService
  ) { }

  ngOnInit(): void {
  }

  public fetch(query: AccessionRecordQuery): void {
    this.searching = true;
    this.showData = false;
    
    this._service.search(query)
      .pipe(
        finalize(() => this.searching = false )
      )
      .subscribe((items) => {
        if(items){
          if (items.length > 0) {
            this._service.updateTableData(items);
            this.showData = true;
          }else{
            this._notificationService.warn(`No se han encontrado resultados para el criterio de búsqueda indicado.`);
          }
        }
         else {
          this._notificationService.error(`Se ha producido un error al realizar la búsqueda.`);
          this.showData = false;
        }
      });
  }

  public openAltaRapida(e:any): void {
    // const dialogRef = this._modalService.initAltaRapida();

    // dialogRef.subscribe((result) => {
    //   this.saveAltaRapida(result);
    // });
  }

  private saveAltaRapida() {
    
  }
}

