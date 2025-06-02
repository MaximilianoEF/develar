import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';


import { User } from '../../../entities/user/user';
import { UserService } from '../../../entities/user/user.service';
import { gldef } from '../../../develar-commons/develar.config';

import { MainMenuItem, SocialMediaItem } from '../../../site-minimal/menu-helper';
import { MinimalMenuService } from '../../../site-minimal/minimal-menu.service';

import { MessageToPrint, notificationModel } from '../../../notifications/notification.model';
import { NotificationService } from '../../notifications.service';
import { UsuarioWeb } from '../../../entities/userweb/usuario-web';
import { UserWebService } from '../../../entities/userweb/user-web.service';

const DEFAULT_AVATAR = 'assets/content/' + gldef.logoUser;
const DEFAULT_LOGO = 'assets/img/' + gldef.logoCompany;
const LOGO_ARGENTINA_GOB_AR = 'assets/img/'+ gldef.logoArgentinaGobAr;


const BG_COLOR_DEFAULT = "#ffffff";
const BG_COLOR_LASARGEN_HOME = "#0645f5"; //75787B //0645f5

const NAVBAR_ITEM_COLOR_DEFAULT = "#0645f5";
const NAVBAR_ITEM_COLOR_LASARGEN_HOME = "#ffffff"; //75787B //0645f5



@Component({
  selector: 'agn-navbar',
  templateUrl: './agn-navbar.component.html',
  styleUrls: ['./agn-navbar.component.scss']
})
export class AgnNavbarComponent implements OnInit {
  @Input() title: string;

  currentUser: User | UsuarioWeb;
  public loggedIn = false;
  public avatar: string = DEFAULT_AVATAR
  public avatar2 = gldef.logoAvatar;
  public logoUrl = DEFAULT_LOGO;
  public logoArgentinaGobAr = LOGO_ARGENTINA_GOB_AR;

  public lema = gldef.lemaNavbar;
  public slema = gldef.slemaNavbar;
  public lemaUrl = gldef.lemaTargetUrl;

  public navbarStyle = {};
  public navbarItemStyle = {};

  public aboutText = "Utopías y Realidades del Movimiento Nacional";
  public contactText = "buscar";

  public hideLogin = false;
  public isHomeView = true;

  public mainMenuItems: MainMenuItem[];
  public socialItems: SocialMediaItem[];
  public userDisplayName: string = "";

  private socket: any;
  private connected = false;
  private username: string = "";
  public messageList: Array<MessageToPrint> = [];
  private messageLength = 0
  private messageNew = false;


  private hasActiveUrlPath = false;
  private actualUrl = "";
  private actualUrlSegments: UrlSegment[] = [];
  private navigationUrl = "";
  public isUserWeb: boolean = false;


  constructor(
    private userService: UserService,
    private _userWebService: UserWebService,
    private mainMenuService: MinimalMenuService,
    private route: ActivatedRoute,
    private router: Router,
    private _notificationService: NotificationService) {

    mainMenuService.menuListener$.subscribe(
      items => {
        this.mainMenuItems = items;
      }
    );

    mainMenuService.socialListener$.subscribe(
      items => {
        this.socialItems = items;
      }
    );
  }

  ngOnInit() {
    this.initSocket();
    this.mainMenuService.loadDefaultMenuItems(gldef.mainmenu);
    this.mainMenuService.loadSocialItems(gldef.socialmedia);

    this.initUser()
    this.title = 'argentina.gob.ar'

    this.route.url.subscribe(url => {
      this.actualUrl = this.router.routerState.snapshot.url;
      this.actualUrl = this.actualUrl ? this.actualUrl.split('?')[0] : this.actualUrl;

      if (!this.actualUrl || this.actualUrl === "/") {
        this.setupHomeView(true);

      } else {
        this.setupHomeView(false);

      }
    });


     this.userService.userEmitter.subscribe(user =>{
       this.initUser();
     })


  }

  initSocket() {
    let that = this;
    this.socket = this.userService.socket;
    this.socket.on('notification:message', function (msj: MessageToPrint) {
      that.addNotificationMessage(msj);
    });

  }

  initUser() {
    this.currentUser = this.userService.currentUser;
    this.loggedIn = this.userService.userlogged;
    this.userDisplayName = "¡Hola, " + (this.currentUser.nombre || this.currentUser.displayName || '') + '! ';
    this.avatar = DEFAULT_AVATAR;
    this.emitLogin();
    this.isUserWeb = this.currentUser['isUsuarioWeb'] ? this.currentUser['isUsuarioWeb'] : false;
  }


  emitLogin() {
    if (!this.loggedIn) return;
    this.username = this.currentUser.username;

    let usr = {
      username: this.username,
      userId: this.currentUser._id
    }
    this.socket.emit('user:connect', usr);
  }

  addNotificationMessage(data: MessageToPrint) {
    this.messageList.unshift(data);
    this.messageLength = this.messageList.length;
    this.messageList = this.messageList.sort((a, b) => (b.fe - a.fe))
    this.messageNew = true;
  }


  open(event) {
    let clickedComponent = event.target.closest('.nav-item');
    let items = clickedComponent.parentElement.children;

    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove('opened');
    }
    clickedComponent.classList.add('opened');
    this.messageNew = false;
  }

  close(event) {
    console.log('close')
    let clickedComponent = event.target;
    let items = clickedComponent.parentElement.children;

    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove('opened');
    }
  }

  isActiveUser(user: User) {
    let logged = false;
    if (user && user.username !== 'invitado')
      logged = true;

    return logged;
  }

  isAdminUser() {
        if(!this.isUserWeb){
          return this.userService.isAdminUser(); 
        }else{
          return false;
        }        
      
  }

  editProfile() {
    this.router.navigate(['/develar/entidades/usuarios', this.currentUser._id])
  }

  editUser(e) {
    e.stopPropagation();
    e.preventDefault();
    this.router.navigate(['/develar/entidades/usuarios', this.currentUser._id])
  }

  miPerfilWeb(e){
    e.stopPropagation();
    e.preventDefault();

    if(this.currentUser && this.currentUser.isUsuarioWeb){
      let navigateArray = [ '/web', 'usuario', 'dashboard', 'datos', this.currentUser._id]
      this.router.navigate(navigateArray)
    }else {
      // no puede acceder al perfil un usuario no-web o sin una sesión activa
      //this._notificacionService.warn('CREDENCIALES INCORRECTAS para acceder a esta opción')
      //navigateArray = [ '/']
    }

  }

  refreshUser(e) {
    e.stopPropagation();
    e.preventDefault();
    this.userService.updateCurrentUser();
  }

  navigateAdmin(e) {
    e.stopPropagation();
    e.preventDefault();
    let path = "/develar/fichas/lista";
    this.router.navigate([path]);
  }

  changeCommunity(e) {
    e.stopPropagation();
    e.preventDefault();
    this.router.navigate(['/develar/comunidades'])
  }

  logout(e) {
    e.stopPropagation();
    e.preventDefault();
    if (this.isUserWeb) {
      this._userWebService.logout().then(() => {
        this.logoutAdm();
        window.location.href = 'https://www.argentina.gob.ar/interior/archivo-general-de-la-nacion';
      }).catch(() => {
        this._notificationService.error("Se ha producido un error al intentar cerrar sesión")
      });
    } else {
      this.logoutAdm();
    }
  }

  logoutAdm() {
    this.userService.logout().then( () => {
      this._notificationService.success("Se ha cerrado sesión éxitosamente");
    }).catch( () => {
      this._notificationService.error("Se ha producido un error al intentar cerrar sesión")
    });
  }

  changePasswd(e) {
    e.stopPropagation();
    e.preventDefault();
    if (this.isUserWeb) {

    } else {
      this.router.navigate(['/ingresar/clave', this.currentUser._id])
    }

  }

  searchAssetsForm(e) {
    e.stopPropagation();
    e.preventDefault();
    this.router.navigate(['/web/fichatecnica'])
  }


  searchPage(e) {
    e.stopPropagation();
    e.preventDefault();
    this.router.navigate(['/trabajan/red'])

  }

  loginUser(e) {
    e.stopPropagation();
    e.preventDefault();
    if (this.hideLogin) return;
    this.router.navigate(['/ingresar/login'])
  }

  toggle(event: Event, item: any, el: any) {
    event.preventDefault();

    let items: any[] = el.mainMenuItems;

    if (item.active) {
      item.active = false;
    } else {
      for (let i = 0; i < items.length; i++) {
        items[i].active = false;
      }
      item.active = true;
    }
  }

  setupHomeView(isHome) {

    if (isHome) {
      this.isHomeView = true;
      this.navbarStyle = {
        background: BG_COLOR_DEFAULT
      }
      this.navbarItemStyle = {
        color: NAVBAR_ITEM_COLOR_DEFAULT
      }

    } else {
      this.isHomeView = false;
      this.navbarStyle = {
        background: BG_COLOR_DEFAULT
      }
      this.navbarItemStyle = {
        color: NAVBAR_ITEM_COLOR_DEFAULT
      }
    }

  }

  goToHistorial(e) {
    e.stopPropagation();
    e.preventDefault();
    this.router.navigate(['web','historial']);
  }

  goToMisConsultasYSolicitudes(e){
    e.stopPropagation();
    e.preventDefault();
    this.router.navigate(['web','usuario','dashboard']);
  }


}
