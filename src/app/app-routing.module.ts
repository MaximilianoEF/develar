import { NgModule }                     from '@angular/core';
import { RouterModule, Routes }         from '@angular/router';
//Develar tests
import { GcseComponent }                from './develar-commons/gcse/gcse.component';
import { CrawlerComponent }             from './develar-commons/crawler/crawler.component';
import { UploadComponent }              from './develar-commons/upload/upload.component';
import { AssetcreateComponent }         from './develar-commons/assets/assetcreate/assetcreate.component';
import { FoldercreateComponent }        from './develar-commons/folders/foldercreate/foldercreate.component';
import { FolderBrowseComponent }        from './develar-commons/folders/folder-browse/folder-browse.component';
import { TagComponent }                 from './develar-commons/tags/tags/tags.component';
import { ChipsDemo }                    from './develar-commons/tags/tags/chip.demo';
//Layouts
import { DefaultLayoutComponent }       from './develar-commons/layouts/default/default.component';
import { ExtraLayoutComponent }         from './develar-commons/layouts/extra/extra.component';
import { PresentacionLayoutComponent }  from './develar-commons/layouts/presentacion/presentacion.component';
import { WorkgroupLayoutComponent }     from './develar-commons/layouts/workgroup/workgroup.component';
//import { MinimalistLayoutComponent }    from './site-minimal/layouts/minimalist/minimalist.component';
// Error pages
import { Page404Component }             from './develar-commons/errorpages/page-404.component';
//import { Page500Component }             from './develar-commons/errorpages/page-500.component';
// Components
import { CommunityCreateComponent }     from './develar-commons/community/community-create/community-create.component';
import { EnterSiteComponent }            from './develar-commons/enter-site/enter-site.component';
import { MustNotBeLoggedInGuard } from './develar-commons/guards/mustnotbeloggedin-guard';
import { MustNotBeAWebUserGuard } from './develar-commons/guards/mustnotbeawebuser-guard';
import { MustBeLoggedInGuard }    from './develar-commons/guards/mustbeloggedin-guard';


const defaultAdminRoute: Routes = [
  {
    path: '',
    component: CommunityCreateComponent ,
    pathMatch: 'full'
  },
];

const communityRoutes: Routes = [
  { path: '', component: CommunityCreateComponent },
];

const personModuleRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./entities/person/person.module').then(m => m.PersonModule)
  },
];

const userModuleRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./entities/user/user/user.module').then(m => m.UserModule)
  },
];

const locacionModuleRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./entities/locaciones/locacion.module').then(m => m.LocacionHospitalariaModule)
  },
];

const turnoModuleRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./entities/turnos/turnos.module').then(m => m.TurnosModule)
  }
];

const consultaModuleRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./entities/consultas/consultas.module').then(m => m.ConsultasModule)
}
];

const productModuleRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./entities/products/product.module').then(m => m.ProductModule)
  },
];

const bookshelfModuleRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./bookshelf/bookshelf.module').then(m => m.BookshelfModule)
  },
];

const entityRoutes: Routes = [
  { path: 'personas',    children:  personModuleRoutes },
  { path: 'productos',   children:  productModuleRoutes },
  { path: 'usuarios',    children:  userModuleRoutes },
  { path: 'locaciones', children: locacionModuleRoutes },
  // { path: 'turnos', children: turnoModuleRoutes } // TODO: Turno como entidad?
];

const afterLogin: Routes = [
  { path: '',          component:  EnterSiteComponent },
];

const loginModuleRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./entities/user/login/login.module').then(m => m.LoginModule)
  }
];

const notificationModuleRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./notifications/notifications.module').then(m => m.NotificationsModule)
  }
];

const userWebRoutes : Routes = [
  {
    path : '',
    loadChildren : () => import('./entities/userweb/userweb.module').then(m => m.UserwebModule)
  }
]

const ingestaRoutes : Routes =[
  {
    path:'',
    loadChildren : () => import('./entities/ingesta/ingesta.module').then( m => m.IngestaModule)
  }
]

const techMachineRoutes : Routes = [
  {
    path : '',
    loadChildren : () => import('./entities/tech-machine/tech-machine.module').then( m => m.TechMachineModule)
  }
]

const turnoSedeRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./entities/slot-turno/slot-turno.module').then(m => m.SlotTurnoModule)
  }
];

const ucoRoutes : Routes = [
  {
    path : '',
    loadChildren : () => import('./entities/uco/uco.module').then( m => m.UcoModule)
  }
]


const authorityRecordRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./entities/authority-record/authority-record.module').then(m => m.AuthorityRecordModule)
  }
];

const accessionRecordsRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./entities/accession-records/accession-records.module').then(m => m.AccessionRecordsModule)
  }
];

const migrantesRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./entities/migrante/migrante.module').then(m => m.MigranteModule)
  }
];

const taxonomiaRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./entities/taxonomia-gdoc/taxonomia.module').then(m => m.TaxonomiaModule)
  }
];

const agnModuleRoutes : Routes = [
  {
    path: 'migrante',
    data: { modo: 'web' },
    children: migrantesRoutes
  },
  {
    path : '',
    loadChildren : () => import('./agn/agn.module').then( m => m.AgnModule)
  }
];

const webRoutes: Routes = [
  {
    path : 'ingresar',
    component : PresentacionLayoutComponent,
    children : userWebRoutes
  },
  {
    path: '',
    component: PresentacionLayoutComponent,
    children: agnModuleRoutes
  },
];



const adminRoutes: Routes = [
  {
    path: 'fichas',
    component: DefaultLayoutComponent,
    children: bookshelfModuleRoutes
  },
  {
    path: 'presentacion',
    component: PresentacionLayoutComponent,
    children: bookshelfModuleRoutes
  },
  {
    path: 'entidades',
    component: DefaultLayoutComponent,
    children: entityRoutes
  },
  {
    path: 'turnos',
    component: DefaultLayoutComponent,
    children: turnoModuleRoutes
  },
  {
    path: 'consultas',
    component: DefaultLayoutComponent,
    children: consultaModuleRoutes
  },
  {
    path: 'punto-acceso',
    component: DefaultLayoutComponent,
    children: accessionRecordsRoutes
  },
  {
    path: 'migrante',
    component: DefaultLayoutComponent,
    children: migrantesRoutes
  },
  {
    path: 'analiticos',
    component: DefaultLayoutComponent,
    children: migrantesRoutes
  },
  {
    path: 'tesauro',
    component: DefaultLayoutComponent,
    children: taxonomiaRoutes
  },
  {
    path : 'registro-autoridad',
    component: DefaultLayoutComponent,
    children: authorityRecordRoutes
  },
  {
    path : 'ingesta',
    component : DefaultLayoutComponent,
    children : ingestaRoutes
  },
  {
    path : 'maquinaria',
    component : DefaultLayoutComponent,
    children : techMachineRoutes
  },
  {
    path: 'uco',
    component : DefaultLayoutComponent,
    children : ucoRoutes
  },
  {
    path: 'turnosnominales',
    component: DefaultLayoutComponent,
    children: turnoSedeRoutes
  },
  {
    path: 'proyectos',
    component: WorkgroupLayoutComponent,
    children: bookshelfModuleRoutes
  },
  {
    path: 'notificaciones',
    component: DefaultLayoutComponent,
    children: notificationModuleRoutes
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    children: defaultAdminRoute
  },
];

const mainRoutes:Routes = [
  {
    path: 'gestion',
    children: adminRoutes
  },
  {
    path: '',
    loadChildren: () => import('./site-minimal/minimal.module').then(m => m.MinimalModule)
  },

];

const unidadDescripcionRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./entities/unidad-descripcion/unidad-descripcion.module').then(m => m.UnidadDescripcionModule)
  }
];

const develarRoutes:Routes = [
  {
    path: 'comunidades',
    component: DefaultLayoutComponent,
    children: communityRoutes
  },
  {
    path: '',
    children: adminRoutes
  },

];


const routes: Routes = [
  {
    path: 'develar',
    canActivate : [MustNotBeAWebUserGuard],
    children: develarRoutes
  },
  {
    path: 'ingresar',
    //canActivate : [MustNotBeLoggedInGuard],
    component: ExtraLayoutComponent,
    children: loginModuleRoutes
  },
  {
    path: 'ingresando',
    component: ExtraLayoutComponent,
    children: afterLogin
  },
  {
    path: 'web',
    children: webRoutes
  },
  {
    path: 'agn',
    component: DefaultLayoutComponent,
    canActivate : [MustNotBeAWebUserGuard],
    children : agnModuleRoutes
  },
  {
    path : 'unidad-descripcion',
    component: DefaultLayoutComponent,
    canActivate : [MustNotBeAWebUserGuard],
    children: unidadDescripcionRoutes
  },
  {
    path: 'punto-acceso',
    component: DefaultLayoutComponent,
    canActivate: [MustNotBeAWebUserGuard],
    children: accessionRecordsRoutes
  },
  {
    path: 'tesauro',
    component: DefaultLayoutComponent,
    canActivate: [MustNotBeAWebUserGuard],
    children: taxonomiaRoutes
  },
  {
    path: 'migrante',
    // component: DefaultLayoutComponent,
    // canActivate: [MustNotBeAWebUserGuard],
    children: migrantesRoutes
  },
  {
    path: 'inicio',
    children: mainRoutes,
    pathMatch: 'full'
  },
  {
    path: '',
    canActivate : [MustBeLoggedInGuard],
    children: mainRoutes,
    pathMatch: 'full'
  },
  {
    path: ':community',
    children: mainRoutes
  },
  {
    path: '**',
    component: Page404Component,
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, {useHash: false , enableTracing: false}) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
