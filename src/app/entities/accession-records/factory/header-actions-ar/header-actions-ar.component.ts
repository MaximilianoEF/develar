import { Component, OnInit } from '@angular/core';
import { AccessionRecordsHelper } from '../../accession-records-helper';
import { AccessionRecordsService } from '../../accession-records.service';

@Component({
  selector: 'header-actions-ar',
  templateUrl: './header-actions-ar.component.html',
  styleUrls: ['./header-actions-ar.component.scss']
})
export class HeaderActionsARComponent implements OnInit {

  public headerActions: any[];
  constructor( private _service: AccessionRecordsService) { 
    this.headerActions = AccessionRecordsHelper.getOptionList('headerActions');
  }

  ngOnInit(): void {
  }

  execAction(action: string): void {
    this._service.headerAction$.next(action);
  }

}
