import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { IngestProcess, UnidadDescripcionTree, AssetHook } from '../../../ingesta.model';
import { DataSource } from '@angular/cdk/table';
import { FlatTreeControl } from '@angular/cdk/tree';
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { map } from 'rxjs/operators';
import { UnidadDescripcion } from '../../../../unidad-descripcion/unidad-descripcion.model';
import { IngestaService } from '../../../ingesta.service';
import { IngestaHelper } from '../../../ingesta.helper';
import { Router } from '@angular/router';
import { UnidadDescripcionModalService } from '../../../../unidad-descripcion/unidad-descripcion-modal.service';
import { UnidadDescripcionService } from '../../../../unidad-descripcion/unidad-descripcion.service';

/** Flat node with expandable and level information */
export class UnidadDescripcionNode {
  constructor(
    public item: string,
    public files: string,
    public level = 1,
    public index: number,                 // La ubicación del nodo dentro del árbol
    public expandable = false,
    public children: Array<any>,
    public _id: string,
    public assetIds: string[],
  ) {}
}

export class DynamicDataSource implements DataSource<UnidadDescripcionNode> {
  dataChange = new BehaviorSubject<UnidadDescripcionNode[]>([]);

  get data(): UnidadDescripcionNode[] {
    return this.dataChange.value;
  }
  set data(value: UnidadDescripcionNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(
    private _treeControl: FlatTreeControl<UnidadDescripcionNode>,
    private tree: UnidadDescripcionTree,
    private assetHookList: AssetHook[]
  ) { }

  connect(collectionViewer: CollectionViewer): Observable<UnidadDescripcionNode[]> {
    this._treeControl.expansionModel.changed.subscribe((change) => {
      if ((change as SelectionChange<UnidadDescripcionNode>).added || (change as SelectionChange<UnidadDescripcionNode>).removed) {
        this.handleTreeControl(change as SelectionChange<UnidadDescripcionNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(
      map(() => this.data)
    );
  }

  disconnect(collectionViewer: CollectionViewer): void {}

  handleTreeControl(change: SelectionChange<UnidadDescripcionNode>) {
    if (change.added) {
      change.added.forEach((node) => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach((node) => this.toggleNode(node, false));
    }
  }

  isExpandable(node: any): boolean {
    return node.children && node.children.length ? true : false;
  }

  toggleNode(node: UnidadDescripcionNode, expand: boolean) {
    const children = node.children;
    const index = this.data.indexOf(node);
    if (!children || index < 0) {
      return;
    }

    if (expand) {
      const nodes = children.map(
        (item, index) =>
          new UnidadDescripcionNode(
            item.title,
            IngestaHelper.buildFileListFromAssetHook(item._id, this.assetHookList),
            node.level + 1,
            index + 1,
            this.isExpandable(item),
            item.children,
            item._id,
            this.assetHookList.map((item) => item.assetId)
          )
      );
      this.data.splice(index + 1, 0, ...nodes);
    } else {
      let count = 0;
      for (
        let i = index + 1;
        i < this.data.length && this.data[i].level > node.level;
        i++, count++
      ) {}
      this.data.splice(index + 1, count);
    }

    // notify the change
    this.dataChange.next(this.data);
  }
}

@Component({
  selector: 'uda-tree',
  templateUrl: './uda-tree.component.html',
  styleUrls: ['./uda-tree.component.scss'],
  providers: [UnidadDescripcionModalService]
})
export class UdaTreeComponent implements OnInit {
  /** Subject para obtener el P.I. del servicio */
  public pi$: BehaviorSubject<IngestProcess>;
  /** Subject para obtener la U.D. del servicio */
  public ud$: BehaviorSubject<UnidadDescripcion>;

  /** Propiedades que determinan el funcionamiento del mat-tree */
  treeControl: FlatTreeControl<UnidadDescripcionNode>;
  dataSource: DynamicDataSource;

  /** Propiedades que determinan el funcionamiento de la creación de UDC/UDS */
  public currentTree: UnidadDescripcionTree;
  public assetHookList: AssetHook[] = [];



  constructor(
    private ingestService: IngestaService,
    private router: Router,
    private _unidadDescripcionModalService: UnidadDescripcionModalService,
    private _unidadDescripcionService: UnidadDescripcionService
  ) {
    this.pi$ = this.ingestService.pi$;
    this.ud$ = this.ingestService.ud$;

    this.treeControl = new FlatTreeControl<UnidadDescripcionNode>(
      this.getLevel,
      this.isExpandable
    );
  }

  ngOnInit(): void {
    this.pi$.subscribe((pi) => {
      if (pi.udaList && pi.udaList.length > 0) {
        const matTreeData = IngestaHelper.buildUDTreeData(
          pi.udaList,
          pi.udaList[0]._id
        );
        this.assetHookList = pi.assetHookList;
        this.dataSource = new DynamicDataSource(this.treeControl, matTreeData, pi.assetHookList);

        this.dataSource.data = [
          new UnidadDescripcionNode(
            matTreeData.title,
            IngestaHelper.buildFileListFromAssetHook(matTreeData._id, pi.assetHookList),
            0,
            0,
            true,
            matTreeData.children,
            matTreeData._id,
            pi.assetHookList.map((item) => item.assetId)
          ),
        ];
      }
    });
  }

  public getAssetIdFromAssetHookListWithNode(assetFileName) : string {
    if(this.assetHookList && this.assetHookList.length){
      const asset = this.assetHookList.find(a => a.assetFilename === assetFileName);
      return asset ? asset.assetId : '';
    }
    return ''
  }

  public goToEditView(id: string): void {
    //this.router.navigate(['unidad-descripcion','factory',id]).then();
  }

    /** Métodos relacionados con el funcionamiento de Material Tree */
  getLevel = (node: UnidadDescripcionNode) => node.level;
  isExpandable = (node: UnidadDescripcionNode) => node.expandable;
  hasChild = (_: number, _nodeData: UnidadDescripcionNode) => _nodeData.expandable;


  /**
   * Desplega el modal de edición de UDA; el modal devolverá la UDA ya editada,
   * que habrá que almacenar
   *
   * @param udaId el ID de la UDA que se va a editar
   */
  abrirMiniEditorUda(udaId: string): void {
    this._unidadDescripcionModalService.openUdaMiniEditorModal(udaId)
      .subscribe(uda => {

        if (uda) {
          // Actualizo la UDA
          this._unidadDescripcionService.update(uda)
            .then(result => console.log('UDA actualizada OK'))
            .catch(err => console.error(err));

          // Actualizo el array de udaList del parte de ingesta
          const piActual = this.pi$.getValue();

          piActual.udaList = piActual.udaList.map(udaItem => {

            if (udaItem._id === uda._id) {
              udaItem.identificador.title = uda.identificador.title;
              udaItem.identificador.identifier = uda.identificador.identifier;
              udaItem.identificador.dates = uda.identificador.dates;
            }

            return udaItem;
          })

          this.ingestService.update(piActual._id, piActual)
            .then(result => console.log('PI actualizado OK'))
            .catch(err => console.error(err));
        }

      });
  }

}
