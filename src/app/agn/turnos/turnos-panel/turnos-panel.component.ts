import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'agn-turnos-panel',
  templateUrl: './turnos-panel.component.html',
  styleUrls: ['./turnos-panel.component.scss']
})
export class TurnosPanelComponent implements OnInit {
  public title = "Solicitá tu turno"

  constructor() { }

  ngOnInit(): void {
  }

}
