import { Component, OnInit, Input } from '@angular/core';

import { Subject } from 'rxjs';

import { SiteMinimalController } from '../../../site-minimal/minimal.controller';
import { RecordCard } from '../../../site-minimal/recordcard.model';
import { DaoService } from '../../dao.service';

const FOOTER =    'footer';

@Component({
  selector: 'footer-page',
  templateUrl: './top-footer-page.component.html',
  styleUrls: ['./top-footer-page.component.scss']
})
export class TopFooterPageComponent implements OnInit {
  @Input() showContacto = true;
 
  private unBindList = [];
  public isFooter = false;
  public footer: RecordCard;

  constructor(
    private daoService: DaoService,
  	private minimalCtrl: SiteMinimalController){

	}

  ngOnInit() {
  	this.fetchFooterRecords();
  }

  ngOnDestroy(){
    this.unBindList.forEach(x => {x.unsubscribe()});
  }


  fetchFooterRecords(){
		let sscrp1 = this.fetchFooterRecordsFromDB().subscribe(records => {
		  this.renderFooter(records);
		});

		this.unBindList.push(sscrp1);
  }

  renderFooter(records: RecordCard[]){
  	if(records && records.length){
			this.footer = records[0];
			this.isFooter = true
  	}
  }

  fetchFooterRecordsFromDB():Subject<RecordCard[]>{
    let listener = new Subject<RecordCard[]>();

    let query = {
      topics: 'home',
      publish: true,
      'publish.template': 'footer',
    }

    this.daoService.search<RecordCard>('recordcard', query).subscribe(tokens =>{
      if(tokens){
        listener.next(tokens)

      }else{
        listener.next([]);
      }

    });

    return listener;
  }




}
