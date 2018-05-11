import { BrowserWindow } from 'electron';

import { express_port as api_port } from './Server';

import * as path from 'path';
import * as url from 'url';

export class AppInterface {

 public window = null;

 public windowOptions = {
  width: 800,
  height: 600,
  autoHideMenuBar: true,
  useContentSize: true,
 }

 constructor() {

 }

 render():void {
  this.window = new BrowserWindow(this.windowOptions);

  this.window.loadURL(path.join(`http://localhost:${api_port}/`));
  this.window.maximize();
  this.window.focus();

  this.window.on('closed', () => {
   this.window = null;
  })

 }

 devDebug():void {
  this.window.webContents.openDevTools();
 }

}
