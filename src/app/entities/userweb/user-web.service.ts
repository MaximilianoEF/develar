import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Subject, Observable } from "rxjs";
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { UsuarioWeb } from './usuario-web';
import { DaoService } from '../../develar-commons/dao.service';
import { NotificationService } from '../../develar-commons/notifications.service';
import { Person } from '../person/person';
import { RecordCard } from '../../bookshelf/recordcard';

const RECORD : string = "usuariosloggin";
const RECORDUSUARIO : string = "usuariosweb"
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


@Injectable({
  providedIn: "root",
})
export class UserWebService {
  private isLogIn = false;
  private hasLogout = false;
  private usersUrl = "api/usuarios"; // URL to web api
  private usersLogginUrl = "api/usuariosloggin";
  private currentUserUrl = "api/currentuser";
  private userApiFetchPerson = 'api/usuarios/%s/persona';

  private headers = new HttpHeaders().set("Content-Type", "application/json");
  private _currentUser: UsuarioWeb;
  private _userEmitter: BehaviorSubject<UsuarioWeb>;
  endSetUser$ : Subject<boolean>;


  private currentUserSubj: Subject<UsuarioWeb> = new Subject<UsuarioWeb>();
  public currentUserObservable$: Observable<UsuarioWeb> = this.currentUserSubj.asObservable()


  constructor(
    private _router: Router,
    private http: HttpClient,
    private _notificacionService: NotificationService,
    private daoService: DaoService
  ) {
    this._userEmitter = new BehaviorSubject( new UsuarioWeb());
    this.endSetUser$ = new Subject();
  }


  private notFetchedMore : boolean = false;

  login(user: any): Promise<UsuarioWeb> {
    
    let url = `${this.usersLogginUrl}/login`;
    this.hasLogout = false;
    return this.http
      .post(url, JSON.stringify(user), { headers: this.headers })
      .toPromise()
      .catch(this.loginError);
  }

  logout(): Promise<any> {
    let url = `${this.usersLogginUrl}/logout`;
  
    this.isLogIn = false;
    this.hasLogout = true;
    this._currentUser = null;
    this._userEmitter.next(this._currentUser);

    return this.http.get(url)
      .toPromise()
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {

    return Promise.reject(error.message || error);
  }

  private loginError(error: any): Promise<any> {
    this.isLogIn = false;
    this.hasLogout = false;
    return Promise.reject(
      {
        message:
          "loginError: fallo en la autenticación, el usuario o la clave son incorrectas",
      },
    );
  }

  get userlogged(): boolean {
    return this.isLogIn;
  }

  initLoginUser() {
    let fetchedUser: UsuarioWeb;
    let loggedIn = false;
    let loginUser = new Subject<UsuarioWeb>();

    this.loadLoginUser().then((res) => {
      fetchedUser = res as UsuarioWeb;
      loggedIn = (fetchedUser && fetchedUser._id) ? true : false;

      if (!loggedIn) {
        setTimeout(() => {
          this.loadLoginUser().then((res) => {
            fetchedUser = res as UsuarioWeb;
            loggedIn = (fetchedUser && fetchedUser._id) ? true : false;

            if (!loggedIn) {
              // Lo redirigimos a la pantalla principal
              this._router.navigateByUrl("");
            } else {
              this.setLoginUser(fetchedUser, loginUser);
            }
          });
        }, 2000);
      } else {
        this.setLoginUser(fetchedUser, loginUser);
      }
    })
      .catch(this.handleError);

    return loginUser;
  }

  loadLoginUser() {
    return this.http
      .get(this.currentUserUrl)
      .toPromise();
  }

  setLoginUser(user: UsuarioWeb, loginUser: Subject<UsuarioWeb>) {
    this.currentUser = user;
    this.isLogIn = true;
    this.hasLogout = false;
    loginUser.next(this._currentUser);
    this._userEmitter.next(this._currentUser);
    this.endSetUser$.next(true);
    this.currentUserSubj.next(user);
  }


  updateCurrentUser(): Promise<UsuarioWeb> {
		return this.http
			.get(this.currentUserUrl)
			.toPromise()
			.then(res =>{
				let fetchedUser = res as UsuarioWeb;
				this.isLogIn = (fetchedUser && fetchedUser._id) ? true: false;

				if(!this.isLogIn ){
					this.hasLogout = true;

				}else {
					this.hasLogout = false;
					this.currentUser = fetchedUser;
				}

        this.userEmitter.next(this._currentUser);
        this.notFetchedMore = true;
				return this._currentUser;
			})
			.catch(this.handleError);
	}

  get userEmitter(): BehaviorSubject<UsuarioWeb> {
    return this._userEmitter;
  }

  get currentUser(): UsuarioWeb {

    if(!this.hasLogout && !this.notFetchedMore){
			this.updateCurrentUser();
		}
		//c onsole.log(this._currentUser)
		return this._currentUser;

  }

  set currentUser(user: UsuarioWeb){
		this._currentUser = user;
  }

  createUserWeb(user: UsuarioWeb): Promise<UsuarioWeb> {
    return this.daoService.create(RECORD, user);
  }

  resetPassword(datos : any) : Promise<any> {
    const url = this.usersLogginUrl+'/resetpassword';
    return this.http.post(url, JSON.stringify(datos), {headers : this.headers}).toPromise().catch();
  }

  updateDataUser(id : string, data : UsuarioWeb) : Promise<UsuarioWeb> {
    return this.http.put<UsuarioWeb>('api/usuarios/'+id,data, {headers : this.headers}).toPromise().catch();
  }

  public fetchPersonByUserId(id: string): Promise<Person> {
    return this.http
      .get<Person>(this.userApiFetchPerson.replace('%s', id), { headers: this.headers })
      .toPromise();
  }

  public fetchById(id: string): Promise<UsuarioWeb> {
    return this.http.get<UsuarioWeb>('api/usuarios/' + id, { headers: this.headers }).toPromise();
  }

  //TEST

  public testUserByDNI(tdoc:string, ndoc:string ): Observable<UsuarioWeb[]>{

    let query = {
      tdoc: tdoc,
      ndoc: parseInt(ndoc)
    }
    return this.daoService.search<UsuarioWeb>(RECORDUSUARIO, query);


  }

  fetchRecordsByQuery(query): Observable<RecordCard[]> {
    return this.daoService.search<RecordCard>('recordcard', query);
  }

  buildMainImage(record: RecordCard):ImageToken{
    let serviceToken: ImageToken = null;
    if(record){
        serviceToken = {
          imageUrl: record.mainimage,
          serviceUrl: record.linkTo,
          slug: record.slug,
          topic: record.topic
        } as ImageToken;
     
    }
    return serviceToken;
   //
  }

  buildImageArray(record: RecordCard):Array<ImageToken>{
    let services: Array<ImageToken> = [];
    if(record && record.relatedcards && record.relatedcards.length){
      services = record.relatedcards.map(rc => {
        return {
          imageUrl: rc.mainimage,
          serviceUrl: rc.linkTo,
          slug: rc.slug,
          topic: rc.topic
        } as ImageToken;
      })
    }
    return services;
   //
  }

  navigateAbsoluteToService(service: ImageToken): Array<string>{
    let navigateArray = [];
    ///web/usuario/dashboard/consultas
    //http://develar-local.co:4200
    switch (service.topic) {
      case 'perfil': {
        if(this.currentUser && this.currentUser.isUsuarioWeb){
          navigateArray = [ '/web', 'usuario', 'dashboard', 'datos', this.currentUser._id]
        }else {
          // no puede acceder al perfil un usuario no-web o sin una sesión activa
          this._notificacionService.warn('CREDENCIALES INCORRECTAS para acceder a esta opción')
          navigateArray = [ '/']
        }
        break;
      }
      case 'inmigrantes': {
        navigateArray = [ '/web', 'usuario', 'dashboard', 'antecedentesmigratorios']
        break;
      }

      case 'turnos': {
        navigateArray = [ '/web', 'usuario', 'dashboard', 'turnospresenciales']
        break;
      }

      case 'consultas': {
        navigateArray = [ '/web', 'usuario', 'dashboard', 'consultas']
        break;
      }

      case 'documentos': {
        navigateArray = [ '/web', 'usuario', 'dashboard', 'documentacion']
        break;
      }

      case 'servicios': {
        navigateArray = [ '/web', 'usuario', 'dashboard', 'servicios']
        break;        
      }

      case 'historialbusquedas': {
        navigateArray = [ '/web', 'usuario', 'dashboard', 'historialbusquedas']
        break;
      }
    }
    return navigateArray;
  }

  private openModalDialog(config:any){
    this._notificacionService.openModalDialog(config).subscribe((result) => {
      this._router.navigate(['']);
    });

  }


  navigateToService(service: ImageToken): Array<string>{
    let navigateArray = [];
    switch (service.topic) {
      case 'perfil': {
        navigateArray = ['datos', this.currentUser._id]
        break;
      }

      case 'turnos': {
        navigateArray = ['turnospresenciales']
        break;
      }

      case 'inmigrantes': {
        navigateArray = [ 'antecedentesmigratorios']
        break;
      }

      case 'consultas': {
        navigateArray = ['consultas']
        break;
      }

      case 'documentos': {
        navigateArray = ['documentacion']
        break;
      }

      case 'servicios': {
        navigateArray = ['servicios']
        break;        
      }

      case 'historialbusquedas': {
        navigateArray = ['historialbusquedas']
        break;
      }
    }
    return navigateArray;
  }

  public testUserByEmail(email ): Observable<UsuarioWeb[]>{
    let query = {
      email: email,
    }
    return this.daoService.search<UsuarioWeb>(RECORDUSUARIO, query)
  }

  public fetchRecordCard(queryString) : Observable<RecordCard[]>{

    let query = {
			publish: true,
			"publish.topics": 'home',
			"publish.publishOrder": queryString,
		}
    let sscrp1 = this.fetchRecordsByQuery(query);
    return sscrp1;
  }

}

export class ImageToken {
  imageUrl: string;
  serviceUrl: string;
  topic: string;
  slug: string;
}
