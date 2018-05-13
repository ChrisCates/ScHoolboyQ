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

  public display_settings = false;

  public default_toggle = false;
  public default_out = true;
  public default_err = true;

  public display_env = false;
  public display_cwd = false;

  public processes_running = 0;

  private socket = io(env.api);

  public command_input = "";

  public monitors = [];

  public folders_input = "";
  public folders_input_ms = 1000;
  public folders = {};
  public folders_intervals = {};
  public folders_toggles = {};

  public eta_start = 0;

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

     if (res.body.env['process_starts_minimized']) {
      this.default_toggle = false;
     } else {
      this.default_toggle = true;
     }

     if (res.body.env['process_shows_output']) {
      this.default_out = true;
     } else {
      this.default_out = false;
     }

     if (res.body.env['process_shows_errors']) {
      this.default_err = true;
     } else {
      this.default_err = false;
     }
    }
   });
  }

  newWatch() {
   let dir = this.folders_input;
   this.watch(dir);

   this.folders_toggles[dir] = true;
   this.folders_intervals[dir] = setInterval(() => {
    this.watch(dir);
   }, this.folders_input_ms);

   this.folders_input = "";
  }

  toggleWatch(dir) {
   if (!this.folders_toggles[dir]) {
    this.folders_toggles[dir] = true;
   } else {
    this.folders_toggles[dir] = false;
   }
  }

  removeWatch(dir) {
   delete this.folders[dir];
   delete this.folders_toggles[dir];
   clearInterval(this.folders_intervals[dir]);
  }

  watch(dir) {
   superagent.post(env.api + "/api/watch")
   .send({ dir })
   .end((err, res) => {
    if (err) {
     console.log(err, res.text);
     this.removeWatch(dir);
    } else {
     let text = String.fromCharCode.apply(null, new Uint16Array(res.body.contents.data));
     let contents = text.split('\n');
     this.folders[dir] = contents;
    }
   })
  }

  run(command) {
    this.eta_start = Number(new Date());

    let cwd = this.cwd;

    superagent.post(env.api + "/api/command")
    .send({ command, cwd })
    .end((err, res) => {
      if (err) {
        console.log(err, res.text);
      } else {
        this.command_input = "";
        this.processes_running++;
        this.monitor(res.body.pid, command.trim(), res.body.cwd);
      }
    })
  }

  formatIndices() {
   this.monitors = this.monitors.map((process, i) => {
    process.index = i;
    return process;
   });
  }

  formatCwd() {
   this.cwd_formatted = this.cwd.match(/([^\/]*)\/*$/)[1];
  }

  monitor(pid, command, cwd) {
    let index = 0;
    let path_name = `${cwd.match(/([^\/]*)\/*$/)[1]} ScHoolboyQ$`;
    let toggle = this.default_toggle;
    let ms_start = this.eta_start;
    let ms_end = null;

    let out_state = this.default_out;
    let err_state = this.default_err;

    this.monitors.unshift({
      command,
      path_name,
      cwd,
      index,
      pid,
      toggle,
      ms_start,
      ms_end,
      out: [],
      err: [],
      signal: null,
      state: 'running',
      out_state,
      err_state
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
        this.monitors[index]['ms_end'] = Number(new Date());
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

  getTime(process) {
   if (process.ms_end == null) {
    return (Number(new Date()) - process.ms_start);
   } else {
    return (process.ms_end - process.ms_start)
   }
  }

}
