import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NotificationService} from '../../../develar-commons/notifications.service';
import {UnidadDescripcionModalService} from '../unidad-descripcion-modal.service';
import {UnidadDescripcion} from '../unidad-descripcion.model';
import {SharedService} from '../../../develar-commons/shared-service';
import {AtomService} from '../../../develar-commons/atom.service';
import {catchError, finalize, take} from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'sync-atom-page',
  templateUrl: './sync-atom-page.component.html',
  styleUrls: ['./sync-atom-page.component.scss'],
  providers: [
    UnidadDescripcionModalService,
    AtomService
  ]
})
export class SyncAtomPageComponent implements OnInit {

  public typesSync = [
    {title: 'Fase 1', subtitle: 'Realizar vuelco masivo de registros sintéticos', button: 'Sincronizar Todo', action: 'syncAll'},
    {title: 'Fase 2', subtitle: 'Sincronizar registros de AtoM a UDA', button: 'Sincronizar AtoM con UDA', action: 'syncWithAtom'},
    {title: 'Fase 3', subtitle: 'Actualizar relación parent-child', button: 'Actualizar', action: 'updateParentChildRelationships'},
    {title: 'Fase 4', subtitle: 'Sincronizar un registro vía AtoM Slug', button: 'Sincronizar', action: 'openModalSync'},
  ];

  public searching: boolean;

  /** Título principal de la página */
  public pageTitle = 'Sincronización con AtoM';

  constructor(
    private _modalService: UnidadDescripcionModalService,
    private _router: Router,
    private _notification: NotificationService,
    private sharedService: SharedService,
    private atomService: AtomService
  ) {
    this.sharedService.emitChange(this.pageTitle);
    this.searching = false;
  }

  ngOnInit(): void {
  }

  public dispatchAction(action: string): void {
    switch (action) {
      case 'syncAll':
        this.syncAll();
        break;
      case 'syncWithAtom':
        this.syncWithAtom();
        break;
      case 'updateParentChildRelationships':
        this.updateParentChildRelationships();
        break;
      case 'openModalSync':
        this.openModalSync();
        break;
    }
  }

  /**
   * Sincroniza la colección atom-adapters; la cual se puebla a partir de los registros sintéticos
   * devueltos por el endpoint /api/informationobjects de AtoM.-
   *
   * @private
   */
  private syncAll(): void {
    this.searching = true;
    this.atomService
      .syncAtomAdapters()
      .pipe(take(1),
      finalize(() => this.searching = false))
      .subscribe((results) => {
        const hasResults = results && results.length;

        if (hasResults) {
          if(results[0].error){
            //this._notification.success(`Se migraron ${results.length} registros satisfactoriamente.`);
            this._notification.success(`Se produjo un error`);

          }else {
            this._notification.success(`Se inició la migración de registros en background....`);

          }
        }
      });
  }

  /**
   * Sincroniza la colección atom-adapters con atom-uda-registries; por cada registro de atom-adapters
   * generará un registro atom-uda-registries y consecuentemente un registro en unidaddescripcion
   *
   * @private
   */
  private syncWithAtom(): void {
    this.searching = true;
    this.atomService
      .syncAtomRegistries()
      .pipe(take(1),
      finalize(() => this.searching = false))
      .subscribe((results) => {
        if(results[0].error){
          //this._notification.success(`Se migraron ${results.length} registros satisfactoriamente.`);
          this._notification.success(`Se produjo un error`);

        }else {
          this._notification.success(`Se inició la migración de registros en background....`);

        }

      });
  }

  private updateParentChildRelationships(): void {
    this.searching = true;
    this.atomService
      .syncAtomParentChildRegistries()
      .pipe(take(1),
      finalize(() => this.searching = false),
      catchError(() => of({length: -1})))
      .subscribe((results) => {
        // if (results) {
        //   this._notification.success(`Operación exitosa, se han actualizado ${results} vinculos.`);
        // }else{
        //   this._notification.error(`Error en el proceso de actualización. Operqción NO realizada.`);
        // }

        if(results[0].error){
          //this._notification.success(`Se migraron ${results.length} registros satisfactoriamente.`);
          this._notification.success(`Se produjo un error`);

        }else {
          this._notification.success(`Se inició la adaptación de registros en background....`);

        }



      });
  }

  private openModalSync(): void {
    this._modalService.openBrowseUDAfromAtoMSlug()
      .subscribe((result: UnidadDescripcion) => {
          if (result) {
            this._notification.success('Se ha recuperado exitosamente la UDA cuyo SLUG es: ' + result.atomSlug);
            this._router.navigate(['/unidad-descripcion', 'factory', result._id]).then();
          }
        }
      );
  }
}
