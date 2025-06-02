import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VideoJsPlayerOptions } from 'video.js';

@Component({
  selector: 'vida-query-modal',
  templateUrl: './vida-query-modal.component.html',
  styleUrls: ['./vida-query-modal.component.scss']
})
export class VidaQueryModalComponent implements OnInit {
  opciones: VideoJsPlayerOptions;

  constructor(
    public dialogRef: MatDialogRef<VidaQueryModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){
    this.opciones = data.opciones;
  }

  ngOnInit(): void {
  }

}
