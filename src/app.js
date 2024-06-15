const express = require("express"),
    bodyParser = require("body-parser"),
    app = express(),
    router = express.Router(),
    routes = require("../routes"),
    portConfiguration = require('../portConfiguration.json'),
    envFile = require('../env.json');

var ErrorMod = require('../customnodemodules/error_node_module/errors');
var customError = new ErrorMod();
const urlValidator = require('../validation/urlValidation')


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(router);
app.set("port", portConfiguration[envFile.stage] || 8888);

app.use(function error_handler(err, req, res, next) {
    res.header("Content-Type", "application/json; charset=utf-8");
    res.status(err.code || 500).send(err)
});

router.all("*", function (req, res, next) {
    var origin = req.get("Origin");
    if (!origin) {
        origin = "*";
    }
    var allow_headers = req.get("Access-Control-Request-Headers");
    if (!allow_headers) {
        allow_headers = "Origin, X-Requested-With, X-Source-Ip, X-Identified-MCC,X-Identified-MNC, X-Using-Mobile-Data, Accept, Authorization, User-Agent,Host, Accept-Language, Location, Referrer, Set-Cookie";
    } else {
        if (allow_headers instanceof Array) {
            allow_headers = allow_headers.join(",");
        }
    }

    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
    res.set("Access-Control-Allow-Headers", allow_headers);
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Credentials", "true");
    if ("OPTIONS" === req.method) return res.sendStatus(200);
    next();
});

//routes for url-shortener
router.get('/', routes.testServer)

// route to list all files
router.get('/files', routes.listFiles)

router.get('/callback', routes.redirect)




router.all('/*', function (req, res) {
    res.status(404);
    res.send(customError.NotFound("Endpoint Not Found"));
});

app.listen(app.get("port"), () => {
    console.log("Express server : started on port : " + app.get("port"));
})

module.exports = app;
