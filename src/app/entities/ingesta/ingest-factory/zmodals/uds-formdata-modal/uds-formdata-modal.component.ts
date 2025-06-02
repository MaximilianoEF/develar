import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { UnidadDescripcionHelper } from '../../../../unidad-descripcion/unidad-descripcion.helper';
import { UnidadDescripcion } from '../../../../unidad-descripcion/unidad-descripcion.model';
import { IngestaHelper } from '../../../ingesta.helper';
import { IngestProcess } from '../../../ingesta.model';


@Component({
  selector: 'uds-formdata-modal',
  templateUrl: './uds-formdata-modal.component.html',
  styleUrls: ['./uds-formdata-modal.component.scss']
})
export class UdsFormdataModalComponent implements OnInit {
  @ViewChild(MatSelectionList, {static: false}) list: MatSelectionList;
  public form: FormGroup;
  public udaList: UnidadDescripcion[];
  /** Mantiene la lista de tipos de cardinalidad que se pueden elegir */
  public relAssetUdsList = [];
  public countUdc: number;
  public countUds: number;
  constructor(
              private fb: FormBuilder,
              private dialogRef: MatDialogRef<UdsFormdataModalComponent>,
              @Inject(MAT_DIALOG_DATA) public pi: IngestProcess
  ) {
    this.udaList = [];
    this.countUdc = 0;
    this.countUds = 0;
    this.form = this.fb.group({
      relAssetUds: ['1', Validators.required],
      identifierBase: [null, Validators.pattern('[a-z A-Z 0-9 _]+')],
      slugBase: [null, Validators.pattern('[a-z A-Z 0-9 _]+')],
      identifyFromFilename: [false],
      identifyFromDirectoryName: [false],
      identifyFromDirectoryNameExact: [false],
      splitCaracterF: ['_'],
      splitCaracterD: ['-'],

    });

    this.relAssetUdsList = IngestaHelper.getOptionList('relAssetUds');
  }

  ngOnInit(): void {
    this.countAssetHook();
  }

  private countAssetHook(): void {
    if(this.pi.assetHookList && this.pi.assetHookList.length){
      for(const asset of this.pi.assetHookList){
        if(asset.assetType === 'directory')
          this.countUdc++;
        else
          this.countUds++;
      }
    }
  }

  public handleOnSubmit(): void {
    if(this.form.valid){
      const fvalue = this.form.value;
      this.dialogRef.close(fvalue);
    }

  }

  public getLabel(type:string, val:string): string {
    return UnidadDescripcionHelper.getOptionLabel(type, val);
  }
}
