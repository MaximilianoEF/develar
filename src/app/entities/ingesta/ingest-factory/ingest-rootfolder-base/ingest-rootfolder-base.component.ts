import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AssetTableData } from '../../ingesta.model';
import { IngestaService } from '../../ingesta.service';
import { IngestaModalService } from '../ingesta-modal.service';
@Component({
  selector: 'ingest-rootfolder-base',
  templateUrl: './ingest-rootfolder-base.component.html',
  styleUrls: ['./ingest-rootfolder-base.component.scss'],
  providers : [IngestaModalService]
})
export class IngestRootfolderBaseComponent implements OnInit {

  public listOfSelection : AssetTableData[];
  public pdfWorkInProgress$: BehaviorSubject<boolean>;
  public pdfProgressInfo$: BehaviorSubject<string>;
  constructor(private _service : IngestaService,
    private _modalService : IngestaModalService) {
    this.listOfSelection = [];
    this.pdfWorkInProgress$ = this._service.pdfWorkInProgress$;
    this.pdfProgressInfo$ = this._service.pdfProgressInfo$
  }

  ngOnInit(): void { }

  public buildDataTable(): void {
    this._service.updateAssetTableData();
  }

  public collectAssetMetadata(): void {
    console.info('ToDo...Work in progress...');
  }

  public edit() : void {
    if(this.listOfSelection && this.listOfSelection.length){
      if(this.listOfSelection.length === 1){
        let asset = this._service.pi$.value.assetList.find(f => f._id === this.listOfSelection[0].idAsset);
        this._modalService.setupEditAssetModal(asset).subscribe(result => {
          if(result){
            //c onsole.log(result)
          }
        })
      }
    }
  }

  public onChildSelectionChange(list : AssetTableData[]) : void {
    this.listOfSelection = list;
  }
}
