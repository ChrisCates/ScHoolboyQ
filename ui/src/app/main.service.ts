import { Injectable, ApplicationRef } from '@angular/core';

import * as superagent from 'superagent';

import { environment as env } from '../environments/environment';

declare var io;

@Injectable({
  providedIn: 'root'
})
export class MainService {

  private socket = io(env.api);

  public command_input = "";

  public monitors = [];

  constructor(private ref: ApplicationRef) {

  }

  run(command) {
    superagent.post(env.api + "/api/command")
    .send({ command })
    .end((err, res) => {
      if (err) {
        console.log(err, res.body);
      } else {
        this.command_input = "";
        this.monitor(res.body.pid, command.trim());
      }
    })
  }

  monitor(pid, command) {
    let index = this.monitors.length;

    this.monitors.push({
      command,
      index,
      pid,
      out: [],
      err: [],
      signal: null,
      state: 'running',
      out_state: true,
      err_state: true
    })

    this.socket.on(pid, io_data => {
      if (io_data.event == "out") {
        this.monitors[index]['out'].push(io_data.data);
      } else if (io_data.event == "err") {
        this.monitors[index]['err'].push(io_data.data);
      } else if (io_data.event == "close") {
        this.monitors[index]['signal'] = io_data.data;
        this.monitors[index]['state'] = "stopped";
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
