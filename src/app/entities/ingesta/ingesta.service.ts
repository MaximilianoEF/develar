import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subject } from 'rxjs';
import { concatMap, map,switchMap, tap } from 'rxjs/operators';
import { DaoService } from '../../develar-commons/dao.service';
import {
  FolderTree,
  IngestProcess,
  IngestProcessDataTable,
  ScanFolder,
  MsrvTask,
  UnidadDocumentalSimple,
  AssetTableData,
  QueueProgress
} from './ingesta.model';

import { UnidadDescripcionQuery, UnidadDescripcion, } from '../unidad-descripcion/unidad-descripcion.model';

import { UnidadDescripcionService } from '../unidad-descripcion/unidad-descripcion.service';
import { Asset, Serial } from '../../develar-commons/develar-entities';
import  {devutils }  from '../../develar-commons/utils';
import { AssetHook, Stack, UdaHook } from './ingesta.model';
import { UnidadDescripcionHelper } from '../unidad-descripcion/unidad-descripcion.helper';
import { IngestaHelper } from './ingesta.helper';
import { UserService } from '../user/user.service';
import { User } from '../user/user';

const RECORD: string = 'ingesta';
const RECORD_MSRV = 'msrvgestiondoc';

// Es el nivel de descripción en el que debemos buscar para localizar
// unidades documentales compuestas
const RECORD_UDC_TYPE: string = 'unidad documental';
const RECORD_UDS_TYPE: string = 'item';
const ITEM_ROLE_MASTER: string = 'master';

const PROGRESS: string = 'progress';
const DERIVADA_PROGRESS:  string = 'derivada-progress';
const THUMBNAIL_PROGRESS: string = 'thumbnail-progress';
const PDF_PROGRESS: string = 'pdf-progress';
@Injectable({
  providedIn: 'root',
})
export class IngestaService {
  public ud$: BehaviorSubject<UnidadDescripcion>;
  public pi$: BehaviorSubject<IngestProcess>;

  public assetTree$: BehaviorSubject<Asset[]>;
  public assetTree: Asset[];
  public estadosCI$: BehaviorSubject<any[]>;
  private adminUsers: User[] = [];

  private _assetDataSource: BehaviorSubject<AssetTableData[]> = new BehaviorSubject<AssetTableData[]>([]);

  private _unidadDocumentalSimpleDataSource = new BehaviorSubject<IngestProcessDataTable[]>([]);
  public inProgressDerivada$: BehaviorSubject<boolean>;
  public inProgressThumbnail$: Subject<boolean>;
  public inProgressAssets$ = new BehaviorSubject<boolean>(false);

  public thumbnailProgressInfo$ = new BehaviorSubject<string>('Procesando ...');
  public derivadaProgressInfo$ = new BehaviorSubject<string>('Procesando ...');
  public pdfProgressInfo$ = new BehaviorSubject<string>('Procesando ...');
  public pdfWorkInProgress$ = new BehaviorSubject<boolean>(false);
  public initProcessThumbnail$ = new Subject<boolean>();
  public initProcessDerivada$ = new Subject<boolean>();
  constructor(
        private _dao: DaoService,
        private userService: UserService,
        private _unidadDescripcionService: UnidadDescripcionService
      )
  {
    this.ud$ = new BehaviorSubject<UnidadDescripcion>(null);
    this.pi$ = new BehaviorSubject<IngestProcess>(null);
    this.assetTree$ = new BehaviorSubject<Asset[]>([]);
    this.estadosCI$ = new BehaviorSubject<any[]>([]);
    this.inProgressDerivada$ = new BehaviorSubject<boolean>(false);
    this.inProgressThumbnail$ = new Subject<boolean>();
    this.updateAdminUsersList();
  }

  public findByQueryWithToken(token: string, val: any): Observable<UnidadDescripcion[]> {
    const query = new UnidadDescripcionQuery();
    query[token] = val;

    return this._unidadDescripcionService.search(query);
  }

  public findByQuery(query): Observable<IngestProcess[]> {
    return this._dao.search<IngestProcess>(RECORD, query);
  }

  public update(id: string, entity: IngestProcess): Promise<IngestProcess> {
    return this._dao.update(RECORD, id, entity);
  }

  public create(ingesta): Promise<IngestProcess> {
    return this._dao.create<IngestProcess>(RECORD, ingesta);
  }

  public findByID(id: string): Promise<IngestProcess> {
    return this._dao.findById(RECORD, id);
  }

  public getNextSerial(serial: Serial): Observable<Serial> {
    let fecha = new Date();
    serial.anio = fecha.getFullYear();
    serial.mes = (fecha.getMonth() + 1);
    serial.dia = fecha.getDate();
    return this._dao.nextSerial<Serial>('serial', serial);
  }

  /**
   * USERS con rol digitalizacion:admin
   * @returns
   */
  public updateAdminUsersList() {
    this.userService.fetchUserByRole('digitalizacion:admin').subscribe(users => {
      if (users && users.length) {
        this.adminUsers = users;
      } else {
        this.adminUsers = [];
      }
    })
  }

  /**
   * @param folder carpeta a examinar, leída a partir de la rootPath
   * @returns Observable<ScanFolder>
   */
  public getResumenFromFolder(folder: string, server: string): Observable<ScanFolder> {
    const query = { folder, server };

    return this._dao.getResumenFromFolder(RECORD, query);
  }

  public getFolderTree(folder: string): Promise<FolderTree> {
    const query = { folder };
    return this._dao.getFolderTree(RECORD, query);
  }

  /**
   * Métodos para manejo de assets
   */
  public getAssetTree(folder: string, server: string): Observable<Asset[]> {
    const query = { folder, server };
    return this._dao.getAssetTree<Asset>(RECORD, query);
  }

  /**
   * @param folder
   * @param server
   * @returns
   */
  public fetchAssetTree(folder: string, rootFolder: string, server: string): BehaviorSubject<Asset[]> {
    const subject = new BehaviorSubject<Asset[]>([]);
    this.loadAssetTree(subject, folder, server);
    return subject;
  }

  private loadAssetTree(subject: BehaviorSubject<Asset[]>, folder: string, server: string): void {
    this.getAssetTree(folder, server).subscribe(assets => {
      if (assets && assets.length > 0) {
        this.assetTree = assets;
      } else {
        this.assetTree = [];
      }
      subject.next(this.assetTree);
    });
  }

  /**
   * Dispara un proceso en Redis para que se generen o regeren los thumbnails de las imágenes
   * contenidas en la carpeta de ingesta
   *
   * @param pi el parte de ingesta para el que se desea generar o regenerar los thumbnails
   */
  public buildThumbnailsForIngestFolder(pi: IngestProcess): Promise<any> {
    if (this.pi$.value) {
      let pi = this.pi$.value;
      const task = new MsrvTask();
      task.taskName = 'pingesta:ingestfolder:buildthumbnails';
      task.route = '/thumbnails';
      task.action = 'buildthumbnails';
      task.status = 'wip';
      task.entityId = pi._id;

      return this._dao.pushMsrvTask<MsrvTask>(RECORD_MSRV, task)
        .then((task) => { })
        .catch((error) => console.error(error))
    }
    return null;
  }

  /**
   * Dispara un proceso en Redis para que se generen o regeren las derivadas-factory de las imágenes
   * contenidas en la carpeta de ingesta
   *
   * @param pi el parte de ingesta para el que se desea generar o regenerar las derivadas-factory
   */
  public buildDerivadasForIngestFolder(pi: IngestProcess): Promise<any> {
    if (this.pi$.value) {
      let pi = this.pi$.value;
      const task = new MsrvTask();
      task.taskName = 'pingesta:ingestfolder:buildderivadas';
      task.route = '/derivadas';
      task.action = 'buildderivadas';
      task.status = 'wip';
      task.entityId = pi._id;

     return this._dao.pushMsrvTask<MsrvTask>(RECORD_MSRV, task)
        .then((task) => { })
        .catch((error) => console.error(error))
    }
    return null;
  }

  /**
   * TABLE METHODS
   * @param term
   * @returns
   */
  public refreshDataSourceTable(term: string): BehaviorSubject<UnidadDocumentalSimple[]> {
    const subject = new BehaviorSubject<UnidadDocumentalSimple[]>([]);
    this._filterUDS(subject, term);
    return subject;
  }

  private _filterUDS(
    subject: BehaviorSubject<UnidadDocumentalSimple[]>,
    term: string
  ): void { }

  get dataRecordsSource(): BehaviorSubject<IngestProcessDataTable[]> {
    return this._unidadDocumentalSimpleDataSource;
  }


  public queueProgress(): Observable<QueueProgress[]>{
    return interval(5000).pipe(
      switchMap(() => this.fetchQueueProgress())
    )
  }

  public derivadaQueueProgress(): Observable<QueueProgress[]>{
    return interval(10000).pipe(
      switchMap(() => this._fetchDerivadaQueueProgress())
    )
  }

  public thumbnailQueueProgress(): Observable<QueueProgress[]>{
    return interval(10000).pipe(
      switchMap(() => this._fetchThumbnailQueueProgress())
      // concatMap(() => this._fetchThumbnailQueueProgress())
    )
    // return this._fetchThumbnailQueueProgress();
  }

  public pdfQueueProgress(): Observable<QueueProgress[]>{
    return interval(5000).pipe(
      switchMap(() => this._fetchPDFQueueProgress())
    )
  }

  private _fetchPDFQueueProgress(): Observable<QueueProgress[]> {
    return this._dao.fetchQueueStatus<QueueProgress>(PDF_PROGRESS)
  }

  private _fetchThumbnailQueueProgress(): Observable<QueueProgress[]> {
    return this._dao.fetchQueueStatus<QueueProgress>(THUMBNAIL_PROGRESS);
  }

  private _fetchDerivadaQueueProgress(): Observable<QueueProgress[]> {
    return this._dao.fetchQueueStatus<QueueProgress>(DERIVADA_PROGRESS);
  }

  private fetchQueueProgress(): Observable<QueueProgress[]>{
    return this._dao.fetchQueueStatus<QueueProgress>(PROGRESS)
  }

  /**
   * bagit!
  */
  public pushBagitTask(pi: IngestProcess): void {
    if (this.pi$.value) {
      let pi = this.pi$.value;

      let task = new MsrvTask();
      task.taskName = 'bagit:pingesta:ingestfolder';
      task.route = '/pushbagit';
      task.action = 'bagit';
      task.status = 'wip';
      task.entityId = pi._id;

      this._dao.pushMsrvTask<MsrvTask>(RECORD_MSRV, task).then(task => {
        this.update(pi._id, pi).then(pi => {
        })
      })

    }
  }



  public pushRsyncIngestToMasterTask(pi: IngestProcess): void {
    if (this.pi$.value) {
      let pi = this.pi$.value;
      let task = new MsrvTask();
      task.taskName = "rsync:ingest:master";
      task.route = '/rsync/ingesttomaster';
      task.action = 'rsync';
      task.status = 'wip';
      task.entityId = pi._id;

      this._dao.pushMsrvTask<MsrvTask>(RECORD_MSRV, task).then(task => {
        this.update(pi._id, pi).then(pi => {

        })
        // c onsole.log('call back!!!')
        // c onsole.dir(task)
      })

    }
  }

  /**
   * Genera una nueva tarea invocando al microservicio rsync, de manera de copiar
   * una root-folder de un parte de ingesta hacia el área de derivadas-factory
   * @param pi el parte de ingesta a 'ingestar' hacia el área de derivadas-factory
   */
  public pushRsyncIngestToDerivadaTask(pi: IngestProcess): void {
    if (this.pi$.value) {
      let pi = this.pi$.value;
      let task = new MsrvTask();
      task.taskName = 'rsync:ingest:derivada';
      task.route = '/rsync/ingesttoderivadas';
      task.action = 'rsync';
      task.status = 'wip';
      task.entityId = pi._id;

      this._dao.pushMsrvTask<MsrvTask>(RECORD_MSRV, task).then(task => {
        this.update(pi._id, pi).then(pi => {
        });
      });
    }
  }

  private _buildUdaIdentifier(index: number, isDirectory:boolean, assetHook: AssetHook, assetIdentifier: string, prefix?: string): string{
    let numIdentifier = ('0000' + index).slice(-4);
    let identifier = '';
    if(isDirectory){
      if(assetIdentifier) {
        //Si existen, eliminamos los leading y/o trailing underscore.
        identifier = `${devutils.cleanLeadingAndTrailingUnderscores(assetHook.assetName)}_${numIdentifier}`;
        //identifier = assetHook.assetName.replace(/_+$/, '').replace(/^_/, '') + '_' + numIdentifier;
      } else {
        identifier = prefix ? prefix + '_' + numIdentifier : numIdentifier;
      }

    }else{
      if(assetIdentifier){
        identifier =  prefix ? prefix + '_' + assetIdentifier + '_' + numIdentifier : assetIdentifier + '_' + numIdentifier;

      }else {
        identifier =  prefix ? prefix + '_' + numIdentifier : numIdentifier;

      }
    }

    identifier = devutils.normalizeUdaIdentifier(identifier);

    return identifier;
  }

  private _buildUdaTitle(index: number, type: string,  prefix?: string): string{
    let numIdentifier = ('0000' + index).slice(-4);
    return prefix ? prefix + '_' + type + '_' + numIdentifier : type + '_' + numIdentifier;
  }
  /**
   * Métodos relacionados a la construcción del árbol de UDC-UDS y su apareo
   * ('matching') con los assets
   */


  /**
   * Construye una unidad de descripción archivística (UDC o UDS)
   */
  private async buildUDAFromAsset(
    assetHook: AssetHook,
    parentUda: UnidadDescripcion,
    formData,
    isDirectory: boolean,
    isRootFolder: boolean,
    index: number,
    udaHook: UnidadDescripcion,
    dateTx: string,
    dateTs: number
  ): Promise<UnidadDescripcion> {
    const udaToBuild = new UnidadDescripcion();

    /** Propiedades generales */
    udaToBuild.parent = UnidadDescripcionHelper.buildParentFromUd(parentUda);
    let assetIdentification = '';
    if(formData.identifyFromFilename && !isDirectory) {
      assetIdentification = this._findAssetIdentificationFile(assetHook, formData.splitCaracterF);
    } else if (formData.identifyFromDirectoryName && isDirectory) {
      assetIdentification =  this._findAssetIdentificationDirectory(assetHook, formData.splitCaracterD);
    } else if (formData.identifyFromDirectoryNameExact && isDirectory) {
      //Si existen, eliminamos los leading y/o trailing underscore.
      // assetIdentification =  assetHook.assetName.replace(/_+$/, '').replace(/^_/, '');
      assetIdentification = devutils.cleanLeadingAndTrailingUnderscores(assetHook.assetName);
    }

    udaToBuild.audit.inventario = assetIdentification ? assetIdentification : formData.identifierBase;
    udaToBuild.identificador.reference_code = [...parentUda.identificador.reference_code];
    udaToBuild.identificador.dates = [ ...udaHook.identificador.dates ];

    udaToBuild.identificador.identifier = this._buildUdaIdentifier(index, isDirectory, assetHook, assetIdentification,
                                                                    formData.identifierBase);

    udaToBuild.identificador.reference_code.push(udaToBuild.identificador.identifier);

    if (isDirectory) {
      // Construir UDC
      udaToBuild.identificador.level_of_description = RECORD_UDC_TYPE;
      udaToBuild.identificador.title = formData.identifyFromDirectoryName ?
        assetHook.assetName : this._buildUdaTitle(index, 'UDC', formData.slugBase);

      // Ver qué hacer con esto; el parent no tiene 'dates', a menos que se traigan de la UD
      // udaToBuild.identificador.dates;
    } else {
      // Construir UDS
      udaToBuild.identificador.level_of_description = RECORD_UDS_TYPE;
      udaToBuild.identificador.title = udaToBuild.parent.title + '_' + (formData.identifyFromFilename && assetIdentification ?
        assetIdentification : this._buildUdaTitle(index, 'UDS', formData.slugBase));
    }

    udaToBuild.company = { ...udaHook.company };

    udaToBuild.audit.creationUserID = this.userService.currentUser ? this.userService.currentUser._id : '';
    udaToBuild.audit.creationUsername = this.userService.currentUser ? this.userService.currentUser.username : '';
    udaToBuild.audit.creationUserEmail = this.userService.currentUser ? this.userService.currentUser.email : '';
    udaToBuild.audit.creationDate = dateTx;
    udaToBuild.audit.creationDateTs = dateTs;
    udaToBuild.audit.isIngestado = true;
    udaToBuild.audit.lastModifiedReason = 'Ingestado el ' + dateTx;

    return await this._unidadDescripcionService.create(udaToBuild);

  }

  /**
   * Actualiza un asset-hook, vinculándolo con la Unidad de Descripción
   * Archivística recibida por parámetro
   *
   * Pre: una unidad de descripcion archivística y un asset-hook
   * Post: Promise<any>
   */
  private async updateAssetHook(uda: UnidadDescripcion, assetHook: AssetHook) {
    assetHook.itemId = uda._id;
    assetHook.itemParentId = (uda.parent && uda.parent.id_parent) ||  null;
    assetHook.itemIdentifier = uda.identificador.identifier;
    assetHook.itemLevel = uda.identificador.level_of_description;
    assetHook.itemName = uda.identificador.title;
    assetHook.itemRole = ITEM_ROLE_MASTER;
    assetHook.isVinculado = true;
  }

  private _findAssetIdentificationFile(assetHook: AssetHook, split: string = '_'): string{
    let identif = '';
    let asset = assetHook.assetName;
    if(asset){
      let tokens = asset.split(split);
      if(tokens && tokens.length){
        let items = tokens.filter(t => {
          let num = parseInt(t,10);
          if(!isNaN(num)){
            return true;
          }else{
            return false;
          }
        });

        if(items && items.length) {
          items.sort()
          return items[items.length-1]
        }

      }
    }
    return identif;
  }

  private _findAssetIdentificationDirectory(assetHook: AssetHook, split: string = '-'): string {
    const asset = assetHook.assetName;
    if(asset){
      const tokens = asset.split(split);
        if(tokens && tokens.length) {

          return tokens[tokens.length-1]
        }

      }

    return '';
  }

  /**
   * Genera el árbol de UDC-UDS a partir de una lista de asset-hooks
   *
   * Pre
   * - unidad de descripción archivística de la cual 'colgará' la UDC
   *   correspondiente a la root-folder
   * - Lista de asset-hooks, partiendo de ellos se generará el árbol
   * - Datos adicionales (cardinalidad asset-a-UDS; identificador de base
   *   para las UDAs que están siendo creadas)
   */
  async createUDAsFromAssets(udaHook: UnidadDescripcion, assetHookList: AssetHook[], formData) {

    /** Contador de assets */
    let assetIndex = 0;
    /** Contador de directorios */
    let folderIndex = 1;

    let isDirectory = false;
    let isRootFolder = true;

    const udaList = [];

    let currentParent = udaHook;
    let dateTs = Date.now();
    let dateTx = devutils.txFromDateTime(dateTs);


    for (let i = 0; i < assetHookList.length; i++) {
      const assetHook = assetHookList[i];
      currentParent = this.findParent(udaHook, currentParent, assetHook, assetHookList, udaList)

      // OjO... assetHoo.asseType, debería ser fileType
      if (assetHook.assetType === 'directory') {

        isDirectory = true;
        const nuevoUDC = await this.buildUDAFromAsset(assetHook, currentParent, formData, isDirectory, isRootFolder,
                folderIndex, udaHook, dateTx, dateTs);

        await this.updateAssetHook(nuevoUDC, assetHook);
        udaList.push(nuevoUDC);

        isRootFolder = false;
        assetIndex = 0;
        folderIndex++;

      } else {

        isDirectory = false;
        assetIndex++;
        const modulo = (assetIndex + parseInt(formData.relAssetUds, 10) - 1) % parseInt(formData.relAssetUds, 10);
        let nuevaUDS: UnidadDescripcion;

        if (modulo === 0) {
          nuevaUDS = await this.buildUDAFromAsset(assetHook, currentParent, formData, isDirectory, isRootFolder,
                  assetIndex, udaHook, dateTx, dateTs);

          await this.updateAssetHook(nuevaUDS, assetHook);
          udaList.push(nuevaUDS);
        } else {
          await this.updateAssetHook(nuevaUDS, assetHook);
        }

      }
    }

    /**
     * En udaList tenemos el listado de UDAs generadas, las almacenamos
     * en el proceso de ingesta
     */
    const pi = this.pi$.value;
    pi.udaList = udaList;
    pi.assetHookList = assetHookList;

    try {
      await this.update(pi._id, pi);
      this.pi$.next(pi);
      this.ud$.next(udaHook);
    } catch (error) {
      console.error('ERROR AL ACTUALIZAR EL PI; WIP');
    }
  }

  // la estructura de los UDC/UDS copian la estructura de las carpetas
  private findParent(udaHook: UnidadDescripcion, currentParent: UnidadDescripcion, assetHook: AssetHook, assetHookList: AssetHook[], udaList: UnidadDescripcion[]): UnidadDescripcion{
    let assetParentId = assetHook.assetParentId;

    // es la rootFolder, no tiene parent, el UDC se colgará del udaHook
    if(!assetParentId ) return udaHook;

    // buscamos el parent en la lista de assetHooks
    let parentAssetHook = assetHookList.find(ah => ah.assetId === assetParentId);

    if(parentAssetHook){
      // es el mismo parent que el actual? (evito volver a buscarlo)
      if(parentAssetHook.itemId === currentParent._id) return currentParent;

      // nuevo Parent, que ya debería estar en la udaList
      let newParent = udaList.find(ud => ud._id === parentAssetHook.itemId);
      if(newParent){
        return newParent;
      }else {
        console.error('b) no encontramos paent! todo')
      }

    }else {
      console.error('a) no encontramos paent! todo')
    }

    return currentParent
  }

  /**
   * A partir de una UdaHook (key 'ingestprocesses.udaHook') obtiene los datos
   * completos de una UDA, construye y devuelve una UDA
   *
   * Pre: udaHook con datos mínimos (en particular ID Mongo de la UDA)
   * Post: objeto UnidadDescripcion completo
   */
  public async buildUDAFromHook(udaHook: UdaHook): Promise<UnidadDescripcion> {
    return await this._unidadDescripcionService.findById(udaHook.udaId);
  }


  /** Table Asset */

  public updateAssetTableData(): void {
    const assetTableData = IngestaHelper.buildAssetDataTable(this.pi$.value.assetList);
    this._assetDataSource.next(assetTableData);
  }

  get dataAssetSource(): BehaviorSubject<AssetTableData[]> {
    return this._assetDataSource;
  }

  changeStateToManifiestoVerify(ip: IngestProcess): Array<string> {
    let errorMsgs = [];

    if (ip.admin.avance !== 'aprobado') {
      errorMsgs.push('El PI debe estar en estdo APROBADO ');
    }

    let user = this.userService.currentUser;
    let isAdminUser = this.adminUsers.find(usr => user.username === usr.username) ? true : false;
    if (!isAdminUser) {
      errorMsgs.push('El usuario debe tener rol administrador ');
    }

    return errorMsgs;
  }

  changeStateToBagit(ip: IngestProcess): Array<string> {
    let errorMsgs = [];

    if (ip.admin.avance !== 'manifiesto') {
      errorMsgs.push('El estado de avance del PI debe incluir la creación del MANIFIESTO');
    }

    let user = this.userService.currentUser;
    let isAdminUser = this.adminUsers.find(usr => user.username === usr.username) ? true : false;
    if (!isAdminUser) {
      errorMsgs.push('El usuario debe tener rol administrador ');
    }

    return errorMsgs;
  }

  changeStateToIngesta(ip: IngestProcess): Array<string> {
    let errorMsgs = [];

    if (ip.admin.avance !== 'bagit') {
      errorMsgs.push('El estado de avance del PI debe incluir la operación BAGIT');
    }

    let user = this.userService.currentUser;
    let isAdminUser = this.adminUsers.find(usr => user.username === usr.username) ? true : false;
     if (!isAdminUser) {
      errorMsgs.push('El usuario debe tener rol administrador ');
    }

    return errorMsgs;
  }

  /**
   * INGEST APROVAL
   *  PRE-CONDITIONS
        - avance = en proceso
        - use.roles: digitalizacion:admin
        - tiene carpeta, uda
        - tiene ingestFolder
        - ingestPlan.userAdmin is not null
   */
  changeStateToAprovalVerify(ip: IngestProcess): Array<string> {
    let errorMsgs = [];

    if (ip.admin.avance !== 'en_proceso') {
      errorMsgs.push('El PI debe estar en estdo EN PROCESO ');
    }

    let user = this.userService.currentUser;
    let isAdminUser = this.adminUsers.find(usr => user.username === usr.username) ? true : false;
    if (!isAdminUser) {
      errorMsgs.push('El usuario debe tener rol administrador ');
    }

    if (!(ip.ingestPlan && ip.ingestPlan.informeTxt && ip.ingestPlan.ingestParams && ip.ingestPlan.ingestParams.machineId)) {
      errorMsgs.push('No se completó información técnica del PI');
    }

    if (!IngestaHelper.hasProperIngestFolder(ip)) {
      errorMsgs.push('La ruta a la carpeta de ingesta no está correctamente definida ');
    }

    if (!IngestaHelper.hasProperUdaHook(ip)) {
      errorMsgs.push('No se ha establecido la UDA base');
    }

    if (!IngestaHelper.hasProperAssetHook(ip)) {
      errorMsgs.push('No se han creado los nuevos UDC/ UDS asociados a el material digitalizado');
    }

    return errorMsgs;
  }

  /**
   *
   * @param pi
   *  - update key admin:
   *      --admin.estado: activo
          --admin.avance: aprobado
          --admin.avanceList: pushear aprobado
          --admin.approvedBy: Audit
      - updateStatistics
      - update in backend:
        - BORRAR la lista de assets y udas, solo quedan los asset-Hook-list
      -
   *
   */
  markProcessAsAproved(pi: IngestProcess, avance: string): Promise<IngestProcess> {
    pi = IngestaHelper.updateAvance(pi, avance);

    let audit = IngestaHelper.buildAudit(this.userService.currentUser);

    pi.admin.approvedBy = audit;

    pi = IngestaHelper.updateStatistics(pi)

    return this._dao.ingestWorkflow<IngestProcess>(RECORD, avance, pi);
  }

  addManifiestoToRootFolder(pi: IngestProcess, avance: string): Promise<IngestProcess> {
    pi = IngestaHelper.updateAvance(pi, avance);

    return this._dao.ingestWorkflow<IngestProcess>(RECORD, avance, pi);
  }

  addBagitToRootFolder(pi: IngestProcess, avance: string) {
    pi = IngestaHelper.updateAvance(pi, avance);
    this.pushBagitTask(pi);
  }

  ingestRootFolder(pi: IngestProcess, avance: string) {
    pi = IngestaHelper.updateAvance(pi, avance);

    if (pi.admin.tipoParte === 'master') {
      this.pushRsyncIngestToMasterTask(pi);
    } else {
      this.pushRsyncIngestToDerivadaTask(pi);
    }
  }

  async matchingUDAsFromAssets(uda: UnidadDescripcion, assetHookList: AssetHook[], items: UnidadDescripcion[]) {
    /** Contador de assets */
    let assetIndex = 0;
    /** Contador de directorios */
    let folderIndex = 1;

    let isDirectory = false;
    let isRootFolder = true;

    const udaList = [];

    const parentStack = new Stack<UnidadDescripcion>();
    parentStack.push(uda);

    let udsParent = uda;


    for (let i = 0; i < assetHookList.length; i++) {
      if (assetHookList[i].assetType === 'directory') {
        isDirectory = true;
        const currentParent = parentStack.peek(); // [ROOT-UDA]

        const udc = items.find(f => f.identificador.level_of_description === RECORD_UDC_TYPE);

        if (udc) {
          this.updateAssetHook(udc, assetHookList[i]).then();

          udaList.push(udc);
          parentStack.push(udc); // [ROOT-UDA, ROOT_FOLDER-UDC]
          isRootFolder = false;

          assetIndex = 0;
          folderIndex++;

          udsParent = null;
          items.slice(items.indexOf(udc),1);
        }
      } else {
        isDirectory = false;
        assetIndex++;

        if (udsParent === null) {
          udsParent = parentStack.pop(); // [ROOT-UDA]
        }

        const uds = items.find(f => f.identificador.level_of_description === RECORD_UDS_TYPE);

        if (uds) {
          this.updateAssetHook(uds, assetHookList[i]).then();
          udaList.push(uds);
        }
      }
    }

    /**
     * En udaList tenemos el listado de UDAs generadas, las almacenamos
     * en el proceso de ingesta
     */
    const pi = this.pi$.value;
    pi.udaList = udaList;
    try {
      await this.update(pi._id, pi);
      this.pi$.next(pi);
      this.ud$.next(uda);
    } catch (error) {
      console.error('ERROR AL ACTUALIZAR EL PI; WIP');
    }
  }

}
