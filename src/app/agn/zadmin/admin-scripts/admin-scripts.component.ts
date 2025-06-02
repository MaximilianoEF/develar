import { Component, OnInit } from '@angular/core';
import { AgnTurnosService } from '../../agn-turnos.service';

@Component({
  selector: 'app-admin-scripts',
  templateUrl: './admin-scripts.component.html',
  styleUrls: ['./admin-scripts.component.scss']
})
export class AdminScriptsComponent implements OnInit {

  constructor(
    private _turnoService: AgnTurnosService

  	) { }

  ngOnInit(): void {
  }


  regenerarTurnosNominales(){
  	console.log('Ready to REGENERAR TURNOS NOMINALES');
  	this._turnoService.regenerarTurnosNominales().subscribe(response => {
  		console.log('Regeneración de turnos cb: ')
  		console.dir(response);
  	})

  }

}
