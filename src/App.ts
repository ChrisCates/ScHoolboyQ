import { app, protocol} from 'electron';
import { AppInterface } from './AppInterface';

import * as path from 'path';
import * as url from 'url';

let appInterface = new AppInterface();

app.on('ready', () => {
 appInterface.render();
});

app.on('window-all-closed', () => {
 if (process.platform !== 'darwin') {
   app.quit();
 }
});

app.on('activate', () => {
 appInterface.render();
});

export { appInterface }
