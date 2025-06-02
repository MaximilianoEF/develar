import { ThemeType } from './themeType.model';

export class Theme {
    id : number;
    title : string;
    themetypeid : ThemeType;
    active : number;
    create : string;
    modified : string;
}