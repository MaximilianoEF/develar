import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HistoriesModalComponent } from '../../../unidad-descripcion-history/histories-modal/histories-modal.component';
import { UnidadDescripcionHelper } from '../../../unidad-descripcion.helper';
import { UnidadDescripcion } from '../../../unidad-descripcion.model';
import { UnidadDescripcionService } from '../../../unidad-descripcion.service';

@Component({
  selector: 'view-control-descripcion',
  templateUrl: './view-control-descripcion.component.html',
  styleUrls: ['./view-control-descripcion.component.scss']
})
export class ViewControlDescripcionComponent implements OnInit {

    /** Recibe la Unidad de Descripción con la que este componente trabajará */
    @Input()
    public ud: UnidadDescripcion;
  
  /** Template variables */
  public createdBy: string;
  public createdAt: string;
  public descriptionStatus: string;
  public generalStatus: string;

  public lastModifiedBy: string;
  public lastModifiedAt: string;
  public lastModifiedReason: string;

  constructor(private service: UnidadDescripcionService,
    private dialog: MatDialog) { }

  ngOnInit(): void {

    this.initTemplateVariables();
  }

  private initTemplateVariables(): void {
    /** Variables para mostrar en el template **/
    this.createdBy = this.ud.audit.creationUsername;
    this.createdAt = this.ud.audit.creationDate;
    this.lastModifiedBy = this.ud.audit.lastModifiedUsername;
    this.lastModifiedAt = this.ud.audit.lastModifiedDate;
    this.lastModifiedReason = this.ud.audit.lastModifiedReason ?
    this.ud.audit.lastModifiedReason : '(sin novedad)';
   
   
    this.generalStatus = UnidadDescripcionHelper.getOptionLabel('estados', this.ud.estado);
    this.descriptionStatus = UnidadDescripcionHelper.getOptionLabel('nivelAvance', this.ud.audit.navance);
     }

     public async displayHistory() {
      const histories = await this.service.fetchHistory(this.ud._id);
      const historiesList = UnidadDescripcionHelper.buildHistoryList(histories);
      const title = this.ud.identificador.title;
  
  
      const dialogRef = this.dialog.open(HistoriesModalComponent, {
        data: {
          title,
          historiesList
        }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        //c onsole.log(result);
      });
    }
}
