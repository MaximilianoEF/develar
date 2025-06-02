import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Subject } from "rxjs";
import { SolicitudesAntecedentesModalComponent } from "./zmodals/solicitudes-antecedentes-modal/solicitudes-antecedentes-modal.component";

@Injectable()
export class MigranteModalService {

  private _dialogSolicitudesAntecedentes$: Subject<boolean>;

  constructor(
              private _dialog: MatDialog
  ){}

  public showSolicitudesAntecedentes(): Subject<boolean> {
    this._dialogSolicitudesAntecedentes$ = new Subject<boolean>();
    this._openSolicitudesAntecedentesModal();
    return this._dialogSolicitudesAntecedentes$;
  }

  private _openSolicitudesAntecedentesModal(): void {
    this._dialog.open(SolicitudesAntecedentesModalComponent)
    .afterClosed().subscribe(result => {
      if (result) {
        this._dialogSolicitudesAntecedentes$.next(true);
      } else {
        this._dialogSolicitudesAntecedentes$.next(false);
      }
    })
  }


}