import { Component, Input, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';

import { SiteMinimalController, SolicitudDeContacto } from '../minimal.controller';
import { RecordCard } from '../recordcard.model';

import { gldef } from '../../develar-commons/develar.config';
import {DomSanitizer} from '@angular/platform-browser';

const ALTERNATIVE_LOGO = 'assets/img/' + gldef.logoCompany2;
const LOGO_COMPANY = 'assets/img/' + gldef.logoCompany;

const AGN_BICENTENARIO_SEARCH_URL = 'web/fichatecnica/';

@Component({
  selector: 'buscador-agn-bicentenario',
  templateUrl: './buscador-agn-bicentenario.component.html',
  styleUrls: ['./buscador-agn-bicentenario.component.scss']
})
export class BuscadorAgnBicentenarioComponent implements OnInit {
	@Input() record: RecordCard;

	public btnRegisterLabel = 'Regístrate';

  public isAsuntoMail = false;
  public isLocacion = true;
	public title: string = "";

  public form: FormGroup;
  public formTitle: string = "Contacto";
  public formSubTitle: string = 'envianos tus datos'
  public description: string = "";
  private contacto = new SolicitudDeContacto();

  public nodes: Array<Notes> = [];

  public hasLogoAlt = false;
  public logoAltUrl = ALTERNATIVE_LOGO;
  public logoCompany = LOGO_COMPANY;

  public mainimage: string = "";
  public hasImage = false;

  public excerpt: string = "";
  public hasExcerpt = false;

  public linkTo: string = "";
  public hasLinkTo = false;
  public linkText: string = "";

  constructor(
      private fb: FormBuilder,
      private minimalCtrl: SiteMinimalController,
      private router: Router,
      private matIconRegistry: MatIconRegistry,
      private domSanitizer: DomSanitizer
    ) {
      /*this.form = this.fb.group({
        name:        [null, Validators.compose([Validators.required])],
        slug:        [null],
        locacion:        [null, Validators.compose([Validators.required])],
        email:       [null, Validators.compose([Validators.required, Validators.email])],
        termsofuse:  [null],
        description: [null],
      });*/

    this.form = this.fb.group({
      terms: [null]
    });

    this.matIconRegistry.addSvgIcon('agn_logo', this.domSanitizer.bypassSecurityTrustResourceUrl('../../assets/img/logo-sidebar-04.svg'));
  }

  ngOnInit() {
    //c onsole.log('ficha buscador-agn-bicentenario record :: %o', this.record);

  	this.title = this.record.slug;
  	this.description = this.record.description;
    this.formTitle = this.record.slug;
    this.formSubTitle = this.record.subtitle;

    this.formReset();


    this.record.relatedcards.forEach(s => {
      this.nodes.push({
        title: s.slug,
        imageUrl: s.mainimage,
        linkTo: s.linkTo,
        subtitle: s.subtitle,
        description: s.description,
      } as About)
    });

    if(gldef.logoCompany2 && gldef.logoCompany2 !== gldef.logoCompany ){
      this.hasLogoAlt = true;
    }

    this.mainimage = this.record.mainimage;
    this.hasImage = this.mainimage ? true : false;
    this.linkTo = this.record.linkTo;
    this.hasLinkTo = this.linkTo ? true : false;

    if(this.nodes && this.nodes.length){

      this.excerpt = this.nodes[0].description;
      this.linkTo = this.nodes[0].linkTo;
      this.linkText = this.nodes[0].subtitle || 'Enviar';

      this.hasExcerpt = this.excerpt ? true : false;
      this.hasLinkTo = this.linkTo ? true : false;
    }

    this.formReset();


  }

  navigateTo(e){
    e.stopPropagation();
    e.preventDefault();
    if(this.hasLinkTo){
      this.router.navigate([this.linkTo])

    }
  }
  public navigateDashboard(): void {
    this.router.navigate(['web', 'usuario', 'dashboard']).then();
  }



  /******** FORM ACTIONS  ******/

  // Buscador AGN-Bicentenario: on submit search form
  public onSubmit(): void {
    const fvalue = this.form.value;
    //c onsole.log(fvalue);

    this.router.navigate([AGN_BICENTENARIO_SEARCH_URL], { queryParams: { terms: fvalue.terms }});
  }

  // form solicitud
  public formReset(){
    /*this.contacto = new SolicitudDeContacto();
    this.form.reset({
        name:        this.contacto.name,
        slug:        this.contacto.slug,
        locacion:    this.contacto.locacion,
        email:       this.contacto.email,
        termsofuse:  this.contacto.termsofuse,
        description: this.contacto.description
    })*/
    this.form.reset({
      terms: null
    });
  }


  /******** SAVING-CANCEL A C T I O N S  ******/
  public enviarSolicitud() {
    let node: Notes = {} as Notes

    let fvalue = this.form.value;
    this.contacto.name = fvalue.name;
    this.contacto.email = fvalue.email;
    this.contacto.locacion = fvalue.locacion;
    this.contacto.termsofuse = fvalue.termsofuse;
    this.contacto.slug = fvalue.slug || this.minimalCtrl.defaultEmailSubject;
    this.contacto.description = fvalue.description || this.minimalCtrl.defaultEmailBody;

    this.minimalCtrl.saveContactPerson(this.contacto)

    this.minimalCtrl.notifyUsers(this.contacto)

    node = this.initMessageText(this.nodes);



    this.minimalCtrl.openModalDialog(new NotifyDialog(node,  this.contacto.name, this.contacto.email ));
    this.formReset();




    // this.model = initForSave(this.form, this.model, this.relatedcards, this.personList, this.resourceList, this.assetList, this.tagList, this.userService.currentUser, this.communityList);
    // return this.cardService.update(this.model).then((model) =>{
    //     this.openSnackBar('Grabación exitosa id: ' + model._id, 'cerrar');
    //     return model;
    //   });

  }

  private initMessageText(nodes: Notes[]){
    if(this.nodes && this.nodes.length && this.nodes.length >= 2){
      return this.nodes[1]

    }else{
      return {
        title: '¡Gracias por vuestro interés!',
        subtitle: 'Mensaje enviado correctamente',
        description: 'Serás contactado por nuestros representantes a la brevedad.',
        imageUrl: '',
        linkTo: ''
      }
    }
  }

  private initTermsOfCondition(nodes: Notes[]){
    if(this.nodes && this.nodes.length && this.nodes.length >= 1){
      return this.nodes[0]

    }else{
      return {
        title: 'Privacidad y uso de los datos',
        subtitle: 'Condiciones de uso de la paltaforma',
        description: `
                <p>Toda información contenida o enviada a esta plataforma es considerada confidencial</p>
                <p>El envío de este formulario supone la aceptación de que seas contactado por uno de nuestros representantes a través de la casilla de correo provista.</p>
                <p>No se te enviará publicidad de ningún tipo a tu casilla de correo desde esta plataforma</p>
                <p>Cualquier otro servicio previsto requiere tu registración voluntaria.</p>`,
        imageUrl: ''

      }
    }
  }

  public termsOfConditions(){
    let node = this.initTermsOfCondition(this.nodes);

    this.minimalCtrl.openModalDialog(new TermsOfCondition( node)).subscribe(action => {
      if(action === 'accept'){

        //  this.form: array de controls ==> formGroup
        // this.form.controls['field'] ==> form Control

        this.form.controls['termsofuse'].setValue(true);
      }else{
        this.form.controls['termsofuse'].setValue(false);

      }

    });
  }

}

interface Notes {
	imageUrl: string;
	description: string;
  title: string;
  subtitle: string;
  linkTo: string;
}


class NotifyDialog {
  width:string =  '430px';
  height:string = '500px';
  hasBackdrop:boolean = true;
  itemplate: string = '';
  backdropClass:string = 'yellow-backdrop';

  data: any = {
                caption:'',
                title: '',
                body: '',
                accept:{
                  action: 'accept',
                  label: 'Cerrar'
                }
              };

  constructor(node, txt?, mail?){
    txt = txt || ' ';
    mail = mail || '';
    this.data.caption = node.subtitle;
    this.data.title = node.title;
    let txt1 =  `<p>Estimado/a <strong>${txt}</strong>:</p>`;
    let txt2 =  `<p>Un mail de confirmación te será enviado a <strong> ${mail} </strong>, por favor verifica que no entre como spam o prioridad baja.</p> <p> Gracias.</p>`;
    this.data.body = txt1 + node.description + txt2;
  }
}

class TermsOfCondition {
  width:string =  '430px';
  height:string = '500px';
  hasBackdrop:boolean = true;
  itemplate: string = '';
  backdropClass:string = 'yellow-backdrop';

  data: any = {
                caption:'',
                title: '',
                body: '',

                accept:{
                  action: 'accept',
                  label: 'Aceptar'
                },
                cancel:{
                  action: 'deny',
                  label: 'Rechazar'
                }
              };

  constructor(node){
    this.data.caption = node.subtitle;
    this.data.title = node.title;
    this.data.body = node.description;

  }
}

interface About {
  imageUrl: string;
  description: string;
  subtitle: string;
  linkTo: string;
  title: string;
}



//*ngFor="let col of TABLE_COLUMNS" [(ngModel)]='col' >{{col}}
