import { Injectable, ApplicationRef } from '@angular/core';

import * as superagent from 'superagent';

import { environment as env } from '../environments/environment';

declare var io;

@Injectable({
  providedIn: 'root'
})
export class MainService {

  public env = [];
  public cwd = "~";
  public cwd_formatted = "~";

  public default_toggle = false;

  public display_env = false;
  public display_cwd = false;

  public processes_running = 0;

  private socket = io(env.api);

  public command_input = "";

  public monitors = [];

  constructor(private ref: ApplicationRef) {
   this.loadEnv();
  }

  loadEnv() {
   superagent.get(env.api + "/api/env")
   .end((err, res) => {
    if (err) {
     console.log(err, res.body);
    } else {
     let env = [];

     Object.keys(res.body.env).forEach(key => {
      let value = res.body.env[key];
      env.push({ key, value });
     })

     this.env = env;
     this.cwd = res.body.cwd;
     this.cwd_formatted = this.cwd.match(/([^\/]*)\/*$/)[1];
    }
   });
  }

  run(command) {
    superagent.post(env.api + "/api/command")
    .send({ command })
    .end((err, res) => {
      if (err) {
        console.log(err, res.body);
      } else {
        this.command_input = "";
        this.processes_running++;
        this.monitor(res.body.pid, command.trim(), res.body.cwd);
        this.loadEnv();
      }
    })
  }

  formatIndices() {
   this.monitors = this.monitors.map((process, i) => {
    process.index = i;
    return process;
   });
  }

  monitor(pid, command, cwd) {
    let index = 0;
    let path_name = `${cwd.match(/([^\/]*)\/*$/)[1]} ScHoolboyQ$`;
    let toggle = this.default_toggle;

    this.monitors.unshift({
      command,
      path_name,
      cwd,
      index,
      pid,
      toggle,
      out: [],
      err: [],
      signal: null,
      state: 'running',
      out_state: true,
      err_state: true
    })

    this.formatIndices();

    this.socket.on(pid, io_data => {
      if (io_data.event == "out") {
        this.monitors[index]['out'].unshift(io_data.data);
      } else if (io_data.event == "err") {
        this.monitors[index]['err'].unshift(io_data.data);
      } else if (io_data.event == "close") {
        this.monitors[index]['signal'] = io_data.data;
        this.monitors[index]['state'] = "stopped";
        this.processes_running--;
      }
      this.ref.tick();
    })
  }

  kill(pid) {
    superagent.post(env.api + "/api/command/kill")
    .send({ pid })
    .end((err, res) => {
      if (err) {
        console.log(err, res.body);
      } else {
        console.log("PID", pid, "killed")
      }
    })
  }

}
