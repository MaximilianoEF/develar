import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../develar-commons/shared-service';
import { SlotTurnoService } from '../slot-turno.service';
import { SlotTurnoModalService } from '../slot-turno-modal.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'slot-turno-page',
  templateUrl: './slot-turno-page.component.html',
  styleUrls: ['./slot-turno-page.component.scss']
})
export class SlotTurnoPageComponent implements OnInit {
  private pageTitle = 'Gestión de turnos nominales';
  public showData = false;

  constructor(
    private shared: SharedService,
    private service: SlotTurnoService,
    private modalService: SlotTurnoModalService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.shared.emitChange(this.pageTitle);
  }

  ngOnInit(): void {
  }

  public fetchTurnosNominales(query): void {
    this.service.fetchTurnoSedeByQuery(query).subscribe((entities) => {
      if (entities && entities.length > 0) {
        this.service.updateTableData();
        this.showData = true;
      } else {
        this.showData = false;
      }
    });
  }

  public openQuickCreateModal(): void {
    const dialogRef = this.modalService.setupQuickCreateModal();

    dialogRef.subscribe((dialogResult) => {
      // dialogResult contiene un TurnoTemplate mínimo que aún debe perferccionarse;
      // Grabarlo y redirigir a vista de edición
      this.service.create(dialogResult)
        .then((created) => {
          this.router.navigate(['factory', created._id], { relativeTo: this.route });
        })
        .catch((error) => {
          console.log('Quick creation ERROR: %o', error);
        });
    });
  }
}
