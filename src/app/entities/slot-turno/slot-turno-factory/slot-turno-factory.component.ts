import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../../develar-commons/shared-service';

@Component({
  selector: 'app-slot-turno-factory',
  templateUrl: './slot-turno-factory.component.html',
  styleUrls: ['./slot-turno-factory.component.scss']
})
export class SlotTurnoFactoryComponent implements OnInit {
  private pageTitle = 'Gestión de turnos nominales';

  public createTurnoTemplateTitle = 'Esquema de turnos nominales';
  public editTurnoTemplateTitle = 'Editar esquema de turnos nominales';

  /** Si llega un ID por parámetro del router, estamos en modo edición */
  public isEdit = false;
  public turnoTemplateId: string = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private shared: SharedService
  ) {
    this.shared.emitChange(this.pageTitle);
  }

  ngOnInit(): void {
    this.initEditMode();
  }

  private initEditMode(): void {
    if (this.route.snapshot.params.id) {
      this.isEdit = true;
      this.turnoTemplateId = this.route.snapshot.params.id;
    }
  }
}
