
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, EventEmitter, Input, OnInit, Output, } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { UnidadDescripcion } from '../../../unidad-descripcion.model';
const PUNTOSACCESO: string = 'puntos-acceso';
@Component({
  selector: 'puntos-acceso',
  templateUrl: './puntos-acceso.component.html',
  styleUrls: ['./puntos-acceso.component.scss']
})
export class PuntosAccesoComponent implements OnInit {

  @Input() ud: UnidadDescripcion;
  @Output() value = new EventEmitter<any>();
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  public materias: string[];
  public lugares: string[];
  public autoridades: string[];
  public nombres: string[];
  /** Emite un valor booleano true toda vez que haya que cerrar el área de trabajo de los formularios */
  @Output()
  public closeInputAreaEmitter = new EventEmitter<boolean>();
  public masterList;

  constructor() { }

  ngOnInit(): void {
    this.initChipsList();
  }

  private initChipsList() {
    if (this.ud.puntoAcceso) {
      this.materias = this.ud.puntoAcceso.subject_access_points && this.ud.puntoAcceso.subject_access_points.length ? this.ud.puntoAcceso.subject_access_points : [];
      this.lugares = this.ud.puntoAcceso.place_access_points && this.ud.puntoAcceso.place_access_points.length ? this.ud.puntoAcceso.place_access_points : [];
      this.autoridades = this.ud.puntoAcceso.genre_access_points && this.ud.puntoAcceso.genre_access_points.length ? this.ud.puntoAcceso.genre_access_points : [];
      this.nombres = this.ud.puntoAcceso.name_access_points && this.ud.puntoAcceso.name_access_points.length ? this.ud.puntoAcceso.name_access_points : [];

      this.masterList = {
        materias: this.materias,
        lugares: this.lugares,
        autoridades: this.autoridades,
        nombres: this.nombres
      }
    }

  }

  onSubmit() {
    let emit = {
      type: PUNTOSACCESO,
      value: this.masterList
    }
    this.value.emit(emit);
  }

  public closeForm(): void {
    this.closeInputAreaEmitter.emit(true);
  }

  add(lista: string, event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.masterList[lista].push(value);
    }

    // Clear the input value
    event.input.value = '';
  }

  remove(lista: string, item: string): void {
    const index = this.masterList[lista].indexOf(item);

    if (index >= 0) {
      this.masterList[lista].splice(index, 1);
    }
  }



}
