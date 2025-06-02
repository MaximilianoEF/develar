import { Component, OnInit, OnDestroy, Input, Output, OnChanges, HostListener, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { PersonController } from '../person.controller';

import { Person, personModel } from '../person';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { tap } from 'rxjs/operators';

const whoami = "person-manage "

@Component({
  selector: 'person-manage',
  templateUrl: './person-manage.component.html',
  styleUrls: ['./person-manage.component.scss']
})
export class PersonManageComponent implements OnInit, OnChanges, OnDestroy {


  public _openEditor: boolean = false;
  private _editable: boolean = true;
  private _editMany: boolean = false;
  private _editorTitle = "Alta nueva Comunidad";
  private _modelSbscrptn;
  private _recordtype = 'person';

  private person: Person;
  private personId: string;
  private personEditList: Person[];
  private searchTerms: Subject<PersonQuery> = new Subject<PersonQuery>();
  private communities: Person[] = [];
  public userTypeList = [
    { val: 'userweb', label: 'Usuarios Web' },
    { val: 'useradmin', label: 'Usuarios Admin' }
  ];
  private query: PersonQuery;
  public form: FormGroup;
  public showData: boolean = false;
  constructor(
    private personCtrl: PersonController,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      typeuser: [null]
    });
  }

  ngOnDestroy() {
    this._modelSbscrptn.unsubscribe()
  }

  ngOnChanges() {

  }

  ngOnInit() {


    this.searchTerms.pipe(
      tap(term => this.updateTableList())
    ).subscribe();

    // this.updateTableList();

    this._modelSbscrptn = this.personCtrl.modelListener.subscribe(entity => {
      this.initEntityData(entity);
      this.person = entity;
    })

    this.personCtrl.initController(this.person, this.personId);



  }

  updateSelCommunities(list: Person[]) {

  }

  updateTableList() {
    if (this.query) {
      this.personCtrl.fetchPersonTableList('person', this.query);
      this.showData = true;

    }
  }

  initEntityData(entity) {
    setTimeout(() => {
      this.updateTableList();
    }, 1000);
  }

  initToSave() {
  }

  save(target) {
    // if(this._editMany){
    //   this.saveMany(target);

    // }else{
    //   this.initToSave()
    //   this.personCtrl.saveRecord().then(model =>{
    //     this.personId = model._id;
    //     this.personCtrl.initController(model, model._id);
    //   });
    // }
  }

  saveMany(target) {
    // let base = this.personCtrl.actualNewData(this.person);
    // delete base['_id'];

    // this.personEditList.forEach(token =>{
    //   token = this.personCtrl.updateCommonData(token, base);
    //   //this.person = token;
    //   this.saveToken(token)
    // });
    // this.resetEditMany();
  }

  saveToken(entity: Person) {
    //this.personCtrl.updateRecord(entity);
  }

  resetEditMany() {
    this.personCtrl.initController(this.person, this.person._id)
    this._editMany = false;
    this.personEditList = [];
  }

  saveNew(target) {
    // 	this.initToSave()
    // this.personCtrl.cloneItemRecord().then(entity =>{
    // 	this.personId = entity._id;
    // 	this.personCtrl.initController(entity, entity._id);
    // });
  }

  openEditor() {
    this._openEditor = true;
    return this._openEditor;
  }

  changeType(val) {
  }

  initTableSelectedEntityList() {
    this.personEditList = this.personCtrl.fetchSelectedList();
    //this.editMany();
  }


  editMany() {
    // if(!this.personEditList || !this.personEditList.length) return;
    // this._editMany = this.personEditList.length > 1 ? true : false;

    // this.person = this.personCtrl.buildCommonData(this.personEditList);
    // this.personId = this.person._id;

    // this.personCtrl.initController(this.person, this.personId);
    // this.openEditor();
  }

  actionTriggered(action) {
    if (action === 'navigate') {
      this.initTableSelectedEntityList();
      this.personCtrl.createUsers(this.personEditList);

    }


    // if(action === 'editone')      this.initTableSelectedEntityList();
    // if(action === 'navigate')     this.changeCurrentPerson();
  }

  volver(target: string) {
    if (target === "public") {
      this.router.navigate(['/' + this.personCtrl.currentPublicUrl()]);

    }
    if (target === 'admin') {
      this.router.navigate(['/']);
    }

  }

  private initQuery(form: FormGroup, query: PersonQuery): PersonQuery {
    const fvalue = form.value;

    if (!query) {
      query = new PersonQuery();
    }

    query.typeuser = fvalue.typeuser;
    return query;
  }

  public onSelectionChange(key: string, val: string): void {
    if (!this.query) {
      this.query = new PersonQuery();
    }
    this.query[key] = val;

    this.query = this.initQuery(this.form, this.query);
    this.query = this.cleanQueryToken(this.query);

    this.searchTerms.next(this.query);
  }

  public search(): void {
    this.query = this.initQuery(this.form, this.query);
    this.query = this.cleanQueryToken(this.query);

    this.searchTerms.next(this.query);
  }

  private cleanQueryToken(query: PersonQuery): PersonQuery {
    if (!query) {
      return null;
    }
    Object.keys(query).forEach((key) => {
      if (
        query[key] == null ||
        query[key] === '' ||
        query[key] === 'no_definido'
      ) {
        delete query[key];
      }
    });
    return query;
  }



  public fetchPersonByQuery(query: PersonQuery): void {
    this.personCtrl.findByQuery('person', query)
      .subscribe({
        next: items => {
          if (items && items.length > 0) {
            this.updateTableList();
            this.showData = true;
          } else {
            this.showData = false;
          }
        },
        error: err => {
          console.log("OPPPPS!! --> %o", err)
        }
      });
  }
}
export class PersonQuery {
  typeuser: string;
}
