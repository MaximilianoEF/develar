import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { UnidadDescripcionQuery } from '../../unidad-descripcion.model';
import { UnidadDescripcionService } from '../../unidad-descripcion.service';

@Component({
  selector: 'app-uda-migracion-atom-modal',
  templateUrl: './uda-migracion-atom-modal.component.html',
  styleUrls: ['./uda-migracion-atom-modal.component.scss']
})
export class UdaMigracionAtomModalComponent implements OnInit, OnDestroy {
  /**
   * El número de UDAs halladas por la búsqueda actual
   * Si es igual a cero, no se permite el click en el botón "Confirmar"
   */
  cantidadUdas: number = 0;
  
  /**
   * La suscripción al método del servicio de UDAs
   */
  udaSearch$: Subscription = null;

  constructor(
      private _unidadDescripcionService: UnidadDescripcionService,
      @Inject(MAT_DIALOG_DATA) private dialogData: any,
      private dialogRef: MatDialogRef<UdaMigracionAtomModalComponent>
  ) { }

  ngOnInit(): void {
    this._refrescarInfoDeUdas();
  }



  confirmarMigracion(): void {
    const query = this.dialogData.data;

    // Marco las UDAs como migradas para AtoM; retorno al parent el timestamp, que
    // me lo retorna el backend
    this._unidadDescripcionService.prepararExportarAtom(query).subscribe(resultado => {
      this.dialogRef.close(resultado);
    });
    
  }


  /**
   * Repite la búsqueda para la query producida por el browser de UDAs; se usa para
   * mostrar la cantidad de registros que van a ser migrados posteriormente
   */
  private _refrescarInfoDeUdas(): void {
    const query = this.dialogData.data;


    this.udaSearch$ = this._unidadDescripcionService.search(query).subscribe(udas => {
      if (udas && udas.length > 0) {
        this.cantidadUdas = udas.length;
      } else {
        this.cantidadUdas = 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.udaSearch$.unsubscribe();
  }
}
