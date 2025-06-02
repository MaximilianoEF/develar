import { Component, OnInit } from '@angular/core';
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { FlatTreeControl } from '@angular/cdk/tree';
import {AssetTableData, FolderTree, IngestProcess} from '../../../ingesta.model';
import { DataSource } from '@angular/cdk/table';
import { IngestaHelper } from '../../../ingesta.helper';
import { IngestaService } from '../../../ingesta.service';
import {AssetService} from '../../../../../develar-commons/asset.service';
import {DerivadaModalService} from '../../../derivadas-factory/derivada-modal.service';
import { NotificationService } from '../../../../../develar-commons/notifications.service';


const CONFIRMATION_PDF_MODAL_CONFIG = {
  data: {
    caption: '¡Acción no permitida!',
    body: 'Está intentando generar un archivo PDF pero la carpeta de ingesta no tiene creadas sus respectivas derivadas. <br/> Ejecute el proceso de creación de las mismas y vuelva a intentar.',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    }
  }
};

const DIRECTORY: string = 'directory';
export class FolderNode {
  constructor(
    public item: string,
    public level = 1,
    public expandable = false,
    public children: Array<any>,
    public id: string,
    public fileType: string
  ) {}
}

export class DynamicDataSource implements DataSource<FolderNode> {
  dataChange = new BehaviorSubject<FolderNode[]>([]);

  get data(): FolderNode[] {
    return this.dataChange.value;
  }
  set data(value: FolderNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(
    private _treeControl: FlatTreeControl<FolderNode>,
    private tree: FolderTree
  ) {}

  connect(collectionViewer: CollectionViewer): Observable<FolderNode[]> {
    this._treeControl.expansionModel.changed.subscribe((change) => {
      if (
        (change as SelectionChange<FolderNode>).added ||
        (change as SelectionChange<FolderNode>).removed
      ) {
        this.handleTreeControl(change as SelectionChange<FolderNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(
      map(() => this.data)
    );
  }

  disconnect(collectionViewer: CollectionViewer): void {}

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<FolderNode>) {
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


  toggleNode(node: FolderNode, expand: boolean) {
    const children = node.children;
    const index = this.data.indexOf(node);
    if (!children || index < 0) {
      return;
    }

    if (expand) {
      const nodes = children.map((item) => {
        return new FolderNode(
          item.filename,
          node.level + 1,
          this.isExpandable(item),
          item.children,
          item._id,
          item.fileType
        );
      });
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
  selector: 'assets-tree',
  templateUrl: './assets-tree.component.html',
  styleUrls: ['./assets-tree.component.scss'],
  providers: [DerivadaModalService]
})
export class AssetsTreeComponent implements OnInit {
  treeControl: FlatTreeControl<FolderNode>;
  dataSource: DynamicDataSource;

  public pi$: BehaviorSubject<IngestProcess>;
  private _pi: IngestProcess;
  constructor(
              private ingestaService: IngestaService,
              private assetService: AssetService,
              private _derivadaModalService: DerivadaModalService,
              private _notificationService: NotificationService
  ) {
    this.treeControl = new FlatTreeControl<FolderNode>(
      this.getLevel,
      this.isExpandable
    );
    this.pi$ = this.ingestaService.pi$;
  }

  debug(node) {
    console.log(node)
  }

  ngOnInit(): void {
    this.pi$.subscribe(pi => {
      if (pi) {
        this._pi = pi;
        const matTreeData = IngestaHelper.buildTreeData(pi.assetList);
        this.dataSource = new DynamicDataSource(this.treeControl, matTreeData);
        this.dataSource.data = [
          new FolderNode(matTreeData.filename, 0, true, matTreeData.children, matTreeData._id, matTreeData.fileType),
        ];
      }
    });
  }

  /**
   * Abre la ventana modal para la generación de una derivada (archivo)
   *
   * @param assetId El ID del asset para el que se va a generar la derivada
   */
  crearDerivada(assetId): void {
      this.assetService.getAsset(assetId)
      .then((asset) => {

        if(asset && asset.fileType === DIRECTORY && this._pi && !this._pi.ingestFolder?.hasDerivadas) {
            this._notificationService.openModalDialog(CONFIRMATION_PDF_MODAL_CONFIG);
        } else {
          this._derivadaModalService.setupCrearDerivadaParaAssetModal(asset).subscribe(result => {
            if (result) {
              // console.info('abrirModalDerivadaArchivo -> result -> ', result)
              }
            });

        }
      }).catch((error) => {
        this._notificationService.error(`No se ha podido recuperar el asset ${assetId}`);
        console.error(error)
      });

  }

  /** Métodos utilizados en el funcionamiento del mat-tree */
  getLevel = (node: FolderNode) => node.level;
  isExpandable = (node: FolderNode) => node.expandable;
  hasChild = (_: number, _nodeData: FolderNode) => _nodeData.expandable;
}
