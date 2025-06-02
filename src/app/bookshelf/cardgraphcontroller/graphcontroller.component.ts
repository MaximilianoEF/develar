import { Component, OnInit, Input } from '@angular/core';
import { CardGraph, predicateType, graphUtilities, predicateLabels } from '../cardgraph.helper';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GenericDialogComponent } from '../../develar-commons/generic-dialog/generic-dialog.component';
import { Subject } from 'rxjs';
import { NotificationService } from '../../develar-commons/notifications.service';

const removeRelation = {
  hasBackdrop: true,
  backdropClass: 'yellow-backdrop',
  data: {
    caption:'Baja de relación',
    title: 'Confirme la acción',
    body: 'Se dará de baja la relación seleccionada en esta ficha',
    accept:{
      action: 'accept',
      label: 'Aceptar'
    },
    cancel:{
      action: 'cancel',
      label: 'Cancelar'
    }
  }
};


@Component({
  selector: 'card-graph-controller',
  templateUrl: './graphcontroller.component.html',
  styleUrls: ['./graphcontroller.component.scss'],
  providers: [GenericDialogComponent]
})
export class GraphcontrollerComponent implements OnInit {
  @Input() addCardToList: Subject<CardGraph>;
  @Input()
    get relatedList():Array<CardGraph>{
      return this.entities;
    }
    set relatedList(tokens: CardGraph[]){
      this.entities = tokens;
    }
  @Input() entityType: string = 'resource'
  @Input() canAddTokens: boolean = true;

  public entities: CardGraph[] = [];
  private acceptNewToken = true;
  public formLabels:{formTitle:string, formAddLabel: string};

  constructor(
      public _notificationService: NotificationService,
    ) { }

  ngOnInit() {
    this.formLabels = predicateLabels[this.entityType] || predicateLabels['default'];

    if(this.addCardToList){
      this.addCardToList.subscribe({
        next: (card) => {
          this.entities.unshift(card);
        }
      })
    }

    //ToDO: chequear que entityTye no sea nula
  }

  addToken(){
    let token = graphUtilities.initNewCardGraph(this.entityType, this.entities);
    console.log('AddNewToken request [%s] [%s] [%s]', token.entity,this.entityType, this.entities.length );

    this.entities.unshift(token);
  }

  deleteToken(token: CardGraph){
    let index = this.entities.findIndex(x => x === token);
    if(index !== -1){
      console.log('delete token:  [%s] [%s]', index, token.displayAs);
      this.openDialog(removeRelation).subscribe(result => {
        if(result==='accept') this.entities.splice(index, 1);
      })
    }
  }

  openDialog(config) {
    let dialogRef = this._notificationService.openModalDialog(config);
    return dialogRef;
  }

}
