import { Injectable } from "@angular/core";
import { DaoService } from '../../develar-commons/dao.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  UnidadDescripcion,
  UnidadDescripcionQuery,
  UnidadDescripcionTable,
  UnidadDescripcionHistoryEntry,
  JerarquiaUD,
  ChildrenUD,
  ApareoUda,
  UdAssets,
  AtomPrepResult
} from './unidad-descripcion.model';
import { UnidadDescripcionHelper } from './unidad-descripcion.helper';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { NotificationService } from "../../develar-commons/notifications.service";

const RECORD: string = 'ud';
@Injectable({
  providedIn: 'root'
})
export class UnidadDescripcionService {

  /**
   * Orígenes de datos para la tabla del navegador de
   * unidades descriptivas
   */
  private _unidadDescripcionDataSource: BehaviorSubject<UnidadDescripcionTable[]> = new BehaviorSubject<UnidadDescripcionTable[]>([]);
  private _unidadDescripcionList: UnidadDescripcion[];
  private headers = new HttpHeaders().set('Content-Type', 'application/json');
  private url: string = `/api/unidaddescripcion`;
  private urlSearch: string = `/api/unidaddescripcion/search`;

  constructor(
              private _dao: DaoService,
              private _http: HttpClient,
              private _notificationService: NotificationService
  ){ }

  create(ud: UnidadDescripcion): Promise<UnidadDescripcion> {
    return this._dao.create<UnidadDescripcion>(RECORD, ud);
  }

  public insertMany(ud: UnidadDescripcion): Promise<UnidadDescripcion[]> {
    return this._dao.insertMany<UnidadDescripcion>(RECORD, ud);
  }

  /** Inserción de varias Unidades de Descripcion */
  public createMany(entities: UnidadDescripcion[]): Promise<UnidadDescripcion[]> {
    return this._dao.createMany<UnidadDescripcion>(RECORD, entities);
  }

  search(query: UnidadDescripcionQuery): Observable<UnidadDescripcion[]> {
    return this._dao.search(RECORD, query);
  }

  /**
   * Navegador de unidades de descripción
   */
  get dataRecordsSource(): BehaviorSubject<UnidadDescripcionTable[]> {
    return this._unidadDescripcionDataSource;
  }

  public fetchUnidadesDescripcionByQuery(query: UnidadDescripcionQuery): BehaviorSubject<UnidadDescripcion[]> {
    const subject = new BehaviorSubject<UnidadDescripcion[]>([]);
    this._loadUnidadesDescripcionByQuery(subject, query);
    return subject;
  }

  private _loadUnidadesDescripcionByQuery(subject: BehaviorSubject<UnidadDescripcion[]>, query: UnidadDescripcionQuery): void {
    if (query.recurso && query.condiciones && query.condiciones.length) {
      this.searchArray<UnidadDescripcion>(query).subscribe((items) => {
        if (items && items.length) {
          this._unidadDescripcionList = items;
        } else {
          this._unidadDescripcionList = [];
          this._notificationService.warn("No se han encontrado resultados para la búsqueda");
        }
        subject.next(this._unidadDescripcionList);
      })
    } else {
      this.search(query).subscribe(items => {
        if (items && items.length > 0) {
          this._unidadDescripcionList = items;
        } else {
          this._unidadDescripcionList = [];
        }

        subject.next(this._unidadDescripcionList);
      });
    }
  }

  private searchArray<UnidadDescripcion>(query: UnidadDescripcionQuery): Observable<UnidadDescripcion[]> {
    const searchUrl = this.buildParamsFromArray(this.urlSearch, query);
    return this._http
      .get<UnidadDescripcion[]>(searchUrl)
      .pipe(
        catchError(this.handleObsError<UnidadDescripcion[]>('search', []))
      );
  }

  private buildParamsFromArray(url: string, query): string {
    let searchUrl = url;
    // IMPLEMENTAMOS ESTE CRITERIO PARA LA BÚSQUEDA POR ARRAY
    let recurso = '?recurso=' + query.recurso + "&isArray=";
    recurso += query.condiciones.length > 1 ? true : false;
    let condiciones: string = "";
    query.condiciones.forEach(condicion => {
      condiciones = condiciones + "&termino=" + condicion.termino + "&buscarEn=" + condicion.buscarEn + "&tipoBusqueda=" + condicion.tipoBusqueda;
    });

    return searchUrl = searchUrl + recurso + condiciones;
  }

  public updateTableData(): void {
    const unidadDescripcionTableData = UnidadDescripcionHelper.buildUnidadDescripcionDataTable(this._unidadDescripcionList);
    this._unidadDescripcionDataSource.next(unidadDescripcionTableData);
  }

  public update(ud: UnidadDescripcion): Promise<UnidadDescripcion> {
    return this._dao.update<UnidadDescripcion>(RECORD, ud._id, ud);
  }

  public findById(id: string): Promise<UnidadDescripcion> {
    return this._dao.findById(RECORD, id);
  }

  public testUDByIdentifier(identifier: string): Observable<UnidadDescripcion[]> {
    const query = { identifier };

    return this._dao.search<UnidadDescripcion>(RECORD, query);
  }

  public fetchHistory(id: string): Promise<UnidadDescripcionHistoryEntry[]> {
    return this._dao.fetchHistoryByID<UnidadDescripcionHistoryEntry>('udhistory', id)
      .toPromise();
  }

  public fetchJerarquia(id: string): Observable<Array<JerarquiaUD[]>> {
    return this._dao.fetchJerarquia<JerarquiaUD[]>('udJerarquia', id);
  }

  public fetchProcedureTxt(id: string): Observable<Array<string>> {
    return this._dao.fetchProcedureTxt<string>('udJerarquia', id);
  }

  public deleteMany(idsToDelete: string[]): Promise<UnidadDescripcion[]> {
    return this._dao.deleteMany(RECORD, idsToDelete);
  }

  private handleObsError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }

  public buildStringifyFromUdas(): Observable<any> {
    const url = `${this.url}/stringify`;
    return this._http.get<any>(url).pipe(catchError(err => of(null)));
  }

  /** Retrieve childrens tree */
  public buildChildrenTreeCollectingAssetFromUdaId(id: string): Observable<UdAssets[]> {
    const url = `${this.url}/childrentree/${id}`;
    return this._http.get<UdAssets[]>(url).pipe(catchError(err => of(null)));
  }

  public buildApareoTreeFromUdaId(id: string): Observable<ApareoUda[]> {
    const url = `${this.url}/apareo/${id}`;
    return this._http.get<ApareoUda>(url).pipe(catchError(err => of(null)));
  }

  public updateUdasFromApareos(apareoList: ApareoUda[]): Observable<ApareoUda[]> {
    const url = `${this.url}/apareo`;
    return this._http.put(url, JSON.stringify(apareoList),{headers: this.headers}).pipe(
      catchError(err => of(null))
    );
  }


  public getUdaChildrenList(parentUdaId: string): Observable<ChildrenUD[]> {
    return this._dao.getChildrenList<ChildrenUD>(RECORD, parentUdaId);
  }

  /** Update Children Tree (cuando cambia un nodo en la jerarquía)  **/
  public updateChildTree(currentUdaId: string): Observable<number> {
    return this._dao.updateChildTree<number>(RECORD, currentUdaId);
  }


  /** AtoM Services */
  public fetchUDAFromAtoMSlug(atomSlug: string): Observable<UnidadDescripcion> {
    const url = `/api/unidaddescripcion/atom/informationobjects/${atomSlug}/migrate`;
    return this._http.get<UnidadDescripcion>(url).pipe(
      catchError(err => of(null))
    );
  }

  // UDA - registros anterior y siguiente
  public getUdaPrevNext(udaId: string): Promise<any> {
    const url = `${this.url}/prevnext/${udaId}`;
    return this._http.get(url).toPromise();
  }


  prepararExportarAtom(query: UnidadDescripcionQuery): Observable<AtomPrepResult> {
    const url = `${this.url}/prepararexportatom`;
    const params = new HttpParams({ fromObject: query as any }).toString();

    return this._http.get<AtomPrepResult>(url + '?' + params);
  }

  exportarAtom(timestamp: number): void {
    const url = `${this.url}/exportatom/${timestamp}`;
    window.open(url);
  }


  syncAnaliticosCYCWithUdas(): Observable<UnidadDescripcion[]> {
    const url = `/api/unidaddescripcion/sincronizar/cyc`;
    return this._http.get<UnidadDescripcion[]>(url);
  }

  syncAnaliticosDNEWithUdas(): Observable<UnidadDescripcion[]> {
    const url = `/api/unidaddescripcion/sincronizar/dne`;
    return this._http.get<UnidadDescripcion[]>(url);
  }

  syncAnaliticosWithUdas(endpoint: string): Observable<UnidadDescripcion[]> {
    const url = `/api/unidaddescripcion/sincronizar/${endpoint}`;
    console.log('Sync ENDPOINT [%s]', url)
    return this._http.get<UnidadDescripcion[]>(url);
  }

}
