import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { graphUtilities } from '../../../../develar-commons/asset-helper';
import { Asset } from '../../../../develar-commons/develar-entities';
import { NotificationService } from '../../../../develar-commons/notifications.service';
import {
  IdentificadorUD,
  ParentUD,
  UnidadDescripcion,
  AuditUD,
  CompanyUD,
  ContenidoYEstructura,
  AccesoYUsoUD,
  DocumentacionAsociadaUD,
  ContextUD,
  ChildrenUD,
  ControlDescripcion,
  PuntoAcceso
} from '../../unidad-descripcion.model';
import { UnidadDescripcionService } from '../../unidad-descripcion.service';
import { UnidadDescripcionHelper } from '../../unidad-descripcion.helper';
import { SharedService } from '../../../../develar-commons/shared-service';
import { UserService } from '../../../user/user.service';
import { devutils } from '../../../../develar-commons/utils';

// develar-config
import { gldef } from '../../../../develar-commons/develar.config';
import { AuthorityRecord } from '../../../authority-record/authority-record.model';
import { AuthorityRecordService } from '../../../authority-record/authority-record.service';
import {DaoService} from '../../../../develar-commons/dao.service';
import {take} from 'rxjs/operators';


const IDENTIFICADOR: string = 'IDENT';
const CONTEXTO: string = 'CONTEXTO';
const CONTENIDO: string = 'CONTENT';
const CONDICIONES: string = 'CONDICIONES';
const DOC: string = 'DOC';
const NOTAS: string = 'NOTAS';
const DESCRIPTION: string = 'DESCR';
const CONTROL_DESCRIPCION: string = 'control-descripcion';
const PUNTOSACCESO: string = 'puntos-acceso';

const modalConfig = {
  hasBackdrop: true,
  backdropClass: 'yellow-backdrop',
  data: {
    caption: 'Sincronización de [%s] con AtoM',
    body: '¿Está seguro que desea sincronizar este registro con AtoM?',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    },
    cancel: {
      action: 'cancel',
      label: 'Cancelar'
    }
  }
};

@Component({
  selector: 'unidad-descripcion-page',
  templateUrl: './unidad-descripcion-page.component.html',
  styleUrls: ['./unidad-descripcion-page.component.scss']
})
export class UnidadDescripcionPageComponent implements OnInit {
  public pageTitle = 'Gestión de unidades de descripción';

  public showHeader: boolean = true;
  public showInputArea: boolean = false;
  public showTextArea: boolean = true;

  /** Define si se muestra el historial */
  public showHistory: boolean = false;

  /** Lista de organizaciones asignables a una Unidad documental */
  public companyList: AuthorityRecord[] = [];

  /** Propiedades utilizadas para construir el identificador (correspondiente
   * al área de identificación) de la unidad documental);
   *
   * También se hace uso del parent, pero dicha propiedad ya se declaró
   * posteriormente
   */
  private archivalInstitution: AuthorityRecord = null;
  private udaIdentifier: string = null;
  public udaReferenceCode: string = null;

  public actionSelected: string = '';
  public renderInputArea: boolean = false;
  public renderUdaAssetPreview: boolean = false;

  public isEdit: boolean = false;

  /**
   * Datos de la unidad de descripción seleccioanda, si existe una.
   */
  public unidadDescripcionId: string = '';
  public ud: UnidadDescripcion;
  public udChildrens: ChildrenUD[] = [];


  public text: string = '';
  public startInitialView: boolean = false;

  /* Lo utilizaremos para saber si hay cambios en el text-area */
  public textOriginal: string = '';
  private isDirty: boolean = false;
  private parentUnidad: ParentUD = null;
  private actualParentId: string = null;


  /* Almacena los registros anterior y siguiente, si existen */
  /* TODO: tipado */
  public prevNext: any;

  constructor(
    private _unidadDescripcionService: UnidadDescripcionService,
    private _userService: UserService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _notificationService: NotificationService,
    private _shared: SharedService,
    private _authorityRecordService: AuthorityRecordService
  ) {
    this.unidadDescripcionId = this._route.snapshot.params.id;
    this.isEdit = !!(this.unidadDescripcionId);
    this._shared.emitChange(this.pageTitle);
  }


  ngOnInit() {

    this._route.params.subscribe(result => {
      if (result) {
        this.unidadDescripcionId = result.id;
        this.initUDA();
      }
    })

  }

  private async initUDA() {
    this.startInitialView = false;
    this.showInputArea = true;

    const companies = await this._authorityRecordService
      .findByQuery({ isArchivalInstitution: true })
      .toPromise();

    this.companyList = companies || [];

    if (this.isEdit) {
      try {
        if (this.unidadDescripcionId) {
          const ud = await this._unidadDescripcionService.findById(this.unidadDescripcionId);

          this.showTextArea = false;
          this.showInputArea = false;

          this.ud = ud;
          this.text = ud.dataWord ? ud.dataWord : null;
          this.textOriginal = ud.dataWord ? ud.dataWord : null;
          // guardo si tiene un padre

          this.ud.parent = (ud.parent) ? ud.parent : null;
          this.parentUnidad = this.ud.parent;

          this.actualParentId = ud.parent && ud.parent.id_parent;// conservo este dato para saber si fue movido en la estructura

          // Controlo si vengo entro por alta-rápida, en tal caso no hay company
          if (ud.company && ud.company.authorityRecordId) {
            const personCompany = this.companyList.find(item => item.controlArea.identifier === ud.company.identifier);
            this.archivalInstitution = personCompany;
          } else {
            // Entré por alta rápida, asigno la persona por defecto
            this.archivalInstitution = this.companyList.find(item => item.controlArea.identifier === gldef.companyIdentifier);
          }

          /** Llegado a este punto tengo la UD cargada; busco sus hijos, si los tiene */
          this._unidadDescripcionService.getUdaChildrenList(this.ud._id)
            .pipe(
              take(1)
            )
            .subscribe((childrenList) => this.udChildrens = childrenList);

          this.udaIdentifier = ud.identificador.identifier;
          this.udaReferenceCode = UnidadDescripcionHelper.referenceCodeToString(this.ud.identificador);

          // Obtengo los enlaces hacia las UDAs anterior/siguiente
          this.prevNext = await this._unidadDescripcionService.getUdaPrevNext(this.ud._id);


          this.showInputArea = true;
          this.showTextArea = true;
          this.showHeader = true;
          this.showHistory = true;

          if (ud.assets && ud.assets.length > 0) {
            this.renderUdaAssetPreview = true;
          }

          await this.rebuildIdentifier();
        }
      } catch (error) {
        this._notificationService.error("No se ha encontrado una UDA que responda al ID: " + this.unidadDescripcionId);
        this._router.navigate(['/unidad-descripcion']).then();
      }

    } else {
      this.showHeader = true;
      this.archivalInstitution = this.companyList[0];
    }

    this.startInitialView = true;
  }

  assetUpload(sub: Subject<Asset>) {
    sub.subscribe(asset => {

      let grap = graphUtilities.cardGraphFromAsset('asset', asset, '');

      if (asset && this.isEdit) {
        if (this.ud.assets && this.ud.assets.length) {
          this.ud.assets.push(grap);
        } else {
          this.ud.assets = [];
          this.ud.assets.push(grap);
        }
        this._unidadDescripcionService.update(this.ud);
      }
    });
  }

  addExternalAsset($event) {}

  action(action: string) {
    this.renderInputArea = false;
    this.actionSelected = action;
    this.renderInputArea = true;
    this.isDirty = true;
  }

  async saveForm(form) {
    let unidadDescripcion = this.isEdit ? this.ud : new UnidadDescripcion();
    unidadDescripcion.dataWord = this.text;
    unidadDescripcion.parent = this.parentUnidad;

    let requiereReconstruirJerarquia = false;
    if(this.actualParentId !== unidadDescripcion.parent.id_parent){
      console.log('Hubo cambio de parentID: [%s]::[%s]', this.actualParentId, unidadDescripcion.parent.id_parent);
      requiereReconstruirJerarquia = true;
      this.actualParentId = unidadDescripcion.parent.id_parent;
    }

    // Key 'audit'; datos del usuario creador
    const auditInfo = new AuditUD();
    auditInfo.lastModifiedDate = devutils.txFromDate(new Date());
    auditInfo.lastModifiedDateTs = devutils.dateNumFromTx(devutils.txFromDate(new Date()));
    auditInfo.lastModifiedUserID = this._userService.currentUser._id;
    auditInfo.lastModifiedUsername = this._userService.currentUser.username;
    auditInfo.lastModifiedUserEmail = this._userService.currentUser.email;

    const companyInfo = new CompanyUD();
    companyInfo.authorityRecordId = this.archivalInstitution._id;
    companyInfo.displayName = this.archivalInstitution.identityArea.authorizedName;
    companyInfo.identifier = this.archivalInstitution.controlArea.identifier;
    companyInfo.countryPrefix = this.archivalInstitution.identityArea.countryPrefix;

    unidadDescripcion.company = companyInfo;


    if (form.type === IDENTIFICADOR) {
      const identificador = new IdentificadorUD();
      Object.assign(identificador, form.value);
      unidadDescripcion.identificador = identificador;
      auditInfo.lastModifiedReason = 'Se modificó el área de IDENTIFICACIÓN';
    }

    if (form.type === DESCRIPTION) {
      const newAudit = new AuditUD();
      Object.assign(newAudit, form.value);
      unidadDescripcion.audit = newAudit;
    }

    if (form.type === CONTEXTO) {
      const contextArea = new ContextUD();
      Object.assign(contextArea, form.value);
      contextArea.creators = form.creators.map(item => {
        return {
          authorityRecordId: item._id,
          authorityRecordName: item.identityArea.authorizedName,
          authorityRecordIdentifier: item.controlArea.identifier
        };
      });
      unidadDescripcion.contexto = contextArea;
    }

    if (form.type === CONTENIDO) {
      const contenidoYEstructura = new ContenidoYEstructura();
      Object.assign(contenidoYEstructura, form.value);
      unidadDescripcion.contenidoYEstructura = contenidoYEstructura;
    }

    if (form.type === CONDICIONES) {
      const condYUso = new AccesoYUsoUD();
      Object.assign(condYUso, form.value);
      unidadDescripcion.accesoYUso = condYUso;
    }

    if (form.type === NOTAS) {
      const notas = new Array<string>();
      Object.assign(notas, form.value);
      unidadDescripcion.notes = notas;
    }

    if (form.type === DOC) {
      const document = new DocumentacionAsociadaUD();
      Object.assign(document, form.value);
      unidadDescripcion.documentacionAsociada = document;
    }

    if(form.type === CONTROL_DESCRIPCION) {
      const controlDeLaDescripcion = new ControlDescripcion();
      Object.assign(controlDeLaDescripcion, form.value);
      unidadDescripcion.controlDeLaDescripcion = controlDeLaDescripcion;
    }

    /**
     *  this.masterList = {
        materias: this.materias,
        lugares: this.lugares,
        autoridades: this.autoridades,
        nombres: this.nombres
      }
     */
    if(form.type === PUNTOSACCESO) {
      const puntoAcceso = new PuntoAcceso();
      puntoAcceso.name_access_points = form.value.nombres;
      puntoAcceso.subject_access_points = form.value.materias;
      puntoAcceso.place_access_points = form.value.lugares;
      puntoAcceso.genre_access_points = form.value.autoridades;
      unidadDescripcion.puntoAcceso = puntoAcceso;
    }

    if (!this.isEdit) {
      // Entonces estamos dando de alta
      auditInfo.creationUserID = this._userService.currentUser._id;
      auditInfo.creationUsername = this._userService.currentUser.username;
      auditInfo.creationUserEmail = this._userService.currentUser.email;

      unidadDescripcion.audit = auditInfo;

      this._unidadDescripcionService.create(unidadDescripcion).then(x => {
        this.isDirty = false;
        this._notificationService.success('Alta exitosa [' + x._id + ']');
        this._router.navigate([x._id], { relativeTo: this._route }).then();
      });
    }

    if (this.isEdit) {
      unidadDescripcion._id = this.unidadDescripcionId;

      // Key 'audit': datos de la última modificación
      if (form.type === DESCRIPTION) {
        Object.assign(auditInfo, form.value);
      } else {
        auditInfo.navance = this.ud.audit.navance;
      }

      auditInfo.creationDate = this.ud.audit.creationDate;
      auditInfo.creationDateTs = this.ud.audit.creationDateTs;
      auditInfo.creationUserID = this.ud.audit.creationUserID;
      auditInfo.creationUsername = this.ud.audit.creationUsername;
      auditInfo.creationUserEmail = this.ud.audit.creationUserEmail;

      unidadDescripcion.audit = auditInfo;

      this.updateDescription(unidadDescripcion, requiereReconstruirJerarquia);
    }
  }

  private updateDescription(unidadDescripcion: UnidadDescripcion, requiereReconstruirJerarquia: boolean) {
    this._unidadDescripcionService.update(unidadDescripcion).then(ud => {
      this.isDirty = false;
      this._notificationService.success('Editado con éxito [' + ud._id + ']');
      this.ud = ud;
      if(requiereReconstruirJerarquia){
        console.log('rehacer jerarquia BEGIN');
        this._unidadDescripcionService.updateChildTree(this.ud._id).subscribe(n =>{
          console.log('arbol revisado / actualizado: [%s]', n)
        })
      }
    });
  }

  loadText(text: string) {
    this.text = text;
  }

  public hasChanges(llama: string): boolean {
    if (((this.isEdit && this.textOriginal !== this.text)) || (this.isDirty)) {
      return true;
    }

    return false;
  }

  vinculoParent(parent: UnidadDescripcion) {
    if (parent) {
      const parentUD = new ParentUD();

      parentUD.id_parent = parent._id;
      parentUD.identifier = parent.identificador.identifier;
      parentUD.level_of_description = parent.identificador.level_of_description;
      parentUD.title = parent.identificador.title;

      this.parentUnidad = parentUD;
    } else {
      this.parentUnidad = null;
    }

    this.rebuildIdentifier();
  }

  /**
   * Almacena la organización que el usuario haya elegido en la lista desplegable
   * del encabezado de la página
   *
   * Pre: se requiere una organización
   * Post: sin valor de retorno
   *
   * @param company la organización a cargo de la U.D.
   */
  public updateCompany(company: AuthorityRecord) {
    this.archivalInstitution = company;
    this.rebuildIdentifier();
  }

  /**
   * Almacena el identificador para la U.D., que el usuario haya ingresado
   * en el formulario de área de identificación
   *
   * Pre: se requiere un identificador
   * Post: sin valor de retorno
   *
   * @param identifier el identificador a asignar a la U.D.
   */
  public updateIdentifier(identifier: string): void {
    this.udaIdentifier = identifier;
    this.rebuildIdentifier();
  }

  private async rebuildIdentifier() {
    const parentTree = await this.buildParentTree();
    this.udaReferenceCode = UnidadDescripcionHelper.buildIdentifierCode(this.archivalInstitution, this.udaIdentifier, parentTree);
  }

  // EXPERIMENTAL
  private async buildParentTree(): Promise<string[]> {
    const parentArray: string[] = [];
    let parentNode = null;

    if (this.parentUnidad && this.parentUnidad.id_parent) {
      parentNode = await this._unidadDescripcionService.findById(this.parentUnidad.id_parent);
      parentArray.push(parentNode.identificador.identifier);

      while (parentNode.parent && parentNode.parent.id_parent) {
          parentNode = await this._unidadDescripcionService.findById(parentNode.parent.id_parent);
          parentArray.push(parentNode.identificador.identifier);
      }

      parentArray.reverse();
    }
    return new Promise(resolve => resolve(parentArray));
  }

  public refreshUdaDialog(): void {
    modalConfig.data.caption = modalConfig.data.caption.replace('[%s]', this.ud.atomSlug);
    this._notificationService.openModalDialog(modalConfig)
    .subscribe(result => {
      if(result)
        this._unidadDescripcionService.fetchUDAFromAtoMSlug(this.ud.atomSlug).subscribe(
          result => {
            if(result){
              this._notificationService.success(`Sincronización de ${result.atomSlug} exitosa.`);
              this.initUDA();
            }
          }
        )
    })
  }

  public hideInputArea(): void {
    this.renderInputArea = false;
  }
}


