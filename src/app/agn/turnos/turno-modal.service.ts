import { Injectable } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { Turno } from '../../entities/turnos/turno.model';
import { TurnosEditModalComponent } from './turnos-edit-modal/turnos-edit-modal.component';


@Injectable()
export class TurnoModalService {

    private dialogResult$ : Subject<Turno>;
    constructor(private _matDialog : MatDialog){}

    public setupEditModal(turno : Turno) : Subject<Turno>{
        this.dialogResult$ = new Subject<Turno>();
        this.openEditModal(turno);
        return this.dialogResult$;

    }

    private openEditModal(turno : Turno) : void {
        this._matDialog.open(TurnosEditModalComponent,{
            data : turno,
            width: '650px'
        }).afterClosed().subscribe(result =>{
            if(result){
                this.dialogResult$.next(result);
            }
        })
    }
}