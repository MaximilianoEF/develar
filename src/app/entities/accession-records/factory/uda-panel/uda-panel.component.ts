
import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { UnidadDescripcionProxy } from '../../accession-records-model';
import { UnidadDescripcionHelper } from '../../../unidad-descripcion/unidad-descripcion.helper';

@Component({
  selector: 'uda-panel',
  templateUrl: './uda-panel.component.html',
  styleUrls: ['./uda-panel.component.scss']
})
export class UdaPanelComponent implements OnInit, AfterViewInit {
  @Input()
  public udaProxy: UnidadDescripcionProxy;

  @ViewChild('udaImage', { read: ElementRef })
  public udaImage: ElementRef;

  // Propiedades relacionadas con drag&drop de la imagen y el zoom
  public escala = 1.0;
  public esModoPaneo = false;
  public x = 0;
  public y = 0;
  public comienzo = { x: 0, y: 0 };
  public zoomContainer;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.zoomContainer = this.udaImage.nativeElement;
  }

  buildReferenceCode(reference_code: string[]): string {
    return UnidadDescripcionHelper.buildReferenceCode(reference_code);
  }

  private _transformar(): void {
    // Alterar la propiedad CSS transform del elemento arrastrable
    console.log(`translate(${this.x}px, ${this.y}px) scale(${this.escala})`);

    this.zoomContainer.style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.escala})`;
  }

  public handleOnMouseDown(event): void {
    console.log('handleOnMouseDown -> ', event);

    this.comienzo = { x: event.clientX - this.x, y: event.clientY - this.y };
    this.esModoPaneo = true;
  }

  public handleOnMouseUp(): void {
    this.esModoPaneo = false;
  }

  public handleOnMouseMove(event): void {
    if (!this.esModoPaneo) {
      return;
    }

    this.x = (event.clientX - this.comienzo.x);
    this.y = (event.clientY - this.comienzo.y);


    this._transformar();
  }

  public handleOnWheel(event): void {
    const deltaX = (event.clientX - this.x) / this.escala;
    const deltaY = (event.clientY - this.y) / this.escala;

    const deltaWheel = (event.wheelDelta ? event.wheelDelta : -event.deltaY);

    if (deltaWheel > 0) {
      this.escala *= 1.1;
    } else {
      this.escala /= 1.1;
    }

    console.log('deltaX[%s] deltaY[%s]', deltaX, deltaY);

    this.x = event.clientX - deltaX * this.escala;
    this.y = event.clientY - deltaY * this.escala;

    console.log('x[%s] y[%s]', this.x, this.y);

    this._transformar();
  }

}
