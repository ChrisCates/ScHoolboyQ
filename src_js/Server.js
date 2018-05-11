"use strict";
exports.__esModule = true;
var express = require("express");
var http = require("http");
var path = require("path");
var bodyParser = require("body-parser");
var SocketIO = require("socket.io");
var morgan = require("morgan");
var child_process_1 = require("child_process");
exports.express_dir = __dirname;
exports.express_port = process.env.EXPRESS_PORT || 9001;
exports.express_app = express();
exports.app_directory = path.join(__dirname, "..", "ui", "dist", "ScHoolboyQ");
exports.server = http.createServer(exports.express_app);
exports.io = SocketIO(exports.server);
exports.express_app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", req.get("origin"));
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    return next();
});
exports.express_app.use(morgan('tiny'));
exports.express_app.use(bodyParser.json());
exports.express_app.use(bodyParser.urlencoded({ extended: true }));
exports.express_app.use(express.static(exports.app_directory));
var cwd = process.env.SCHOOLBOYQ_CWD || process.env.HOME;
var env = process.env;
exports.express_app.get('/api/env', function (req, res) {
    return res.status(200).json({ env: env, cwd: cwd });
});
exports.express_app.post('/api/command', function (req, res) {
    var commandString = req.body.command.trim();
    var command = child_process_1.exec(commandString, { cwd: cwd });
    var pid = command.pid;
    var signal = command.signalCode;
    command.stdout.on('data', function (data) {
        exports.io.sockets.emit(pid, {
            'event': 'out',
            data: data
        });
    });
    command.stderr.on('data', function (data) {
        exports.io.sockets.emit(pid, {
            'event': 'err',
            data: data
        });
    });
    command.on('close', function (code) {
        exports.io.sockets.emit(pid, {
            'event': 'close',
            'data': code
        });
    });
    return res.status(200).json({ pid: pid, signal: signal, cwd: cwd });
});
exports.express_app.post('/api/command/kill', function (req, res) {
    var pid = req.body.pid;
    var command = child_process_1.exec("kill " + pid);
    return res.status(200).json({
        pid: pid,
        "status": "killed"
    });
});
exports.express_app.get('*', function (req, res) {
    return res.sendFile(__dirname + "/dist/index.html");
});
console.log("ScHoolboy Q REST RPC running on", exports.express_port);
exports.server.listen(exports.express_port);
