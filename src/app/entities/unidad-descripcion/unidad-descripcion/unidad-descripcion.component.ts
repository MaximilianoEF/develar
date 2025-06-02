import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NotificationService} from '../../../develar-commons/notifications.service';
import {devutils} from '../../../develar-commons/utils';
import {UserService} from '../../user/user.service';
import {UnidadDescripcionModalService} from '../unidad-descripcion-modal.service';
import {
  UnidadDescripcion,
  UnidadDescripcionQuery,
  AuditUD,
  ParentUD,
} from '../unidad-descripcion.model';
import {UnidadDescripcionService} from '../unidad-descripcion.service';
import {finalize, take} from 'rxjs/operators';

@Component({
  selector: 'unidad-descripcion',
  templateUrl: './unidad-descripcion.component.html',
  styleUrls: ['./unidad-descripcion.component.scss'],
  providers: [UnidadDescripcionModalService]
})
export class UnidadDescripcionComponent implements OnInit {
  public showData = false;
  public searching: boolean = false;

  constructor(
    private unidadDescripcionService: UnidadDescripcionService,
    private userService: UserService,
    private _notificationService: NotificationService,
    private _router: Router,
    private route: ActivatedRoute,
    private _altaRapidaService: UnidadDescripcionModalService
  ) { }

  ngOnInit(): void {
  }

  public fetchUnidadDescripcion(query: UnidadDescripcionQuery): void {
    this.searching = true;

    /** El pipe está planteado de esta manera puesto que fetchUnidadesDescripcionQuery() retorna un BehaviorSubject y no un observable
     *  Por lo tanto, debemos quedarnos con dos valores (take 2): el primero que el BehaviorSubject nos emita, y el valor nuevo que emitirá,
     *  es decir, los resultados frescos de la última búsqueda realizada
     */
    this.unidadDescripcionService
      .fetchUnidadesDescripcionByQuery(query)
      .pipe(
        take(2),
        finalize(() => this.searching = false )
      )
      .subscribe((items) => {
        if (items && items.length > 0) {
          this.unidadDescripcionService.updateTableData();
          this.showData = true;
        } else {
          this.showData = false;
        }
      });
  }

  public openAltaRapida(parent?: ParentUD): void {
    let padre = parent ? parent : null;
    const dialogRef = this._altaRapidaService.initAltaRapida(padre);

    dialogRef.subscribe((result) => {
      this.saveAltaRapida(result);
    });
  }

  private saveAltaRapida(data) {
    const ud = new UnidadDescripcion();
    ud.udsNumber = data.udsNumber;
    ud.identificador = data.identificador;
    ud.parent = data.parent ? data.parent : null;

    /** Agregar audit ya que estamos haciendo un alta */
    const audit = new AuditUD();
    audit.creationUserID = this.userService.currentUser._id;
    audit.creationUsername = this.userService.currentUser.username;
    audit.creationUserEmail = this.userService.currentUser.email;

    audit.lastModifiedDate = devutils.txFromDate(new Date());
    audit.lastModifiedDateTs = devutils.dateNumFromTx(
      devutils.txFromDate(new Date())
    );
    audit.lastModifiedUserID = this.userService.currentUser._id;
    audit.lastModifiedUsername = this.userService.currentUser.username;
    audit.lastModifiedUserEmail = this.userService.currentUser.email;

    ud.audit = audit;

    ud.company = data.company;

    if (data.udsNumber > 1) {
      this.unidadDescripcionService.insertMany(ud).then((unidad) => {
        this._notificationService.success('Alta múltiple exitosa');
      });
    } else {
      this.unidadDescripcionService.create(ud).then((unidad) => {
        this._notificationService.success('Alta exitosa [' + unidad._id + ']');

        this._router.navigate(['factory', unidad._id], {
          relativeTo: this.route,
        }).then();
      });
    }
  }

  exportarAtom(timestamp: number) {
    this.unidadDescripcionService.exportarAtom(timestamp);
  }
}
