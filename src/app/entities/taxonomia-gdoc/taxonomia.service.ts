import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DaoService } from '../../develar-commons/dao.service';
import { TaxonomiaHelper } from './taxonomia.helper';
import {Taxonomia, TaxonomiaTermino, TaxonomiaTerminoQuery, TaxonomiaQuery, TaxonomiaTable, TaxonomiaTerminoTable, BreadcrumbPart} from './taxonomia.model';

const RECORD_TAXONOMIA: string = 'taxonomia';
const RECORD_TAXONOMIA_TERMINO: string = 'taxonomiatermino';

@Injectable({
  providedIn: 'root'
})
export class TaxonomiaService {
  private readonly _dataSource$: BehaviorSubject<TaxonomiaTable[]> ;
  private readonly _dataSourceTerminos$: BehaviorSubject<TaxonomiaTerminoTable[]> ;
  public taxonomiaTerminoSelected$: BehaviorSubject<TaxonomiaTermino>;
  constructor(
    private _dao: DaoService,
    private _http: HttpClient
  ) {
    this._dataSource$ = new BehaviorSubject<TaxonomiaTable[]>([]);
    this._dataSourceTerminos$ = new BehaviorSubject<TaxonomiaTerminoTable[]>([]);
    this.taxonomiaTerminoSelected$ = new BehaviorSubject<TaxonomiaTermino>(null);
  }

  create(entity: Taxonomia): Promise<Taxonomia> {
    return this._dao.create<Taxonomia>(RECORD_TAXONOMIA, entity);
  }

  createTermino(entity: TaxonomiaTermino): Promise<TaxonomiaTermino> {
    return this._dao.create<TaxonomiaTermino>(RECORD_TAXONOMIA_TERMINO, entity);
  }

  // createMany(entities: Tesauro[]): Promise<Tesauro[]> {
  //   return this._dao.createMany<Tesauro>(RECORD_TAXONOMIA, entities);
  // }

  search(query: TaxonomiaQuery): Observable<Taxonomia[]> {
    return this._dao.search(RECORD_TAXONOMIA, query);
  }


  searchTerminos(query: TaxonomiaTerminoQuery): Observable<TaxonomiaTermino[]> {
    return this._dao.search(RECORD_TAXONOMIA_TERMINO, query);
  }

  update(entity: Taxonomia): Promise<Taxonomia> {
    return this._dao.update<Taxonomia>(RECORD_TAXONOMIA, entity._id, entity);
  }

  updateTermino(entity: TaxonomiaTermino): Promise<TaxonomiaTermino> {
    return this._dao.update<TaxonomiaTermino>(RECORD_TAXONOMIA_TERMINO, entity._id, entity);
  }

  findById(entity: string): Promise<Taxonomia> {
    return this._dao.findById(RECORD_TAXONOMIA, entity);
  }

  findTerminoById(entity: string): Promise<TaxonomiaTermino> {
    return this._dao.findById(RECORD_TAXONOMIA_TERMINO, entity);
  }

  // upsert(entity: Tesauro): Observable<Tesauro> {
  //   return this._http.post<Tesauro>(this.url+'/upsert', JSON.stringify(entity), {headers: this._dao.headers})
  //     .pipe(
  //       catchError( err => of(null))
  //   );
  // }

  delete(id: string): Promise<void> {
    return this._dao.delete<Taxonomia>(RECORD_TAXONOMIA, id);
  }

  deleteTermino(id: string): Promise<void> {
    return this._dao.delete<TaxonomiaTermino>(RECORD_TAXONOMIA_TERMINO, id);
  }

  /**
   * Retorna el breadcrumb para una taxonomía-término dada
   *
   * @param id el _id del término para el que se quiere obtener el breadcrumb
   * @returns Promise<BreadcrumbPart[]>
   */
  getBreadcrumb(id: string): Observable<BreadcrumbPart[]> {
    const url = `/api/taxonomiatermino/${id}/breadcrumb`;
    return this._http.get<BreadcrumbPart[]>(url);
  }

  /**
   * Determina si un término es único dentro de la taxonomía
   *
   * @param sinonimo el sinónimo que se desea validar
   * @param taxonomiaId el ID de la taxonomía donde se va a validar el sinónimo
   * @returns {Promise}
   */
  esSinonimoUnicoEnTaxonomia(sinonimo: string, taxonomiaId: string): Promise<boolean> {
    const url = `/api/taxonomia/${taxonomiaId}/unicidadsinonimo/${sinonimo}/`;
    return this._http.get<boolean>(url).toPromise();
  }

  get dataRecordsSource(): BehaviorSubject<TaxonomiaTable[]> {
    return this._dataSource$;
  }

  get dataRecordsSourceTerminos(): BehaviorSubject<TaxonomiaTerminoTable[]> {
    return this._dataSourceTerminos$;
  }

  /**
   * Actualiza el dataSource a partir del array de Tesauros
   * @param entities
   */
  updateTableData(entities: Taxonomia[]): void {
    const tableData = TaxonomiaHelper.buildTaxonomiaDataTable(entities);
    this._dataSource$.next(tableData);
  }

  /**
   * Actualiza el dataSource a partir del array de Tesauros
   * @param entities
   */
   updateTableTerminoData(entities: TaxonomiaTermino[]): void {
    const tableData = TaxonomiaHelper.buildTaxonomiaTerminoDataTable(entities);
    this._dataSourceTerminos$.next(tableData);
  }
}
