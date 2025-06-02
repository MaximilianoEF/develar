import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { FormIdentificadorComponent } from './unidad-descripcion-factory/mini-form/form-identificador/form-identificador.component';
import { UnidadDescripcionPageComponent } from './unidad-descripcion-factory/unidad-descripcion-page/unidad-descripcion-page.component';


@Injectable({
    providedIn : 'root'
})
export class MustHaveSavedChangesTextAreaGuard implements CanDeactivate<UnidadDescripcionPageComponent>{
    
    canDeactivate(target : UnidadDescripcionPageComponent){

        // if(target.hasChanges('TextArea')){

        //     return window.confirm('Tiene cambios sin guardar. ¿Desea abandonar el sitio?');
        // }
        return true;
    }

}