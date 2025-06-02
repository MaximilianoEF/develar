/*
 *  core config.js
 *  package: /core/config
 *  Use:
 *     Exporta un objeto con las configuraciones basicas para devel, test, production
 */
const debug = require('debug')('develar-local.co:server');


const path = require('path');
const rootPath = path.normalize(__dirname + '/../..');


const environment = global.environment || process.env.NODE_ENV || 'development';

const PORT = normalizePort(process.env.PORT || '8080');
const DBASE = process.env.DBASE || 'develar';
const SERVER = process.env.SERVER || 'http://develar-local.co';
const FAVICON = process.env.FAVICON || 'favicon.ico';
const PUBLIC = process.env.PUBLIC || '/public';

const STORAGE = 'storage';
const CONVERTED = 'converted';

const publicPath = path.join(rootPath, PUBLIC);
const storagePath = path.join(publicPath, STORAGE);
const convertedFilesPath = path.join(publicPath, CONVERTED);
const app_file = path.join(rootPath, '/core/app');

const DEV_SERVER = 'http://develar-local.co:4200';
const QA_SERVER = 'http://develar-local.co:4200';

const MONGOSRV = 'mongodb://localhost/';
const GOOGLE_LOGIN_RETURN = '/api/users/login/google/return'

const mongo_db = MONGOSRV + DBASE


console.log('***config ENV:[%s] PORT:[%s]  DB:[%s]  SRV:[%s]  public:[%s] ****', environment, PORT, mongo_db, SERVER, PUBLIC);;

debug('config.js:settings:mode:[%s]', environment);

const mailingOptions = {
    host: 'smtp.mininterior.gob.ar',
    port: 25,
    user: '',
    password: '',
    from: 'noresponderagn@mininterior.gob.ar',
    prefix: 'AGN - ',
    subjects: {
        cancelled: 'Turno cancelado',
        confirmed: 'Turno confirmado',
        notification: 'Nueva notificación',
        register: 'Confirmación de registro',
        forgot: 'Recuperá tu contraseña'
    },
    headerImg: 'mail_agn_banner.png',
    footerImg: 'mail_agn_footer.png'
};


const development_serverOptList = [
    { val: 'no_definido',  label: 'Seleccione opción', slug: 'Seleccione opción' },
    { val: 'master',       label: 'Master',             mountingPath: 'publicPath', serverPath: 'master',     ip: '107.11.12.001', hasPublicAccess: false,  isNormalized: true,   slug: 'Server de master objects' },
    { val: 'ingesta',      label: 'Ingesta',            mountingPath: 'publicPath', serverPath: 'ingesta',    ip: '107.11.12.002', hasPublicAccess: false,  isNormalized: true,   slug: 'Punto de montaje visible para Digitalización' },
    { val: 'derivadas',    label: 'Derivadas',          mountingPath: 'publicPath', serverPath: 'derivadas',  ip: '107.11.12.003', hasPublicAccess: false,  isNormalized: true,   slug: 'Server de versiones derivadas' },
    { val: 'intermedias',  label: 'Intermedias',        mountingPath: 'publicPath', serverPath: 'intermedias',ip: '107.11.12.006', hasPublicAccess: false,  isNormalized: true,   slug: 'Server de versiones intermedias' },
    { val: 'storage',      label: 'Storage dvlr',       mountingPath: 'publicPath', serverPath: 'storage',    ip: '127.0.0.1',     hasPublicAccess: true,   isNormalized: false,  slug: 'Ambiente de desarrollo' },
    { val: 'web',          label: 'Web',                mountingPath: 'publicPath', serverPath: 'www/assets', ip: '107.11.12.004', hasPublicAccess: true,   isNormalized: false,  slug: 'Servidor en la DMZ' },
    { val: 'caos',         label: 'Servidor Caos',      mountingPath: 'publicPath', serverPath: 'xxx/yyy',    ip: '107.11.12.005', hasPublicAccess: false,  isNormalized: false,  slug: 'Servidor(es) legacy con media no identificada' },
];

const production_serverOptList = [
    { val: 'no_definido', label: 'Seleccione opción', slug: 'Seleccione opción' },
    { val: 'master',      label: 'Master',          mountingPath: 'publicPath', serverPath: 'master',     ip: '107.11.12.001',  hasPublicAccess: false, isNormalized: true,  slug: 'Server de master objects' },
    { val: 'ingesta',     label: 'Ingesta',         mountingPath: 'publicPath', serverPath: 'ingesta',    ip: '107.11.12.002',  hasPublicAccess: false, isNormalized: true,  slug: 'Punto de montaje visible para Digitalización' },
    { val: 'derivadas',   label: 'Derivadas',       mountingPath: 'publicPath', serverPath: 'derivadas',  ip: '107.11.12.003',  hasPublicAccess: false, isNormalized: true,  slug: 'Server de versiones derivadas' },
    { val: 'intermedias', label: 'Intermedias',     mountingPath: 'publicPath', serverPath: 'intermedias',ip: '107.11.12.006',  hasPublicAccess: false, isNormalized: true,  slug: 'Server de versiones intermedias' },
    { val: 'storage',     label: 'Storage dvlr',    mountingPath: 'publicPath', serverPath: 'storage',    ip: '127.0.0.1',      hasPublicAccess: true,  isNormalized: false, slug: 'Ambiente de desarrollo' },
    { val: 'web',         label: 'Web',             mountingPath: 'publicPath', serverPath: 'www/assets', ip: '107.11.12.004',  hasPublicAccess: true,  isNormalized: false, slug: 'Servidor en la DMZ' },
    { val: 'caos',        label: 'Servidor Caos',   mountingPath: 'publicPath', serverPath: 'xxx/yyy',    ip: '107.11.12.005',  hasPublicAccess: false, isNormalized: false, slug: 'Servidor(es) legacy con media no identificada' },
];


const settings = {
    rootPath: rootPath,
    faviconPath: '/core/img/' + FAVICON,
    publicPath: publicPath,
    storagePath: storagePath,
    convertedPath: convertedFilesPath,
    port: PORT,
    debug: 'develar:server',
    serverUrl: DEV_SERVER,
    dbconnect: path.join(rootPath, 'core/config/dbconnect'),
    failureLoginUrl: '/ingresar/login',
    signUpUrl: '/ingresar/registrarse',
    googleCbUrl: DEV_SERVER + GOOGLE_LOGIN_RETURN,
    loginUrl: path.join('/ingresando'),
    serversAvailable: development_serverOptList,
    mailing: mailingOptions
};

if (environment === 'development') {
    settings.dbase = mongo_db + '_dev';
    settings.app = app_file;
    settings.serverUrl = DEV_SERVER;
    settings.googleCbUrl = settings.serverUrl + GOOGLE_LOGIN_RETURN;
    settings.serversAvailable = development_serverOptList;


} else if (environment === 'test') {
    settings.dbase = mongo_db;
    settings.app = app_file;
    settings.serverUrl = QA_SERVER;
    settings.googleCbUrl = settings.serverUrl + GOOGLE_LOGIN_RETURN;
    settings.serversAvailable = development_serverOptList;

} else if (environment === 'production') {
    settings.dbase = mongo_db;
    settings.app = app_file;
    settings.serverUrl = SERVER;
    settings.googleCbUrl = settings.serverUrl + GOOGLE_LOGIN_RETURN;
    settings.serversAvailable = production_serverOptList;
}

//console.dir(settings);
module.exports = settings

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}
