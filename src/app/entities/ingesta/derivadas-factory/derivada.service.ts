import { Injectable } from '@angular/core';
import { DaoService } from '../../../develar-commons/dao.service';
import { Asset }      from '../../../develar-commons/develar-entities';
import { MsrvTask }   from '../ingesta.model';

@Injectable()
export class DerivadaService {
  constructor(
        private _dao: DaoService,
  ) { }


  /**
   * Invoca al microservicio para generación de la derivada para un asset en concreto
   *
   * @param asset    Es el asset para el que se desea generar la derivada
   * @param opciones Opciones para la generación de la derivada. Por ejemplo: alto, ancho
   */
  crearDerivada(asset: Asset, opciones: any): Promise<MsrvTask> {
    const task = new MsrvTask();

    task.taskName = 'asset:buildderivada';
    task.route = `/derivadas/${asset._id}`;
    task.action = 'buildderivadaasset';
    task.status = 'wip';
    task.entityId = asset._id;

    task.options = opciones;

    return this._dao.pushMsrvTask<MsrvTask>('msrvgestiondoc', task);
  }
}
