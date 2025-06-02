import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PersonContactData, UpdateContactEvent } from '../../../../entities/person/person';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

const TOKEN_TYPE = 'contact';
const CANCEL = 'cancel';
const DELETE = 'delete';
const UPDATE = 'update';
@Component({
  selector: 'personas-contactdata-edit',
  templateUrl: './personas-contactdata-edit.component.html',
  styleUrls: ['./personas-contactdata-edit.component.scss']
})
export class PersonasContactdataEditComponent implements OnInit {

  @Input() token: PersonContactData;
	@Output() updateToken = new EventEmitter<UpdateContactEvent>();

  public tipoDeContactoList =  [
		{val: 'no_definido', 	  label: 'Seleccione opción',slug:'Seleccione opción' },
		{val: 'CEL',   label: 'CEL',    slug:'CEL' },
		{val: 'MAIL',  label: 'MAIL',   slug:'MAIL' },
		{val: 'TEL',   label: 'TEL',    slug:'TEL' },
		{val: 'WEB',   label: 'WEB',    slug:'WEB' },
];
  public contactTypeList = [
    {val: 'no_definido', label: 'Seleccione opción',   slug:'Seleccione opción' },
    {val: 'PER',    label: 'Personal',      slug:'PER' },
    {val: 'LAB',    label: 'Laboral',       slug:'LAB' },
    {val: 'OTRO',   label: 'Otro',          slug:'OTRO' },
];

	public form: FormGroup;


  private action = "";
  private fireEvent: UpdateContactEvent;

  constructor(
  	private fb: FormBuilder,
  	) { 
  		this.form = this.buildForm();
	}

  ngOnInit() {
  	this.initForEdit(this.form, this.token);
  }

  onSubmit(){
  	this.initForSave(this.form, this.token);
  	this.action = UPDATE;
  	this.emitEvent(this.action);
  }

  onCancel(){
  	this.action = CANCEL;
  	this.emitEvent(this.action);
  }

  deleteToken(){
    this.action = DELETE;
    this.emitEvent(this.action);
  }

  emitEvent(action:string){
  	this.updateToken.next({
  		action: action,
  		type: TOKEN_TYPE,
  		token: this.token
  	});

  }

  changeSelectionValue(type, val){
    //c onsole.log('Change [%s] nuevo valor: [%s]', type, val);
  }
 
  buildForm(): FormGroup{
  	let form: FormGroup;

    form = this.fb.group({
      tdato: [null,  Validators.compose([Validators.required])],
      data:  [null,  Validators.compose([Validators.required])],
      type:  [null],
      slug:  [null],
    });
    return form;
  }

  initForEdit(form: FormGroup, token: PersonContactData): FormGroup {
		form.reset({
			tdato: token.tdato,
			data: token.data,
			type: token.type,
			slug: token.slug
		});

		return form;
  }

	initForSave(form: FormGroup, token: PersonContactData): PersonContactData {
		const fvalue = form.value;
		const entity = token;
		entity.tdato = fvalue.tdato;
		entity.data  = fvalue.data;
		entity.type  = fvalue.type;
		entity.slug  = fvalue.slug;

		return entity;
	}

}
