// Express requires
var createError = require('http-errors'),
   express = require('express'),
   path = require('path'),
   cookieParser = require('cookie-parser'),
   morgan = require('morgan'),
   cors = require("cors");

// API routes requires
var ScenesAPI = require('./api/scenes');
var SystemAPI = require('./api/system');

// Launchpad requires
var LaunchpadControl = require("./launchpad/launchpad");
var SceneManager = require("./scene-manager");

// Misc requires
var winston = require('winston');
var Configuration = require("./configuration");
var Publisher = require("./publisher");

//// LOGGING INIT ////

global.logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ]
});

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

logger.info("Initializing Launchpad connection...");
var launchpad = new LaunchpadControl();
launchpad.init(conf.get("launchpad"));

if(!launchpad.isConnected()) {
    logger.info("Exiting.");
    process.exit();
}

//// SCENE MANAGER INIT ////

logger.info("Initializing scene manager...");
var sm = new SceneManager(launchpad);
sm.init(conf.get("scenes", {}));

// Initial rendering when launchpad is ready
launchpad.on('ready', sm.render.bind(sm));

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
    sm.executeScript('teardown');
    launchpad.closeLaunchpad();
    process.exit();
});

//// WEB SERVER INIT ////

logger.info("Initializing Express...");
var app = express();

// view engine setup
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'jade');

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
    system: new SystemAPI(sm, conf)
};

app.use('/scenes', routes.scenes.router());
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

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
