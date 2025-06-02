import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { AyudaEnLineaService } from '../../../develar-commons/ayuda-en-linea.service';
import {
  CondicionBusqueda,
  buscarEnOptList,
  tipoBusquedaOptList,
  recursosOptList
} from "../../models/browser.campos";

import { VidaQuery, Condiciones } from '../../models/vidaQuery.model';


@Component({
  selector: "vida-query-browse",
  templateUrl: "./vida-query-browse.component.html",
  styleUrls: ["./vida-query-browse.component.scss"],
})
export class VidaQueryBrowseComponent implements OnInit {
  @Output()
  emitQuery: EventEmitter<any>;
  @Output() onEmitExportExcel : EventEmitter<boolean> = new EventEmitter<boolean>();
  form: FormGroup;
  buscarEnOptList: CondicionBusqueda[] = buscarEnOptList;
  tipoBusquedaOptList: CondicionBusqueda[] = tipoBusquedaOptList;
  recursosOptList: CondicionBusqueda[] = recursosOptList;
  @Input()
  public query: VidaQuery;
  @Input()
  public browseEnable = false;
  @Input() public cantExport : boolean = true;
  public results : VidaQuery;

  public codigo = {
    vidaBrowse: "query:audio-visual:01",
  }
  constructor(
              private _fb: FormBuilder,
              private _onlineHelpService : AyudaEnLineaService
  ){
    this.emitQuery = new EventEmitter<VidaQuery>();
  }

  ngOnInit(): void {
    this.initFormGroup();
  }


  private initFormGroup(): void {
    this.form = this._fb.group({
      recurso: [(this.query && this.query.recurso) ? this.query.recurso : '3', Validators.required],
      condiciones: this._fb.array([])
    });

    this.refreshBuscarEnOptListWithRecurso();

    if(this.query.condiciones && this.query.condiciones.length){
      this.loadControlsFromQuery();
    }else{
      this.addControls(false);
    }
  }

  public onSubmit(): void {
    let query = new VidaQuery();
    query.recurso = this.form.value.recurso;
    query.condiciones = this.condicionesGet.getRawValue();
    this.results = query;
    this.emitQuery.emit(query);
  }


  get condicionesGet(): FormArray {
    return this.form.get('condiciones') as FormArray;
  }

  loadControlsFromQuery(){
    this.query.condiciones.forEach(condicion => {
      this.addControls(true, condicion);
    })
  }

  addControls(isQuery : boolean, condicion? : Condiciones): void {


    let length = this.condicionesGet.length;
    if (length < 10) {
      const group = this._fb.group({
        termino: [ isQuery ? condicion.termino :  null, Validators.required],
        buscarEn: [isQuery ? condicion.buscarEn : 'all', Validators.required],
        tipoBusqueda: [isQuery ? condicion.tipoBusqueda : 'aprox']
      })
      this.condicionesGet.push(group);

    }
  }

  removeControl() {
    let index = this.condicionesGet.length - 1;
    this.condicionesGet.removeAt(index);
  }

  public onExportExcel() : void {
    this.onEmitExportExcel.emit(true);
  }

  public showHelp(key : string){
    this._onlineHelpService.showOnlineHelp(this.codigo[key]);
  }

  refreshBuscarEnOptListWithRecurso(): void {
    const recurso = this.form.get('recurso').value;
    if(recurso) {
      this.buscarEnOptList = buscarEnOptList.filter(f => 
        f.displayIn.includes(recurso))
    }
  }
    
}
