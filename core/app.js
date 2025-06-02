const express = require('express');
const path = require('path');
const config = require('./config/config');
const passportconf = require('./config/passportconf');
const middleware = require('./services/middleware');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
//const helmet = require('helmet');



/**
 * Configuración de BULL-MONITOR
 */
const bullQueues = require('./routes/bullRoutes');
const Bull = require('bull');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const thumbnailQueue = new Bull('pingesta:ingestfolder:thumbnail');
const derivadaQueue = new Bull('pingesta:ingestfolder:derivada');
const derivadaAssetQueue = new Bull('pingesta:asset:derivada');
const bagitQueue = new Bull('bagit:pingesta:ingestfolder');
const rsyncMasterQueue = new Bull('rsync:ingest:master');

const serverAdapter = new ExpressAdapter();

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [
    new BullAdapter(thumbnailQueue),
    new BullAdapter(derivadaQueue),
    new BullAdapter(derivadaAssetQueue),
    new BullAdapter(bagitQueue),
    new BullAdapter(rsyncMasterQueue)
  ],
  serverAdapter
});

serverAdapter.setBasePath('/admin/queues');





const routes = require(path.join(config.rootPath, 'core/routes/index'));
const msrvgdocRoutes = require('./routes/microsrvgdocRoutes.js');
const acervoRoutes = require('./routes/agnRoutes.js');
const agnUserRoutes = require('./routes/agnUserRoutes.js');
const agnUserLogginRoutes = require('./routes/agnUserLogginRoutes.js');
const currentUserRoutes = require('./routes/currentUserRoutes');
const agnTurnoRoutes = require('./routes/agnTurnoRoutes.js');
const consultasAcervoRoutes = require('./routes/consultasAcervoRoutes.js');
const tesauroRoutes = require('./routes/tesauroRoutes.js');
const ingestaRoutes = require('./routes/ingestaRoutes.js');
const ucoRoutes = require('./routes/ucoRoutes.js');
const auditentregasRoutes = require('./routes/auditentregasRoutes.js');
const asistenciasRoutes = require('./routes/asistenciasRoutes.js');
const asisprevencionRoutes = require('./routes/asisprevencionRoutes.js');
const zauditDataRoutes = require('./routes/zauditDateRoutes.js');
const integracioncovidRoutes = require('./routes/integracioncovidRoutes.js');
const solinternacionRoutes = require('./routes/solinternacionRoutes.js');
const pculturalRoutes = require('./routes/pculturalRoutes.js');
const censoRoutes = require('./routes/censoRoutes.js');
const budgetRoutes = require('./routes/budgetRoutes.js');
const recordcardRoutes = require('./routes/recordcardRoutes.js');
const serialRoutes = require('./routes/serialRoutes.js');
const turnosRoutes = require('./routes/turnosRoutes.js');
const gturnosRoutes = require('./routes/gturnosRoutes.js');
const locacioneshospRoutes = require('./routes/locacionhospRoutes.js');
const gturnosasignadosRoutes = require('./routes/gturnosasignadosRoutes.js');
const tasksRoutes = require('./routes/tasksRoutes.js');
const consultasRoutes = require('./routes/consultasRoutes.js');
const observacionesRoutes = require('./routes/observacionesRoutes.js');
const rolnocturnidadRoutes = require('./routes/rolnocturnidadRoutes.js');
const remitosAlmacenRoutes = require('./routes/almacenRoutes.js');
const userRouter = require('./routes/userRouter.js');
const parserRoutes = require('./routes/parserRoutes.js');
const assetRoutes = require('./routes/assetRoutes.js');
const folderRoutes = require('./routes/folderRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const productKitRoutes = require('./routes/productKitRoutes.js');
const productitRoutes = require('./routes/productitRoutes.js');
const productsnRoutes = require('./routes/productsnRoutes.js');
const communityRoutes = require('./routes/communityRoutes.js');
const tagRoutes = require('./routes/tagRoutes.js');
const personRoutes = require('./routes/personRoutes.js');
const pdfRoutes = require('./routes/zpdfRoutes.js');


const alimentarRoutes = require('./routes/alimentarRoutes.js');
const commonRouter = require('./routes/commonRouter.js');
const gcseRoutes = require('./routes/gcseRoutes');
const crawlRoutes = require('./routes/crawlerRoutes');
const uploadRoutes = require('./services/uploadfs');
const downloadRoutes = require('./routes/downloadRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const unidadDescripcionRoutes = require('./routes/unidadDescripcionRoutes');
const authorityRecordRoutes = require('./routes/authorityRecordRoutes');
const techMachineRoutes = require('./routes/techMachineRoutes');
const turnoSedeRoutes = require('./routes/turnoSedeRoutes');
const atomAdapterRoutes = require('./routes/atomAdapterRoutes');
const atomRegistryRoutes = require('./routes/atomRegistryRoutes');
const accessionRecordsRoutes = require('./routes/accessionRecordRoutes');
const migranteRoutes = require('./routes/migranteRoutes');
const taxonomiaRoutes = require('./routes/taxonomiaRoutes');
const taxonomiaTerminoRoutes = require('./routes/taxonomiaTerminoRoutes');

const app = express();



app.use('/admin/queues', serverAdapter.getRouter());



// analizar estas declaraciones. Qué son 'cors': Cross origin request
// app.use(function(req, res, next) { //allow cross origin requests
//   res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
//   res.header("Access-Control-Allow-Origin", "http://localhost:xxxx");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   res.header("Access-Control-Allow-Credentials", true);
//   next();
//   });


// view engine setup
app.set('views', path.join(config.rootPath, 'core/views'));
app.set('view engine', 'pug');

app.use(logger('dev'));

// app.use(
//     helmet.frameguard({
//         action: 'allow-from',
//         domain: 'https://youtu.be'
//     }));
app.use(express.urlencoded({extended: true, limit: '50mb'}));
// extended: true hace que express use https://www.npmjs.com/package/qs#readme para parsear el query-string
app.use(express.json({limit: '50mb'}));

app.use(cookieParser());
app.use(cookieSession({
    name: 'session',
    keys: ['develar'],
    maxAge: 24 * 60 * 60 * 1000

}));
app.use(express.static(config.publicPath));
passportconf(app);

const myLogger = function(req, res, next) {
    console.log('++++++++My logger ++++++++++')
    next();
};

app.use(myLogger);

console.log('++++++++dynamic begins ++++++++++')
app.use('/api/parser', parserRoutes);
app.use('/api/gcse', gcseRoutes);
app.use('/api/crawl', crawlRoutes);

app.use('/api/usuariosloggin', agnUserLogginRoutes);
app.use('/api/usuarios', agnUserRoutes);
app.use('/api/currentuser', currentUserRoutes);
app.use('/api/vida', acervoRoutes);
app.use('/api/users', userRouter);

// TODO: Agregar validación middleware.isAdminUser
app.use('/api/ingesta', ingestaRoutes);
app.use('/api/persons', middleware.isAuth, personRoutes);
app.use('/api/techmachine', middleware.isAdminUser, techMachineRoutes);
app.use('/api/uco', middleware.isAdminUser, ucoRoutes);
// microservicios del módulo Gestión DOC
app.use('/api/msrvgestiondoc', msrvgdocRoutes);
/** Rutas afectadas a la migración de datos Atom -> GestionDoc */
app.use('/api/atomadapter', atomAdapterRoutes);
app.use('/api/atomregistry', atomRegistryRoutes);

app.use('/api/accessionrecords',  accessionRecordsRoutes);
app.use('/api/migrante', migranteRoutes);
app.use('/api/queuestatus', bullQueues);
app.use('/api/taxonomia', taxonomiaRoutes);
app.use('/api/taxonomiatermino', taxonomiaTerminoRoutes);

app.use('/api/turnospresenciales', middleware.isAuth, agnTurnoRoutes);
app.use('/api/turnosnominales', middleware.isAuth, turnoSedeRoutes);
app.use('/api/consultas', consultasRoutes);
app.use('/api/consultasacervo', consultasAcervoRoutes);
app.use('/api/tesauro', middleware.isAdminUser, tesauroRoutes);
app.use('/api/unidaddescripcion', unidadDescripcionRoutes)
app.use('/api/authorityrecord', middleware.isAdminUser, authorityRecordRoutes);
app.use('/api/remitosalmacen', remitosAlmacenRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/asisprevencion', asisprevencionRoutes);
app.use('/api/integracioncovid', integracioncovidRoutes);
app.use('/api/solinternacion', solinternacionRoutes);
app.use('/api/censoindustrias', censoRoutes);
app.use('/api/eventosculturales', pculturalRoutes);
app.use('/api/presupuestos', budgetRoutes);
app.use('/api/auditentregas', auditentregasRoutes);
app.use('/api/recordcards', recordcardRoutes);
app.use('/api/seriales', serialRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/auditodatos', zauditDataRoutes);
app.use('/api/locacionhospitalaria', locacioneshospRoutes);
app.use('/api/turnosdisponibles', gturnosRoutes);
app.use('/api/turnosasignados', gturnosasignadosRoutes);
app.use('/api/observaciones', observacionesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/rolnocturnidad', rolnocturnidadRoutes);
app.use('/api/alimentar', alimentarRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/productkits', productKitRoutes);
app.use('/api/productits', productitRoutes);
app.use('/api/productserial', productsnRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/utils', commonRouter);
app.use('/api/upload', uploadRoutes);
app.use('/download', downloadRoutes);
app.use('/pug', routes);

//===============ERROR RENDERING BEGIN ==================
// catch 404 and forward to error handler

app.use(function(req, res, next) {
    console.log('**************************Catchig 404');
    res.sendFile(path.join(config.publicPath, 'index.html'))
});

// development error handler, will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler, no stacktraces leaked to user
app.use(function(err, req, res, next) {
    console.log('modo PRODUCTION')
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
//============= end error handling ========================


module.exports = app;
