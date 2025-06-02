import { ResourceTypes } from './resourcetype.model';

export class Resource {
    id : number;
    title : string;
    description : string;
    path : string;
    resourcetype : ResourceTypes;
}