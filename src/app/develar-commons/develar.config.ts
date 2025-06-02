/************
 *
 *  GLOBALS develar.config
 *
*************/
const user = 'agn';

const globals = {
	agn : {
        logoAvatar: 'avatar-develar.jpg',
        logoUser: 'avatar-u-develar.jpg',
        logoArgentinaGobAr : 'logo-argentina-gob-ar.png',
        logoCompany: 'logo_AGN_apaisado.png',
        logoCompany3: 'logo-sidebar-06.png',

        logoCompany2: 'logo-publico.png',
        company: 'AGN',

        // AGN - Ministerio del Interior
        comptdoc: 'CUIT',
        compndoc: '30546662361',

        // Registro de autoridad/Institución archivística por defecto
        companyIdentifier: 'AGN',
        lemaNavbar:  'Coronavirus COVID-19',
        slemaNavbar: 'conocé información y recomendaciones del Ministerio de Salud',
        lemaTargetUrl: 'https://www.argentina.gob.ar/salud/coronavirus-COVID-19',
        mainmenu: 'AGN',
        mainmenutpl: 'agn-navbar',  	 // Define el main-menu
        admintarget: '/agn/fichatecnica', 		 //Ruta al componente x defecto al loguearse
        dashboard: '/agn/fichatecnica', 		 //Ruta al dashboard (completarla)
        socialmedia: 'AGN_SOCIAL_MEDIA', // Array de redes sociales del organismo
        emailsubject: '[AGN] Contacto',		 // Template de como aparece el asunto
        emailbody: 'Formulario de contacto completado',
        copyright: '©2022 DGTIC@AGN   22.09.01-13:47 ',		 // Hay que ir actualizandolo por fecha de deploy
        version: '1.0 beta',
        url: 'https://agnbicentenario.mininterior.com',
        app_prefix: 'ar.gob.mininterior.agnbicentenario',

        // Página a mostrar en caso de que el backend esté caído
        maintenancepage_path: '/assets/errorpages/enmantenimiento.html'
	},

	develar: {
		logoAvatar: 'avatar-develar.jpg',
		logoUser: 'avatar-u-develar.jpg',
		logoCompany: 'logo-publico.png',
		logoCompany2: 'logo-publico.png',
		company: 'develar',
		admintarget: '/develar/fichas/lista',
		dashboard: '/develar/fichas/lista',
		mainmenu: 'DEFAULT',
		mainmenutpl: 'default-navbar',
		database: 'develar',
		socialmedia: 'DEFAULT_SOCIAL_MEDIA',
		emailsubject: '[develar] Contacto',
		emailbody: 'Formulario de contacto completado',
		copyright: '© Copyright 2019 dvlr ',
		version: '1.0',
		url: 'www.develar.co'
	},
}

export const gldef = globals[user];
