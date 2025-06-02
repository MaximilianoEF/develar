import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UnidadDescripcion } from '../../../unidad-descripcion/unidad-descripcion.model';
import { IngestaService } from '../../ingesta.service';
import { IngestaModalService } from '../ingesta-modal.service';
import { UnidadDescripcionHelper } from '../../../unidad-descripcion/unidad-descripcion.helper';
import { Router } from '@angular/router';

@Component({
  selector: 'ingest-uda-panel',
  templateUrl: './ingest-uda-panel.component.html',
  styleUrls: ['./ingest-uda-panel.component.scss'],
  providers: [IngestaModalService]
})
export class IngestUdaPanelComponent implements OnInit {

  @Output() showMatching = new EventEmitter<boolean>();
  private isMatchingVisible = false;

  public ud$: BehaviorSubject<UnidadDescripcion>;
  constructor(
    private _modalServiceING: IngestaModalService,
    private _ingestaService: IngestaService,
    private _router: Router) { }

  ngOnInit(): void {
    this.ud$ = this._ingestaService.ud$;
  }

  public goToDetailedView(index: number, ud: UnidadDescripcion): void {
    let _referencecode: string = "";
    for (let i = 0; i <= index; i++) {
      _referencecode += ud.identificador.reference_code[i];
      if (i !== index) {
        _referencecode += ' ';
      }
    }
    this._ingestaService.findByQueryWithToken('codigo_referencia_exact', _referencecode).subscribe(result => {
      if (result && result.length) {

        let ud = result[0];
        this._router.navigate(['/unidad-descripcion', 'vista-detallada', ud._id]);
      }
    });
  }

  public verDetalle() : void{
    this.isMatchingVisible = !this.isMatchingVisible;
    this.showMatching.emit(this.isMatchingVisible);
  }

  public matching() : void {
    console.info('todo')
  }

  public crearUDS(): void {
    console.info('todo')
  }


  // deprecated
  public getLabel(type: string, val: string): string {
    return UnidadDescripcionHelper.getOptionLabel(type, val);
  }

  public openExplorarModal(): void {
    this._modalServiceING.setupBrowserUDModal().subscribe(result => {
      if (result) {
        // c onsole.log("resultado --> %o", result)
      }
    })
  }


}
