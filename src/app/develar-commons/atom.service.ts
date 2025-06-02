import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable()
export class AtomService {
  private urls: any = {
    'syncAtomAdapters': '/api/atomadapter/syncall',
    'syncAtomRegistries': '/api/atomregistry/syncall',
    'syncOneAtomRegistry': '/api/unidaddescripcion/atom/%s/migrate',
    'syncParentChild': '/api/unidaddescripcion/atom/parentchild'
  };

  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });


  constructor(
        private http: HttpClient
  ) {}

  public syncAtomAdapters(): Observable<any[]> {
    const url = `${this.urls.syncAtomAdapters}`;
    return this.http.get(url, { headers: this.headers } ).pipe(
      catchError(error => of(error))
    );
  }

  public syncAtomRegistries(): Observable<any[]> {
    const url = `${this.urls.syncAtomRegistries}`;
    return this.http.get(url, { headers: this.headers } ).pipe(
      catchError(error => of(error))
    );
  }

  public syncAtomParentChildRegistries(): Observable<number> {
    const url = `${this.urls.syncParentChild}`;
    return this.http.get<number>(url, { headers: this.headers } ).pipe(
      catchError(error => of(error))
    )
  }
}
