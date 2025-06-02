import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ScanFolder } from '../../../ingesta.model';
import { IngestaService } from '../../../ingesta.service';
import { take } from 'rxjs/operators';

@Component({
  selector: "rootfolder-modal",
  templateUrl: './rootfolder-modal.component.html',
  styleUrls: ['./rootfolder-modal.component.scss'],
})
export class RootfolderModalComponent implements OnInit {
  public formGroup: FormGroup;
  // public scan$: Promise<ScanFolder>;

  /** La carpeta raíz; de ella hacia abajo comienzo a hacer los escaneos */
  public rootPath: string;

  /** La carpeta en la que estoy buscando los assets */
  public path: string;

  /* Determina el estado del botón de selección de root-folder */
  public puedeSeleccionarCarpeta = false;

  /* Almacena el resultado de escaneo de una carpeta */
  public scanResult: ScanFolder = null;


  constructor(
    public dialogRef: MatDialogRef<RootfolderModalComponent>,
    private _fb: FormBuilder,
    private _serviceIng: IngestaService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.rootPath = this.data.pathInfo.rootPath;
    this.path = this.data.pathInfo.path;
  }

  ngOnInit(): void {
    this.initGroup();

    if (this.path) {
      this.escanear(this.path);
    }
  }

  private initGroup(): void {
    this.formGroup = this._fb.group({
      localPath: [this.path, Validators.required],
    });
  }

  public escanear(path: string): void {
    /**
     * Remueve una cantidad arbitraria de / al inicio o final de la ruta
     * hacia la carpeta a escanear
     */
    const cleanPath = path.replace(/^(\/)+|(\/)+$/g, '');

    this._serviceIng.getResumenFromFolder(cleanPath, this.rootPath)
      .pipe(
        take(1)
      )
      .subscribe(result => {
        this.scanResult = result;
        this.puedeSeleccionarCarpeta = !!((this.scanResult.filesCount && this.scanResult.filesCount > 0) || (this.scanResult.folderCount && this.scanResult.folderCount > 0))
    });
  }

  public improvePath(path: string, item: string): void {
    this.formGroup.get('localPath').setValue(path + '/' + item);
    this.escanear(this.formGroup.get('localPath').value);
  }

  public onSubmit(): void {
    const value = this.formGroup.value.localPath;

    let result = {
      payload : value,
      scan: this.scanResult
    }

    this.dialogRef.close(result);
  }
}
