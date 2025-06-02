import { Acervo } from '../models/acervo.model';
import { AcervoDataList } from '../models/acervodatalist.model';
import { recursosOptList, buscarEnOptList, tipoBusquedaOptList } from '../models/browser.campos';
import { BusquedaTable, ConsultaAcervo,   } from '../models/historial.model';

export class VidaQueryHelper {
  public static buildDataList(acervosList: Acervo[]): AcervoDataList[] {
    return acervosList.map((token) => {
      const ac = new AcervoDataList();
      ac.titulo = token.metadatos.titulo_formal;
      ac.temas_raw = token.metadatos.temas_raw;
      ac.id = token['_id'];

      if (token.materials && token.materials.length > 0) {
        ac.id_externo = token.materials[0].id_externo;
      } else {
        ac.id_externo = '';
      }

      if (token.artists && token.artists.length > 0) {
        const productorArray = [];
        for (let k = 0; k < token.artists.length; k++) {
          if (token.artists[k].role.artistRoleId === 1) {
            productorArray.push(token.artists[k]);
          }
        }
        // ac.productor = token.artists.title;
        ac.productor = productorArray.join(', ');
      } else {
        ac.productor = '';
      }

      ac.fecha_grabacion =
        token.metadatos.fecha_grabacion !== (null && undefined)
          ? this.formatFecha(token.metadatos.fecha_grabacion)
          : '';
      ac.fecha_filmacion =
        token.metadatos.fecha_filmacion !== (null && undefined)
          ? this.formatFecha(token.metadatos.fecha_filmacion)
          : '';
      ac.legajo = token.fondo.legajo_numero !== (null && undefined)
        ? token.fondo.legajo_numero
        : 0; // definimos que si no existe tal numero, para que no se muestre le cargamos 0 para generar un falsy

      if (token.fondo.coleccion) {
        ac.fondo_collection = token.fondo.coleccion[0].title;
      } else {
        ac.fondo_collection = '';
      }

      if (token.metadatos.duracion) {
        ac.duracion = token.metadatos.duracion;
      } else {
        ac.duracion = '';
      }

      if (token.metadatos.sonido) {
        ac.tieneSonido = token.metadatos.sonido === 1 ? "Sonora" : "Muda";
      } else {
        ac.tieneSonido = '';
      }

      if (token.metadatos.color) {
        ac.color = token.metadatos.color === 1 ? "Color" : "B/N";
      } else {
        ac.color = '';
      }

      /* Descripción y timecodes */
      if (token.timecodes) {
        ac.timecodes = token.timecodes;
      }

      if (token.documentos) {
        ac.document = token.documentos;
      }

      // Video, Audio (1,2) - Si no existen assets, -1
      ac.id_tipo_recurso = token.assets.length > 0 ? token.assets[0].resourcetype.resourceTypeId : -1;
      ac.path_recurso = token.assets.length > 0 ? token.assets[0].path : '';
      if (token.materials && token.materials.length > 0) {
        ac.soporte = token.materials[0].titulo_formal || token.materials[0].type.title;  // Este campo define el nombre del tipo de soporte
      } else {
        ac.soporte = '';
      }

      ac.fecha_digitalizacion = token.metadatos['fecha_digitalizacion'] !== (null && undefined) ? this.formatFecha(token.metadatos['fecha_digitalizacion']) : '';
      return ac;

    });
  }

  private static formatFecha(fecha): string {
    const date: Date = new Date(fecha);
    let fecha_formateada: string = date.getDate() + '/' +
      (date.getMonth() + 1) + '/' + date.getFullYear();

    if (fecha_formateada === 'NaN/NaN/NaN') {
      return '';
    } else {
      return fecha_formateada;
    }
  }


  static getRecursoListByID(id: number): string {
    if (id !== -1) {
      return recursosOptList.find(recurso => recurso.key === id.toString()).label;
    } else {
      return '';
    }
  }

  static getTipoBusquedaListByKey(key : string) : string {
    return tipoBusquedaOptList.find(ti => ti.key === key).label;
  }

  static getBuscarEnListByID( id : string) : string {
    return buscarEnOptList.find(en => en.key === id).label;
  }


  //CAMBIAR TIPOS

  static buildBusquedaBrowseDataTable(itemList: ConsultaAcervo[]): BusquedaTable[] {
    let busquedas: ConsultaAcervo[] = itemList;
    return busquedas.map(token => {
      const tableCell = new BusquedaTable();

      tableCell.txFechaHora = token.txFecha+' :: '+token.txHora;
      tableCell.tsFechaHora = token.tsFechaHora;
      if(token.query.recurso === "-1"){
        tableCell.recurso = 'Todos'
      }else{
        tableCell.recurso = VidaQueryHelper.getRecursoListByID(parseInt(token.query.recurso));
      }
      tableCell.descripcion = [];
      token.query.condiciones.forEach( cond => {
        tableCell.descripcion.push(cond.termino+" :: En -->"+ VidaQueryHelper.getBuscarEnListByID(cond.buscarEn)+" ("+VidaQueryHelper.getTipoBusquedaListByKey(cond.tipoBusqueda)+")");
      })
      tableCell.query = token.query;

      return tableCell;
    })




  }
}
