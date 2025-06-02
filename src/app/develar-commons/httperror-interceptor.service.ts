import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { gldef } from './develar.config';
import { Injectable } from "@angular/core";

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        catchError((errorInstance: HttpErrorResponse) => {
          //console.log('Error HTTP');

          if (errorInstance.error instanceof ErrorEvent) {    // Error frontend
          } else {                                            // Error backend

            //console.table(errorInstance);

            //window.location.href = gldef.maintenancepage_path;
            //console.log("error --> %o",errorInstance.error.error.status)
            if(errorInstance.error.error && errorInstance.error.error.status > 500){
            }
            else if(!errorInstance.error.error){
             // window.location.href = gldef.maintenancepage_path;
            }
          }
          return throwError(null);
        })
      );
  }
}
