import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class MatPaginatorIntlEspañol extends MatPaginatorIntl {
    
    
    public itemsPerPageLabel = 'Elementos por página';
    public lastPageLabel = 'Última página';
    public nextPageLabel = 'Siguiente página';
    public previousPageLabel = 'Página anterior';
    public firstPageLabel = 'Primera página';
}