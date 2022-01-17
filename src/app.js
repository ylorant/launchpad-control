// Express requires
const createError = require('http-errors'),
   express = require('express'),
   path = require('path'),
   cookieParser = require('cookie-parser'),
   morgan = require('morgan'),
   cors = require("cors");

// API routes requires
const ScenesAPI = require('./api/scenes');
const SystemAPI = require('./api/system');
const ScriptsAPI = require('./api/scripts');
const DevicesAPI = require('./api/devices');
const VirtualDeviceAPI = require('./api/virtual-device');
const ModulesAPI = require('./api/modules');

// Components requires
const ModuleManager = require('./modules');
const DeviceManager = require('./devices');
const SceneManager = require('./scenes');
const ScriptsManager = require('./scripts');

// Misc requires
const winston = require('winston');
const Configuration = require('./configuration');
const Publisher = require('./publisher');

//// LOGGING INIT ////

let loggerTransports = [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
];

global.logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.simple()
    )
});

// Toggle either full console logging or logfile logging depending on cases
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.align(),
            winston.format.printf(
                info => `${info.level}: ${info.message}`
            )
        )
    }));
} else {
    for(let transport of loggerTransports) {
        logger.add(transport);
    }
}

//// CONFIGURATION LOADING ////

logger.info("Initializing configuration...");
global.configFile = process.env.CONFIG_FILE || "config.json";
var conf = new Configuration(configFile);
conf.get("launchpad.port.input");


//// MERCURE INIT ////

logger.info("Initializing publisher...");
global.publisher = new Publisher(conf.get("publisher"));

//// LAUNCHPAD INIT ////

// logger.info("Initializing Launchpad connection...");
// var launchpad = new LaunchpadControl();
// launchpad.init(conf.get("launchpad"));

// if(!launchpad.isConnected()) {
//     logger.info("Exiting.");
//     process.exit();
// }

//// SCRIPTS MANAGER INIT ////

logger.info("Initializing scripts manager...");
var scrm = new ScriptsManager();
scrm.init(conf.get("scripts", {}));

//// DEVICE MANAGER INIT ////

logger.info("Initializing device manager...");
var dm = new DeviceManager();
dm.init(conf.get("devices", {}));

//// SCENE MANAGER INIT ////

logger.info("Initializing scene manager...");
var sm = new SceneManager(dm, scrm);
sm.init(conf.get("scenes", {}));

//// MODULE MANAGER INIT ////

logger.info("Initializing module manager...");
var modm = new ModuleManager(scrm, sm, conf);
sm.setModuleManager(modm);

// Initial rendering when devices are ready
dm.on('ready', sm.render.bind(sm));

// Add scene manager and device manager to the sandbox
scrm.updateContext({ sceneManager: sm, deviceManager: dm });

//// PROCESS MANAGEMENT ////

// Windows fill-in because it doesn't implement sigint
if (process.platform === "win32") {
    var rl = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });
  
    rl.on("SIGINT", function () {
        process.emit("SIGINT");
    });
}

process.on('SIGINT', function() {
    logger.info("Caught SIGINT, exiting.");
    scrm.close();
    modm.shutdown();
    dm.close();
    process.exit();
});

//// WEB SERVER INIT ////

logger.info("Initializing Express...");
var app = express();

// view engine setup
// app.set('views', path.join(__dirname, '..', 'views'));
// app.set('view engine', 'jade');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

//// WEB PAGES ROUTING ////

// React app route
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

var routes = {
    scenes: new ScenesAPI(sm),
    devices: new DevicesAPI(dm),
    virtualdevice: new VirtualDeviceAPI(dm, sm),
    scripts: new ScriptsAPI(scrm),
    modules: new ModulesAPI(modm),
    system: new SystemAPI(sm, dm, conf)
};

app.use('/scenes', routes.scenes.router());
app.use('/devices', routes.devices.router());
app.use('/virtualdevice', routes.virtualdevice.router());
app.use('/scripts', routes.scripts.router());
app.use('/modules', routes.modules.router());
app.use('/system', routes.system.router());

//// AFTER-ROUTING MIDDLEWARE ////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    
    if(req.app.get('env') === 'development') {
        console.log(err);
    }

    // render the error page
    res.status(err.status || 500);
    res.json({
        error: err,
        message: err.message
    });
});

module.exports = app;
