import { BrowserModule }                    from '@angular/platform-browser';
import { CommonModule, registerLocaleData }                     from '@angular/common';
import { NgModule, LOCALE_ID, APP_INITIALIZER }                         from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS}                  from '@angular/common/http';
import { BrowserAnimationsModule }          from '@angular/platform-browser/animations';
import { NgbModule }                        from '@ng-bootstrap/ng-bootstrap';
import { DevelarCommonsModule }             from './develar-commons/develar-commons.module';
import { AppRoutingModule }                 from './app-routing.module';
import { AppComponent }                     from './app.component';
// Develar Components
import { UserService }                      from './entities/user/user.service';
import { SharedService }                    from './develar-commons/shared-service';
import { RouterModule }                     from '@angular/router';

import localeAr from '@angular/common/locales/es-AR';
import { minimalProviderFactory, MinimalProvider } from './minimal-provider';
import { HttpErrorInterceptor } from './develar-commons/httperror-interceptor.service';

registerLocaleData(localeAr, 'es-AR');

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    DevelarCommonsModule,
    AppRoutingModule,
    NgbModule,
    RouterModule
  ],
  declarations : [
    AppComponent,
  ],
  entryComponents: [],
  bootstrap: [ AppComponent ],
  providers: [
    UserService,
    SharedService,
    {
      provide: LOCALE_ID,
      useValue: 'es-AR'
    },
    {
      provide: APP_INITIALIZER,
      useFactory: minimalProviderFactory,
      deps: [MinimalProvider],
      multi: true
    },
    /** Registrar el interceptor-HTTP, para capturar errores producidos por
     * el backend (inclusive derivados de requests via AJAX)
     */
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    }
  ]
})

export class AppModule { }
