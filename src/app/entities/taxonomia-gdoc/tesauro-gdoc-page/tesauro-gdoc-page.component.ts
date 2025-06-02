import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { NotificationService } from '../../../develar-commons/notifications.service';
import { TaxonomiaQuery } from '../taxonomia.model';
import { TaxonomiaService } from '../taxonomia.service';
import {TaxonomiaModalService} from '../taxonomia-modal.service';
import {SharedService} from '../../../develar-commons/shared-service';

@Component({
  selector: 'tesauro-gdoc-page',
  templateUrl: './tesauro-gdoc-page.component.html',
  styleUrls: ['./tesauro-gdoc-page.component.scss'],
  providers: [TaxonomiaModalService]
})
export class TesauroGDocPageComponent implements OnInit {

  public showData = false;
  public searching: boolean = false;

  private pageTitle = 'Gestión de taxonomías';

  constructor(
    private _service: TaxonomiaService,
    private _modal: TaxonomiaModalService,
    private _notificationService: NotificationService,
    private _shared: SharedService
  ) {
    this._shared.emitChange(this.pageTitle);
  }

  ngOnInit(): void {
  }

  /**
   * Realiza una búsqueda de taxonomías de acuerdo al criterio especificado
   *
   * @param query define los criterios de búsqueda
   */
  fetch(query: TaxonomiaQuery): void {
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
}

