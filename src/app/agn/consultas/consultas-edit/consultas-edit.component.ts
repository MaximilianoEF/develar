import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../develar-commons/notifications.service';
import { ConsultasHelper } from '../consulta.helper';
import { ConsultasService } from '../consulta.service';

import { Consulta, AsesoramientoTecnico, MaterialSolicitado, Atendido } from '../consulta.model';
import { ConsultaQuery } from '../../../entities/consultas/consulta.model';
import { AGNHelper } from '../../agn.helper';
import { UserService } from '../../../entities/user/user.service';
import { ConsultaHelper } from '../../../entities/consultas/consulta.helper';

const ESTADO_ACTIVO = 'activo';
const SECTOR_INICIAL = 'comunicacion';
const ENEJECUCION = 'enejecucion';
const EMITIDO = 'emitido';

const CONFIRMATION_MODAL_CONFIG = {
  data: {
    caption: '¡Consulta realizada con éxito!',
    body: 'Te responderemos a la brevedad.<br>Podrás ver el historial de tus consultas en el listado de <b>Consultas realizadas</b>',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    }
  }
};

const CONFIRMATIONSERVICE_MODAL_CONFIG = {
  data: {
    caption: '¡Solicitud enviada con éxito!',
    body: 'Te responderemos a la brevedad.<br>Podrás ver el historial de tus servicios en el listado de <b>Solicitudes emitidas</b>',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    }
  }
};

@Component({
  selector: 'agn-consultas-edit',
  templateUrl: './consultas-edit.component.html',
  styleUrls: ['./consultas-edit.component.scss']
})
export class ConsultasEditComponent implements OnInit, AfterViewChecked {
  public form: FormGroup;
  public tipoMaterialList = [];
  public sedesList = [];
  public modo = 'consulta';

  public title = '';
  public stitle = '';

  public meContent: string = '';
  public mePlaceholder: string = 'Ingresá el texto de tu consulta';

  public isConsulta = false;
  public isAsesoramiento = false;
  public isMaterial = false;
  public isModoServicio: boolean = false;
  public consultaOptList = [];
  public tmaterialList = [];
  public typeSelected : boolean = false;

  private consulta: Consulta;
  private solmaterial: Array<MaterialSolicitado>;
  private asesoramiento: AsesoramientoTecnico;
  private isEdit = false;
  private consultaId: string;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _notificacionService: NotificationService,
    private _service: ConsultasService,
    private _notificationService: NotificationService,
    private _userService: UserService,
    private _cdRef: ChangeDetectorRef
  ) {


    this.form = this._fb.group({
      type: ['consulta'],
      description: [null],

      institucion: [null],
      cuit: [null],
      solicitud: [null],
      contacto: [null],
      telefono: [null],

      solMaterial: this._fb.array([]),

    });

    this.tmaterialList = AGNHelper.getOptionList('tmaterial');
  }

  ngOnInit(): void {


    this.consultaId = this._route.snapshot.params.id

    if (this.consultaId) {
      this.isEdit = true;
    }

    this._route.data.subscribe(data => {

      this.modo = data ? data.modo : this.modo;

      this.initOnce();
    })


  }

  ngAfterViewChecked(): void {
    this._cdRef.detectChanges();
  }


  public get solMaterialGet(): FormArray {
    return this.form.get('solMaterial') as FormArray;
  }

  public getTMaterial(index: number): string {
    let formArray = this.solMaterialGet;
    return formArray.controls[index].get('tmaterial').value
  }

  public addControls(solMaterial?: MaterialSolicitado): void {

    const group = this._fb.group({
      tmaterial: [solMaterial ? solMaterial.tmaterial : null, Validators.required],
      identificador: [solMaterial ? solMaterial.identificador : null],
      fondodocumental: [solMaterial ? solMaterial.fondodocumental : null],
      seriedocumental: [solMaterial ? solMaterial.seriedocumental : null],
      numeropieza: [solMaterial ? solMaterial.numeropieza : null],
      destino: [solMaterial ? solMaterial.destino : null],
      fecha: [solMaterial ? solMaterial.fecha : null],
      titulo: [solMaterial ? solMaterial.titulo : null],
      timescode: [solMaterial ? solMaterial.timescode : null]
    })

    this.solMaterialGet.push(group);

  }

  public removeControl() {
    let index = this.solMaterialGet.length - 1;
    this.solMaterialGet.removeAt(index);
  }

  private initOnce() {

    if (this.modo === 'consulta') {
      this.title = 'Realizá tu consulta';
      this.stitle = '';
      this.consultaOptList = ConsultasHelper.getOptionlist('consultaType');
      this.form.get('description').setValidators(Validators.required);

    } else if (this.modo === 'servicio') {
      this.title = 'Otros servicios';
      this.stitle = 'Enviá tu solicitud, te responderemos en este mismo espacio dentro de las 48 hs.'
      this.isModoServicio = true;
      this.consultaOptList = ConsultasHelper.getOptionlist('servicioType').filter( f => f.val !== 'no_definido');

    }

    this.consulta = new Consulta();

    if (!this.isEdit) {
      this.consulta = ConsultasHelper.initNewConsulta();
      this.initForEdit(this.form, this.consulta)

    } else {
      this._service.fetchConsultaById(this.consultaId)
        .then(item => {
          this.consulta = item;
          this.initForEdit(this.form, this.consulta)
        })
        .catch(error => {
        });
    }
  }


  changeSelectionValue(type, val) {

    if (type === 'type') {
      this.typeSelected = true;
      this.isConsulta = val === 'consulta' ? true : false;
      this.isAsesoramiento = val === 'asesoramiento' ? true : false;
      this.isMaterial = val === 'solmaterial' ? true : false;
    }

    if(this.isAsesoramiento) {
      this.clearValidators();
      this.form.get('contacto').setValidators(Validators.email);
      this.form.get('telefono').setValidators(Validators.required);
      this.form.get('cuit').setValidators([Validators.minLength(10), Validators.maxLength(11), Validators.pattern('[0-9]+'), Validators.required]);
      this.form.get('institucion').setValidators(Validators.required);
      this.form.get('solicitud').setValidators(Validators.required);
    }
    else if(this.isMaterial){

      this.clearValidators();

      this.addControls(null);
    }

  }

  private clearValidators() : void {
    Object.keys(this.form.controls).forEach( control => {
      this.form.get(control).clearValidators();
      this.form.get(control).updateValueAndValidity();
    })
  }

  cancel() {
    // this.navigateConsultas();
    this._router.navigate(['']);
  }

  private navigateConsultas(): void {
    this._router.navigate(['web', 'usuario', 'dashboard', 'consultas']);
  }

  private navigateServicios(): void {
    this._router.navigate(['web', 'usuario', 'dashboard', 'servicios']);
  }

  upsertRecord(): void {
    this.initForSave(this.form, this.consulta);
  }


  private initForSave(form: FormGroup, consulta: Consulta) {

    let user = this._userService.currentUser;

    const fvalue = this.form.value;

    consulta.type = fvalue.type;
    consulta.description = fvalue.description;

    if (this.isAsesoramiento) {
      this.asesoramiento.institucion = fvalue.institucion;
      this.asesoramiento.solicitud = fvalue.solicitud;
      this.asesoramiento.contacto = fvalue.contacto;
      this.asesoramiento.telefono = fvalue.telefono;
      this.asesoramiento.cuit = fvalue.cuit;

      consulta.description = fvalue.solicitud; // es la descripción de la solicitud de asesoramiento técnico

      consulta.asesoramiento = this.asesoramiento;

    } else {
      consulta.asesoramiento = null;
    }

    if (this.isMaterial) {

      fvalue.solMaterial.forEach(solicitud => {
        const solMaterial = solicitud as MaterialSolicitado;
        this.solmaterial.push(solMaterial);
      })
      consulta.material = this.solmaterial;


    } else {
      consulta.material = null;
    }


    let consulta_new = new Consulta();
    Object.assign(consulta_new, consulta)
    const pase = ConsultaHelper.generarPaseFromUpsertConsulta(user, this.isEdit);

    consulta_new.sector = pase.sector;
    consulta_new.ejecucion = pase.ejecucion;

    consulta.pases.push(pase);

    this._service.manageConsulta(consulta_new, user).subscribe(record => {
      if (record) {
        const whichModal = this.modo === 'consulta' ? CONFIRMATION_MODAL_CONFIG : CONFIRMATIONSERVICE_MODAL_CONFIG;
        // this._notificationService.openModalDialog(CONFIRMATION_MODAL_CONFIG).subscribe((result) => {
        this._notificationService.openModalDialog(whichModal).subscribe((result) => {
          if (result) {
            /**
             * Si el guardado es exitoso, refrescamos la lista de consultas
             */
            const query = new ConsultaQuery();
            query.modoconsulta = this.modo;
            query.userId = user._id;
            this._service.fetchConsultasByQuery(query).subscribe((entities) => {
              if (entities && entities.length) {
                this._service.updateTableData();

                this.form.reset();

                if (this.modo === 'consulta') {
                  this.navigateConsultas();
                } else {
                  this.navigateServicios();
                }
              }
            });
          }
        });
      } else {
        this._notificacionService.error("Se produjo un error al intentar actualizar el registro");
      }
    });
  }

  private initForEdit(form: FormGroup, consulta: Consulta): FormGroup {

    this.isMaterial = consulta.material && consulta.material.length ? true : false;
    this.isAsesoramiento = consulta.asesoramiento ? true : false;
    this.solmaterial = consulta.material || new Array<MaterialSolicitado>();
    this.asesoramiento = consulta.asesoramiento || new AsesoramientoTecnico();

    form.reset({
      type: consulta.type,
      description: consulta.description,

      institucion: this.asesoramiento.institucion,
      solicitud: this.asesoramiento.solicitud,
      contacto: this.asesoramiento.contacto,
      cuit: this.asesoramiento.cuit,
      telefono: this.asesoramiento.telefono
    })

    if (this.isMaterial && this.solmaterial && this.solmaterial.length) {
      this.solmaterial.forEach(sol => {
        this.addControls(sol);
      })
    }

    return form;
  }

}
