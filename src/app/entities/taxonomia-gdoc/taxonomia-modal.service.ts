import { Injectable } from '@angular/core';
import { Taxonomia, TaxonomiaTermino } from './taxonomia.model';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TaxonomiaService } from './taxonomia.service';
import { AltaRapidaTerminoComponent } from './zmodals/alta-rapida-termino/alta-rapida-termino.component';


@Injectable()
export class TaxonomiaModalService {
  // Subject retornada por las ventanas modales
  public dialogResult$: Subject<Taxonomia> = new Subject<Taxonomia>();
  public dialogTerminoResult$: Subject<TaxonomiaTermino> = new Subject<TaxonomiaTermino>();

  constructor(
    private dialog: MatDialog,
    private _service: TaxonomiaService
  ) { }

  // Alta rápida de un término
  public abrirAltaRapidaTerminoModal(taxonomia: Taxonomia): Subject<TaxonomiaTermino> {
    this.dialogTerminoResult$ = new Subject<TaxonomiaTermino>();
    this._setupAltaRapidaTerminoModal(taxonomia);
    return this.dialogTerminoResult$;
  }

  private _setupAltaRapidaTerminoModal(taxonomia: Taxonomia): void {
    const dialogRef = this.dialog.open(AltaRapidaTerminoComponent, {
      data: { taxonomia }
    });

    dialogRef.afterClosed().subscribe((entity: TaxonomiaTermino) => {
      if (entity) this.dialogTerminoResult$.next(entity);
    });
  }
}
