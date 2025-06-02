import { Component, OnInit } from '@angular/core';
import { TesauroSearchForm } from '../tesauro-browse/tesauro-browse.component';
import { TesauroService } from '../tesauro.service';
import { Observable } from 'rxjs';
import { Tesauro } from '../models/tesauro.model';
import { NotificationService } from '../../../../develar-commons/notifications.service';

@Component({
  selector: 'app-tesauro-page',
  templateUrl: './tesauro-page.component.html',
  styleUrls: ['./tesauro-page.component.scss']
})
export class TesauroPageComponent implements OnInit {

  data$ : Observable<Tesauro[]>;
  data : Tesauro[];
  initView : boolean = false;

  constructor(private _tesauroService : TesauroService,
    private _notificationService : NotificationService) { }

  ngOnInit(): void {
  }

  search(query : TesauroSearchForm) {
    this.initView = false;
    this.data$ = this._tesauroService.findByQuery(query);

    this.data$.subscribe(tesauros => {
      if(tesauros && tesauros.length){
        this.data = tesauros;
        this.initView = true;
      }else{
        this._notificationService.warn("No se han encontrado resultados para el criterio de búsqueda indicado.")
        this.initView = false;
      }
    })
  }

}
