import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';

@Injectable()
export class AccessionRecordsModalService {

  private dialogResult$: Subject<any>;
  
  constructor(
              private _dialog: MatDialog
  ) {}
}
