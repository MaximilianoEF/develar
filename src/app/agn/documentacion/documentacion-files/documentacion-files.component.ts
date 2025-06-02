import { Component, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { Subject } from 'rxjs';
import { AssetFile, Asset } from '../../../develar-commons/develar-entities';
import { AssetService } from '../../../develar-commons/asset.service';
import { NotificationService } from '../../../develar-commons/notifications.service';
import { PersonService } from '../../../entities/person/person.service';
import { UserService } from '../../../entities/user/user.service';
import { Person } from '../../../entities/person/person';
import { CardGraph, graphUtilities } from '../../../develar-commons/asset-helper';
import { UserWebService } from '../../../entities/userweb/user-web.service';

const URL = 'api/upload/assetupload';
@Component({
  selector: 'documentacion-files',
  templateUrl: './documentacion-files.component.html',
  styleUrls: ['./documentacion-files.component.scss']
})
export class DocumentacionFilesComponent implements OnInit {

	private fileSubject = new Subject<AssetFile>();
  public title = 'Tus archivos digitales';
  public slugTitle = 'Para determinados trámites o servicios, AGN podrá requerir que adjuntes documentos en formato PDF o JPEG. En ése caso arrastra el archivo a la zona punteada o utiliza el botón de Seleccionar archivo. Se admite un peso máximo de 1MB.';
  public files = [];
  public model: Asset;
  public hasBaseDropZoneOver:boolean = false;
	public hasAnotherDropZoneOver:boolean = false;
  public person : Person ;
  public uploader : FileUploader = new FileUploader({url: URL});
  public showPersonCard : boolean = false;

  constructor(
    private assetService : AssetService,
    private _notificationService : NotificationService,
    private _userService : UserService,
    private _personService : PersonService,
    private _user : UserWebService) {}

  ngOnInit(): void {

    let user = this._userService.currentUser;
    let isWeb = user.isUsuarioWeb ? true : false;
    if(isWeb){
      this._user.fetchPersonByUserId(this._userService.currentUser._id).then(persona => {
        this.person = persona[0];
        this.showPersonCard = true;
      });
    }else{
      this._userService.getPerson().then(persona => {
        this.person = persona;
        this.showPersonCard = true;
      })
    }
    
    this.prepararCarga();
    

  }

  prepararCarga() : void {
    this.fileUpdated(this.fileSubject);

  	this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
			let asset = JSON.parse(response) as AssetFile;
      this.fileSubject.next(asset);
      let grap = graphUtilities.cardGraphFromAsset('asset',asset, '');
      if(this.person.assets && this.person.assets.length){
        this.person.assets.unshift(grap);
      }else{
        this.person.assets = [];
        this.person.assets.push(grap);
      }
      this._personService.update(this.person).then( person => {
        //c onsole.log(person);
        this._notificationService.success("Documentación adjuntada con éxito");
      })
    };
  }

  uploadFile() : void {
    const fileInput = document.getElementById('fileupload') as HTMLInputElement;
    fileInput.click();
  }

  public fileOverBase(e:any):void {
	  this.hasBaseDropZoneOver = e;
	}

	public fileOverAnother(e:any):void {
	  this.hasAnotherDropZoneOver = e;
  }
  
  fileUpdated(loader: Subject<AssetFile>){
    loader.subscribe(file =>{
      this.files.unshift(file);
    })
  }

  saveNewRecord(){
    return this.assetService.create(this.model).then((model) =>{
              this._notificationService.success('Grabación exitosa id: ' + model._id);
              return model;
            });
  }

  deleteCard(card : CardGraph) {
    let cardG = this.person.assets.find(c => c.entityId === card.entityId);
    if(cardG){
      this.person.assets.splice(this.person.assets.indexOf(cardG),1);
      this._personService.update(this.person).then(person => {
        // this.assetService.delete(card.entityId).then( x => {
        //   console.log("Se borro con exito : "+x)
        // });
      })
    }
  }

  /**
   * 
   *   let fileData = {
    filename:     file.filename,
    path:         path.relative(publicPath,req.file.path),
    originalname: file.originalname,
    encoding:     file.encoding,
    mimetype:     file.mimetype,
    size:         file.size,
    destination:  file.destination,
    upload:       uploadDate,
    uploadtime:   uploadDate.getTime()
  }
   */

  

  


}
