import * as express from 'express';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs-jetpack';
import * as bodyParser from 'body-parser';
import * as SocketIO from 'socket.io';
import * as morgan from 'morgan';
import { spawn, exec } from 'child_process';

export const express_dir = __dirname;
export const express_port = process.env.EXPRESS_PORT || 9001;
export const express_app = express();
export const app_directory = path.join(__dirname, "..", "ui", "dist", "ScHoolboyQ")

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

express_app.post('/api/command', (req, res) => {
 let cwd = req.body.cwd || process.env.HOME;

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

 return res.status(200).json({ pid, signal });
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
 return res.sendFile(__dirname + "/dist/index.html");
});

console.log("ScHoolboy Q REST RPC running on", express_port);
server.listen(express_port);
