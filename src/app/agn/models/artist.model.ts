import { ArtistRole } from './artistrole.model';

export class Artist{
    id : number;
    title : string;
    description : string;
    active : number;
    role: ArtistRole;
    created : string;
    modified : string;
}