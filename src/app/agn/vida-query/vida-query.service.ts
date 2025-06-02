import { Injectable } from "@angular/core";
import { Subject, BehaviorSubject, Observable, of } from "rxjs";
import { DaoService } from "../../develar-commons/dao.service";
import { Acervo } from "../models/acervo.model";
import { VidaQueryHelper } from "./vida-query.helper";
import { VidaQuery } from '../models/vidaQuery.model';
import { NotificationService } from '../../develar-commons/notifications.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { ConsultaAcervoQuery, ConsultaAcervo } from '../models/historial.model';

const RECORD = "vida";
const RECORD_CONSULTAS = "consultasacervo";
@Injectable()
export class VidaQueryService {
  private emitVidaQueryDataSource = new BehaviorSubject<any[]>([]);
  private onUpdateFiltrosSubject: Subject<any> = new Subject<any>();
  onUpdateFiltrosObservable$: Observable<any> = this.onUpdateFiltrosSubject
    .asObservable();

  acervosList: Acervo[] = [];
  urlSearch : string = 'api/vida/search';
  /* Almacena la última query realizada, de manera que no se pierda al navegar entre páginas
   * y retornar al buscador
   */
  public query: VidaQuery;

  /**
   * Determina si la última busqueda realizada provino por una búsqueda en el componente buscador mismo,
   * o desde la ficha Buscador presente en página de inicio.
   *
   * Se usa para determinar si se debe bloquear o no el acceso a usuarios no-logueados al modal
   * de vista del objeto archivístico (audio, video, imagen, etc)
   *
   * @see VidaQueryPageComponent
   * @see VidaQueryViewComponent
   */
  public isSearchFromHomeSearch = false;

  constructor(private _daoService: DaoService,
    private _snackBarService : NotificationService,
    private http : HttpClient) {
    this.query = new VidaQuery();
  }

  exports (query : VidaQuery){
    const url = 'api/vida/exportar';
    const urlAndParams = this.buildParamsFromArray(url,query);

    window.open(urlAndParams, 'about: blank');
  }



  fetchVidaByQuery(query: VidaQuery, consulta : ConsultaAcervoQuery): Subject<any[]> {
    let listener = new Subject<any[]>();
    this.query = query;
    this.loadVidaByQueryArray(listener, query, consulta);
    return listener;
  }


  private loadVidaByQueryArray(listener: Subject<any[]>, query : VidaQuery, consulta : ConsultaAcervoQuery) {

    this.searchArray<Acervo>(query, consulta).subscribe({next: (list) => {
      if (list && list.length) {
        this.acervosList = list;
        this.updateDataSource();
      } else {
        this.acervosList = [];
      }
      listener.next(this.acervosList);
    },
  error: err => {
    this._snackBarService.error("Se ha producido un error inesperado");
  }});
  }

  addFiltroDeBusqueda(filtro: any) {
    this.onUpdateFiltrosSubject.next(filtro);
  }

  searchArray<Acervo>( query : VidaQuery, consulta: ConsultaAcervoQuery) : Observable<Acervo[]> {

    let searchUrl = this.buildParamsFromArray(this.urlSearch, query);
    let params = this.buildParams(consulta);
    return this.http
               .get<Acervo[]>(searchUrl, {params})
               .pipe(
                   catchError(this.handleObsError<Acervo[]>('search',[]))
                 ) as Observable<Acervo[]>;
  }

  buildParams(query : any){
    //let params =  new HttpParams().append('slug', query.slug).append('cardType',  query["type"]);
    return Object.getOwnPropertyNames(query)
                 .reduce((p, key) => p.append(key, query[key]), new HttpParams());
  }

  get vidaQueryDataSource(): BehaviorSubject<any[]> {
    return this.emitVidaQueryDataSource;
  }

  buildParamsFromArray(url: string ,query) : string {
    let searchUrl = url;
    // IMPLEMENTAMOS ESTE CRITERIO PARA LA BÚSQUEDA POR ARRAY
    let recurso = '?recurso='+query.recurso+"&isArray=";
    recurso += query.condiciones.length > 1 ? true : false;
    let condiciones : string = "";
    query.condiciones.forEach( condicion => {
      condiciones = condiciones+"&termino="+condicion.termino+"&buscarEn="+condicion.buscarEn+"&tipoBusqueda="+condicion.tipoBusqueda;
    });

    return searchUrl = searchUrl+recurso+condiciones;
  }

  fetchVidaById(id: string): Subject<any> {
    let listener = new Subject<any>();
    this.loadVidaById(listener, id);
    return listener;
  }

  loadVidaById(listener: Subject<any>, id: string) {
    let url_id = "/acervo/" + id;
    this._daoService.findById(RECORD, url_id).then((acervo) => {
      listener.next(acervo);
    });
  }

  updateDataSource() {
    let data = VidaQueryHelper.buildDataList(this.acervosList);
    this.emitVidaQueryDataSource.next(data);
  }

  private handleObsError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      //con sole.error(error); // log to cons ole instead

      // TODO: better job of transforming error for user consumption
      //this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  searchConsultasAcervoByUser(userId : string) : Observable<ConsultaAcervo[]>{
    let query = {
      userId : userId
    }
    return this._daoService.search<ConsultaAcervo>(RECORD_CONSULTAS, query);
  }



}
