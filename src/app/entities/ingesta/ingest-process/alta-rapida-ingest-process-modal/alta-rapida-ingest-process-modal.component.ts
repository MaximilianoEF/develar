import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { devutils } from '../../../../develar-commons/utils';
import { User } from '../../../user/user';
import { UserService } from '../../../user/user.service';
import { IngestaHelper } from '../../ingesta.helper';
import { AdminData, Audit, IngestFolder, IngestPlan, IngestProcess } from '../../ingesta.model';


@Component({
  selector: 'alta-rapida-ingest-process-modal',
  templateUrl: './alta-rapida-ingest-process-modal.component.html',
  styleUrls: ['./alta-rapida-ingest-process-modal.component.scss']
})
export class AltaRapidaIngestProcessModalComponent implements OnInit {
  public formGroup : FormGroup;
  public startDate = new Date();
  public userResult$ : Observable<User[]>;


  /** Opt lists */
  public puntoMontajeList = IngestaHelper.getOptionList('puntoMontaje');
  public tipoParteList = IngestaHelper.getOptionList('tipoParte');

  constructor(
    public dialogRef:MatDialogRef<AltaRapidaIngestProcessModalComponent>,
    private _fb : FormBuilder,
    private _userService : UserService
  ) { }

  ngOnInit(): void {
    this.userResult$ = this._userService.fetchUserByRole('digitalizacion:admin');
    this.initGroup();
  }

  private initGroup() {
    this.formGroup = this._fb.group({
      slug:         [ '',         Validators.required ],
      fecha:        [ new Date(), Validators.required ],
      user:         [ null,       Validators.required ],
      tipoParte:    [ 'master',   Validators.required ],
      puntoMontaje: [ 'ingesta',  Validators.required ]
    });
  }

  public onSubmit(): void {
    let fvalue = this.formGroup.value;
    let model = new IngestProcess();
    model.ingestPlan = new IngestPlan();
    model.admin = new AdminData();
    model.admin.audit = new Audit();

    model.ingestPlan.userAdmin = fvalue.user; //Id del usuario seleccionado en el desplegable
    model.slug = fvalue.slug;

    /** Tipo de parte de ingesta: master, derivada, etc */
    model.admin.tipoParte = fvalue.tipoParte;

    model.ingestFolder = new IngestFolder('');
    /** Carpeta raíz; a partir de ella hago los escaneos, busco los files a ingestar, etc */
    model.ingestFolder.server = fvalue.puntoMontaje;

    model.ingestFolder.path = '';
    model.ingestFolder.rootPath = fvalue.puntoMontaje

    model.admin.fe_tx = devutils.datePickerToTx(fvalue.fecha);
    model.admin.fe_ts = devutils.datePickerToNum(fvalue.fecha);

    const today = new Date();
    model.admin.fe_comp_ts = today.getTime();
    model.admin.fe_comp_tx = devutils.txFromDate(today);
    model.admin.estado = 'activo';
    model.serial = IngestaHelper.parteIngestaSerial(model.slug);


    model.admin.audit.ts_alta = today.getTime();
    model.admin.audit.userId = this._userService.currentUser._id;
    model.admin.audit.username = this._userService.currentUser.username;

    this.dialogRef.close(model);
  }
}
