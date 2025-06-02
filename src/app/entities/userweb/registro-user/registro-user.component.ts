import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { InstructivoNumTramiteModalComponent } from '../../../develar-commons/instructivo-num-tramite-modal/instructivo-num-tramite-modal.component';
import { finalize } from 'rxjs/operators';
import { personModel, Person } from '../../../entities/person/person';
import { NotificationService } from '../../../develar-commons/notifications.service';
import { PersonService } from '../../../entities/person/person.service';
import { devutils } from '../../../develar-commons/utils';
import { Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { MatDatepicker } from '@angular/material/datepicker';
import { TermscondModalComponent } from '../../../develar-commons/termscond-modal/termscond-modal.component';
import { LocalStorageService } from '../../../develar-commons/local-storage/local-storage.service';
import { gldef } from '../../../develar-commons/develar.config';
import { ImageToken, UserWebService } from '../user-web.service';
import { UsuarioWeb } from '../usuario-web';

const AGN_REGISTRO: string = 'agn:registro';
const DEFAULT_LOGO = 'assets/img/' + gldef.logoCompany;

const CONFIRMATION_MODAL_CONFIG = {
  data: {
    caption: 'Acceso denegado',
    body: 'No tiene credenciales habilitadas para ingresar a esta opción. ',
    accept: {
      action: 'accept',
      label: 'Aceptar'
    }
  }
};

@Component({
  selector: 'registro-user-web',
  templateUrl: './registro-user.component.html',
  styleUrls: ['./registro-user.component.scss']
})
export class RegistroUserWebComponent implements OnInit {

  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;

  public mainimage: string = "";
  public hasImage: boolean = false;
  public logoUrl = DEFAULT_LOGO;

  form: FormGroup;
  title: string = 'Registrarse';
  button_label: string = 'Registrarse';
  ruta: Array<string> = ['web', 'ingresar']
  showPassword: boolean = false;
  showForm: boolean = false;
  showDetail: boolean = false;

  imageData: ImageToken;

  public docBelongsTo = { error: '' };
  public preguntasSecretas: PreguntaSecreta[];
  public tcompPersonaFisica: Array<any> = personModel.tipoDocumPF;
  public usuario: UsuarioWeb;
  public isEdit: boolean = false;
  private emailOrigen: string;
  public startDate = new Date(1990, 0, 1);

  constructor(private _fb: FormBuilder, private _dialog: MatDialog,
    private _userWebService: UserWebService,
    private _notificacionService: NotificationService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _personService: PersonService,
    private _localService: LocalStorageService) {
    this.preguntasSecretas = preguntasSecretas;

  }
  ngOnInit(): void {
    let id = this._route.snapshot.params.id;
    if (id) {
      this.initUser(id);
    } else {
      this.initGroup();

    }

    this.initOnce();
  }

  private initOnce(): void {
    this.showDetail = false;
    this.hasImage = false;
    this._userWebService.fetchRecordCard(AGN_REGISTRO).pipe(finalize(() => this.showDetail = true)).subscribe(records => {
      if(records && records.length){
        this.imageData = this._userWebService.buildMainImage(records[0]);
        this.mainimage = this.imageData.imageUrl;
        this.hasImage = this.mainimage ? true : false;
      }
    })
  }



  initUser(id: string): void {
    this._userWebService.currentUser;
    this._userWebService.userEmitter.subscribe(usuario => {
      if (usuario && (usuario._id === id)) {
        this.usuario = usuario;
        this.isEdit = true;
        this.emailOrigen = this.usuario.email ? this.usuario.email.trim() : '';
        this.initGroup();
        this.title = 'Mi perfil AGN';
        this.button_label = 'Actualizar';
        this.ruta = ['/'];
        if( !this.usuario.isUsuarioWeb ){
          this.notAllowedToEditFromHere();
        }

      }else {
        // el asincronismo provoca que salga por acá al momento de inicializar el component. No es un ERROR
      }
    })
  }

  private notAllowedToEditFromHere(){
    this._notificacionService.openModalDialog(CONFIRMATION_MODAL_CONFIG).subscribe((result) => {
      this._router.navigate(['']);
    });

  }

  private initGroup(): void {
    this.form = this._fb.group({
      tipoDoc: [this.isEdit ? this.usuario.tipoDoc : 'DNI', Validators.required],

      ndoc: [this.isEdit ? this.usuario.ndoc : '', [Validators.required,
      Validators.minLength(6),
      Validators.maxLength(15)],
      ],

      numTramite: [
        this.isEdit ? this.usuario.numTramite : '',
        Validators.compose([Validators.pattern('[0-9]+'), Validators.minLength(11), Validators.maxLength(11), Validators.required]),
      ],
      fechaNacimiento: [this.isEdit ? new Date(this.usuario.fechaNacimiento) : '', Validators.required],
      telefono: [
        this.isEdit ? this.usuario.telefono : '',
        Validators.compose([Validators.required]),
      ],
      email: [this.isEdit ? this.usuario.email : '', [Validators.email, Validators.required], [this.emailExistenteValidator(this, this._userWebService, this.docBelongsTo)]],
      password: ['', Validators.required],
      confirmPassword: [''],
      termscond: [null, Validators.requiredTrue],
      preguntaSecreta: [this.isEdit ? this.usuario.preguntaSecreta : '', Validators.required],
      respuestaSecreta: [this.isEdit ? this.usuario.respuestaSecreta : '', Validators.required],
      nombre: [this.isEdit ? this.usuario.nombre : '', Validators.required],
      apellido: [this.isEdit ? this.usuario.apellido : '', Validators.required],


      domicilio : [null, Validators.required],
      ciudad : [null, Validators.required],
      provincia_estado : [null, Validators.required],
      pais  : [null, Validators.required]
    });

    this._setValidators();

    if (this.usuario) {
      this.removeControl();
    } else {
      this.showForm = true;
      this.form.get('ndoc').setAsyncValidators(this.dniExistenteValidator(this, this._userWebService, this.docBelongsTo))
    }
  }

  private _setValidators(): void {
    this.form.get('confirmPassword').setValidators([devutils.equalPasswordValidator(this.form, 'password','confirmPassword'), Validators.required]);
  }

  removeControl(): void {
    this.form.removeControl('termscond');
    this.form.removeControl('password');
    this.form.removeControl('confirmPassword');
    this.form.removeControl('fechaNacimiento');
    this.form.removeControl('telefono');
    this.form.removeControl('domicilio');
    this.form.removeControl('ciudad');
    this.form.removeControl('provincia_estado');
    this.form.removeControl('pais');
    this.form.get('tipoDoc').disable();
    this.form.get('ndoc').disable();
    this.form.get('ndoc').clearAsyncValidators();
    this.form.get('numTramite').disable();
    this.showForm = true;
  }

  verPassword(): void {
    const nodes = document.getElementsByClassName('password');
    for (let i = 0; i < nodes.length; i++) {
      const atributo = nodes[i].getAttribute('type');
      if (atributo === 'password') {
        nodes[i].setAttribute('type', 'text');
      } else {
        nodes[i].setAttribute('type', 'password');
      }
    }
    this.showPassword = this.showPassword ? false : true;
  }

  showInstructivo() {
    this._dialog.open(InstructivoNumTramiteModalComponent);
  }
  onSubmit(): void {

    let fvalue: RegistroUser = this.form.getRawValue();
    if (!this.isEdit) {
      // Primero seteamos la fecha
      let date = new Date(this.form.get('fechaNacimiento').value)
      let fecha_nacimiento_string = devutils.setFecha(date);
      fvalue.fechaNacimiento = fecha_nacimiento_string;
      fvalue.tsFechaNacimiento = date.getTime();

    }

    delete fvalue['termscond'];
    this.checkRegister(fvalue);
  }

  editPerson() {
    let user = new UsuarioWeb();
    user._id = this._userWebService.currentUser._id;
    this._personService.fetchPersonByUserAGN(user).subscribe(personas => {
      if (personas && personas.length) {
        this._router.navigate(['../../', 'personas', personas[0]['_id']], { relativeTo: this._route });
      }
    })
  }

  checkRegister(userAGNForm: RegistroUser): void {
    let userAgn = new UsuarioWeb();
    userAGNForm.email = userAGNForm.email ? userAGNForm.email.trim() : userAGNForm.email;
    userAGNForm.respuestaSecreta = userAGNForm.respuestaSecreta ? userAGNForm.respuestaSecreta.trim() : userAGNForm.respuestaSecreta;

    Object.assign(userAgn, userAGNForm);

    userAgn.username = userAGNForm.email; //De momento el email será el usuario
    delete userAgn['confirmPassword'];
    userAgn.respuestaSecreta = this.eliminarDiacriticos(userAgn.respuestaSecreta.toLowerCase());

    //Verificamos si estamos en modo edición o modo alta
    if (!this.isEdit) {
      userAgn.isMayorEdad = parseInt(this.currentAge()) >= 18 ? true : false;
      this._userWebService.createUserWeb(userAgn).then((user) => {
        this._notificacionService.success("Usuario registrado con éxito");
        this._localService.setItem(gldef.app_prefix, 'navegante', { isRegistered: true });
        this.volver();
      }).catch((err) => {
        this._notificacionService.error(
          "Se produjo un error al registrar usuario",
        );
      });
    }
    else {
      this._userWebService.updateDataUser(this.usuario._id, userAgn).then(user => {
        this._notificacionService.success("Usuario editado con éxito");
        this._userWebService.userEmitter.next(user);
        this._userWebService.fetchPersonByUserId(this.usuario._id).then(persona => {

          if (persona) {
            let personEdit: Person = persona[0];
            let compare: Person = new Person('abc');
            Object.assign(compare, persona[0]);
            personEdit.nombre = user.nombre;
            personEdit.apellido = user.apellido;
            if ((user.nombre !== compare.nombre) || (user.apellido !== compare.apellido)) {
              personEdit.displayName = user.nombre + ' ' + user.apellido;
            }
            personEdit.email = user.email.trim();
            this._personService.update(personEdit).then(persona => {
              this.volver();
            })

          }



        })

      }).catch((err) => {
        this._notificacionService.error(
          "Se produjo un error al editar al usuario",
        );
      });
    }

  }

  eliminarDiacriticos(texto: string) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  }

  volver(): void {
    this._router.navigate(this.ruta);
  }



  currentAge() {
    let edad = '';
    let valueDate = this.form.value.fechaNacimiento;
    if (valueDate) {
      let value = devutils.datePickerToTx(valueDate);
      let validAge = devutils.validAge(value);
      if (validAge) {
        edad = devutils.edadActual(devutils.dateFromTx(value)) + '';
      }
      return edad;

    }
  }

  hasError = (controlName: string, errorName: string) => {
    return this.form.controls[controlName].hasError(errorName);
  }

  dniExistenteValidator(that: any, service: UserWebService, message: object): AsyncValidatorFn {
    return ((control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      let value = control.value;
      let tdoc = that.form.controls['tipoDoc'].value || 'DNI';

      return service.testUserByDNI(tdoc, value).pipe(
        map(t => {
          let invalid = false;
          let txt = '';

          if (t && t.length) {
            invalid = true;
            txt = 'Documento existente';
          }

          message['error'] = txt;
          return invalid ? { 'ndocerror': txt } : null;
        })
      )
    });
  }

  emailExistenteValidator(that: any, service: UserWebService, message: object): AsyncValidatorFn {
    return ((control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      let value = control.value;

      return service.testUserByEmail(value).pipe(
        debounceTime(3000),
        map(t => {
          let invalid = false;
          let txt = '';

          if (t && t.length) {
            if (t[0].email === this.emailOrigen) {
              invalid = false;
            } else {
              invalid = true;
              txt = 'Correo electrónico existente';
            }
          }

          message['error'] = txt;
          return invalid ? { 'mailerror': txt } : null;
        })
      )
    });
  }

  openTermsCond(): void {
    this._dialog.open(TermscondModalComponent).afterClosed().subscribe(action => {
      if (action) {

        this.form.controls['termscond'].setValue(true);
      } else {
        this.form.controls['termscond'].setValue(false);

      }

    });
  }

}

export class PreguntaSecreta {
  key: string;
  label: string;
}

const preguntasSecretas: PreguntaSecreta[] = [{
  key: 'mascota',
  label: '¿Nombre de tu mascota?',
}, {
  key: 'madre',
  label: '¿Primer nombre de tu madre?',
}, {
  key: 'hijo',
  label: '¿Primer nombre de tu hijo?',
}, {
  key: 'color',
  label: '¿Color favorito?',
}, {
  key: 'comida',
  label: '¿Comida favorita?',
}];

export class RegistroUser {
  username: string;
  telefono: string;
  ndoc: string;
  email: string;
  tipoDni: string;
  numTramite: number;
  fechaNacimiento: string;
  tsFechaNacimiento: number;
  password: string;
  preguntaSecreta: string;
  respuestaSecreta: string;
  nombre: string;
  apellido: string;
  domicilio: string;
  ciudad : string;
  provincia_estado : string;
  pais : string;
}
