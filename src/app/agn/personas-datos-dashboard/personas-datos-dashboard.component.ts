import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PersonService } from '../../entities/person/person.service';
import { take } from 'rxjs/operators';
import { Person } from '../../entities/person/person';
import { PersonasController } from '../personas/personas.controller';
import { devutils } from '../../develar-commons/utils';
import { UserService } from '../../entities/user/user.service';
import { UsuarioWeb } from '../../entities/userweb/usuario-web';

@Component({
  selector: 'personas-datos-dashboard',
  templateUrl: './personas-datos-dashboard.component.html',
  styleUrls: ['./personas-datos-dashboard.component.scss']
})
export class PersonasDatosDashboardComponent implements OnInit {

  public title: string = 'Mis datos de contacto';
  public subtitle: string = 'Mis datos personales'
  public person: Person;
  public showPersonData: boolean = false;
  constructor(private _router: Router,
    private _usuarioService: UserService,
    private _personService: PersonService,
    private _personCtrl: PersonasController) { }

  ngOnInit(): void {

    let user = new UsuarioWeb();
    user._id = this._usuarioService.currentUser._id;
    this._personService.fetchPersonByUserAGN(user).pipe(take(1)).subscribe(persona => {

      if (persona[0]) {
        this.person = persona[0];
        this.showPersonData = true;
        this._personCtrl.personListener.next(this.person);
      }
    })


    // this._usuarioService.userEmitter.subscribe(usuario => {
    //   if (usuario) {
    //     this._personService.fetchPersonByUserAGN(usuario).pipe(take(1)).subscribe(persona => {
    //       if (persona[0]) {
    //         this.person = persona[0];
    //         this.showPersonData = true;
    //         this._personCtrl.personListener.next(this.person);
    //       }
    //     })

    //   }
    // })

  }

  goToPersonData(): void {
    this._router.navigate(['web', 'usuario', 'dashboard', 'personas', this.person['_id']]);
  }

  currentAge() {
    let edad = '';

    if (!this.person.fenac) return 0;

    let valueDate: Date = new Date(this.person.fenac);
    if (valueDate) {
      let value = valueDate.getDate() + '/' + (valueDate.getMonth() + 1) + '/' + valueDate.getFullYear();
      let validAge = devutils.validAge(value);
      if (validAge) {
        edad = devutils.edadActual(devutils.dateFromTx(value)) + '';
      }
      return edad;

    }
  }

}
