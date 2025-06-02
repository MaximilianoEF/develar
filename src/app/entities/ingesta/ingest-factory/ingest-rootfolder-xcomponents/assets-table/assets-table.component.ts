import {CollectionViewer, SelectionModel} from '@angular/cdk/collections';
import {DataSource} from '@angular/cdk/table';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AssetTableData} from '../../../ingesta.model';
import {IngestaService} from '../../../ingesta.service';
import {IngestaModalService} from '../../ingesta-modal.service';
import {AssetService} from '../../../../../develar-commons/asset.service';
import {NotificationService} from '../../../../../develar-commons/notifications.service';
import {DerivadaModalService} from '../../../derivadas-factory/derivada-modal.service';

class AssetTableDataSource extends DataSource<AssetTableData> {
  private data$: BehaviorSubject<AssetTableData[]>;

  constructor(
    recordsSource$: BehaviorSubject<AssetTableData[]>,
    private _paginator: MatPaginator,
    private _sort: MatSort
  ) {
    super();
    this.data$ = recordsSource$;
  }

  connect(collectionViewer: CollectionViewer): Observable<AssetTableData[]> {
    const displayDataChanges = [
      this.data$,
      this._paginator.page,
      this._sort.sortChange,
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        const data = this._getSortedData();
        this._paginator.length = data.length;
        const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
        return data.splice(startIndex, this._paginator.pageSize);
      })
    );
  }

  disconnect(collectionViewer: CollectionViewer): void {
  }

  private _getSortedData(): AssetTableData[] {
    const data = this.data$.value.slice();
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (
        this._sort.active
        // case 'entityType':
        //   [propertyA, propertyB] = [a.entityType, b.entityType];
        //   break;
        ) {
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (
        (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1)
      );
    });
  }
}

@Component({
  selector: 'assets-table',
  templateUrl: './assets-table.component.html',
  styleUrls: ['./assets-table.component.scss'],
  providers: [IngestaModalService, DerivadaModalService],
})
export class AssetsTableComponent implements OnInit {
  @Output() updateSelection = new EventEmitter<AssetTableData[]>();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  public displayedColumns: string[] = [
    'select',
    'fileType',
    'assetType',
    'filename',
    'bundlePath',
    'rowactions',
  ];

  public selection = new SelectionModel<AssetTableData>(true, []);
  public dataSource: AssetTableDataSource;
  private dataAssetSource: BehaviorSubject<AssetTableData[]> = new BehaviorSubject<AssetTableData[]>([]);

  constructor(
    private _service: IngestaService,
    private _modalService: IngestaModalService,
    private assetService: AssetService,
    private _notificationService: NotificationService,
    private _derivadaModalService: DerivadaModalService
  ) {
    this.dataAssetSource = this._service.dataAssetSource;
  }

  ngOnInit(): void {
    this.dataSource = new AssetTableDataSource(
      this.dataAssetSource,
      this.paginator,
      this.sort
    );
  }

  public isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataAssetSource.value.length;
    return numSelected === numRows;
  }

  public masterToggle(): void {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataAssetSource.value.forEach((row) => this.selection.select(row));
    this.updateSelection.emit(this.selection.selected);
  }

  public changeSelectionStatus(row): void {
    this.selection.toggle(row);

    this.updateSelection.emit(this.selection.selected);
  }

  public edit(record: AssetTableData): void {
    let asset = this._service.pi$.value.assetList.find(
      (f) => f._id === record.idAsset
    );
    this._modalService.setupEditAssetModal(asset).subscribe((result) => {
      if (result) {
        //c onsole.log(result);
      }
    });
  }

  public showMetadata(record: AssetTableData): void {
    this.assetService
      .getAssetMetadata(record.idAsset)
      .then((metadata) => {
        if (metadata) {
          this._modalService
            .setupAssetMetadataModal(record.filename, metadata)
            .subscribe((result) => {
              //c onsole.log(result);
            });
        } else {
          this._notificationService.error(
            'El objeto digital seleccionado no contiene metadatos'
          );
        }
      })
      .catch((error) => {
        this._notificationService.error(
          'El objeto digital seleccionado no contiene metadatos'
        );
      });
  }

  /**
   * Abre la ventana modal para la generación de una derivada (archivo)
   *
   * @param record El registro (Asset) para el que se va a generar la derivada
   */
  crearDerivada(record: AssetTableData): void {
    this.assetService.getAsset(record.idAsset)
      .then((asset) => {
        this._derivadaModalService.setupCrearDerivadaParaAssetModal(asset).subscribe(result => {
          if (result) {
            // console.info('abrirModalDerivadaArchivo -> result -> ', result)
          }
        });
      })
      .catch((error) => console.error(error));
  }
}
