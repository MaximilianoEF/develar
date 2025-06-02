import { Injectable } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { Pase } from '../../entities/consultas/consulta.model';
import { PasesFromConsultaComponent } from '../../entities/consultas/pases-from-consulta/pases-from-consulta.component';
import { AddPaseConsultaModalComponent } from './consultas-xcomponents/add-pase-consulta-modal/add-pase-consulta-modal.component';

@Injectable()
export class ConsultaModalService {

    private dialogResult$ : Subject<Pase>;
    constructor(private matDialog : MatDialog){}

    public openPaseModal() : Subject<Pase>{
        this.dialogResult$ = new Subject<Pase>();
        this.initPaseMoldal();
        return this.dialogResult$;
    }

    public openShowPases(id : string) : void {
        this.matDialog.open(PasesFromConsultaComponent, {
            data : id});
        
    }

    private initPaseMoldal(): void {
        this.matDialog.open(AddPaseConsultaModalComponent).afterClosed().subscribe(result => {
            if(result){
                this.dialogResult$.next(result);
            }
        })
    }

    


}