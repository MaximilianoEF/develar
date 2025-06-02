import { Injectable } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { TmAltaRapidaModalComponent } from './factory/tm-alta-rapida-modal/tm-alta-rapida-modal.component';
import { TechMachine } from './tech-machine.model';


@Injectable()
export class TechMachineModalService {

    private dialogResult$ : Subject<TechMachine>
    constructor(private _matDialog : MatDialog){}

    public setupAltaRapidaTechMachineModal(): Subject<TechMachine> {
        this.dialogResult$ = new Subject<TechMachine>();
        this.openAltaRapidaTechMachineModal();
        return this.dialogResult$;
      }

    
  private openAltaRapidaTechMachineModal(): void {
    const dialogRef = this._matDialog.open(TmAltaRapidaModalComponent,{
        width: '650px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dialogResult$.next(result);
      }
    });
  }
}