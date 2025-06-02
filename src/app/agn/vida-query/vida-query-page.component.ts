import {Component, OnInit, ChangeDetectorRef, AfterViewChecked} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from "rxjs";
import { VidaQueryService } from "./vida-query.service";
import {Condiciones, VidaQuery} from '../models/vidaQuery.model';
import { NotificationService } from '../../develar-commons/notifications.service';
import { devutils } from '../../develar-commons/utils';
import { UserService } from '../../entities/user/user.service';
import { ConsultaAcervoQuery } from '../models/historial.model';
import { catchError, filter, finalize, switchMap, toArray } from 'rxjs/operators';
import { UnidadDescripcionService } from '../../entities/unidad-descripcion/unidad-descripcion.service';

@Component({
  selector: "vida-query-page",
  templateUrl: "./vida-query-page.component.html",
  styleUrls: ["./vida-query-page.component.scss"],
})
export class VidaQueryPageComponent implements OnInit, AfterViewChecked {
  public showList = false;

  /* Almacena la última query realizada, de manera que no se pierda al navegar entre páginas
   * y retornar al buscador
   */
  public query: VidaQuery;
  public isResults : boolean = false;
  public data$ = new BehaviorSubject<any>({});
  public searching = false;
  cantExport : boolean = true;

  constructor(
              private _notificationService: NotificationService,
              private _vidaService: VidaQueryService,
              private _udaService: UnidadDescripcionService,
              private _cdRef: ChangeDetectorRef,
              private _userService: UserService,
              private route: ActivatedRoute
    ){
    this.query = this._vidaService.query;
    //oJo
    if (this._vidaService.vidaQueryDataSource.value.length > 0) {
      this.showList = true;
      this.searching = true;
    }
  }

  ngOnInit(): void {
    this.parseQueryString();
  }

  /**
   * Verifica si existe un parámetro 'terms' por URL; si existe, lo captura, genera y dispara una query
   * @private
   */
  private parseQueryString(): void {
    this.route.queryParams.subscribe(params => {
      if (params && params.terms && params.terms.length > 0) {
        const query = new VidaQuery();
        const queryConditions = new Condiciones();

        queryConditions.termino = params.terms;
        queryConditions.buscarEn = 'all';
        queryConditions.tipoBusqueda = 'aprox';

        query.recurso = '-1';
        query.condiciones = [queryConditions];

        this._vidaService.isSearchFromHomeSearch = true;

        this.showView(query);
      } else {
        this._vidaService.isSearchFromHomeSearch = false;
      }
    });
  }

  ngAfterViewChecked(): void {
    this._cdRef.detectChanges();
  }

  showView(event: VidaQuery): void {
    this.showList = false;
    this.searching = true;
    this.query = event;
    const date = new Date();
    const busqueda = this.saveBusqueda(date, event);
    this._udaService.dataRecordsSource.next([]);
    this._vidaService.vidaQueryDataSource.next([]);
    /** Evaluo donde tengo que realizar la búsqueda */
    if(this.query.recurso === '3'){
      /** Es contra las Unidades de descripción */
      this._udaService.fetchUnidadesDescripcionByQuery(event)
      .subscribe({
        next: (list) => {
          this.initProcessView(list, true);
        },
        error: (err) => {
          this._notificationService.error(`Se ha producido un error al visualizar la búsqueda.`);
          // this.searching = false;
        }
      })
    }else{
      this._vidaService.fetchVidaByQuery(this.query, busqueda).pipe(
        finalize(() => this.searching = false)
      ).subscribe({
        next: (list) => {
          this.initProcessView(list);
        },
        error: (err) => {
          this._notificationService.error('Se ha producido un error al realizar la búsqueda.');
        },
      });
    }

  }

  private initProcessView(list: any, isUda?: boolean) {
    setTimeout(() => {
      if (list && list.length) {
      this.data$.next(list);
      this.cantExport = false;
      this.isResults = true;
      this.showList = true;
        if(isUda){
          this._udaService.updateTableData();
          this.searching = false;
        }
      } else {
        if(!isUda)
          this._notificationService.warn(`No se han encontrado resultados para el criterio de búsqueda indicado.`);
        this.cantExport = true;
        this.isResults = false;
        this.showList = false;
        this.searching = false;
      }
  },1500)
  }

  endSearching(e: boolean): void {
    this.searching = e;
  }

  saveBusqueda(date : Date, query : VidaQuery) : ConsultaAcervoQuery{
    let busqueda = new ConsultaAcervoQuery();
    busqueda.txFecha = devutils.txFromDate(date);
    busqueda.tsFechaHora = date.getTime();
    busqueda.txHora = devutils.txFromHora(date);
    let user = this._userService.currentUser;
    if(user && user.email !== 'invitado@develar'){
      busqueda.userId = this._userService.currentUser._id;
      busqueda.userNombre = this._userService.currentUser.isUsuarioWeb ? this._userService.currentUser['nombre'] : this._userService.currentUser.displayName;
      let fenac = this._userService.currentUser.isUsuarioWeb ? this._userService.currentUser['tsFechaNacimiento']: null;
      if(fenac){
      busqueda.userEdad = devutils.edadActual(new Date(fenac));
      }
    }else{
      // logica para anonimo
      busqueda.userId = null;
      busqueda.userNombre = 'invitado';
      busqueda.userEdad = 0;
    }
    busqueda.palabras = [];
    query.condiciones.forEach(input => {
      busqueda.palabras.push(input.termino);
    })
    return busqueda;
  }

  onExportExcel() : void {
    this._vidaService.exports(this.query);
  }
}
