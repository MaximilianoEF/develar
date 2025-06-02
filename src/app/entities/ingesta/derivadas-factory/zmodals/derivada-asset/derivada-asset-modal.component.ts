import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Asset } from '../../../../../develar-commons/develar-entities';
import { NotificationService } from '../../../../../develar-commons/notifications.service';
import { IngestaService } from '../../../ingesta.service';
import { DerivadaService } from '../../derivada.service';

const DERIVADA_OK: string = 'Derivada OK';
@Component({
  selector: 'derivada-asset',
  templateUrl: './derivada-asset-modal.component.html',
  styleUrls: ['./derivada-asset-modal.component.scss'],
  providers: [DerivadaService]
})
export class DerivadaAssetModalComponent implements OnInit {
  /**
   * Almacena el asset con el que el modal va a trabajar
   * @member {Asset}
   */
  public asset: Asset = null;

  /**
   * Determina si el asset es una carpeta o un archivo; usado para
   * mostrar opciones de generación de derivadas
   * @member {boolean}
   */
  public esDirectorio: boolean;

  /**
   * Formulario para ingreso de parámetros de generación de derivadas
   * @member {FormGroup}
   */
  public form: FormGroup;

  public renegerarDerivadas: boolean;

  private progressSubscriptionPDF: Subscription;

  constructor(
              @Inject(MAT_DIALOG_DATA) public data: any,
              private _dialogRef: MatDialogRef<DerivadaAssetModalComponent>,
              private _derivadaService: DerivadaService,
              private _ingestaService: IngestaService,
              private _fb: FormBuilder,
              private _notificationService: NotificationService

  ) {
    this.renegerarDerivadas = false;
  }

  ngOnInit(): void {
    this._inicializarFormulario();

    if(this.data && this.data.asset) {
      this.asset = this.data.asset;
      this.esDirectorio = this.data.asset.fileType === 'directory';
    }
  }

  private _inicializarFormulario(): void {
    this.form = this._fb.group({
      ancho: [900, Validators.pattern(/[0-9]+/)],
      alto: [900, Validators.pattern(/[0-9]+/)],
      esCarpetaContenedora: [null, Validators.required]
    });
  }

  /**
   * Invoca al miacroservicio de generación de derivadas; a este microservicio se envía
   * el asset para el que se va a generar la derivada, y un objeto conteniendo opciones
   * tomadas del formulario que esta ventana modal presenta
   *
   * @see DerivadaService.crearDerivada
   */
  generarDerivadaParaAsset(): void {
    const opciones = this.form.value;
    console.log('this.asset: [%s]', this.asset);

    if (this.asset) {
      if(opciones.esCarpetaContenedora) {
        this._ingestaService.pdfWorkInProgress$.next(true);
        this._jobPDFProgressFollowUp('PDF');
      }
      this._derivadaService.crearDerivada(this.asset, opciones)
        .then((result) => {
          this.cerrarModal(result);
        })
        .catch((error) => console.error(error));
    } else {
      console.error('Error al cargar el asset; cerramos');
    }
  }

  cerrarModal(result: any = null): void {
    this._dialogRef.close(result);
  }

  private _jobPDFProgressFollowUp(jobtype: string) {
    if (!this.progressSubscriptionPDF) {
      this.progressSubscriptionPDF = this._ingestaService.pdfQueueProgress()
        .subscribe(list => {
          if (list && list.length) {
            let token = list[0];
            this._ingestaService.pdfProgressInfo$.next(`${token.identifier}: ${token.queue}  [${token.progress}]`);
            let final = list.find(token => token.progress == 999999);
            if (final) {
              this._ingestaService.pdfProgressInfo$.next(`${final.identifier}: ${final.queue}  [${final.progress}]`);
              this._ingestaService.inProgressDerivada$.next(false);
              this.progressSubscriptionPDF.unsubscribe();
              this.progressSubscriptionPDF = null;
              /** Como finalizó el proceso, los thumbnail ya fueron creados. */

              console.log("FINALIZÓ JOB PDF");
              /** Ponemos en false al behavior */
              this._ingestaService.pdfWorkInProgress$.next(false);
              if(token.status === DERIVADA_OK) {
                this._notificationService.success('PDF generado exitosamente');
              } else {
                this._notificationService.error('Se ha detectado un error al generar el PDF');
              }
              this.cerrarModal(null);

            }
          }
        })
    }
  }
}
