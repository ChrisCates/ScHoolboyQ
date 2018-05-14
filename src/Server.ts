import * as express from 'express';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs-jetpack';
import * as bodyParser from 'body-parser';
import * as SocketIO from 'socket.io';
import * as morgan from 'morgan';
import { exec, spawn, execSync } from 'child_process';

import * as shellenv from 'shell-env';
import * as fixpath from 'fix-path';

fixpath();
process.env = shellenv.sync('/bin/bash');

/*
import Sudoer from 'electron-sudo';

let sudoer = new Sudoer({ name: 'ScHoolboy Q' });
let spawn = sudoer.spawn;
let exec = sudoer.exec;
let execSync = sudoer.execSync;
*/

import { appInterface } from './App';

export const express_dir = __dirname;
export const express_port = process.env.EXPRESS_PORT || 9001;
export const express_app = express();
export const app_directory = path.join(__dirname, "web_ui", "ScHoolboyQ");

export const server = http.createServer(express_app);
export const io = SocketIO(server);

express_app.use((req, res, next) => {
 res.header("Access-Control-Allow-Origin", req.get("origin"));
 res.header("Access-Control-Allow-Credentials", "true");
 res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
 res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 return next();
});

express_app.use(morgan('tiny'));

express_app.use(bodyParser.json());
express_app.use(bodyParser.urlencoded({ extended: true }));

express_app.use(express.static(app_directory));

let schoolboy_conf_path = process.env.HOME + "/.ScHoolboyQ";

let schoolboy_conf = fs.read(`${schoolboy_conf_path}`);
let env:any = {};
let conf:any = {};

if (!schoolboy_conf) {
 console.log("Looks like your first time running ScHoolboyQ, setting up default configuration for ~/.ScHoolboyQ");
 fs.append(schoolboy_conf_path, `process_starts_minimized=true\n`);
 fs.append(schoolboy_conf_path, `process_shows_output=true\n`);
 fs.append(schoolboy_conf_path, `process_shows_errors=true\n`);
 fs.append(schoolboy_conf_path, `starting_directory=${process.env.HOME}\n`);
 conf['process_starts_minimized'] = "true";
 conf['process_shows_output'] = "true";
 conf['process_shows_errors'] = "true";
 conf['starting_directory'] = process.env.HOME;
} else {
 let data = schoolboy_conf.split('\n');
 data.forEach(d => {
  let key = d.split('=')[0];
  let value = d.split('=')[1];
  conf[key] = value;
 })
}

express_app.post('/api/debug', (req, res) => {
 appInterface.devDebug();
 return res.status(200).send("OK");
});

express_app.get('/api/env', (req, res) => {
 let env = process.env;

 Object.keys(conf).forEach(key => {
  env[key] = conf[key];
 })

 let cwd = env['starting_directory'];

 return res.status(200).json({ env, cwd });
});

express_app.post('/api/watch', (req, res) => {
 let dir = req.body.dir;
 let contents = execSync(`ls -a ${dir}`);

 return res.status(200).send({ contents });
})

express_app.post('/api/command', (req, res) => {
 let cwd = req.body.cwd || env.HOME;

 let commandString = req.body.command.trim();
 let command:any = exec(commandString, { cwd });

 let pid = command.pid;
 let signal = command.signalCode;

 command.stdout.on('data', (data) => {
   io.sockets.emit(pid, {
     'event': 'out',
     data
   })
 });

 command.stderr.on('data', (data) => {
  io.sockets.emit(pid, {
    'event': 'err',
    data
  })
 });

 command.on('close', (code) => {
  io.sockets.emit(pid, {
    'event': 'close',
    'data': code
  })
 });

 return res.status(200).json({ pid, signal, cwd });
});

express_app.post('/api/command/kill', (req, res) => {
  let pid = req.body.pid;

  let command:any = exec(`kill ${pid}`);

  return res.status(200).json({
    pid,
    "status": "killed"
  })
});

express_app.get('*', (req, res) => {
 return res.sendFile(__dirname + "/web_ui/ScHoolboyQ/index.html");
});

console.log("ScHoolboy Q REST RPC running on", express_port);
server.listen(express_port);
