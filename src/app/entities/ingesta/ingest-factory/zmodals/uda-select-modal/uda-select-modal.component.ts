import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IngestaService } from '../../../ingesta.service';
import { ChildrenUD, ParentUD, UnidadDescripcion } from '../../../../unidad-descripcion/unidad-descripcion.model';
import { MatDialogRef } from '@angular/material/dialog';
import { UnidadDescripcionModalService } from '../../../../unidad-descripcion/unidad-descripcion-modal.service';
import { UnidadDescripcionService } from '../../../../unidad-descripcion/unidad-descripcion.service';
import { NotificationService } from '../../../../../develar-commons/notifications.service';
import { UnidadDescripcionHelper } from '../../../../unidad-descripcion/unidad-descripcion.helper';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UnidadDescripcionQuery } from '../../../ingesta.model';

@Component({
  selector: 'uda-select-modal',
  templateUrl: './uda-select-modal.component.html',
  styleUrls: ['./uda-select-modal.component.scss'],
  providers: [UnidadDescripcionModalService]
})
export class UdaSelectModalComponent implements OnInit {

  public udc$: BehaviorSubject<UnidadDescripcion> = new BehaviorSubject<UnidadDescripcion>(null);
  public udcSelected: UnidadDescripcion | ChildrenUD | ParentUD;
  public unidadesDocumentales$: Observable<UnidadDescripcion[]>;
  public formGroup: FormGroup;
  public levelOfDescriptionList: any[];
  constructor(
    private _fb: FormBuilder,
    public dialogRef: MatDialogRef<UdaSelectModalComponent>,
    private _service: IngestaService,
    private _udModalService: UnidadDescripcionModalService,
    private _serviceUD: UnidadDescripcionService,
    private _notificationService: NotificationService
  ) {
    this.levelOfDescriptionList = UnidadDescripcionHelper.getOptionList('descriptionLevel');
  }

  ngOnInit(): void {

    this.initGroup();
    this.initUDC();
  }

  private initGroup() {
    this.formGroup = this._fb.group({
      term: ['', [Validators.required, Validators.minLength(1)]],
      descriptionLevel: ['']
    })
  }

  public search(): void {
    const fvalue = this.formGroup.value;
    let search = fvalue.term;
    let split1 = search && search.split('-')
    let split2 = search && search.split(' ')

    if (fvalue.descriptionLevel && fvalue.descriptionLevel !== 'no_definido') {
      /** Se intenta filtrar por nivel de descripción */
      const query = new UnidadDescripcionQuery();
      query.descriptionlevel = fvalue.descriptionLevel;
      if (split1 && split1.length > 1) {
        // se pasó un código de referencia con guiones
        query.codigo_referencia_exact = split1.join(' ');

      } else if (split2 && split2.length > 1) {
        // se pasó un código de referencia con espacios
        query.codigo_referencia_exact = split2.join(' ');

      } else if (search) {
        // se pasó un identifier, va solito
        query.codigo_referencia = search;
      }

      this.unidadesDocumentales$ = this._serviceUD.search(query);
    } else {
      /** El nivel de descripción no está definido */
      if (split1 && split1.length > 1) {
        // se pasó un código de referencia con guiones
        this.unidadesDocumentales$ = this._service.findByQueryWithToken('codigo_referencia_exact', split1.join(' '));

      } else if (split2 && split2.length > 1) {
        // se pasó un código de referencia con espacios
        this.unidadesDocumentales$ = this._service.findByQueryWithToken('codigo_referencia_exact', split2.join(' '));

      } else if (search) {
        // se pasó un identifier, va solito
        this.unidadesDocumentales$ = this._service.findByQueryWithToken('codigo_referencia', search);
      } else if (search && fvalue.descriptionLevel) {
        // Los dos campos están completos
        
        
      }
    }
  }

  public selectEntity(ud: UnidadDescripcion): void {
    //this._service.ud$.next(ud);
    this.udc$.next(ud);
  }

  public submitSelection() {
    this._service.ud$.next(this.udcSelected as UnidadDescripcion);
    this.dialogRef.close(this.udcSelected as UnidadDescripcion);
  }

  public getReferenceCode(reference_code: string[]) : string {
    return UnidadDescripcionHelper.buildReferenceCode(reference_code);
  }


  public initUDC() {
    this.udc$.subscribe(udc => {
      if (udc) {
        this.udcSelected = udc;
      }
    })
  }

  public getLabel(type: string, val: string): string {
    return UnidadDescripcionHelper.getOptionSlug(type, val);
  }

  public altaRapidaUDCModal(udc: UnidadDescripcion): void {
    let parent = new ParentUD();
    parent.level_of_description = udc.identificador.level_of_description;
    parent.identifier = udc.identificador.identifier;
    parent.id_parent = udc._id;
    parent.title = udc.identificador.title;
    parent.reference_code = udc.identificador.reference_code;
    this.altaRapidaUDCModalWithParent(parent);
  }

  public altaRapidaUDCModalWithParent(parent: ParentUD): void {
    this._udModalService.initAltaRapida(parent).subscribe(result => {
      if (result) {
        if (result.udsNumber > 1) {
          this._serviceUD.insertMany(result).then((x) => {
            this.refreshUDC(this.udc$.value._id);
          })
        } else {
          this._serviceUD.create(result).then((ud) => {
            this.refreshUDC(this.udc$.value._id);
          })
        }
      }
    })
  }


  private refreshUDC(id: string) {
    this.searchUDC(id);
    this._notificationService.success("Operación realizada con éxito")
  }

  public searchUDC(id: string) {
    this._serviceUD.findById(id).then(udc => {
      this.udc$.next(udc);
    })
  }

  public syncUdaAtom(): void {
    this._udModalService.openBrowseUDAfromAtoMSlug()
      .subscribe(result => {
        if (result) {
          this._notificationService.success(`Vinculación [${result.atomSlug}] exitosa.`);
        }
      })
  }


}
