import {Component, OnInit} from '@angular/core';
import {Input} from '@angular/core';
import {VidaQueryModalComponent} from '../vida-query-modal/vida-query-modal.component';
import {MatDialog} from '@angular/material/dialog';
import {AcervoDataList} from '../../models/acervodatalist.model';
import {VideoJsPlayerOptions} from 'video.js';
import {VidaQueryHelper} from '../vida-query.helper';
import {Router} from '@angular/router';
import {ResTypesEnum} from '../../models/types.enum';
import {VidaQueryService} from '../vida-query.service';
import {UnloggedInterceptorService} from '../../../develar-commons/unlogged-interceptor.service';

const STORAGE_KEY = 'navegante';

type Preload = 'auto' | 'metadata' | 'none';
const NONE: Preload = 'none';

const VJS_VIDEO_OPTIONS = {
  controls: true,
  fluid: true,
  preload: NONE
};

const VJS_AUDIO_OPTIONS = {
  controls: true,
  autoplay: false,
  fluid: true,
  loop: false,
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
    }
  }
};


@Component({
  selector: 'vida-query-view',
  templateUrl: './vida-query-view.component.html',
  styleUrls: ['./vida-query-view.component.scss'],
})
export class VidaQueryViewComponent implements OnInit {
  @Input() archive: AcervoDataList;
  public primerRenglon: string;
  public archiveId: string;
  public feFilmacion: string;
  public feGrabacion: string;
  public recursoDigital: string;
  public recursoDuracion: string;
  public recursoSonoro: string;
  public recursoColor: string;
  public legajo: string;

  /* Define si se muestra o no información ampliada */
  public showMore = false;

  constructor(
    private _dialog: MatDialog,
    private _router: Router,
    private _vidaService: VidaQueryService,
    private unloggedInterceptorService: UnloggedInterceptorService
  ) {
  }

  ngOnInit(): void {
    this.initData();
  }

  private initData() {
    this.primerRenglon = this.archive.id_externo + ' :: ';
    let fecha_filmacion: string =
      this.archive.fecha_filmacion !== ''
        ? 'Fecha de Filmación: ' + this.archive.fecha_filmacion
        : null;
    let fecha_grabacion: string =
      this.archive.fecha_grabacion !== ''
        ? 'Fecha de Grabación: ' + this.archive.fecha_grabacion
        : null;

    if (fecha_filmacion) {
      this.primerRenglon += fecha_filmacion + ' :: ';
    } else if (fecha_grabacion) {
      this.primerRenglon += fecha_grabacion + ' :: ';
    }

    let recurso = VidaQueryHelper.getRecursoListByID(
      this.archive.id_tipo_recurso
    );
    if (this.archive.legajo) {
      this.primerRenglon += 'Legajo: ' + this.archive.legajo + ' :: ';
    }
    if (recurso) {
      this.primerRenglon += 'Recurso: ' + recurso;
    }

    this.recursoDuracion =
      this.archive.duracion !== ''
        ? 'Duración: ' + this.archive.duracion
        : null;

    this.recursoSonoro = this.archive.tieneSonido !== '' ? 'Sonido: ' + this.archive.tieneSonido : 'Sonido: Muda';

    this.recursoColor = this.archive.color !== '' ? 'Color: ' + this.archive.color : 'Color: B/N';

    this.archiveId = this.archive.id_externo || '';
    this.feFilmacion =
      this.archive.fecha_filmacion !== ''
        ? 'Filmación: ' + this.archive.fecha_filmacion
        : null;
    this.feGrabacion =
      this.archive.fecha_grabacion !== ''
        ? 'Grabación: ' + this.archive.fecha_grabacion
        : null;
    this.recursoDigital = VidaQueryHelper.getRecursoListByID(
      this.archive.id_tipo_recurso
    );
    this.legajo = this.archive.legajo ? 'Legajo: ' + this.archive.legajo : '';
  }

  public navegarAVistaDetallada(): void {
    this._router.navigate(['/web/fichatecnica/', this.archive.id]);
  }

  public playMedia(source: string, sourceType: number, titulo: string): void {
    const isUserAbleToPlayMedia = this.unloggedInterceptorService.checkLocalStorageForUnloggedUser(STORAGE_KEY);

    if (isUserAbleToPlayMedia) {
      let opciones: VideoJsPlayerOptions;
      if (sourceType === ResTypesEnum.RESTYPE_VIDEO) {
        opciones = VJS_VIDEO_OPTIONS;
        opciones.sources = [{src: source, type: 'video/mp4'}];
      } else if (sourceType === ResTypesEnum.RESTYPE_AUDIO) {
        opciones = VJS_AUDIO_OPTIONS;
        opciones.src = source;
      }

      const dialogRef = this._dialog.open(VidaQueryModalComponent, {
        width: '800px',
        data: {opciones: opciones, tituloModal: titulo},
        panelClass: 'vida-query-view-modal',
      });

      dialogRef.afterClosed().subscribe((result) => {
      });
    }
  }


  public onToggleShowMore(): void {
    this.showMore = !this.showMore;
  }
}
