import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CardGraph } from '../../../develar-commons/asset-helper';

@Component({
  selector: 'documentacion-panel',
  templateUrl: './documentacion-panel.component.html',
  styleUrls: ['./documentacion-panel.component.scss']
})
export class DocumentacionPanelComponent implements OnInit {

  @Input() assets : CardGraph[];
  @Output() onDeleteCard = new EventEmitter<CardGraph>();
  constructor() { }

  ngOnInit(): void {
  }

  deleteCard(card : CardGraph) {
    this.onDeleteCard.emit(card);
  }

}
