"use strict";
exports.__esModule = true;
var express = require("express");
var http = require("http");
var path = require("path");
var fs = require("fs-jetpack");
var bodyParser = require("body-parser");
var SocketIO = require("socket.io");
var morgan = require("morgan");
var child_process_1 = require("child_process");
var shellenv = require("shell-env");
var fixpath = require("fix-path");
fixpath();
process.env = shellenv.sync('/bin/bash');
/*
import Sudoer from 'electron-sudo';

let sudoer = new Sudoer({ name: 'ScHoolboy Q' });
let spawn = sudoer.spawn;
let exec = sudoer.exec;
let execSync = sudoer.execSync;
*/
var App_1 = require("./App");
exports.express_dir = __dirname;
exports.express_port = process.env.EXPRESS_PORT || 9001;
exports.express_app = express();
exports.app_directory = path.join(__dirname, "web_ui", "ScHoolboyQ");
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
var schoolboy_conf_path = process.env.HOME + "/.ScHoolboyQ";
var schoolboy_conf = fs.read("" + schoolboy_conf_path);
var env = {};
var conf = {};
if (!schoolboy_conf) {
    console.log("Looks like your first time running ScHoolboyQ, setting up default configuration for ~/.ScHoolboyQ");
    fs.append(schoolboy_conf_path, "process_starts_minimized=true\n");
    fs.append(schoolboy_conf_path, "process_shows_output=true\n");
    fs.append(schoolboy_conf_path, "process_shows_errors=true\n");
    fs.append(schoolboy_conf_path, "starting_directory=" + process.env.HOME + "\n");
    conf['process_starts_minimized'] = "true";
    conf['process_shows_output'] = "true";
    conf['process_shows_errors'] = "true";
    conf['starting_directory'] = process.env.HOME;
}
else {
    var data = schoolboy_conf.split('\n');
    data.forEach(function (d) {
        var key = d.split('=')[0];
        var value = d.split('=')[1];
        conf[key] = value;
    });
}
exports.express_app.post('/api/debug', function (req, res) {
    App_1.appInterface.devDebug();
    return res.status(200).send("OK");
});
exports.express_app.get('/api/env', function (req, res) {
    var env = process.env;
    Object.keys(conf).forEach(function (key) {
        env[key] = conf[key];
    });
    var cwd = env['starting_directory'];
    return res.status(200).json({ env: env, cwd: cwd });
});
exports.express_app.post('/api/watch', function (req, res) {
    var dir = req.body.dir;
    var contents = child_process_1.execSync("ls -a " + dir);
    return res.status(200).send({ contents: contents });
});
exports.express_app.post('/api/command', function (req, res) {
    var cwd = req.body.cwd || env.HOME;
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
    return res.sendFile(__dirname + "/web_ui/ScHoolboyQ/index.html");
});
console.log("ScHoolboy Q REST RPC running on", exports.express_port);
exports.server.listen(exports.express_port);
