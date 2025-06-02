import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VidaQueryModalComponent } from '../vida-query-modal/vida-query-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { VidaQueryService } from '../vida-query.service';
import { Acervo } from '../../models/acervo.model';
import { VideoJsPlayerOptions } from 'video.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResTypesEnum, ThemeTypesEnum } from '../../models/types.enum';
import { devutils } from '../../../develar-commons/utils';

@Component({
  selector: 'app-vida-query-detailed-view',
  templateUrl: './vida-query-detailed-view.component.html',
  styleUrls: ['./vida-query-detailed-view.component.scss'],
})
export class VidaQueryDetailedViewComponent implements OnInit {
  archiveId: string;
  panelOpenStateTecnico = false;
  panelOpenStateMultimedia = false;
  archive$: Observable<Acervo>;

  hasPartialDate: boolean;

  /* ID externo */
  public archivoIdExterno;
/* Colección */
  public archivoColeccion;
/* Título Serie */
  public archivoTituloSerie;
/* Artistas */
  public archivoProductores;
  public archivoActores;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _dialog: MatDialog,
    private _router: Router,
    private _vidaQueryService: VidaQueryService,
  ) {
    this.archive$ = new Observable<Acervo>();

    this._activatedRoute.params.subscribe((paramRuta) => {
      this.archiveId = this._activatedRoute.snapshot.paramMap.get('id');
    });
  }

  ngOnInit(): void {
    if (this.archiveId === 'undefined') {
      this.exitDetailedView();
    } else {
      this.archive$ = this._vidaQueryService.fetchVidaById(this.archiveId).pipe(
        map((item: Acervo) => {

          this.processIdExterno(item);
          this.processColeccion(item);
          this.processTituloSerie(item);
          this.processArtistsArray(item);

          if (item.assets && item.assets.length > 0) {
            let archiveDate: Date;

            if (item.metadatos.fecha_filmacion !== null || item.metadatos.fecha_grabacion !== null) {
              if (item.assets[0].resourcetype.resourceTypeId === ResTypesEnum.RESTYPE_VIDEO) {
                archiveDate = new Date(item.metadatos.fecha_filmacion);

                if (archiveDate.getDate() === 1 && (archiveDate.getMonth() + 1) === 1) {
                  item.metadatos.fecha_filmacion = archiveDate.getFullYear().toString();
                } else {
                  item.metadatos.fecha_filmacion = devutils.txFromDate(new Date(item.metadatos.fecha_filmacion));
                }
              } else if (item.assets[0].resourcetype.resourceTypeId === ResTypesEnum.RESTYPE_AUDIO) {
                archiveDate = new Date(item.metadatos.fecha_grabacion);

                if (archiveDate.getDate() === 1 && (archiveDate.getMonth() + 1) === 1) {
                  item.metadatos.fecha_grabacion = archiveDate.getFullYear().toString();
                } else {
                  item.metadatos.fecha_grabacion = devutils.txFromDate(new Date(item.metadatos.fecha_grabacion));
                }
              }
            }
          }
          return item;
        })
      );
    }
  }

  private processIdExterno(item: Acervo): void {
    this.archivoIdExterno = (item.materials && item.materials.length > 0) ? item.materials[0].id_externo : item.fondo.id_externo;
  }

  private processColeccion(item: Acervo): void {
    this.archivoColeccion = item.metadatos.coleccion || '';
  }

  private processTituloSerie(item: Acervo): void {
    this.archivoTituloSerie = (item.fondo.coleccion && item.fondo.coleccion.length > 0) ? item.fondo.coleccion[0].title : '';
  }

  private processArtistsArray(item: Acervo): void {
    if (item.artists && item.artists.length > 0) {
      const productoresArray = [];
      const actoresArray = [];

      for (let k = 0; k < item.artists.length; k++) {
        if (item.artists[k].role.artistRoleId === 1) {

          productoresArray.push(item.artists[k].title);
        } else if (item.artists[k].role.artistRoleId === 2) {
          actoresArray.push(item.artists[k].title);
        }
      }
      this.archivoProductores = productoresArray.join(', ');
      this.archivoActores = actoresArray.join(', ');
    }
  }

  private exitDetailedView(): void {
    this._router.navigate(['agn']);
  }

  public playMedia(source: string, sourceType: number, titulo: string): void {
    let opciones: VideoJsPlayerOptions;

    if (sourceType === ResTypesEnum.RESTYPE_VIDEO) {
      opciones = {
        controls: true,
        fluid: true,
        preload: 'none',
        sources: [
          { src: source, type: 'video/mp4' },
        ],
      };
    } else if (sourceType === ResTypesEnum.RESTYPE_AUDIO) {
      opciones = {
        controls: true,
        autoplay: false,
        fluid: true,
        loop: false,
        src: source,
        plugins: {
          wavesurfer: {
            backend: 'MediaElement',
            waveColor: 'gray',
            progressColor: 'white',
            cursorColor: 'white',
            hideScrollbar: true,
            barWidth: 2,
            barHeight: 1,
            barGap: null,
            scrollParent: true,
          },
        },
      };
    }

    const dialogRef = this._dialog.open(VidaQueryModalComponent, {
      width: '800px',
      data: { opciones: opciones, tituloModal: titulo },
      panelClass: 'vida-query-view-modal'
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  public onGoBack(): void {
    this._router.navigate(['web/fichatecnica']);
  }
}
