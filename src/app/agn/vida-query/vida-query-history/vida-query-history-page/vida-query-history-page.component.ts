import { Component, OnInit } from '@angular/core';
import { VidaQueryService } from '../../vida-query.service';
import { UserService } from '../../../../entities/user/user.service';
import { Observable } from 'rxjs';
import { VidaQuery } from '../../../models/vidaQuery.model';
import { Router } from '@angular/router';

@Component({
  selector: 'vida-query-history-page',
  templateUrl: './vida-query-history-page.component.html',
  styleUrls: ['./vida-query-history-page.component.scss']
})
export class VidaQueryHistoryPageComponent implements OnInit {

  initTable: boolean = false;
  userId: string;
  data$: Observable<any[]>; //CAMBIAR TIPO
  noBusquedas: boolean = false;
  constructor(private _vidaService: VidaQueryService,
    private _userService: UserService,
    private _router: Router) { }

  ngOnInit(): void {
    this.userId = this._userService.currentUser._id;
    if (this.userId) {
      this.searchHistorial();
    }
  }

  searchHistorial() {
    this.data$ = this._vidaService.searchConsultasAcervoByUser(this.userId);
    this.data$.subscribe(x => {
      if (x && x.length) {
        this.initTable = true;
      } else {
        this.noBusquedas = true;
      }
    })
  }

  repetirBusqueda(query: VidaQuery): void {
    this._vidaService.query = query;
    this._router.navigate(['web', 'fichatecnica']);
  }

  goToHome(): void {
    this._router.navigate(['/']);
  }

}
