import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { NotificationService } from '../../../../develar-commons/notifications.service';
import { User } from '../../../user/user';
import { UserService } from '../../../user/user.service';
import { UnidadDescripcionModalService } from '../../unidad-descripcion-modal.service';
import { UnidadDescripcionHelper } from '../../unidad-descripcion.helper';
import { ActionUda, ApareoUda, IngestadosAndNoIngestados, UnidadDescripcion, UnidadDescripcionQuery } from '../../unidad-descripcion.model';
import { UnidadDescripcionService } from '../../unidad-descripcion.service';

const INACTIVO: string = 'inactivo';
const IS_INGESTADO: string = 'isIngestado';
const NOT_IS_INGESTADO: string = 'notIsIngestado';
@Component({
  selector: 'apareo-ud-page',
  templateUrl: './apareo-ud-page.component.html',
  styleUrls: ['./apareo-ud-page.component.scss'],
  providers: [UnidadDescripcionModalService]
})
export class ApareoUdPageComponent implements OnInit {

  public searching: boolean;
  public udRoot: UnidadDescripcion;
  public ingestadosAndNoIngestados: IngestadosAndNoIngestados;
  public selectedTableRight: ApareoUda[];
  public selectedTableLeft: ApareoUda[];
  public working: boolean = false;
  private user: User;
  private typeAndActionId = {
    type: '',
    actionId: ''
  }
  constructor(
              private _serviceUD: UnidadDescripcionService,
              private _notification: NotificationService,
              private _modalService: UnidadDescripcionModalService,
              private _userService: UserService
  ) {
    this.searching = false;
    this.selectedTableLeft = [];
    this.selectedTableRight = [];
  }

  ngOnInit(): void {
    this.user = this._userService.currentUser;
  }

  public search(query: UnidadDescripcionQuery): void {
    this.udRoot = null;
    this.ingestadosAndNoIngestados = null;
    this.selectedTableRight = [];
    this.selectedTableLeft = [];
    this.searching = true;

    this.typeAndActionId.actionId = query.actionId;
    this.typeAndActionId.type = query.type;

    this._serviceUD.search(query).pipe(
      finalize(() => this.searching = false)
    ).subscribe(results => {
      if (results) {
        if (results.length) {

          if (results.length > 1) {
            this._modalService.openListFromUdasResults(results)
              .subscribe(result => {
                if (result)
                  this.udRoot = result;
                this.searchChildrens();
              })
          } else {
            this.udRoot = results[0];
            this.searchChildrens();
          }
        } else {
          this._notification.warn(`No se han encontrado registros para el criterio de búsqueda indicado.`);
        }
      } else {
        this.notificationErrorMsj();
      }
    })
  }

  private searchChildrens(): void {

    this.searching = true;
    this._serviceUD.buildApareoTreeFromUdaId(this.udRoot._id).pipe(
      finalize(() => this.searching = false)
    ).subscribe(results => {
      if (results) {
        if (results.length) {
          const udaApareoListFiltered = UnidadDescripcionHelper.filterUdasWithActionId(this.typeAndActionId.type, this.typeAndActionId.actionId, results);
          if(udaApareoListFiltered && udaApareoListFiltered.length){
            this.ingestadosAndNoIngestados = UnidadDescripcionHelper.forkIngestedFromNoIngested(udaApareoListFiltered);
          } else {
            this.notificationWarnDependencias();
          }
        } else {
          this.notificationWarnDependencias();
        }
      } else {
        this.notificationErrorMsj();
      }
    })
  }

  private notificationWarnDependencias(): void {
    this._notification.warn(`No se han detectado dependencias para realizar el apareo`);
  }

  private notificationErrorMsj(): void {
    this._notification.error(`Se ha producido un error intentando realizar la operación.`);
  }

  public getReferenceCode(reference_code: string[]): string {
    return UnidadDescripcionHelper.buildReferenceCode(reference_code);
  }

  public procesarAction(): void {

    const action = UnidadDescripcionHelper.factoryActionUda(this.typeAndActionId.type, this.typeAndActionId.actionId, this.user);
    switch (action.type) {
      case 'apareo': this.empardar(action);
    }
    this.empardar(action);

  }

  private empardar(action: ActionUda): void {
    this.working = true;

    /** Este proceso se va a encargar de que la UD ingestada
     *  le transifera sus assets a la UD no ingestada.
     *  Esto se llevara a cabo según el orden en el que fueron seleccionadas
     */

    /** Previamente verificamos que tenga igual cantidad seleccionada
     *  Tanto a izquierda, como a derecha, sino se lo notificamos en el template.
     */
    const noIngestadosAux = [...this.selectedTableLeft];
    const ingestadosAux = [...this.selectedTableRight];
    if (this.selectedTableRight.length === this.selectedTableLeft.length) {

      noIngestadosAux.map((udaNoIngestada, index) => {

        udaNoIngestada.assets = [...this.selectedTableRight[index].assets];
        const actionAux = { ...action };
        actionAux.role = NOT_IS_INGESTADO;
        udaNoIngestada.actions.push(actionAux);
        return udaNoIngestada;
      }
      );

      ingestadosAux.map(udaIngestada => {
        udaIngestada.estado = INACTIVO;
        const actionAux = { ...action };
        actionAux.role = IS_INGESTADO;
        udaIngestada.actions.push(actionAux);
        return udaIngestada;
      }
      )

      this._serviceUD.updateUdasFromApareos([...noIngestadosAux, ...ingestadosAux])
        .pipe(
          finalize(() => this.working = false)
        ).subscribe(
          results => {
            if (results) {
              if (results.length) {
                /** Se encarga de hacerle el next pertinente a los BehaviorSubject de las tables */
                UnidadDescripcionHelper.filterUdasApareadasFromSubject(this.ingestadosAndNoIngestados, results);
                this._notification.success(`Operación realizada con éxito.`);
                this.selectedTableLeft = [];
                this.selectedTableRight = [];
              }
            } else {
              this.notificationErrorMsj();
            }
          }
        );
    }
  }



  public pushToApareoSelectedList(itemsApareo: ApareoUda[], isIngestado: boolean): void {
    if (isIngestado) {
      this.selectedTableRight = [...itemsApareo];
    } else {
      this.selectedTableLeft = [...itemsApareo];
    }
  }

}
