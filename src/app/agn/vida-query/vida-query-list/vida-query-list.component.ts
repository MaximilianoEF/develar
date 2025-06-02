import { Component, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { ArrayDataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { map } from 'rxjs/operators';
import { VidaQueryService } from '../vida-query.service';
import { AcervoDataList } from '../../models/acervodatalist.model';
import { UnidadDescripcionService } from '../../../entities/unidad-descripcion/unidad-descripcion.service';
import { UnidadDescripcionTable } from '../../../entities/unidad-descripcion/unidad-descripcion.model';


@Component({
  selector: 'vida-query-list',
  templateUrl: './vida-query-list.component.html',
  styleUrls: ['./vida-query-list.component.scss']
})
export class VidaQueryListComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Output() emitEndRender: EventEmitter<boolean>;
  vidaQueryDataSource: ArrayDataSource<AcervoDataList>;
  vidaQueryList$: BehaviorSubject<AcervoDataList[]>;
  vidaQueryList: any[] = [];
  public udaList: Array<UnidadDescripcionTable> = [];
  public udaList$: BehaviorSubject<UnidadDescripcionTable[]>;
  viewCard: boolean = false;
  itemsLength: number = 0;
  public showUdaData: boolean = false;
  constructor(
              private _vidaService: VidaQueryService,
              private _udaService: UnidadDescripcionService
  ){
    this.emitEndRender = new EventEmitter<boolean>();
    this.vidaQueryList$ = this._vidaService.vidaQueryDataSource;
    this.udaList$ = this._udaService.dataRecordsSource;
  }

  ngOnInit(): void {
    this.initList();
  }

  //oJo
  initList(): void {
    if (this.vidaQueryList$.value && this.vidaQueryList$.value.length) {
      this.vidaQueryDataSource = new VidaQueryDataSource(this.vidaQueryList$, this.paginator);
      this.viewCard = true;
      setTimeout(() => {
        this.vidaQueryDataSource.connect().subscribe(list => {
          this.vidaQueryList = list as AcervoDataList[];

          if (this.vidaQueryList !== undefined) {
            this.viewCard = true;
            this.itemsLength = this.vidaQueryList$.value.length;
          }
        })
        this.emitEndRender.emit(false);

      }, 1500);
    } else if (this.udaList$.value && this.udaList$.value.length) {

      const udaDataSource = new UdaDataSource(this.udaList$, this.paginator);

      setTimeout(() => {
        udaDataSource.connect().subscribe(list => {
          this.udaList = list;
          if (this.udaList && this.udaList.length) {
            this.showUdaData = true;
            this.itemsLength = this.udaList$.value.length;
          }
        })
        this.emitEndRender.emit(false);

      }, 1500);
    }
  }

  public hidePaginator(): void {
    /** FIXME: Cuidado con esto, accede al DOM directamente */
    document.getElementById('paginatorvida').style.display = 'none';
  }


}

export class VidaQueryDataSource extends ArrayDataSource<AcervoDataList> {

  constructor(private sourceData: BehaviorSubject<AcervoDataList[]>,
    private _paginator: MatPaginator) {
    super(sourceData);
  }

  connect(): Observable<any[]> {

    const displayDataChanges = [
      this.sourceData,
      this._paginator.page
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        const data = this.sourceData.value.slice()

        const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
        return data.splice(startIndex, this._paginator.pageSize);
      })
    );
  }

  disconnect() { }

}

class UdaDataSource extends ArrayDataSource<UnidadDescripcionTable> {

  constructor(private sourceData: BehaviorSubject<UnidadDescripcionTable[]>,
    private _paginator: MatPaginator) {
    super(sourceData);
  }

  connect(): Observable<any[]> {

    const displayDataChanges = [
      this.sourceData,
      this._paginator.page
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        const data = this.sourceData.value.slice()

        const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
        return data.splice(startIndex, this._paginator.pageSize);
      })
    );
  }

  disconnect() { }

}
