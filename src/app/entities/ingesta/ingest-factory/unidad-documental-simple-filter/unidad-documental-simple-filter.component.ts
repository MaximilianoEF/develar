import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';
import { NotificationService } from '../../../../develar-commons/notifications.service';
import { UnidadDescripcionModalService } from '../../../unidad-descripcion/unidad-descripcion-modal.service';
import { ParentUD, UnidadDescripcion } from '../../../unidad-descripcion/unidad-descripcion.model';
import { UnidadDescripcionService } from '../../../unidad-descripcion/unidad-descripcion.service';
import { IngestaService } from '../../ingesta.service';

@Component({
  selector: 'unidad-documental-simple-filter',
  templateUrl: './unidad-documental-simple-filter.component.html',
  styleUrls: ['./unidad-documental-simple-filter.component.scss'],
  providers: [UnidadDescripcionModalService]
})
export class UnidadDocumentalSimpleFilterComponent implements OnInit {

  private searchTerms: Subject<string>;
  public udc$: BehaviorSubject<UnidadDescripcion>;
  public parent: ParentUD;
  constructor(private _service: IngestaService,
    private _modalService: UnidadDescripcionModalService,
    private _serviceUD: UnidadDescripcionService,
    private _notificationService: NotificationService) {
    this.searchTerms = new Subject();
    this.udc$ = this._service.ud$;
  }

  ngOnInit(): void {

    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(t => t && t.length > 2),
      tap(term => this._service.refreshDataSourceTable(term))
    ).subscribe();

    this.buildParent();
  }

  private buildParent() {
    this._service.ud$.subscribe(udc => {
      if (udc) {
        this.parent = new ParentUD();
        this.parent.level_of_description = udc.identificador.level_of_description;
        this.parent.identifier = udc.identificador.identifier;
        this.parent.id_parent = udc._id;
        this.parent.title = udc.identificador.title;

      }
    })
  }

  public altaUDS(): void {

    this._modalService.initAltaRapida(this.parent).subscribe(result => {
      if (result) {
        if(result.udsNumber > 1){
          this._serviceUD.insertMany(result).then((x) => {
            this.refreshUDC();
          })
        }else{
          this._serviceUD.create(result).then( (ud) => {
            this.refreshUDC();
          })
        }
        

      }
    })
  }

  private refreshUDC() {
    this._serviceUD.findById(this.udc$.value._id).then(udc => {
      this._service.ud$.next(udc);
      this._notificationService.success("Alta múltiple éxitosa")
    })
  }
  public search(term: string) {
    this.searchTerms.next(term);
  }

}
