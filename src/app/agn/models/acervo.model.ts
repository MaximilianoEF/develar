import { Fondo } from './fondo.model';
import { MetaData } from './metadata.model';
import { Resource } from './resource.model';
import { Document } from './document.model';
import { Attachments } from './attachments.model';
import { Theme } from './theme.model';
import { TimeCode } from './timecode.model';
import { Language } from './language.model';
import { Artist } from './artist.model';
import { Material } from './material.model';
import { Genres } from './genres.model';

export class Acervo {
  fondo: Fondo;
  metadatos: MetaData;
  assets: Resource[];
  documentos: Document[];
  genres: Genres[];
  attachments: Attachments[];
  temas: Theme[];
  timecodes: TimeCode[];
  languages: Language[];
  artists: Artist[];
  materials: Material[];
}
