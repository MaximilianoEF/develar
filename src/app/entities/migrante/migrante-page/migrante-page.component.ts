import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NotificationService } from '../../../develar-commons/notifications.service';
import { MigranteModalService } from '../migrante-modal.service';
import { MigranteQuery } from '../migrante.model';
import { MigranteService } from '../migrante.service';

@Component({
  selector: 'migrante-page',
  templateUrl: './migrante-page.component.html',
  styleUrls: ['./migrante-page.component.scss'],
  providers: [MigranteModalService]
})
export class MigrantePageComponent implements OnInit {

  public showData = false;
  public searching: boolean = false;
  public antecedentesSolicitados$: BehaviorSubject<any[]>;
  constructor(
              private _service: MigranteService,
              private _modalService: MigranteModalService,
              private _notificationService: NotificationService
  ) {
    this.antecedentesSolicitados$ = this._service.antecedentesSolicitados$;
   }

  ngOnInit(): void {
  }

  public fetch(query: MigranteQuery): void {
    this.searching = true;
    this.showData = false;

    this._service.search(query)
      .pipe(
        finalize(() => this.searching = false )
      )
      .subscribe((items) => {
        if(items){
          if (items.length > 0) {
            this._service.updateTableData(items);
            this.showData = true;
          }else{
            this._notificationService.warn(`No se han encontrado resultados para el criterio de búsqueda indicado.`);
          }
        }
         else {
          this._notificationService.error(`Se ha producido un error al realizar la búsqueda.`);
          this.showData = false;
        }
      });
  }


  /**
   * Dispara una búsqueda en un libro para el migrante elegido
   * @param fechaArribo El timestamp correspondiente a la fecha de arribo que se
   *                quiere buscar
   */
  buscarDocumentos(fechaArribo: number): void {
    this._service.findDocumentation(fechaArribo)
      .then(results => {
        if(results && results.length) {
          this._service.selectedAntecedentesFromMigrante$.next(results);
        }
      })
      .catch(error => console.error(error));
  }

  showAntecedentes(): void {
    this._modalService.showSolicitudesAntecedentes()
      .subscribe(result => {
        if(result) {
          /** Si confirma la acción procedemos a administrar las solicitudes */
          const solicitudesAntecedentes = this._service.antecedentesSolicitados$.value;
          if(solicitudesAntecedentes && solicitudesAntecedentes.length) {
            //c onsole.log(solicitudesAntecedentes);
          }
        }
      })
  }

  private _cleanSolicitudesAntecedentes(): void {
    this._service.antecedentesSolicitados$.next([]);
  }
}

/**
 * 
Consulta de antecedentes migratorios 

Ponemos a disposición los registros de pasajeros que ingresaron al país entre los años 1882 y 1937. Éstos surgen de los Libros de entradas de pasajeros por vía marítima que produjo la Dirección Nacional de Migraciones en el arribo al puerto de Buenos Aires. 



El AGN se encuentra en estos momentos en un proceso de digitalización del total de los libros de entrada del período, los cuales se irán cargando progresivamente.  



Asimismo, conservamos Actas de Inspección Marítima. Estos documentos contienen los listados elaborados por la autoridad correspondiente en cada puerto de subida, y contienen listados hasta el año 1954. Las mismas también serán digitalizadas y publicadas progresivamente. 

Podés buscar por nombre y/o apellido del pasajero, nombre del buque y fecha estimada de arribo a puerto. 



Si encontrás el registro de ingreso de tu familiar o pasajero buscado podrás descargar una constancia en formato PDF cliqueando en el botón “ver detalles”. Además, de encontrarse digitalizado podrás descargarte el PDF para visualizar el libro completo donde se encuentra registrado el pasajero. 


    <p><span class="text">Ponemos a disposición los registros de pasajeros que ingresaron al país entre 1882 y 1937. Los datos surgen de los libros en los que la oficina de migraciones asentaba la nómina de las personas abordo de cada buque arribado a puerto. </span></p>
    <p><span class="text">El AGN está digitalizando dichos libros y actas de arribo, de modo que progresivamente serán visualizables desde esta consulta.</span></p>
    <p><span class="text">Podés buscar por nombre y/o apellido del pasajero, nombre del buque y rango de fechas de arribo a puerto.</span></p>
    <p><span class="text">Si encontrás el registro de ingreso de tu familiar podrás descargar una constancia en formado PDF cliqueando en el botón "ver detalles"</span></p>

*/
