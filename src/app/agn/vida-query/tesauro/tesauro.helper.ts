import { Tesauro } from './models/tesauro.model';
import { CloudData } from 'angular-tag-cloud-module';


export class TesauroHelper{


    static buildCloudData(tesauros : Tesauro[]){
        // tesauros.forEach(tesauro => {

        // })
       // { text: 'Initial Data weight-10', weight: 10 }
        const accum : Array<CloudData> = new Array<CloudData>();

        tesauros.forEach(tesauro => {
            let key = accum.find(palabra => palabra.text === tesauro.palabra)
            if (key){
                let elemento = accum[accum.indexOf(key)]; 
                elemento.weight++;
            }else{
                accum.push({text : tesauro.palabra, weight: 1 })
            }
        })
        
        return accum;
    }
        // const diccionario = tesauros.reduce((accum, item) => {
        //     if (accum[item]){
        //          accum[item]++; 
        //         }, [])
        //     };

}

