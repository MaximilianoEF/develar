import { Component, OnInit, Input } from '@angular/core';
import { CloudData, CloudOptions } from 'angular-tag-cloud-module';
import { Tesauro } from '../models/tesauro.model';
import { TesauroHelper } from '../tesauro.helper';

@Component({
  selector: 'tesauro-tag-cloud',
  templateUrl: './tesauro-tag-cloud.component.html',
  styleUrls: ['./tesauro-tag-cloud.component.scss']
})
export class TesauroTagCloudComponent implements OnInit {


  @Input() data : Tesauro[];
  initView : boolean = false;
  options: CloudOptions = {
    // if width is between 0 and 1 it will be set to the width of the upper element multiplied by the value
    width: 1000,
    // if height is between 0 and 1 it will be set to the height of the upper element multiplied by the value
    height: 400,
    overflow: false,
  };
 
  cloudData: CloudData[];
  


  constructor() { }

  ngOnInit(): void {
    
    this.cloudData = TesauroHelper.buildCloudData(this.data);
    this.initView = true;
  }

}
