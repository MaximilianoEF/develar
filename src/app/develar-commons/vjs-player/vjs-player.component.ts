// vjs-player.component.ts
import { Component, ElementRef, Input, OnDestroy, AfterViewInit, ViewEncapsulation } from '@angular/core';
import videojs, { VideoJsPlayerOptions } from 'video.js';
import 'videojs-youtube';
import '@devmobiliza/videojs-vimeo/dist/videojs-vimeo.cjs';
import * as WaveSurfer from 'wavesurfer.js';
import * as Wavesurfer from 'videojs-wavesurfer/dist/videojs.wavesurfer.js';
import { devutils } from '../utils';

@Component({
  selector: 'vjs-player',
  templateUrl: './vjs-player.component.html',
  styleUrls: ['./vjs-player.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class VjsPlayerComponent implements AfterViewInit, OnDestroy {
  private player;
  private plugin;
  @Input() idx: number;
  @Input() options: VideoJsPlayerOptions;

  constructor(private elementRef: ElementRef) {
    this.player = false;
    // save reference to plugin (so it initializes)
    this.plugin = Wavesurfer;
  }

  ngAfterViewInit() {
    this.player = videojs(document.getElementById('target-' + this.idx), this.options, () => {
      this.player.src(this.options.src);
    });

    // error handling
    this.player.on('error', (element, error) => {
      console.warn(error);
    });

    this.player.on('deviceError', () => {
      console.error('device error:', this.player.deviceErrorCode);
    });


    document.getElementById('target-'+ this.idx).oncontextmenu = devutils.disabledContextMenu;
  }

  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
      this.player = false;
    }
  }
}
